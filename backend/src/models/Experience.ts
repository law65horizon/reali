// Updated ExperienceModel
import { Pool } from "pg";
import redis from "redis";
import pool from "../config/database.js";
import { Address } from "./Address.js";

export interface Experience {
  id: number;
  host_id: number;
  address_id: number;
  title: string;
  brief_bio: string;
  category: string;
  years_of_experience: number;
  professional_title: string;
  price: number;
  group_size_min: number;
  group_size_max: number;
  duration_minutes: number;
  experience_overview: string;
  cancellation_policy?: string;
  status: 'draft' | 'published' | 'pending_review' | 'archived';
  created_at?: string;
  updated_at?: string;
  address?: Address;
  images?: { id: number; url: string; meta_data?: string; caption?: string }[];
  itineraries?: { id: number; day: number; description: string; start_time?: string; end_time?: string }[];
  itinerary_days?: { id: number; date: string; start_time?: string; end_time?: string; activities: { id: number; title: string; description?: string; thumbnail_url?: string; location?: string, duration_minutes?: number }[] }[];
  faqs?: { id: number; question: string; answer: string; created_at?: string }[];
  bookings?: { id: number; user_id: number; start_date: string; end_date: string; status: string; created_at?: string }[];
  reviews?: { id: number; user_id: number; rating: number; comment?: string; created_at?: string }[];
}

interface ExperienceSearchInput {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  professionalTitle?: string;
  groupSize?: number;
  minDuration?: number;
  minYearsOfExperience?: number;
  minRating?: number;
  startDate?: string;
  endDate?: string;
}

export class ExperienceModel {
  private redisClient: redis.RedisClientType;

  constructor(private pool: Pool) {
    // this.redisClient = redis.createClient({
    //   username: 'default',
    //   password: process.env.REDIS_PASSWORD || 'npA2GgAvR6DpV0Z2NZurNQqK93mJIgmW',
    //   socket: {
    //     host: process.env.REDIS_HOST || 'redis-11196.c92.us-east-1-3.ec2.redns.redis-cloud.com',
    //     port: parseInt(process.env.REDIS_PORT || '11196')
    //   }
    // });
    // this.redisClient.connect().catch(err => console.error('Redis connection error:', err));
  }

  private mapGraphQLFieldsToColumns(requestedFields: string[]): string[] {
    const fieldMap: { [key: string]: string } = {
      id: 'id',
      host_id: 'host_id',
      address_id: 'address_id',
      title: 'title',
      brief_bio: 'brief_bio',
      category: 'category',
      years_of_experience: 'years_of_experience',
      professional_title: 'professional_title',
      price: 'price',
      group_size_min: 'group_size_min',
      group_size_max: 'group_size_max',
      duration_minutes: 'duration_minutes',
      experience_overview: 'experience_overview',
      cancellation_policy: 'cancellation_policy',
      status: 'status',
      created_at: 'created_at',
      updated_at: 'updated_at',
      address: 'address_id', // Will join with addresses table
      images: 'id', // Will resolve via DataLoader
      reviews: 'id' // Will resolve via DataLoader
    };

    const requiredFields = ['id', 'host_id', 'address_id'];
    const selectedFields = new Set<string>(requiredFields);

    requestedFields.forEach(field => {
      if (fieldMap[field] && !selectedFields.has(fieldMap[field])) {
        selectedFields.add(fieldMap[field]);
      }
    });

    return Array.from(selectedFields).map(field => `e.${field}`);
  }

