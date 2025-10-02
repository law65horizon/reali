// Updated propertyModel
import { Pool } from "pg";
import redis from "redis";
import pool from "../config/database.js";
import { Address } from "./Address.js";

export interface Property {
  id: number;
  realtor_id: number;
  address_id: number;
  title: string;
  speciality: string;
  amenities: string[];
  price: number;
  description?: string;
  status: 'draft' | 'published' | 'pending_review' | 'archived';
  created_at?: string;
  updated_at?: string;
  address?: Address;
  images?: { id: number; url: string; meta_data?: string; caption?: string }[];
  bookings?: { id: number; user_id: number; start_date: string; end_date: string; status: string; created_at?: string }[];
  reviews?: { id: number; user_id: number; rating: number; comment?: string; created_at?: string }[];
}

interface PropertySearchInput {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  speciality?: string;
  amenities?: string[];
  startDate?: string;
  endDate?: string;
  minRating?: number;
}

export class PropertyModel {
  private redisClient: redis.RedisClientType;

  constructor(private pool: Pool) {
    this.redisClient = redis.createClient({
      username: 'default',
      password: process.env.REDIS_PASSWORD || 'npA2GgAvR6DpV0Z2NZurNQqK93mJIgmW',
      socket: {
        host: process.env.REDIS_HOST || 'redis-11196.c92.us-east-1-3.ec2.redns.redis-cloud.com',
        port: parseInt(process.env.REDIS_PORT || '11196')
      }
    });
    this.redisClient.connect().catch(err => console.error('Redis connection error:', err));
  }

  private mapGraphQLFieldsToColumns(requestedFields: string[]): string[] {
    const fieldMap: { [key: string]: string } = {
      id: 'id',
      realtor_id: 'realtor_id',
      address_id: 'address_id',
      title: 'title',
      speciality: 'speciality',
      amenities: 'amenities',
      price: 'price',
      description: 'description',
      status: 'status',
      created_at: 'created_at',
      updated_at: 'updated_at'
    };
    
    const requiredFields = ['id', 'realtor_id', 'address_id'];
    const selectedFields = new Set<string>(requiredFields);

    requestedFields.forEach(field => {
      if (fieldMap[field] && !selectedFields.has(fieldMap[field])) {
        selectedFields.add(fieldMap[field]);
      }
    });

    return Array.from(selectedFields).map(field => `p.${field}`);
  }

  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'> & { address: Omit<Address, 'id' | 'created_at'>; image_urls: string[] }): Promise<Property> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let address_id: number | null = null;
      if (property.address) {
        const countryQuery = `
          WITH inserted AS (
            INSERT INTO countries (name, code)
            VALUES ($1, $2)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM countries WHERE name = $1
        `;
        const countryResult = await client.query(countryQuery, [
          property.address.country,
          property.address.country.slice(0, 2).toUpperCase()
        ]);
        const country_id = countryResult.rows[0].id;

        const cityQuery = `
          WITH inserted AS (
            INSERT INTO cities (name, country_id)
            VALUES ($1, $2)
            ON CONFLICT (name, country_id) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM cities WHERE name = $1 AND country_id = $2
        `;
        const cityResult = await client.query(cityQuery, [property.address.city, country_id]);
        const city_id = cityResult.rows[0].id;

        const addressQuery = `
          WITH inserted AS (
            INSERT INTO addresses (street, city_id, postal_code, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (street, city_id, postal_code) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM addresses WHERE street = $1 AND city_id = $2 AND (postal_code = $3 OR (postal_code IS NULL AND $3 IS NULL))
        `;
        const addressResult = await client.query(addressQuery, [
          property.address.street,
          city_id,
          property.address.postal_code || null,
          property.address.latitude || null,
          property.address.longitude || null
        ]);
        address_id = addressResult.rows[0].id;
      }

