import { Pool } from 'pg';

interface SearchInput {
  propertyType?: string;
  beds?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  amenities?: string[];
  query?: string;
  checkIn?: Date;
  checkOut?: Date;
  first?: number;
  after?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface SearchResult {
  roomTypes: RoomTypeResult[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

interface RoomTypeResult {
  id: number;
  name: string;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  sizeSqft: number;
  propertyType: string;
  propertyName: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  availableUnits?: number;
  distance?: number;
}

export class RoomTypeSearchService {
  constructor(private pool: Pool) {}

  /**
   * Parse address query to determine optimal search strategy
   */
  private parseAddressQuery(query: string): {
    useFullText: boolean;
    usePostalCode: boolean;
    useCity: boolean;
    normalizedQuery: string;
  } {
    const trimmed = query.trim();
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    const usePostalCode = digitsOnly.length >= 5;
    const useCity = trimmed.split(/\s+/).length <= 2 && !usePostalCode;
    const useFullText = !usePostalCode && !useCity;
    
    return {
      useFullText,
      usePostalCode,
      useCity,
      normalizedQuery: trimmed.toLowerCase()
    };
  }

  /**
   * Main search function with unit-based availability
   */
  async searchRoomTypes(input: SearchInput): Promise<SearchResult> {
    const {
      propertyType,
      beds,
      bathrooms,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      amenities,
      query,
      checkIn,
      checkOut,
      first = 20,
      after,
      latitude,
      longitude,
      radius,
    } = input;

    const params: any[] = [];
    let paramIndex = 1;

    // Helper to add parameters
    const addParam = (value: any): string => {
      params.push(value);
      return `$${paramIndex++}`;
    };

    // Build address filter CTE
    const addressCTE = this.buildAddressFilterCTE(
      query, latitude, longitude, radius, addParam
    );

    // Build availability CTE - checking unit-level bookings
    const availabilityCTE = checkIn && checkOut
      ? this.buildAvailabilityCTE(checkIn, checkOut, addParam)
      : null;

    // Main query with all CTEs
    let sqlQuery = `
      WITH filtered_addresses AS (
        ${addressCTE}
      )
      ${availabilityCTE ? `, available_room_types AS (${availabilityCTE})` : ''}
      SELECT 
        rt.id,
        rt.name,
        rt.beds,
        rt.bathrooms,
        rt.price_per_night,
        rt.size_sqft,
        rt.property_type,
        rt.total_units,
        p.name as property_name,
        a.street_address,
        a.city,
        a.state,
        a.postal_code,
        ST_Y(a.coordinates::geometry) as latitude,
        ST_X(a.coordinates::geometry) as longitude
        ${availabilityCTE ? ', art.available_units' : ''}
        ${latitude && longitude 
          ? `, ST_Distance(
              a.coordinates, 
              ST_SetSRID(ST_MakePoint(${addParam(longitude)}, ${addParam(latitude)}), 4326)
            ) as distance` 
          : ''}
      FROM room_types rt
      INNER JOIN properties p ON rt.property_id = p.id
      INNER JOIN filtered_addresses a ON rt.address_id = a.id
      ${availabilityCTE ? 'INNER JOIN available_room_types art ON rt.id = art.room_type_id' : ''}
    `;

    const conditions: string[] = [];

    // Apply filters
    if (propertyType) {
      conditions.push(`rt.property_type = ${addParam(propertyType)}`);
    }

    if (beds !== undefined) {
      conditions.push(`rt.beds >= ${addParam(beds)}`);
    }

    if (bathrooms !== undefined) {
      conditions.push(`rt.bathrooms >= ${addParam(bathrooms)}`);
    }

    if (minPrice !== undefined) {
      conditions.push(`rt.price_per_night >= ${addParam(minPrice)}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(`rt.price_per_night <= ${addParam(maxPrice)}`);
    }

    if (minSize !== undefined) {
      conditions.push(`rt.size_sqft >= ${addParam(minSize)}`);
    }

    if (maxSize !== undefined) {
      conditions.push(`rt.size_sqft <= ${addParam(maxSize)}`);
    }

    // Amenities filter - ALL amenities must be present
    if (amenities && amenities.length > 0) {
      conditions.push(`
        (
          SELECT COUNT(DISTINCT rta.amenity)
          FROM room_type_amenities rta
          WHERE rta.room_type_id = rt.id 
            AND rta.amenity = ANY(${addParam(amenities)})
        ) = ${addParam(amenities.length)}
      `);
    }

    // Cursor pagination
    if (after) {
      const decodedCursor = this.decodeCursor(after);
      conditions.push(`rt.id > ${addParam(decodedCursor.id)}`);
    }

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Ordering
    if (latitude && longitude) {
      sqlQuery += ` ORDER BY distance ASC, rt.id ASC`;
    } else {
      sqlQuery += ` ORDER BY rt.price_per_night ASC, rt.id ASC`;
    }

    // Limit with +1 for hasNextPage detection
    sqlQuery += ` LIMIT ${addParam(first + 1)}`;

    // Execute query
    const result = await this.pool.query(sqlQuery, params);
    const rows = result.rows;

    // Process pagination
    const hasNextPage = rows.length > first;
    const roomTypes = hasNextPage ? rows.slice(0, first) : rows;
    const endCursor = roomTypes.length > 0 
      ? this.encodeCursor({ id: roomTypes[roomTypes.length - 1].id })
      : null;

    // Transform results
    const formattedResults: RoomTypeResult[] = roomTypes.map(row => ({
      id: row.id,
      name: row.name,
      beds: row.beds,
      bathrooms: parseFloat(row.bathrooms),
      pricePerNight: parseFloat(row.price_per_night),
      sizeSqft: row.size_sqft,
      propertyType: row.property_type,
      propertyName: row.property_name,
      address: {
        street: row.street_address,
        city: row.city,
        state: row.state,
        postalCode: row.postal_code,
        latitude: row.latitude,
        longitude: row.longitude,
      },
      ...(row.available_units && { availableUnits: row.available_units }),
      ...(row.distance && { distance: row.distance }),
    }));

    return {
      roomTypes: formattedResults,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    };
  }

  /**
   * Build availability CTE - finds room types with at least one available unit
   * 
   * Logic:
   * 1. Get all active units for each room type
   * 2. Check which units have conflicting bookings in the date range
   * 3. Return room types where (total_active_units - booked_units) > 0
   */
  private buildAvailabilityCTE(
    checkIn: Date,
    checkOut: Date,
    addParam: (val: any) => string
  ): string {
    const checkInParam = addParam(checkIn);
    const checkOutParam = addParam(checkOut);

    return `
      SELECT 
        ru.room_type_id,
        COUNT(DISTINCT ru.id) - COUNT(DISTINCT b.unit_id) as available_units
      FROM room_units ru
      LEFT JOIN bookings b ON (
        b.unit_id = ru.id
        AND b.status IN ('pending', 'confirmed')
        AND daterange(b.check_in, b.check_out, '[)') && 
            daterange(${checkInParam}, ${checkOutParam}, '[)')
      )
      WHERE ru.is_active = true
      GROUP BY ru.room_type_id
      HAVING COUNT(DISTINCT ru.id) - COUNT(DISTINCT b.unit_id) > 0
    `;
  }

  /**
   * Build address filter CTE based on search type
   */
  private buildAddressFilterCTE(
    query: string | undefined,
    latitude: number | undefined,
    longitude: number | undefined,
    radius: number | undefined,
    addParam: (val: any) => string
  ): string {
    // Geographic search takes priority
    if (latitude && longitude && radius) {
      const latParam = addParam(latitude);
      const lonParam = addParam(longitude);
      const radiusParam = addParam(radius);
      
      return `
        SELECT id, street_address, city, state, postal_code, coordinates
        FROM addresses
        WHERE ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint(${lonParam}, ${latParam}), 4326)::geography,
          ${radiusParam}
        )
      `;
    }

    // Text-based address search
    if (query) {
      const parsed = this.parseAddressQuery(query);
      
      if (parsed.usePostalCode) {
        const normalized = query.replace(/[^0-9]/g, '');
        const queryParam = addParam(`${normalized}%`);
        return `
          SELECT id, street_address, city, state, postal_code, coordinates
          FROM addresses
          WHERE postal_code_normalized LIKE ${queryParam}
        `;
      }
      
      if (parsed.useCity) {
        const queryParam = addParam(`${parsed.normalizedQuery}%`);
        return `
          SELECT id, street_address, city, state, postal_code, coordinates
          FROM addresses
          WHERE city_normalized LIKE ${queryParam}
        `;
      }
      
      // Full-text search
      const queryParam = addParam(query);
      return `
        SELECT id, street_address, city, state, postal_code, coordinates,
               ts_rank(search_vector, query) as rank
        FROM addresses, 
             plainto_tsquery('english', ${queryParam}) query
        WHERE search_vector @@ query
        ORDER BY rank DESC
      `;
    }

    // No filter - return all addresses
    return `
      SELECT id, street_address, city, state, postal_code, coordinates
      FROM addresses
    `;
  }

  /**
   * Cursor encoding/decoding for pagination
   */
  private encodeCursor(data: { id: number }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { id: number } {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  }
}

// Usage example
const pool = new Pool({
  host: 'localhost',
  database: 'your_db',
  user: 'your_user',
  password: 'your_password',
  max: 20,
});

const searchService = new RoomTypeSearchService(pool);

const results = await searchService.searchRoomTypes({
  query: 'San Francisco',
  beds: 2,
  bathrooms: 1,
  minPrice: 100,
  maxPrice: 300,
  amenities: ['wifi', 'parking'],
  checkIn: new Date('2025-02-01'),
  checkOut: new Date('2025-02-05'),
  first: 20,
});

console.log(`Found ${results.roomTypes.length} room types`);
results.roomTypes.forEach(rt => {
  console.log(`${rt.name}: $${rt.pricePerNight}/night, ${rt.availableUnits} units available`);
});