  async create(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'> & {
    address: Omit<Address, 'id' | 'created_at'>;
    image_urls: string[];
    itineraries: { day: number; description: string; start_time?: string; end_time?: string }[];
    itinerary_days: { date: string; start_time?: string; end_time?: string; activities: { title: string; description?: string; duration_minutes?: number; thumbnail_url?: string; location?: string }[] }[];
    faqs: { question: string; answer: string }[];
  }): Promise<Experience> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let address_id: number | null = null;
      if (experience.address) {
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
          experience.address.country,
          experience.address.country.slice(0, 2).toUpperCase()
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
        const cityResult = await client.query(cityQuery, [experience.address.city, country_id]);
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
          experience.address.street,
          city_id,
          experience.address.postal_code || null,
          experience.address.latitude || null,
          experience.address.longitude || null
        ]);
        address_id = addressResult.rows[0].id;
      }

      const experienceQuery = `
        INSERT INTO experiences (
          host_id, address_id, title, brief_bio, category, years_of_experience, professional_title,
          price, group_size_min, group_size_max, duration_minutes, experience_overview, cancellation_policy, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'draft')
        RETURNING *
      `;
      const experienceResult = await client.query(experienceQuery, [
        experience.host_id,
        address_id,
        experience.title,
        experience.brief_bio,
        experience.category,
        experience.years_of_experience,
        experience.professional_title,
        experience.price,
        experience.group_size_min,
        experience.group_size_max,
        experience.duration_minutes,
        experience.experience_overview,
        experience.cancellation_policy
      ]);
      const newExperience = experienceResult.rows[0];

      const images = [];
      for (const imageUrl of experience.image_urls) {
        console.log('Inserting image URL:', imageUrl);
        const imageQuery = `
          INSERT INTO experience_images (experience_id, url)
          VALUES ($1, $2)
          RETURNING id, url, meta_data, caption
        `;
        const imageResult = await client.query(imageQuery, [newExperience.id, imageUrl]);
        images.push(imageResult.rows[0]);
        console.log('Inserted image:', imageResult.rows[0]);
      }

      const itineraries = [];
      for (const itinerary of experience.itineraries) {
        const itineraryQuery = `
          INSERT INTO experience_itineraries (experience_id, day, description, start_time, end_time)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const itineraryResult = await client.query(itineraryQuery, [
          newExperience.id,
          itinerary.day,
          itinerary.description,
          itinerary.start_time || null,
          itinerary.end_time || null
        ]);
        itineraries.push(itineraryResult.rows[0]);
        console.log('Inserted itinerary:', itineraryResult.rows[0]);
      }

      const itinerary_days = [];
      for (const day of experience.itinerary_days) {
        const dayQuery = `
          INSERT INTO itinerary_days (experience_id, date, start_time, end_time)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const dayResult = await client.query(dayQuery, [newExperience.id, day.date, day.start_time || null, day.end_time || null]);
        const newDay = dayResult.rows[0];

        const activities = [];
        for (const activity of day.activities) {
          const activityQuery = `
            INSERT INTO activities (itinerary_day_id, title, description, duration_minutes, thumbnail_url, location)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          const activityResult = await client.query(activityQuery, [
            newDay.id,
            activity.title,
            activity.description || null,
            activity.duration_minutes || null,
            activity.thumbnail_url || null,
            activity.location || null
          ]);
          activities.push(activityResult.rows[0]);
          console.log('Inserted activity:', activityResult.rows[0]);
        }
        itinerary_days.push({ ...newDay, activities });
        console.log('Inserted itinerary day:', { ...newDay, activities });
      }

      const faqs = [];
      for (const faq of experience.faqs) {
        const faqQuery = `
          INSERT INTO experience_faqs (experience_id, question, answer)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const faqResult = await client.query(faqQuery, [newExperience.id, faq.question, faq.answer]);
        faqs.push(faqResult.rows[0]);
        console.log('Inserted FAQ:', faqResult.rows[0]);
      }

      await client.query('COMMIT');
      await this.redisClient.del(`experiences:host:${experience.host_id}`);
      await this.redisClient.del(`experiences:all:*`);
      await this.redisClient.del(`experiences:connection:*`);
      await this.redisClient.del(`experiences:search:*`);
      console.log('Created experience with related data:', { ...newExperience, images, itineraries, itinerary_days, faqs });
      return { ...newExperience, images, itineraries, itinerary_days, faqs };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        throw new Error('Unique constraint violation: ' + error.detail);
      }
      console.error('Create error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: number, requestedFields: string[] = []): Promise<Experience | null> {
    const cacheKey = `experiences:id:${id}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') {
      console.log('Cache hit for findById:', cacheKey);
      return JSON.parse(cached);
    }

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    const query = `
      SELECT ${fields.join(', ')}
      FROM experiences e
      WHERE e.id = $1
    `;
    console.log('findById query:', query, 'with id:', id);
    const result = await this.pool.query(query, [id]);
    const experience = result.rows[0] || null;
    console.log('findById result:', experience);

    if (experience) {
      await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experience));
    }
    return experience;
  }

  async findByHost(host_id: number, requestedFields: string[] = []): Promise<Experience[]> {
    const cacheKey = `experiences:host:${host_id}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') {
      console.log('Cache hit for findByHost:', cacheKey);
      return JSON.parse(cached);
    }

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    const query = `
      SELECT ${fields.join(', ')}
      FROM experiences e
      WHERE e.host_id = $1
    `;
    console.log('findByHost query:', query, 'with host_id:', host_id);
    const result = await this.pool.query(query, [host_id]);
    const experiences = result.rows;
    console.log('findByHost result:', experiences);

    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experiences));
    return experiences;
  }

  async findAll(requestedFields: string[] = []): Promise<Experience[]> {
    const cacheKey = `experiences:all:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') {
      console.log('Cache hit for findAll:', cacheKey);
      return JSON.parse(cached);
    }

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    const query = `
      SELECT ${fields.join(', ')}
      FROM experiences e
      WHERE e.status IN ('draft', 'published')
    `;
    console.log('findAll query:', query);
    const result = await this.pool.query(query);
    const experiences = result.rows;
    console.log('findAll result:', experiences);

    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experiences));
    return experiences;
  }

  async findAllPaginated(first: number, after?: string, requestedFields: string[] = []): Promise<{
    edges: { node: Experience; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  }> {
    const cacheKey = `experiences:connection:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached && typeof cached === 'string') {
      console.log('Cache hit for findAllPaginated:', cacheKey);
      return JSON.parse(cached);
    }

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    let whereClauses = ["e.status IN ('draft', 'published')"];
    const params: any[] = [];
    let paramIndex = 1;

    if (after) {
      whereClauses.push(`e.id > $${paramIndex}`);
      params.push(parseInt(after));
      paramIndex++;
    }

    const fullWhere = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT ${fields.join(', ')}, c.name AS city, co.name AS country
      FROM experiences e
      LEFT JOIN addresses a ON e.address_id = a.id
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${fullWhere}
      ORDER BY e.id ASC
      LIMIT $${paramIndex}
    `;
    params.push(first + 1);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM experiences e
      ${fullWhere}
    `;
    const countParams = params.slice(0, -1);

    const [result, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const experiences = result.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const hasNextPage = experiences.length > first;
    const edges = experiences.slice(0, first).map(experience => ({
      node: experience,
      cursor: experience.id.toString()
    }));
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    const response = {
      edges,
      pageInfo: { hasNextPage, endCursor },
      totalCount
    };

    await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
    console.log('findAllPaginated result:', response);
    return response;
  }

  async searchPaginated(input: ExperienceSearchInput, first: number, after?: string, requestedFields: string[] = []): Promise<{
    edges: { node: Experience; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  }> {
    const cacheKey = `experiences:search:${JSON.stringify(input)}:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
    const cached = await this.redisClient.get(cacheKey);
    // if (cached && typeof cached === 'string') return JSON.parse(cached);

    const fields = this.mapGraphQLFieldsToColumns(requestedFields);
    let whereClauses = ["e.status = 'published' OR e.status = 'draft'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.query) {
      console.log('Adding search query filter:', input.query);
      whereClauses.push(`(e.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex} OR a.street ILIKE $${paramIndex})`);
      params.push(`%${input.query}%`);
      paramIndex++;
    }

    if (input.minPrice) {
      console.log('Adding minPrice filter:', input.minPrice);
      whereClauses.push(`e.price >= $${paramIndex}`);
      params.push(input.minPrice);
      paramIndex++;
    }

    if (input.maxPrice) {
      whereClauses.push(`e.price <= $${paramIndex}`);
      params.push(input.maxPrice);
      paramIndex++;
    }

    if (input.category) {
      whereClauses.push(`e.category ILIKE $${paramIndex}`);
      params.push(`%${input.category}%`);
      paramIndex++;
    }

    if (input.professionalTitle) {
      whereClauses.push(`e.professional_title ILIKE $${paramIndex}`);
      params.push(`%${input.professionalTitle}%`);
      paramIndex++;
    }

    if (input.groupSize) {
      whereClauses.push(`e.group_size_min <= $${paramIndex} AND e.group_size_max >= $${paramIndex}`);
      params.push(input.groupSize);
      paramIndex++;
    }

    if (input.minDuration) {
      whereClauses.push(`e.duration_minutes >= $${paramIndex}`);
      params.push(input.minDuration);
      paramIndex++;
    }

    if (input.minYearsOfExperience) {
      whereClauses.push(`e.years_of_experience >= $${paramIndex}`);
      params.push(input.minYearsOfExperience);
      paramIndex++;
    }

    if (input.minRating) {
      whereClauses.push(`COALESCE((SELECT AVG(r.rating) FROM experience_reviews r WHERE r.experience_id = e.id), 0) >= $${paramIndex}`);
      params.push(input.minRating);
      paramIndex++;
    }

    let availabilityClause = '';
    if (input.startDate && input.endDate) {
      availabilityClause = ` AND NOT EXISTS (
        SELECT 1 FROM experience_bookings b 
        WHERE b.experience_id = e.id AND b.status = 'confirmed' 
        AND (b.start_date, b.end_date) OVERLAPS ($${paramIndex}::date, $${paramIndex + 1}::date)
      )`;
      params.push(input.startDate, input.endDate);
      paramIndex += 2;
    }

    if (after) {
      whereClauses.push(`e.id > $${paramIndex}`);
      params.push(parseInt(after));
      paramIndex++;
    }

    const fullWhere = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT ${fields.join(', ')}, c.name AS city, co.name AS country
      FROM experiences e
      LEFT JOIN addresses a ON e.address_id = a.id
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${fullWhere}${availabilityClause}
      ORDER BY e.id ASC
      LIMIT $${paramIndex}
    `;
    params.push(first + 1);

    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total
      FROM experiences e
      LEFT JOIN addresses a ON e.address_id = a.id
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${fullWhere}${availabilityClause}
    `;
    const countParams = params.slice(0, paramIndex - 1);

    const [result, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const experiences = result.rows;
    const totalCount = parseInt(countResult.rows[0].total);
    const hasNextPage = experiences.length > first;
    const edges = experiences.slice(0, first).map(experience => ({
      node: experience,
      cursor: experience.id.toString()
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

  async update(id: number, experience: Partial<Omit<Experience, 'id' | 'created_at'>> & {
    address?: Omit<Address, 'id' | 'created_at'>;
    image_urls?: string[];
    itineraries?: { day: number; description: string; start_time?: string; end_time?: string }[];
    itinerary_days?: { date: string; start_time?: string; end_time?: string; activities: { title: string; description?: string; duration_minutes?: number; thumbnail_url?: string; location?: string }[] }[];
    faqs?: { question: string; answer: string }[];
  }): Promise<Experience | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const experienceData = await this.findById(id, ['id', 'host_id', 'address_id']);
      if (!experienceData) return null;

      if (experience.address) {
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
          experience.address.country,
          experience.address.country.slice(0, 2).toUpperCase()
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
        const cityResult = await client.query(cityQuery, [experience.address.city, country_id]);
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
          experience.address.street,
          city_id,
          experience.address.postal_code || null,
          experience.address.latitude || null,
          experience.address.longitude || null
        ]);
        experience.address_id = addressResult.rows[0].id;
      }

      if (experience.image_urls) {
        await client.query('DELETE FROM experience_images WHERE experience_id = $1', [id]);
        for (const imageUrl of experience.image_urls) {
          console.log('Inserting image URL for update:', imageUrl);
          const imageQuery = `
            INSERT INTO experience_images (experience_id, url)
            VALUES ($1, $2)
            RETURNING id, url, meta_data, caption
          `;
          const imageResult = await client.query(imageQuery, [id, imageUrl]);
          console.log('Inserted image for update:', imageResult.rows[0]);
        }
      }

      if (experience.itineraries) {
        await client.query('DELETE FROM experience_itineraries WHERE experience_id = $1', [id]);
        for (const itinerary of experience.itineraries) {
          const itineraryQuery = `
            INSERT INTO experience_itineraries (experience_id, day, description, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `;
          const itineraryResult = await client.query(itineraryQuery, [
            id,
            itinerary.day,
            itinerary.description,
            itinerary.start_time || null,
            itinerary.end_time || null
          ]);
          console.log('Inserted itinerary for update:', itineraryResult.rows[0]);
        }
      }

      if (experience.itinerary_days) {
        await client.query('DELETE FROM itinerary_days WHERE experience_id = $1', [id]);
        for (const day of experience.itinerary_days) {
          const dayQuery = `
            INSERT INTO itinerary_days (experience_id, date, start_time, end_time)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
          const dayResult = await client.query(dayQuery, [id, day.date, day.start_time || null, day.end_time || null]);
          const newDay = dayResult.rows[0];

          for (const activity of day.activities) {
            const activityQuery = `
              INSERT INTO activities (itinerary_day_id, title, description, duration_minutes, thumbnail_url, location)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
            `;
            const activityResult = await client.query(activityQuery, [
              newDay.id,
              activity.title,
              activity.description || null,
              activity.duration_minutes || null,
              activity.thumbnail_url || null,
              activity.location || null
            ]);
            console.log('Inserted activity for update:', activityResult.rows[0]);
          }
          console.log('Inserted itinerary day for update:', newDay);
        }
      }

      if (experience.faqs) {
        await client.query('DELETE FROM experience_faqs WHERE experience_id = $1', [id]);
        for (const faq of experience.faqs) {
          const faqQuery = `
            INSERT INTO experience_faqs (experience_id, question, answer)
            VALUES ($1, $2, $3)
            RETURNING *
          `;
          const faqResult = await client.query(faqQuery, [id, faq.question, faq.answer]);
          console.log('Inserted FAQ for update:', faqResult.rows[0]);
        }
      }

      const fields = [];
      const values = [];
      let index = 1;
      for (const [key, value] of Object.entries(experience)) {
        if (value !== undefined && key !== 'address' && key !== 'image_urls' && key !== 'itineraries' && key !== 'itinerary_days' && key !== 'faqs') {
          fields.push(`${key} = $${index++}`);
          values.push(value);
        }
      }
      if (fields.length === 0) return await this.findById(id, ['id', 'host_id', 'address_id']);
      values.push(id);
      const query = `
        UPDATE experiences
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
        RETURNING *
      `;
      console.log('update query:', query, 'with values:', values);
      const result = await this.pool.query(query, values);
      await client.query('COMMIT');

      await this.redisClient.del(`experiences:host:${result.rows[0].host_id}`);
      await this.redisClient.del(`experiences:all:*`);
      await this.redisClient.del(`experiences:id:${id}:*`);
      await this.redisClient.del(`experiences:connection:*`);
      await this.redisClient.del(`experiences:search:*`);
      console.log('update result:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const experience = await this.findById(id, ['id', 'host_id']);
      if (!experience) return false;
      const query = `DELETE FROM experiences WHERE id = $1`;
      console.log('delete query:', query, 'with id:', id);
      const result = await this.pool.query(query, [id]);
      await client.query('COMMIT');
      await this.redisClient.del(`experiences:host:${experience.host_id}`);
      await this.redisClient.del(`experiences:all:*`);
      await this.redisClient.del(`experiences:id:${id}:*`);
      await this.redisClient.del(`experiences:connection:*`);
      await this.redisClient.del(`experiences:search:*`);
      console.log('delete result:', (result.rowCount ?? 0) > 0);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Delete error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new ExperienceModel(pool);

// import { Pool } from "pg";
// import redis from "redis";
// import pool from "../config/database.js";
// import { Address } from "./Address.js";

// export interface Experience {
//   id: number;
//   host_id: number;
//   address_id: number;
//   title: string;
//   brief_bio: string;
//   category: string;
//   years_of_experience: number;
//   professional_title: string;
//   price: number;
//   group_size_min: number;
//   group_size_max: number;
//   duration_minutes: number;
//   experience_overview: string;
//   cancellation_policy?: string;
//   status: 'draft' | 'published' | 'pending_review' | 'archived';
//   created_at?: string;
//   updated_at?: string;
//   address?: Address;
//   images?: { id: number; url: string; meta_data?: string; caption?: string }[];
//   itineraries?: { id: number; day: number; description: string; start_time?: string; end_time?: string }[];
//   itinerary_days?: { id: number; date: string; start_time?: string; end_time?: string; activities: { id: number; title: string; description?: string; thumbnail_url?: string; location?: string, duration_minutes?: number }[] }[];
//   faqs?: { id: number; question: string; answer: string; created_at?: string }[];
//   bookings?: { id: number; user_id: number; start_date: string; end_date: string; status: string; created_at?: string }[];
//   reviews?: { id: number; user_id: number; rating: number; comment?: string; created_at?: string }[];
// }

// export class ExperienceModel {
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
//       host_id: 'host_id',
//       address_id: 'address_id',
//       title: 'title',
//       brief_bio: 'brief_bio',
//       category: 'category',
//       years_of_experience: 'years_of_experience',
//       professional_title: 'professional_title',
//       price: 'price',
//       group_size_min: 'group_size_min',
//       group_size_max: 'group_size_max',
//       duration_minutes: 'duration_minutes',
//       experience_overview: 'experience_overview',
//       cancellation_policy: 'cancellation_policy',
//       status: 'status',
//       created_at: 'created_at',
//       updated_at: 'updated_at',
//       address: 'address_id', // Will join with addresses table
//       images: 'id', // Will resolve via DataLoader
//       reviews: 'id' // Will resolve via DataLoader
//     };

//     const requiredFields = ['id', 'host_id', 'address_id'];
//     const selectedFields = new Set<string>(requiredFields);

//     requestedFields.forEach(field => {
//       if (fieldMap[field] && !selectedFields.has(fieldMap[field])) {
//         selectedFields.add(fieldMap[field]);
//       }
//     });

//     return Array.from(selectedFields).map(field => `e.${field}`);
//   }

//   async create(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'> & {
//     address: Omit<Address, 'id' | 'created_at'>;
//     image_urls: string[];
//     itineraries: { day: number; description: string; start_time?: string; end_time?: string }[];
//     itinerary_days: { date: string; activities: { title: string; description?: string; start_time?: string; end_time?: string; url?: string; location?: string }[] }[];
//     faqs: { question: string; answer: string }[];
//   }): Promise<Experience> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');

//       let address_id: number | null = null;
//       if (experience.address) {
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
//           experience.address.country,
//           experience.address.country.slice(0, 2).toUpperCase()
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
//         const cityResult = await client.query(cityQuery, [experience.address.city, country_id]);
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
//           experience.address.street,
//           city_id,
//           experience.address.postal_code || null,
//           experience.address.latitude || null,
//           experience.address.longitude || null
//         ]);
//         address_id = addressResult.rows[0].id;
//       }

//       const experienceQuery = `
//         INSERT INTO experiences (
//           host_id, address_id, title, brief_bio, category, years_of_experience, professional_title,
//           price, group_size_min, group_size_max, duration_minutes, experience_overview, cancellation_policy, status
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'draft')
//         RETURNING *
//       `;
//       const experienceResult = await client.query(experienceQuery, [
//         experience.host_id,
//         address_id,
//         experience.title,
//         experience.brief_bio,
//         experience.category,
//         experience.years_of_experience,
//         experience.professional_title,
//         experience.price,
//         experience.group_size_min,
//         experience.group_size_max,
//         experience.duration_minutes,
//         experience.experience_overview,
//         experience.cancellation_policy
//       ]);
//       const newExperience = experienceResult.rows[0];