      const propertyQuery = `
        INSERT INTO properties (realtor_id, address_id, title, speciality, price, description, amenities, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
        RETURNING *
      `;
      const propertyResult = await client.query(propertyQuery, [
        property.realtor_id,
        address_id,
        property.title,
        property.speciality,
        property.price,
        property.description,
        JSON.stringify(property.amenities)
      ]);
      const newProperty = propertyResult.rows[0];

      const images = [];
      for (const imageUrl of property.image_urls) {
        const imageQuery = `
          INSERT INTO property_images (property_id, url)
          VALUES ($1, $2)
          RETURNING id, url, meta_data, caption
        `;
        const imageResult = await client.query(imageQuery, [newProperty.id, imageUrl]);
        images.push(imageResult.rows[0]);
      }

      await client.query('COMMIT');
      await this.redisClient.del(`properties:realtor:${property.realtor_id}`);
      await this.redisClient.del("properties:connection:*");
      await this.redisClient.del("properties:search:*");
      return { ...newProperty, images };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        throw new Error('Unique constraint violation: ' + error.detail);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: number, requestedFields: string[] = []): Promise<Property | null> {
    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    const query = `
      SELECT ${fields.join(', ')}
      FROM properties p
      WHERE p.id = $1
    `;
    console.log(fields, requestedFields)
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByRealtor(realtor_id: number, requestedFields: string[] = []): Promise<Property[]> {
    const cacheKey = `properties:realtor:${realtor_id}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') return JSON.parse(cached);

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    const query = `
      SELECT ${fields.join(', ')}
      FROM properties p
      WHERE p.realtor_id = $1
    `;
    const result = await this.pool.query(query, [realtor_id]);
    const properties = result.rows;

    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(properties));
    return properties;
  }

  async findAllPaginated(first: number, after?: string, requestedFields: string[] = []): Promise<{
    edges: { node: Property; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  }> {
    const cacheKey = `properties:connection:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') return JSON.parse(cached);

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    let whereClauses = ["p.status IN ('draft', 'published')"];
    const params: any[] = [];
    let paramIndex = 1;

    if (after) {
      whereClauses.push(`p.id > $${paramIndex}`);
      params.push(parseInt(after));
      paramIndex++;
    }

    const fullWhere = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT ${fields.join(', ')}
      FROM properties p
      ${fullWhere}
      ORDER BY p.id ASC
      LIMIT $${paramIndex}
    `;
    params.push(first + 1);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      ${fullWhere}
    `;
    const countParams = params.slice(0, -1);

    const [result, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const properties = result.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const hasNextPage = properties.length > first;
    const edges = properties.slice(0, first).map(property => ({
      node: property,
      cursor: property.id.toString()
    }));
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    const response = {
      edges,
      pageInfo: { hasNextPage, endCursor },
      totalCount
    };

    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
    return response;
  }

  async searchPaginated(input: PropertySearchInput, first: number, after?: string, requestedFields: string[] = []): Promise<{
    edges: { node: Property; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  }> {
    const cacheKey = `properties:search:${JSON.stringify(input)}:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    // if (cached && typeof cached === 'string') return JSON.parse(cached);

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    let whereClauses = ["p.status = 'draft' OR p.status = 'published'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (input?.query) {
      whereClauses.push(`(p.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex} OR a.street ILIKE $${paramIndex})`);
      params.push(`%${input.query}%`);
      paramIndex++;
    }

    if (input.minPrice !== undefined) {
      whereClauses.push(`p.price >= $${paramIndex}`);
      params.push(input.minPrice);
      paramIndex++;
    }

    if (input.maxPrice !== undefined) {
      whereClauses.push(`p.price <= $${paramIndex}`);
      params.push(input.maxPrice);
      paramIndex++;
    }

    if (input.speciality) {
      whereClauses.push(`p.speciality ILIKE $${paramIndex}`);
      params.push(`%${input.speciality}%`);
      paramIndex++;
    }

    if (input.amenities && input.amenities.length > 0) {
      whereClauses.push(`p.amenities @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify(input.amenities));
      paramIndex++;
    }

    if (input.minRating !== undefined) {
      whereClauses.push(`COALESCE((SELECT AVG(r.rating) FROM property_reviews r WHERE r.property_id = p.id), 0) >= $${paramIndex}`);
      params.push(input.minRating);
      paramIndex++;
    }

    let availabilityClause = '';
    let dateParamsCount = 0;
    if (input.startDate && input.endDate) {
      availabilityClause = ` AND NOT EXISTS (
        SELECT 1 FROM property_bookings b 
        WHERE b.property_id = p.id AND b.status = 'confirmed' 
        AND (b.start_date, b.end_date) OVERLAPS ($${paramIndex}::date, $${paramIndex + 1}::date)
      )`;
      params.push(input.startDate, input.endDate);
      paramIndex += 2;
      dateParamsCount = 2;
    }

    if (after) {
      whereClauses.push(`p.id > $${paramIndex}`);
      params.push(parseInt(after));
      paramIndex++;
    }

    const fullWhere = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    console.log(fullWhere, params)
    const query = `
      SELECT ${fields.join(', ')}
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${fullWhere}${availabilityClause}
      ORDER BY p.id ASC
      LIMIT $${paramIndex}
    `;
    params.push(first + 1);

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      LEFT JOIN addresses a ON p.address_id = a.id
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${fullWhere}${availabilityClause}
    `;
    const countParams = params.slice(0, paramIndex - 1);

    const [result, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const properties = result.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const hasNextPage = properties.length > first;
    const edges = properties.slice(0, first).map(property => ({
      node: property,
      cursor: property.id.toString()
    }));
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    const response = {
      edges,
      pageInfo: { hasNextPage, endCursor },
      totalCount
    };

    await this.redisClient.setEx(cacheKey, 300, JSON.stringify(response)); // Shorter TTL for searches
    return response;
  }

  async update(id: number, property: Partial<Omit<Property, 'id' | 'created_at'>> & { address?: Omit<Address, 'id' | 'created_at'>; image_urls?: string[] }): Promise<Property | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const propertyData = await this.findById(id, ['id', 'realtor_id', 'address_id']);
      if (!propertyData) return null;

      if (property.address) {
        const countryQuery = `
          WITH inserted AS (
            INSERT INTO countries (name, code)
            VALUES ($1, $2)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM countries WHERE name = $1
        `;
        const countryResult = await client.query(countryQuery, [
          property.address.country,
          property.address.country.slice(0, 2).toUpperCase()
        ]);
        const country_id = countryResult.rows[0].id;

        const cityQuery = `
          WITH inserted AS (
            INSERT INTO cities (name, country_id)
            VALUES ($1, $2)
            ON CONFLICT (name, country_id) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM cities WHERE name = $1 AND country_id = $2
        `;
        const cityResult = await client.query(cityQuery, [property.address.city, country_id]);
        const city_id = cityResult.rows[0].id;

        const addressQuery = `
          WITH inserted AS (
            INSERT INTO addresses (street, city_id, postal_code, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (street, city_id, postal_code) DO NOTHING
            RETURNING id
          )
          SELECT id FROM inserted
          UNION
          SELECT id FROM addresses WHERE street = $1 AND city_id = $2 AND (postal_code = $3 OR (postal_code IS NULL AND $3 IS NULL))
        `;
        const addressResult = await client.query(addressQuery, [
          property.address.street,
          city_id,
          property.address.postal_code || null,
          property.address.latitude || null,
          property.address.longitude || null
        ]);
        property.address_id = addressResult.rows[0].id;
      }

      if (property.image_urls) {
        await client.query('DELETE FROM property_images WHERE property_id = $1', [id]);
        for (const imageUrl of property.image_urls) {
          await client.query(
            'INSERT INTO property_images (property_id, url) VALUES ($1, $2)',
            [id, imageUrl]
          );
        }
      }

      const fields = [];
      const values = [];
      let index = 1;
      for (const [key, value] of Object.entries(property)) {
        if (value !== undefined && key !== 'address' && key !== 'image_urls') {
          fields.push(`${key} = $${index++}`);
          values.push(key === 'amenities' ? JSON.stringify(value) : value);
        }
      }
      if (fields.length === 0) return null;
      values.push(id);
      const query = `
        UPDATE properties
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
        RETURNING *
      `;
      const result = await client.query(query, values);
      await client.query('COMMIT');

      await this.redisClient.del(`properties:realtor:${result.rows[0].realtor_id}`);
      await this.redisClient.del(`properties:connection:*`);
      await this.redisClient.del(`properties:search:*`);
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const property = await this.findById(id, ['id', 'realtor_id']);
      if (!property) return false;
      const query = `DELETE FROM properties WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      await client.query('COMMIT');
      await this.redisClient.del(`properties:realtor:${property.realtor_id}`);
      await this.redisClient.del(`properties:connection:*`);
      await this.redisClient.del(`properties:search:*`);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new PropertyModel(pool);


// import { Pool } from "pg";
// import redis from "redis";
// import pool from "../config/database.js";
// import { Address } from "./Address.js";

// export interface Property {
//   id: number;
//   realtor_id: number;
//   address_id: number;
//   title: string;
//   speciality: string;
//   amenities: string[];
//   price: number;
//   description?: string;
//   status: 'draft' | 'published' | 'pending_review' | 'archived';
//   created_at?: string;
//   updated_at?: string;
//   address?: Address;
//   images?: { id: number; url: string; meta_data?: string; caption?: string }[];
//   bookings?: { id: number; user_id: number; start_date: string; end_date: string; status: string; created_at?: string }[];
//   reviews?: { id: number; user_id: number; rating: number; comment?: string; created_at?: string }[];
// }

// export class PropertyModel {
//   private redisClient: redis.RedisClientType;

//   constructor(private pool: Pool) {
//     this.redisClient = redis.createClient({
//       username: 'default',
//       password: process.env.REDIS_PASSWORD || 'npA2GgAvR6DpV0Z2NZurNQqK93mJIgmW',
//       socket: {
//         host: process.env.REDIS_HOST || 'redis-11196.c92.us-east-1-3.ec2.redns.redis-cloud.com',
//         port: parseInt(process.env.REDIS_PORT || '11196')
//       }
//     });
//     this.redisClient.connect().catch(err => console.error('Redis connection error:', err));
//   }

//   private mapGraphQLFieldsToColumns(requestedFields: string[]): string[] {
//     const fieldMap: { [key: string]: string } = {
//       id: 'id',
//       realtor_id: 'realtor_id',
//       address_id: 'address_id',
//       title: 'title',
//       speciality: 'speciality',
//       amenities: 'amenities',
//       price: 'price',
//       description: 'description',
//       status: 'status',
//       created_at: 'created_at',
//       updated_at: 'updated_at'
//     };
    
//     const requiredFields = ['id', 'realtor_id', 'address_id'];
//     const selectedFields = new Set<string>(requiredFields);

//     requestedFields.forEach(field => {
//       if (fieldMap[field] && !selectedFields.has(fieldMap[field])) {
//         selectedFields.add(fieldMap[field]);
//       }
//     });

//     return Array.from(selectedFields).map(field => `p.${field}`);
//   }

//   async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'> & { address: Omit<Address, 'id' | 'created_at'>; image_urls: string[] }): Promise<Property> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');

//       let address_id: number | null = null;
//       if (property.address) {
//         const countryQuery = `
//           WITH inserted AS (
//             INSERT INTO countries (name, code)
//             VALUES ($1, $2)
//             ON CONFLICT (name) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM countries WHERE name = $1
//         `;
//         const countryResult = await client.query(countryQuery, [
//           property.address.country,
//           property.address.country.slice(0, 2).toUpperCase()
//         ]);
//         const country_id = countryResult.rows[0].id;

//         const cityQuery = `
//           WITH inserted AS (
//             INSERT INTO cities (name, country_id)
//             VALUES ($1, $2)
//             ON CONFLICT (name, country_id) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM cities WHERE name = $1 AND country_id = $2
//         `;
//         const cityResult = await client.query(cityQuery, [property.address.city, country_id]);
//         const city_id = cityResult.rows[0].id;

//         const addressQuery = `
//           WITH inserted AS (
//             INSERT INTO addresses (street, city_id, postal_code, latitude, longitude)
//             VALUES ($1, $2, $3, $4, $5)
//             ON CONFLICT (street, city_id, postal_code) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM addresses WHERE street = $1 AND city_id = $2 AND (postal_code = $3 OR (postal_code IS NULL AND $3 IS NULL))
//         `;
//         const addressResult = await client.query(addressQuery, [
//           property.address.street,
//           city_id,
//           property.address.postal_code || null,
//           property.address.latitude || null,
//           property.address.longitude || null
//         ]);
//         address_id = addressResult.rows[0].id;
//       }

//       const propertyQuery = `
//         INSERT INTO properties (realtor_id, address_id, title, speciality, price, description, amenities, status)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
//         RETURNING *
//       `;
//       const propertyResult = await client.query(propertyQuery, [
//         property.realtor_id,
//         address_id,
//         property.title,
//         property.speciality,
//         property.price,
//         property.description,
//         JSON.stringify(property.amenities)
//       ]);
//       const newProperty = propertyResult.rows[0];

//       const images = [];
//       for (const imageUrl of property.image_urls) {
//         const imageQuery = `
//           INSERT INTO property_images (property_id, url)
//           VALUES ($1, $2)
//           RETURNING id, url, meta_data, caption
//         `;
//         const imageResult = await client.query(imageQuery, [newProperty.id, imageUrl]);
//         images.push(imageResult.rows[0]);
//       }

//       await client.query('COMMIT');
//       await this.redisClient.del(`properties:realtor:${property.realtor_id}`);
//       await this.redisClient.del("properties:connection:*");
//       return { ...newProperty, images };
//     } catch (error) {
//       await client.query('ROLLBACK');
//       if (error.code === '23505') {
//         throw new Error('Unique constraint violation: ' + error.detail);
//       }
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   async findById(id: number, requestedFields: string[] = []): Promise<Property | null> {
//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM properties p
//       WHERE p.id = $1
//     `;
//     console.log(fields, requestedFields)
//     const result = await this.pool.query(query, [id]);
//     return result.rows[0] || null;
//   }

//   async findByRealtor(realtor_id: number, requestedFields: string[] = []): Promise<Property[]> {
//     const cacheKey = `properties:realtor:${realtor_id}:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     if (cached && typeof cached === 'string') return JSON.parse(cached);

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM properties p
//       WHERE p.realtor_id = $1
//     `;
//     const result = await this.pool.query(query, [realtor_id]);
//     const properties = result.rows;

//     await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(properties));
//     return properties;
//   }

//   async findAllPaginated(first: number, after?: string, requestedFields: string[] = []): Promise<{
//     edges: { node: Property; cursor: string }[];
//     pageInfo: { hasNextPage: boolean; endCursor: string | null };
//     totalCount: number;
//   }> {
//     const cacheKey = `properties:connection:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     if (cached && typeof cached === 'string') return JSON.parse(cached);

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const whereClause = after ? `WHERE p.id > $1 AND (p.status = 'draft' OR p.status = 'published')` : `WHERE p.status = 'draft' OR p.status = 'published'`;
//     console.log(whereClause, after)
//     const params = after ? [parseInt(after)] : [];
//     // console.log(fields, requestedFields);

//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM properties p
//       ${whereClause}
//       ORDER BY p.id ASC
//       LIMIT ${first + 11}
//     `;
//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM properties p
//       WHERE p.status = 'draft' OR p.status = 'published'
//     `;

//     const [result, countResult] = await Promise.all([
//       this.pool.query(query, params),
//       this.pool.query(countQuery)
//     ]);

//     const properties = result.rows;
//     const totalCount = parseInt(countResult.rows[0].total);
//     const hasNextPage = properties.length > first;
//     const edges = properties.slice(0, first).map(property => ({
//       node: property,
//       cursor: property.id.toString()
//     }));
//     const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

//     const response = {
//       edges,
//       pageInfo: { hasNextPage, endCursor },
//       totalCount
//     };

//     await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
//     return response;
//   }

//   async update(id: number, property: Partial<Omit<Property, 'id' | 'created_at'>> & { address?: Omit<Address, 'id' | 'created_at'>; image_urls?: string[] }): Promise<Property | null> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');
//       const propertyData = await this.findById(id, ['id', 'realtor_id', 'address_id']);
//       if (!propertyData) return null;

//       if (property.address) {
//         const countryQuery = `
//           WITH inserted AS (
//             INSERT INTO countries (name, code)
//             VALUES ($1, $2)
//             ON CONFLICT (name) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM countries WHERE name = $1
//         `;
//         const countryResult = await client.query(countryQuery, [
//           property.address.country,
//           property.address.country.slice(0, 2).toUpperCase()
//         ]);
//         const country_id = countryResult.rows[0].id;

//         const cityQuery = `
//           WITH inserted AS (
//             INSERT INTO cities (name, country_id)
//             VALUES ($1, $2)
//             ON CONFLICT (name, country_id) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM cities WHERE name = $1 AND country_id = $2
//         `;
//         const cityResult = await client.query(cityQuery, [property.address.city, country_id]);
//         const city_id = cityResult.rows[0].id;

//         const addressQuery = `
//           WITH inserted AS (
//             INSERT INTO addresses (street, city_id, postal_code, latitude, longitude)
//             VALUES ($1, $2, $3, $4, $5)
//             ON CONFLICT (street, city_id, postal_code) DO NOTHING
//             RETURNING id
//           )
//           SELECT id FROM inserted
//           UNION
//           SELECT id FROM addresses WHERE street = $1 AND city_id = $2 AND (postal_code = $3 OR (postal_code IS NULL AND $3 IS NULL))
//         `;
//         const addressResult = await client.query(addressQuery, [
//           property.address.street,
//           city_id,
//           property.address.postal_code || null,
//           property.address.latitude || null,
//           property.address.longitude || null
//         ]);
//         property.address_id = addressResult.rows[0].id;
//       }

//       if (property.image_urls) {
//         await client.query('DELETE FROM property_images WHERE property_id = $1', [id]);
//         for (const imageUrl of property.image_urls) {
//           await client.query(
//             'INSERT INTO property_images (property_id, url) VALUES ($1, $2)',
//             [id, imageUrl]
//           );
//         }
//       }

//       const fields = [];
//       const values = [];
//       let index = 1;
//       for (const [key, value] of Object.entries(property)) {
//         if (value !== undefined && key !== 'address' && key !== 'image_urls') {
//           fields.push(`${key} = $${index++}`);
//           values.push(key === 'amenities' ? JSON.stringify(value) : value);
//         }
//       }
//       if (fields.length === 0) return null;
//       values.push(id);
//       const query = `
//         UPDATE properties
//         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
//         WHERE id = $${index}
//         RETURNING *
//       `;
//       const result = await client.query(query, values);
//       await client.query('COMMIT');

//       await this.redisClient.del(`properties:realtor:${result.rows[0].realtor_id}`);
//       await this.redisClient.del(`properties:connection:*`);
//       return result.rows[0];
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   async delete(id: number): Promise<boolean> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');
//       const property = await this.findById(id, ['id', 'realtor_id']);
//       if (!property) return false;
//       const query = `DELETE FROM properties WHERE id = $1`;
//       const result = await this.pool.query(query, [id]);
//       await client.query('COMMIT');
//       await this.redisClient.del(`properties:realtor:${property.realtor_id}`);
//       await this.redisClient.del(`properties:connection:*`);
//       return (result.rowCount ?? 0) > 0;
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }
// }

// export default new PropertyModel(pool);
