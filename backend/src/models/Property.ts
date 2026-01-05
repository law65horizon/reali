// Updated propertyModel
import { Pool } from "pg";
import redis from "redis";
import pool from "../config/database.js";
import { Address } from "./Address.js"; 
import { request } from "http";

export type Unit = {id: number, roomTypeId: string, unitCode?: string, floorNumber?: number, status?: string}
export type RateCalender = {date: String, nightly_rate: number, min_stay: number, is_blocked: boolean}

interface RoomType {
  id: number;
  property_id: number;
  name: string;
  description?: string;
  capacity?: number;
  bed_count?: number;
  bathroom_count?: number;
  size_sqft?: number;
  basePrice?: number;
  devivedPrice?: number;
  currency?: string;
  is_active?: boolean;
  amenities?: string[];
  units?: Unit[]
  pricingRules?: {startDate: string, endDate: string, nightlyRate?: number, minStay?: number, maxStay?: number, note?: string}[],
  durationDiscounts?: {stayType: string, discountPercent: string}[]
  created_at?: string;
  updated_at?: string;
  property: Omit<Property, 'roomTypes'>
  availableUnits?: number
  totalUnits?: number
  duration?: string
  monthlyRate?: number;
  weeklyRate?: number;
}

export interface Property {
  id: number;
  realtor_id: number;
  address_id: number;
  title: string;
  speciality: string;
  amenities: string[];
  price: number;
  description?: string;
  property_type: 'apartment' | 'hotel' | 'house';
  sale_status: 'rent' | 'sale';
  status: 'draft' | 'published' | 'pending_review' | 'archived';
  created_at?: string;
  updated_at?: string;
  address?: Address;
  roomTypes: RoomType[];
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

export interface SearchRoomsInput {
  propertyType: String
  beds: number
  bathrooms: number
  minPrice: number
  maxPrice: number
  minSize: number
  maxSize: number
  amenities: string[]
  address: String
  checkIn: Date
  checkOut: Date
  first: number
  after: String
  latitude?: number;
  longitude?: number;
  radius?: number;
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

  private mapGraphQLFieldsToColumns(requestedFields: string[], is_p=true): string[] {
    const fieldMap: { [key: string]: string } = {
      id: 'id',
      realtor_id: 'realtor_id',
      address_id: 'address_id',
      title: 'title',
      speciality: 'speciality',
      amenities: 'amenities',
      price: 'base_price',
      basePrice: 'base_price',
      description: 'description',
      status: 'status',
      created_at: 'created_at',
      updated_at: 'updated_at',
      property_type: 'property_type',
      sale_status: 'sale_status',
      property_id: 'property_id',
      name: 'name',
      bedCount: 'bed_count',
      bathroomCount: 'bathroom_count',
      sizeSqft: 'size_sqft',
      capacity: 'capacity',
      currency: 'currency',
      isActive: 'is_active',
      weeklyRate: 'weekly_rate',
      monthlyRate: 'monthly_rate',
    };
    
    const requiredFields = is_p ? ['id', 'realtor_id', 'address_id']: ['id'];
    const selectedFields = new Set<string>(requiredFields);

    requestedFields.forEach(field => {
      if (fieldMap[field] && !selectedFields.has(fieldMap[field])) {
        selectedFields.add(fieldMap[field]);
      }
    });

    return  is_p ? Array.from(selectedFields).map(field => `p.${field}`): Array.from(selectedFields).map(field => `rt.${field}`);
  }

  // private async calculateDurationLoader({check_in, check_out}): Promise<number> {
  //   const nights = pool.query(
  //     `SELECT calculate_nights($1, $2)`,
  //     [check_in, check_out]
  //   )
  //   console.log({osd: nights.rows[0]})
  //   return 19
  // }