//       const images = [];
//       for (const imageUrl of experience.image_urls) {
//         console.log('Inserting image URL:', imageUrl);
//         const imageQuery = `
//           INSERT INTO experience_images (experience_id, url)
//           VALUES ($1, $2)
//           RETURNING id, url, meta_data, caption
//         `;
//         const imageResult = await client.query(imageQuery, [newExperience.id, imageUrl]);
//         images.push(imageResult.rows[0]);
//         console.log('Inserted image:', imageResult.rows[0]);
//       }

//       const itineraries = [];
//       for (const itinerary of experience.itineraries) {
//         const itineraryQuery = `
//           INSERT INTO experience_itineraries (experience_id, day, description, start_time, end_time)
//           VALUES ($1, $2, $3, $4, $5)
//           RETURNING *
//         `;
//         const itineraryResult = await client.query(itineraryQuery, [
//           newExperience.id,
//           itinerary.day,
//           itinerary.description,
//           itinerary.start_time || null,
//           itinerary.end_time || null
//         ]);
//         itineraries.push(itineraryResult.rows[0]);
//         console.log('Inserted itinerary:', itineraryResult.rows[0]);
//       }

//       const itinerary_days = [];
//       for (const day of experience.itinerary_days) {
//         const dayQuery = `
//           INSERT INTO itinerary_days (experience_id, date, start_time, end_time)
//           VALUES ($1, $2, $3, $4)
//           RETURNING *
//         `;
//         const dayResult = await client.query(dayQuery, [newExperience.id, day.date, day.start_time || null, day.end_time || null]);
//         const newDay = dayResult.rows[0];

