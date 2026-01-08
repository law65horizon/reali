// geoSearch.js - Advanced geospatial search with Redis + PostgreSQL
import pool from './db.js'; // Your PostgreSQL connection
import redis from './src/config/redis.js';

const GEO_KEY = 'properties:geo';
const PROPERTY_HASH_PREFIX = 'property:hash:';

export class GeoSearch {
  // Add property to geospatial index with metadata
  static async indexProperty(property) {
    const { id, latitude, longitude, price, bedrooms, bathrooms, type, status } = property;
    
    // Add to geo index
    await redis.geoadd(GEO_KEY, longitude, latitude, id);
    
    // Store filterable attributes in hash for quick access
    await redis.hset(`${PROPERTY_HASH_PREFIX}${id}`, {
      price,
      bedrooms,
      bathrooms,
      type,
      status,
      latitude,
      longitude,
    });
    
    // Set expiry to keep data fresh (optional)
    await redis.expire(`${PROPERTY_HASH_PREFIX}${id}`, 86400); // 24 hours
  }

  // Main search: nearby + filters
  static async searchNearby(latitude, longitude, radiusKm, filters = {}) {
    const {
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      propertyType,
      status = 'active',
      limit = 50,
      offset = 0,
    } = filters;

    // Step 1: Get all properties within radius from Redis
    const nearbyIds = await redis.georadius(
      GEO_KEY,
      longitude,
      latitude,
      radiusKm,
      'km',
      'ASC',
      'COUNT',
      500 // Get more than needed for filtering
    );

    if (nearbyIds.length === 0) {
      return { properties: [], total: 0 };
    }

    // Step 2: Quick filter using Redis hashes
    const filtered = await this.filterByAttributes(nearbyIds, {
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      propertyType,
      status,
    });

    // Step 3: Fetch full details from PostgreSQL for remaining properties
    const propertyIds = filtered.slice(offset, offset + limit);
    
    if (propertyIds.length === 0) {
      return { properties: [], total: filtered.length };
    }

    const properties = await this.fetchPropertiesFromDB(propertyIds, latitude, longitude);

    return {
      properties,
      total: filtered.length,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  // Filter properties by attributes using Redis hashes
  static async filterByAttributes(propertyIds, filters) {
    const pipeline = redis.pipe
    
    // Fetch all property hashes in one go
    propertyIds.forEach(id => {
      pipeline.hgetall(`${PROPERTY_HASH_PREFIX}${id}`);
    });
    
    const results = await pipeline.exec();
    
    // Filter in memory
    const filtered = [];
    
    for (let i = 0; i < results.length; i++) {
      const [err, attrs] = results[i];
      if (err || !attrs || Object.keys(attrs).length === 0) continue;
      
      const propertyId = propertyIds[i];
      
      // Apply filters
      if (filters.minPrice && parseFloat(attrs.price) < filters.minPrice) continue;
      if (filters.maxPrice && parseFloat(attrs.price) > filters.maxPrice) continue;
      if (filters.minBedrooms && parseInt(attrs.bedrooms) < filters.minBedrooms) continue;
      if (filters.maxBedrooms && parseInt(attrs.bedrooms) > filters.maxBedrooms) continue;
      if (filters.minBathrooms && parseInt(attrs.bathrooms) < filters.minBathrooms) continue;
      if (filters.propertyType && attrs.type !== filters.propertyType) continue;
      if (filters.status && attrs.status !== filters.status) continue;
      
      filtered.push(propertyId);
    }
    
    return filtered;
  }

  // Hybrid approach: Use Redis for geo + basic filters, PostgreSQL for complex queries
  static async searchNearbyHybrid(latitude, longitude, radiusKm, filters = {}) {
    const {
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      propertyType,
      status = 'active',
      amenities = [],
      limit = 50,
      offset = 0,
    } = filters;

    // Get nearby property IDs from Redis
    const nearbyResults = await redis.georadius(
      GEO_KEY,
      longitude,
      latitude,
      radiusKm,
      'km',
      'WITHDIST',
      'ASC'
    );

    if (nearbyResults.length === 0) {
      return { properties: [], total: 0 };
    }

    // Extract IDs and distances
    const idsWithDistance = nearbyResults.map(([id, distance]) => ({
      id,
      distance: parseFloat(distance),
    }));

    const propertyIds = idsWithDistance.map(item => item.id);

    // Build PostgreSQL query with all filters
    let query = `
      SELECT p.*, 
        (SELECT json_agg(url) FROM property_images WHERE property_id = p.id) as images,
        (SELECT json_agg(name) FROM property_amenities pa 
         JOIN amenities a ON pa.amenity_id = a.id 
         WHERE pa.property_id = p.id) as amenities
      FROM properties p
      WHERE p.id = ANY($1)
        AND p.status = $2
    `;
    
    const params = [propertyIds, status];
    let paramIndex = 3;

    if (minPrice) {
      query += ` AND p.price >= $${paramIndex++}`;
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex++}`;
      params.push(maxPrice);
    }
    if (minBedrooms) {
      query += ` AND p.bedrooms >= $${paramIndex++}`;
      params.push(minBedrooms);
    }
    if (maxBedrooms) {
      query += ` AND p.bedrooms <= $${paramIndex++}`;
      params.push(maxBedrooms);
    }
    if (minBathrooms) {
      query += ` AND p.bathrooms >= $${paramIndex++}`;
      params.push(minBathrooms);
    }
    if (propertyType) {
      query += ` AND p.type = $${paramIndex++}`;
      params.push(propertyType);
    }

    // Complex filter: properties with specific amenities
    if (amenities.length > 0) {
      query += `
        AND p.id IN (
          SELECT property_id 
          FROM property_amenities pa
          JOIN amenities a ON pa.amenity_id = a.id
          WHERE a.name = ANY($${paramIndex++})
          GROUP BY property_id
          HAVING COUNT(DISTINCT a.name) = $${paramIndex++}
        )
      `;
      params.push(amenities, amenities.length);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    // Merge with distance data from Redis
    const properties = rows.map(property => {
      const distanceData = idsWithDistance.find(item => item.id === property.id.toString());
      return {
        ...property,
        distance: distanceData?.distance || null,
      };
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM properties p
      WHERE p.id = ANY($1) AND p.status = $2
    `;
    const countParams = [propertyIds, status];
    let countParamIndex = 3;

    if (minPrice) {
      countQuery += ` AND p.price >= $${countParamIndex++}`;
      countParams.push(minPrice);
    }
    if (maxPrice) {
      countQuery += ` AND p.price <= $${countParamIndex++}`;
      countParams.push(maxPrice);
    }
    if (minBedrooms) {
      countQuery += ` AND p.bedrooms >= $${countParamIndex++}`;
      countParams.push(minBedrooms);
    }
    if (maxBedrooms) {
      countQuery += ` AND p.bedrooms <= $${countParamIndex++}`;
      countParams.push(maxBedrooms);
    }
    if (minBathrooms) {
      countQuery += ` AND p.bathrooms >= $${countParamIndex++}`;
      countParams.push(minBathrooms);
    }
    if (propertyType) {
      countQuery += ` AND p.type = $${countParamIndex++}`;
      countParams.push(propertyType);
    }
    if (amenities.length > 0) {
      countQuery += `
        AND p.id IN (
          SELECT property_id 
          FROM property_amenities pa
          JOIN amenities a ON pa.amenity_id = a.id
          WHERE a.name = ANY($${countParamIndex++})
          GROUP BY property_id
          HAVING COUNT(DISTINCT a.name) = $${countParamIndex++}
        )
      `;
      countParams.push(amenities, amenities.length);
    }

    const { rows: [{ count }] } = await pool.query(countQuery, countParams);

    return {
      properties,
      total: parseInt(count),
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(parseInt(count) / limit),
    };
  }

  // Search in bounding box with filters (for map view)
  static async searchInBounds(minLat, minLon, maxLat, maxLon, filters = {}) {
    // Calculate center and dimensions
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const width = Math.abs(maxLon - minLon) * 111; // Approx km
    const height = Math.abs(maxLat - minLat) * 111;

    const nearbyIds = await redis.geosearch(
      GEO_KEY,
      'FROMLONLAT',
      centerLon,
      centerLat,
      'BYBOX',
      width,
      height,
      'km'
    );

    if (nearbyIds.length === 0) {
      return [];
    }

    // Filter by attributes
    const filtered = await this.filterByAttributes(nearbyIds, filters);

    // Fetch from DB (limit for map view)
    const properties = await this.fetchPropertiesFromDB(filtered.slice(0, 100));

    return properties;
  }

  // Fetch properties from PostgreSQL with distance calculation
  static async fetchPropertiesFromDB(propertyIds, refLat = null, refLon = null) {
    if (propertyIds.length === 0) return [];

    let query = `
      SELECT p.*,
        (SELECT json_agg(url) FROM property_images WHERE property_id = p.id) as images
    `;

    if (refLat && refLon) {
      // Calculate distance using PostgreSQL (if you have PostGIS)
      query += `,
        earth_distance(
          ll_to_earth(${refLat}, ${refLon}),
          ll_to_earth(p.latitude, p.longitude)
        ) / 1000 as distance_km
      `;
    }

    query += ` FROM properties p WHERE p.id = ANY($1) ORDER BY p.created_at DESC`;

    const { rows } = await pool.query(query, [propertyIds]);
    return rows;
  }

  // Update property in geo index
  static async updateProperty(propertyId, updates) {
    const { latitude, longitude, price, bedrooms, bathrooms, type, status } = updates;

    // Update geo location if changed
    if (latitude && longitude) {
      await redis.geoadd(GEO_KEY, longitude, latitude, propertyId);
    }

    // Update hash attributes
    const hashUpdates = {};
    if (price !== undefined) hashUpdates.price = price;
    if (bedrooms !== undefined) hashUpdates.bedrooms = bedrooms;
    if (bathrooms !== undefined) hashUpdates.bathrooms = bathrooms;
    if (type !== undefined) hashUpdates.type = type;
    if (status !== undefined) hashUpdates.status = status;
    if (latitude !== undefined) hashUpdates.latitude = latitude;
    if (longitude !== undefined) hashUpdates.longitude = longitude;

    if (Object.keys(hashUpdates).length > 0) {
      await redis.hset(`${PROPERTY_HASH_PREFIX}${propertyId}`, hashUpdates);
    }
  }

  // Remove property
  static async removeProperty(propertyId) {
    await Promise.all([
      redis.zrem(GEO_KEY, propertyId),
      redis.del(`${PROPERTY_HASH_PREFIX}${propertyId}`),
    ]);
  }

  // Batch index properties (useful for initial load or re-indexing)
  static async batchIndex(properties) {
    const pipeline = redis.pipeline();

    properties.forEach(property => {
      const { id, latitude, longitude, price, bedrooms, bathrooms, type, status } = property;
      
      pipeline.geoadd(GEO_KEY, longitude, latitude, id);
      pipeline.hset(`${PROPERTY_HASH_PREFIX}${id}`, {
        price,
        bedrooms,
        bathrooms,
        type,
        status,
        latitude,
        longitude,
      });
    });

    await pipeline.exec();
    console.log(`Indexed ${properties.length} properties`);
  }
}

// GraphQL resolvers
export const geoResolvers = {
  Query: {
    nearbyProperties: async (_, { lat, lng, radius, filters }) => {
      const result = await GeoSearch.searchNearbyHybrid(lat, lng, radius, filters);
      return result;
    },

    propertiesInBounds: async (_, { minLat, minLon, maxLat, maxLon, filters }) => {
      return await GeoSearch.searchInBounds(minLat, minLon, maxLat, maxLon, filters);
    },

    searchProperties: async (_, { filters }) => {
      // If location provided, use geo search
      if (filters.lat && filters.lng && filters.radius) {
        return await GeoSearch.searchNearbyHybrid(
          filters.lat,
          filters.lng,
          filters.radius,
          filters
        );
      }
      
      // Otherwise fall back to regular DB search
      return await regularSearch(filters);
    },
  },
};

// Fallback for non-geo searches
async function regularSearch(filters) {
  // Implement standard PostgreSQL search without geo
  return { properties: [], total: 0 };
}