  private extractPropertiesFields(fields: string[]): string[] {
    const result = fields.filter(f => (f.split('.').length - 1) === 1);
    return result
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
        INSERT INTO properties (realtor_id, address_id, title, speciality, price, description, amenities, status, property_type, sale_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8, 'rent')
        RETURNING *
      `;
      const propertyResult = await client.query(propertyQuery, [
        property.realtor_id,
        address_id,
        property.title,
        property.speciality,
        property.price,
        property.description,
        JSON.stringify(property.amenities),
        property.property_type,
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

      // const roomTypes = []
      for (const room of property.roomTypes) {
        const room_typesQuery = `
          INSERT INTO room_types (property_id, name, description, capacity, bed_count, bathroom_count, size_sqft, base_price, currency, is_active, amenities)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `

        const result = await client.query(room_typesQuery, [
          newProperty.id, room.name, room.description, room.capacity, room.bed_count,
          room.bathroom_count, room.size_sqft, room.basePrice, room.currency, 
          room.is_active, JSON.stringify(room.amenities)
        ])

        const type_id = result.rows[0]?.id

        // console.log({type_id, ce: room.basePrice})

        if (room.pricingRules && room.pricingRules.length > 0) {
          for (const pr of room.pricingRules) {
            await client.query(
              `INSERT INTO room_pricing_rules
                 (room_type_id, start_date, end_date, nightly_rate, min_stay, max_stay, note)
               VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [type_id, pr.startDate, pr.endDate, pr.nightlyRate, pr.minStay, pr.maxStay, pr.note]
            );
          }
        }

        // 4️⃣ Insert duration discounts
        if (room.durationDiscounts && room.durationDiscounts.length > 0) {
          for (const d of room.durationDiscounts) {
            await client.query(
              `INSERT INTO room_duration_discounts
                 (room_type_id, stay_type, discount_percent)
               VALUES ($1,$2,$3)`,
              [type_id, d.stayType, d.discountPercent]
            );
          }
        }

        await client.query(
          `SELECT refresh_rate_calendar($1, CURRENT_DATE, (CURRENT_DATE + INTERVAL '90 days')::date)`,
          [type_id]
        )

        // roomTypes.push(result.rows[0])
      }

      await client.query('COMMIT');
      await this.redisClient.del(`properties:realtor:${property.realtor_id}`);
      await this.redisClient.del("properties:connection:*");
      await this.redisClient.del("properties:search:*");
      return { ...newProperty, images };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        console.error({errors: 'error'})
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
    // console.log(fields, requestedFields)
    // console.log({query})
    const result = await this.pool.query(query, [id]);
    // console.log(result.rows[0])
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

  async searchRoomTypes(input: SearchRoomsInput, requestedFields: string[]): Promise<{
    edges: { node: RoomType, cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  }> {
    const {
      propertyType,
      beds,
      bathrooms,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      amenities,
      address,
      checkIn,
      checkOut,
      first = 20,
      after,
      latitude,
      longitude,
      radius
    } = input;
    let duration: string;
    let price;
    const conditions: string[] = [];
    const params: any[] = [];

    // Property type
    if (propertyType) {
      params.push(propertyType);
      conditions.push(`p.property_type = $${params.length}`);
    }

  // Bed / bath filters
    if (beds) {
      params.push(beds);
      conditions.push(`rt.bed_count >= $${params.length}`);
    }
    if (bathrooms) {
      params.push(bathrooms);
      conditions.push(`rt.bathroom_count >= $${params.length}`);
    }

    // Size filters
    if (minSize) {
      params.push(minSize);
      conditions.push(`rt.size_sqft >= $${params.length}`);
    }
    if (maxSize) {
      params.push(maxSize);
      conditions.push(`rt.size_sqft <= $${params.length}`);
    }

    // Price filters
    if (minPrice) {
      params.push(minPrice);
      conditions.push(`rt.base_price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(maxPrice);
      conditions.push(`rt.base_price <= $${params.length}`);
    }

    // Amenity filter
    if (amenities && amenities.length > 0) {
      params.push(amenities);
      conditions.push(`rt.amenities && $${params.length}::text[]`);
    }

    // 🔍 Location filter — FIXED (direct JOIN with addresses)
    if (latitude && longitude && radius) {
      params.push(longitude, latitude, radius * 1000); // convert km → meters if needed
      conditions.push(`
        ST_DWithin(
          a.geom,
          ST_MakePoint($${params.length - 2}, $${params.length - 1})::geography,
          $${params.length}
        )
      `);
    }

  // Address search (partial match)
    if (address) {
      params.push(`%${address}%`);
      conditions.push(`(
        p.title ILIKE $${params.length}
        OR a.street ILIKE $${params.length}
        OR EXISTS (SELECT 1 FROM cities c WHERE c.id = a.city_id AND c.name ILIKE $${params.length})
        OR EXISTS (SELECT 1 FROM countries co 
        JOIN cities c2 ON c2.country_id = co.id
        HERE c2.id = a.city_id AND co.name ILIKE $${params.length})
      )`);
    }

    // Availability
    let availabilityJoin = "";
    if (checkIn && checkOut) {
      const result = await this.pool.query(
        `SELECT calculate_nights($1, $2)`,
        [checkIn, checkOut]
      )

      const nights = result.rows[0]?.calculate_nights;

      if (nights >= 30) {
        duration =  'monthly';
      } else if (nights >= 7) {
        duration =  'weekly';
      } else {
        duration =  'daily';
      }
      
      params.push(checkIn, checkOut);
      const startIdx = params.length - 1;
      const endIdx = params.length;
      availabilityJoin = `
        JOIN room_units u ON u.room_type_id = rt.id AND u.status = 'active'
        LEFT JOIN bookings b ON b.unit_id = u.id
        AND b.status = 'confirmed'
        AND daterange(b.check_in, b.check_out, '[]') && daterange($${startIdx}, $${endIdx}, '[]')
      `;
      conditions.push("b.id IS NULL");
      // availabilityJoin = `
      //   JOIN room_units u ON u.room_type_id = rt.id AND u.status = 'active'
      //   LEFT JOIN bookings b ON b.unit_id = u.id
      //   AND b.status = 'confirmed'
      // `;
    } else {
      // availabilityJoin = `
      //   JOIN room_units u ON u.room_type_id = rt.id AND u.status = 'active'
      //   LEFT JOIN bookings b ON b.unit_id = u.id
      //   AND b.status = 'confirmed'
      // `;
      availabilityJoin = `
        JOIN room_units u ON u.room_type_id = rt.id AND u.status = 'active'
      `;
      // conditions.push("b.id IS NULL");
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Pagination
    let paginationClause = "";
    if (after) {
      params.push(after);
      paginationClause = `AND rt.id > $${params.length}`;
    }



    const p_fields = requestedFields.filter(f => f.startsWith('p.')).map(f => f + ' AS ' + f.replace('.', '_'))
    let price_fields = [];
    switch (duration) {
      case 'daily': {
        // params.push(checkIn);
        // const startIndex = params.length;

        // params.push(checkOut);
        // const endIndex = params.length;
        if (!checkIn || !checkOut) return;

        price_fields = [`
          (
            SELECT AVG(rc.nightly_rate)
            FROM rate_calendar rc
            WHERE rc.room_type_id = rt.id
            AND rc.date >= '2025-11-14'
            AND rc.date <  '2025-11-16'
          ) AS dbx
        `];
        break;
      }
      case 'weekly': {
        price_fields = ['rt.weekly_rate AS dbx']
        break
      }
      case 'monthly': {
        price_fields = ['rt.monthly_rate AS dbx']
        break
      }
    }
    params.push(first);
    const limitClause = `LIMIT $${params.length}`;
    const fields = [
      ...this.mapGraphQLFieldsToColumns(requestedFields, false),
      ...p_fields,
      ...price_fields
    ]

    // console.log({fields, p_fields})

    // ✅ Fixed: include JOIN addresses a for spatial + text filtering
    // const roomTypesQuery = `
    //   SELECT rt.*,
    //     p.id AS property_id,
    //     p.realtor_id AS property_realtor_id,
    //     p.address_id AS property_address_id,
    //     p.title AS property_title,
    //     p.speciality AS property_speciality,
    //     p.property_type AS property_type,
    //     p.sale_status AS property_sale_status,
    //     p.price AS property_price,
    //     p.description AS property_description,
    //     p.status AS property_status,
    //     p.created_at AS property_created_at,
    //     p.updated_at AS property_updated_at,
    //     COUNT(u.id) AS available_units,
    //     COUNT(rt.id) AS total_units
    //   FROM room_types rt
    //   JOIN properties p ON rt.property_id = p.id
    //   JOIN addresses a ON p.address_id = a.id
    //   ${availabilityJoin}
    //   ${whereClause}
    //   GROUP BY rt.id, p.id
    //   ORDER BY rt.id
    //   ${paginationClause}
    //   ${limitClause};
    // `;
    
    const roomTypesQuery = `
      SELECT 
        ${fields.join(', ')},     
        COUNT(u.id) AS available_units,
        COUNT(rt.id) AS total_units
      FROM room_types rt
      JOIN properties p ON rt.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      ${availabilityJoin}
      ${whereClause}
      GROUP BY rt.id, p.id
      ORDER BY rt.id
      ${paginationClause}
      ${limitClause};
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*)
      FROM room_types rt
      JOIN properties p ON rt.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      ${availabilityJoin}
      ${whereClause};
    `;

    // console.log({ roomTypesQuery, params });

    const result = await this.pool.query(roomTypesQuery, params);
    const totalCountResult = await this.pool.query(countQuery, params.slice(0, -1));


    const roomTypes: RoomType[] = result.rows.map(row => ({
      id: row.id,
      property_id: row.property_id,
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      bedCount: row.bed_count,
      bathroomcount: row.bathroom_count,
      sizeSqft: row.size_sqft,
      basePrice: row.base_price,
      price: row.base_price,
      derivedPrice: row.dbx,
      weeklyRate: row.weekly_rate,
      monthlyRate: row.monthly_rate,
      property: {
        id: row.p_id,
        realtor_id: row.p_realtor_id,
        address_id: row.p_address_id,
        title: row.p_title,
        speciality: row.p_speciality,
        amenities: row.p_amenities,
        price: row.p_price,
        description: row.p_description,
        property_type: row.p_property_type,
        sale_status: row.p_sale_status,
        status: row.p_status,
        created_at: row.p_created_at,
        updated_at: row.p_updated_at,
      },
      availableUnits: row.available_units,
      totalUnits: row.total_units,
      duration: duration,
      amenities: row.amenities || [],
    }));


    // console.log({roomTypes})

    const hasNextPage = result.rows.length === first;
    const endCursor = hasNextPage ? result.rows[result.rows.length - 1].id : null;

    console.log({returned: 'fas'})

    return {
      edges: roomTypes.map(node => ({
        node,
        cursor: node.id.toString(),
      })),
      pageInfo: { hasNextPage, endCursor },
      totalCount: totalCountResult.rows[0].count,
    };
  }
  
  async getRoomType(id: number, requestedFields: string[]): Promise<RoomType> {
    let params = []
    params.push(id)
    const p_fields = requestedFields.filter(f => f.startsWith('p.')).map(f => f + ' AS ' + f.replace('.', '_'))
    const fields = [...this.mapGraphQLFieldsToColumns(requestedFields, false), ...p_fields]
    const query = `
      SELECT ${fields.join(' ,')}
      FROM room_types rt
      JOIN properties p ON rt.property_id = p.id
      WHERE rt.id = $${params.length}
    `;
    console.log({query})
    const result = await this.pool.query(query, params);
    console.log({resul: result.rows[0]})
    const room: any = {
      id: result.rows[0]?.id,
      name: result.rows[0]?.name,
      property_id: result.rows[0]?.property_id,
      description: result.rows[0]?.description,
      currency: result.rows[0]?.currency,
      amenities: result.rows[0]?.amenities,
      capacity: result.rows[0]?.capacity,
      bedCount: result.rows[0]?.bed_count,
      bathroomCount: result.rows[0]?.bathroom_count,
      sizeSqft: result.rows[0]?.size_sqft,
      basePrice: result.rows[0]?.base_price,
      weeklyRate: result.rows[0]?.weekly_rate,
      monthlyRate: result.rows[0]?.monthly_rate,
      totalUnits: result.rows[0]?.total_units,
      property: {
        id: result.rows[0]?.p_id,
        realtor_id: result.rows[0]?.p_realtor_id,
        address_id: result.rows[0]?.p_address_id,
        title: result.rows[0]?.p_title,
        speciality: result.rows[0]?.p_speciality,
        amenities: result.rows[0]?.p_amenities,
        price: result.rows[0]?.p_price,
        description: result.rows[0]?.p_description,
        property_type: result.rows[0]?.p_property_type,
        sale_status: result.rows[0]?.p_sale_status,
        status: result.rows[0]?.p_status,
        created_at: result.rows[0]?.p_created_at,
        updated_at: result.rows[0]?.p_updated_at,
      },
    }
    // console.log({result: room})rs

    return room
  }

  async addRoomUnit(input: Omit<Unit, 'id'>): Promise<Unit> {
    // console.log('sosioiso')
    const query = `
      INSERT INTO room_units (room_type_id, unit_code, floor_number, status) VALUES ($1, $2, $3, $4) RETURNING *
    `

    const result = await this.pool.query(query, [
      input.roomTypeId, input.unitCode, input.floorNumber, input.status
    ])

    console.log(result.rows[0])
    return result.rows[0]
  }

  async getAvailability({ id, startDate, endDate }): Promise<RateCalender[]> {
    // console.log({id, startDate, endDate})
    const result = await this.pool.query(
      `SELECT date, nightly_rate, min_stay, is_blocked
       FROM rate_calendar
       WHERE room_type_id = $1
         AND date BETWEEN $2 AND $3
       ORDER BY date`,
      [id, startDate, endDate]
    );
    // console.log({result: result.rows})
    return result.rows;
  }

  async getAvailableUnits({ id, checkIn, checkOut }): Promise<Unit[]> {
    const params = (checkIn && checkOut) ? [id, checkIn, checkOut]: [id]
    const result = await this.pool.query(
      `SELECT ru.*
       FROM room_units ru
       WHERE ru.room_type_id = $1
        AND ru.id NOT IN (
          SELECT b.unit_id
          FROM bookings b
          WHERE b.status = 'confirmed'
          ${(checkIn && checkOut) ? `AND daterange(check_in, check_out, '[]') && daterange($2, $3, '[]')`: ''}
        )`,
      [...params]
    );
    return result.rows;
  }

  async countUnits({ id }): Promise<number> {
    console.log({id})
    const result = await this.pool.query(
      `SELECT COUNT(*)
       FROM room_units ru
       WHERE ru.room_type_id = $1
        AND ru.id NOT IN (
          SELECT b.unit_id
          FROM bookings b
          WHERE b.status = 'confirmed'
        )`,
      [id]
    );

    console.log({resos: result.rows[0]})
    return result.rows[0]?.count;
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