//         const activities = [];
//         for (const activity of day.activities) {
//           const activityQuery = `
//             INSERT INTO activities (itinerary_day_id, title, description, location, duration_minutes, thumbnail_url)
//             VALUES ($1, $2, $3, $4, $5, $6)
//             RETURNING *
//           `;
//           const activityResult = await client.query(activityQuery, [
//             newDay.id,
//             activity.title,
//             activity.description || null,
//             activity.location || null,
//             activity.duration_minutes || null,
//             activity.thumbnail_url || null
//           ]);
//           activities.push(activityResult.rows[0]);
//           console.log('Inserted activity:', activityResult.rows[0]);
//         }
//         itinerary_days.push({ ...newDay, activities });
//         console.log('Inserted itinerary day:', { ...newDay, activities });
//       }

//       const faqs = [];
//       for (const faq of experience.faqs) {
//         const faqQuery = `
//           INSERT INTO experience_faqs (experience_id, question, answer)
//           VALUES ($1, $2, $3)
//           RETURNING *
//         `;
//         const faqResult = await client.query(faqQuery, [newExperience.id, faq.question, faq.answer]);
//         faqs.push(faqResult.rows[0]);
//         console.log('Inserted FAQ:', faqResult.rows[0]);
//       }

//       await client.query('COMMIT');
//       await this.redisClient.del(`experiences:host:${experience.host_id}`);
//       await this.redisClient.del(`experiences:all:*`);
//       console.log('Created experience with related data:', { ...newExperience, images, itineraries, itinerary_days, faqs });
//       return { ...newExperience, images, itineraries, itinerary_days, faqs };
//     } catch (error) {
//       await client.query('ROLLBACK');
//       if (error.code === '23505') {
//         throw new Error('Unique constraint violation: ' + error.detail);
//       }
//       console.error('Create error:', error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   async findById(id: number, requestedFields: string[] = []): Promise<Experience | null> {
//     const cacheKey = `experiences:id:${id}:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     if (cached && typeof cached === 'string') {
//       console.log('Cache hit for findById:', cacheKey);
//       return JSON.parse(cached);
//     }

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM experiences e
//       WHERE e.id = $1
//     `;
//     console.log('findById query:', query, 'with id:', id);
//     const result = await this.pool.query(query, [id]);
//     const experience = result.rows[0] || null;
//     console.log('findById result:', experience);

//     if (experience) {
//       await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experience));
//     }
//     return experience;
//   }

//   async findByHost(host_id: number, requestedFields: string[] = []): Promise<Experience[]> {
//     const cacheKey = `experiences:host:${host_id}:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     if (cached && typeof cached === 'string') {
//       console.log('Cache hit for findByHost:', cacheKey);
//       return JSON.parse(cached);
//     }

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM experiences e
//       WHERE e.host_id = $1
//     `;
//     console.log('findByHost query:', query, 'with host_id:', host_id);
//     const result = await this.pool.query(query, [host_id]);
//     const experiences = result.rows;
//     console.log('findByHost result:', experiences);

//     await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experiences));
//     return experiences;
//   }

//   async findAll(requestedFields: string[] = []): Promise<Experience[]> {
//     const cacheKey = `experiences:all:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     if (cached && typeof cached === 'string') {
//       console.log('Cache hit for findAll:', cacheKey);
//       return JSON.parse(cached);
//     }

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const query = `
//       SELECT ${fields.join(', ')}
//       FROM experiences e
//       WHERE e.status IN ('draft', 'published')
//     `;
//     console.log('findAll query:', query);
//     const result = await this.pool.query(query);
//     const experiences = result.rows;
//     console.log('findAll result:', experiences);

//     await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(experiences));
//     return experiences;
//   }

//   async findAllPaginated(first: number, after?: string, requestedFields: string[] = []): Promise<{
//     edges: { node: Experience; cursor: string }[];
//     pageInfo: { hasNextPage: boolean; endCursor: string | null };
//     totalCount: number;
//   }> {
//     const cacheKey = `experiences:connection:${first}:${after || 'null'}:${JSON.stringify(requestedFields.sort())}`;
//     const cached = await this.redisClient.get(cacheKey);
//     // if (cached && typeof cached === 'string') {
//     //   console.log('Cache hit for findAllPaginated:', cacheKey);
//     //   return JSON.parse(cached);
//     // }

//     const fields = this.mapGraphQLFieldsToColumns(requestedFields);
//     const whereClause = after ? `WHERE e.id > $1 AND e.status IN ('draft', 'published')` : `WHERE e.status IN ('draft', 'published')`;
//     const params = after ? [parseInt(after)] : [];

//     // Join with addresses and cities to get city for grouping
//     const query = `
//       SELECT ${fields.join(', ')}, c.name AS city, co.name AS country
//       FROM experiences e
//       LEFT JOIN addresses a ON e.address_id = a.id
//       LEFT JOIN cities c ON a.city_id = c.id
//       LEFT JOIN countries co ON c.country_id = co.id
//       ${whereClause}
//       ORDER BY e.id ASC
//       LIMIT ${first + 1}
//     `;
//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM experiences e
//       WHERE e.status IN ('draft', 'published')
//     `;

//     const [result, countResult] = await Promise.all([
//       this.pool.query(query, params),
//       this.pool.query(countQuery)
//     ]);

//     const experiences = result.rows;
//     const totalCount = parseInt(countResult.rows[0].total);
//     const hasNextPage = experiences.length > first;
//     const edges = experiences.slice(0, first).map(experience => ({
//       node: { ...experience, address: { city: experience.city, country: experience.country } },
//       cursor: experience.id.toString()
//     }));
//     const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

//     const response = {
//       edges,
//       pageInfo: { hasNextPage, endCursor },
//       totalCount
//     };

//     await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
//     console.log('findAllPaginated result:', response);
//     return response;
//   }

//   async update(id: number, experience: Partial<Omit<Experience, 'id' | 'created_at'>> & {
//     address?: Omit<Address, 'id' | 'created_at'>;
//     image_urls?: string[];
//     itineraries?: { day: number; description: string; start_time?: string; end_time?: string }[];
//     itinerary_days?: { date: string; activities: { title: string; description?: string; start_time?: string; end_time?: string; url?: string; location?: string }[] }[];
//     faqs?: { question: string; answer: string }[];
//   }): Promise<Experience | null> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');
//       const experienceData = await this.findById(id, ['id', 'host_id', 'address_id']);
//       if (!experienceData) return null;

//       if (experience.address) {
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
//           experience.address.country,
//           experience.address.country.slice(0, 2).toUpperCase()
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
//         const cityResult = await client.query(cityQuery, [experience.address.city, country_id]);
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
//           experience.address.street,
//           city_id,
//           experience.address.postal_code || null,
//           experience.address.latitude || null,
//           experience.address.longitude || null
//         ]);
//         experience.address_id = addressResult.rows[0].id;
//       }

//       if (experience.image_urls) {
//         await client.query('DELETE FROM experience_images WHERE experience_id = $1', [id]);
//         for (const imageUrl of experience.image_urls) {
//           console.log('Inserting image URL for update:', imageUrl);
//           const imageQuery = `
//             INSERT INTO experience_images (experience_id, url)
//             VALUES ($1, $2)
//             RETURNING id, url, meta_data, caption
//           `;
//           const imageResult = await client.query(imageQuery, [id, imageUrl]);
//           console.log('Inserted image for update:', imageResult.rows[0]);
//         }
//       }

//       if (experience.itineraries) {
//         await client.query('DELETE FROM experience_itineraries WHERE experience_id = $1', [id]);
//         for (const itinerary of experience.itineraries) {
//           const itineraryQuery = `
//             INSERT INTO experience_itineraries (experience_id, day, description, start_time, end_time)
//             VALUES ($1, $2, $3, $4, $5)
//             RETURNING *
//           `;
//           const itineraryResult = await client.query(itineraryQuery, [
//             id,
//             itinerary.day,
//             itinerary.description,
//             itinerary.start_time || null,
//             itinerary.end_time || null
//           ]);
//           console.log('Inserted itinerary for update:', itineraryResult.rows[0]);
//         }
//       }

//       if (experience.itinerary_days) {
//         await client.query('DELETE FROM itinerary_days WHERE experience_id = $1', [id]);
//         for (const day of experience.itinerary_days) {
//           const dayQuery = `
//             INSERT INTO itinerary_days (experience_id, date)
//             VALUES ($1, $2)
//             RETURNING *
//           `;
//           const dayResult = await client.query(dayQuery, [id, day.date]);
//           const newDay = dayResult.rows[0];

//           for (const activity of day.activities) {
//             const activityQuery = `
//               INSERT INTO activities (itinerary_day_id, title, description, start_time, end_time, url, location)
//               VALUES ($1, $2, $3, $4, $5, $6, $7)
//               RETURNING *
//             `;
//             const activityResult = await client.query(activityQuery, [
//               newDay.id,
//               activity.title,
//               activity.description || null,
//               activity.start_time || null,
//               activity.end_time || null,
//               activity.url || null,
//               activity.location || null
//             ]);
//             console.log('Inserted activity for update:', activityResult.rows[0]);
//           }
//           console.log('Inserted itinerary day for update:', newDay);
//         }
//       }

//       if (experience.faqs) {
//         await client.query('DELETE FROM experience_faqs WHERE experience_id = $1', [id]);
//         for (const faq of experience.faqs) {
//           const faqQuery = `
//             INSERT INTO experience_faqs (experience_id, question, answer)
//             VALUES ($1, $2, $3)
//             RETURNING *
//           `;
//           const faqResult = await client.query(faqQuery, [id, faq.question, faq.answer]);
//           console.log('Inserted FAQ for update:', faqResult.rows[0]);
//         }
//       }

//       const fields = [];
//       const values = [];
//       let index = 1;
//       for (const [key, value] of Object.entries(experience)) {
//         if (value !== undefined && key !== 'address' && key !== 'image_urls' && key !== 'itineraries' && key !== 'itinerary_days' && key !== 'faqs') {
//           fields.push(`${key} = $${index++}`);
//           values.push(value);
//         }
//       }
//       if (fields.length === 0) return await this.findById(id, ['id', 'host_id', 'address_id']);
//       values.push(id);
//       const query = `
//         UPDATE experiences
//         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
//         WHERE id = $${index}
//         RETURNING *
//       `;
//       console.log('update query:', query, 'with values:', values);
//       const result = await this.pool.query(query, values);
//       await client.query('COMMIT');

//       await this.redisClient.del(`experiences:host:${result.rows[0].host_id}`);
//       await this.redisClient.del(`experiences:all:*`);
//       await this.redisClient.del(`experiences:id:${id}:*`);
//       console.log('update result:', result.rows[0]);
//       return result.rows[0];
//     } catch (error) {
//       await client.query('ROLLBACK');
//       console.error('Update error:', error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }

//   async delete(id: number): Promise<boolean> {
//     const client = await this.pool.connect();
//     try {
//       await client.query('BEGIN');
//       const experience = await this.findById(id, ['id', 'host_id']);
//       if (!experience) return false;
//       const query = `DELETE FROM experiences WHERE id = $1`;
//       console.log('delete query:', query, 'with id:', id);
//       const result = await this.pool.query(query, [id]);
//       await client.query('COMMIT');
//       await this.redisClient.del(`experiences:host:${experience.host_id}`);
//       await this.redisClient.del(`experiences:all:*`);
//       await this.redisClient.del(`experiences:id:${id}:*`);
//       console.log('delete result:', (result.rowCount ?? 0) > 0);
//       return (result.rowCount ?? 0) > 0;
//     } catch (error) {
//       await client.query('ROLLBACK');
//       console.error('Delete error:', error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   }
// }

// export default new ExperienceModel(pool);
