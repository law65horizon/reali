import { Pool } from "pg";
import pool from "../config/database.js";
import { Address } from "./Address.js";

export interface User {
  id: number;
  name: string;
  uid: string;
  email: string;
  password: string;
  phone?: string;
  description?: string;
  address_id?: number;
  created_at?: string;
  address?: Address;
}

export class UserModel {
  constructor(public pool: Pool) {}

  async create(user: Omit<User, 'id' | 'created_at'> & { address: Omit<Address, 'id' | 'created_at'> }): Promise<User> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let address_id: number | null = null;
    if (user.address) {
      // Find or create the country
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
        user.address.country,
        user.address.country.slice(0, 2).toUpperCase()
      ]);
      const country_id = countryResult.rows[0].id;

      // Find or create the city
      const cityQuery = `
        INSERT INTO cities (name, country_id)
        VALUES ($1, $2)
        ON CONFLICT (name, country_id) DO NOTHING
        RETURNING id
      `;
      const cityResult = await client.query(cityQuery, [user.address.city, country_id]);
      let city_id: number;
      if (cityResult.rows.length > 0) {
        city_id = cityResult.rows[0].id;
      } else {
        const selectCityQuery = `SELECT id FROM cities WHERE name = $1 AND country_id = $2`;
        const selectCityResult = await client.query(selectCityQuery, [user.address.city, country_id]);
        city_id = selectCityResult.rows[0].id;
      }

      // Create the address
      const addressQuery = `
        INSERT INTO addresses (street, city_id, postal_code, geom)
        VALUES ($1, $2, $3, ST_SetSrid(ST_MakePoint($4, $5), 4326)::geography)
        ON CONFLICT (street, city_id, postal_code) DO NOTHING
        RETURNING id
      `;
      const addressResult = await client.query(addressQuery, [
        user.address.street,
        city_id,
        user.address.postal_code || null,
        user.address.latitude || null,
        user.address.longitude || null
      ]);
      address_id = addressResult.rows[0].id;
    }

    // Create the user
    const userQuery = `
      INSERT INTO users (name, address_id, email, uid, password, phone, description, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, email, uid, phone, description, created_at, address_id
    `;
    const userResult = await client.query(userQuery, [
      user.name, address_id, user.email, user.uid||'sioso', user.password, user.phone, user.description
    ]);

    await client.query('COMMIT');
    return userResult.rows[0];
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
  
  async findById(id: number, requestedFields: string[] = []): Promise<User | null> {
  const userFields = requestedFields
    .filter(f => !f.startsWith('address.') && f !== 'address')
    .filter(f => ['id', 'name', 'email', 'uid', 'phone', 'description', 'created_at', 'address_id'].includes(f));
  const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));

  const query = `
    SELECT 
      ${userFields.length > 0 ? userFields.map(f => `u.${f}`).join(', ') : 'u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id'}
      ${includesAddress ? `, COALESCE(
        json_build_object(
          'id', a.id,
          'street', a.street,
          'city', c.name,
          'country', co.name,
          'postal_code', a.postal_code,
          'latitude', a.latitude,
          'longitude', a.longitude
        ),
        '{}'::json
      ) AS address` : ''}
    FROM users u
    LEFT JOIN addresses a ON u.address_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN countries co ON c.country_id = co.id
    WHERE u.id = $1
  `;
  const result = await this.pool.query(query, [id]);
  return result.rows[0] || null;
}

  async findAll(requestedFields: string[] = []): Promise<User[]> {
  const userFields = requestedFields
    .filter(f => !f.startsWith('address.') && f !== 'address')
    .filter(f => ['id', 'name', 'email', 'uid', 'phone', 'description', 'created_at', 'address_id'].includes(f));
  const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));

  const query = `
    SELECT 
      ${userFields.length > 0 ? userFields.map(f => `u.${f}`).join(', ') : 'u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id'}
      ${includesAddress ? `, COALESCE(
        json_build_object(
          'id', a.id,
          'street', a.street,
          'city', c.name,
          'country', co.name,
          'postal_code', a.postal_code,
          'latitude', a.latitude,
          'longitude', a.longitude
        ),
        '{}'::json
      ) AS address` : ''}
    FROM users u
    LEFT JOIN addresses a ON u.address_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN countries co ON c.country_id = co.id
  `;
  const result = await this.pool.query(query);
  return result.rows;
}

  async update(id: number, user: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(user)) {
      if (value !== undefined && key !== 'address' && key !== 'created_at') {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${index} 
      RETURNING id, name, email, uid, phone, description, created_at, address_id
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new UserModel(pool);


// async create(user: Omit<User, 'id' | 'created_at'> & { address: Omit<Address, 'id' | 'created_at'> }): Promise<Omit<User, 'address'>> {

  //   let address_id: number | null = null;
  //   if (user.address) {
  //     // First, find or create the country
  //     let countryQuery = `
  //       INSERT INTO countries (name, code)
  //       VALUES ($1, $2)
  //       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  //       RETURNING id
  //     `;
  //     const countryResult = await this.pool.query(countryQuery, [user.address.country, user.address.country.slice(0, 2).toUpperCase()]);
  //     // const countryResult = await this.pool.query(countryQuery, [user.address.city.country.name, user.address.city.country.code.slice(0, 2).toUpperCase()]);
  //     const country_id = countryResult.rows[0].id;

  //     // Then, find or create the city
  //     let cityQuery = `
  //       INSERT INTO cities (name, country_id)
  //       VALUES ($1, $2)
  //       ON CONFLICT (name, country_id) DO UPDATE SET name = EXCLUDED.name
  //       RETURNING id
  //     `;
  //     const cityResult = await this.pool.query(cityQuery, [user.address.city, country_id]);
  //     const city_id = cityResult.rows[0].id;

  //     // Finally, create the address
  //     const addressQuery = `
  //       INSERT INTO addresses (street, city_id, postal_code, latitude, longitude)
  //       VALUES ($1, $2, $3, $4, $5)
  //       ON CONFLICT (street, city_id, postal_code) DO UPDATE SET street = EXCLUDED.street
  //       RETURNING id, street
  //     `;
  //     const addressResult = await this.pool.query(addressQuery, [
  //       user.address.street,
  //       city_id,
  //       user.address.postal_code || null,
  //       user.address.latitude || null,
  //       user.address.longitude || null
  //     ]);
  //     address_id = addressResult.rows[0].id;
  //     console.log(addressResult.rows[0].street)
  //   }

  //   const query = `
  //     INSERT INTO users (name, address_id, email, uid, password, phone, description)
  //     VALUES ($1, $2, $3, $4, $5, $6, $7)
  //     RETURNING id, name, email, uid, phone, description, created_at, address_id
  //   `;
  //   const result = await this.pool.query(query, [
  //     user.name, address_id, user.email, user.uid, user.password, user.phone, user.description
  //   ]);
  //   return result.rows[0];
  // }

  // async findById(id: number, requestedFields: string[] = []): Promise<User | null> {
  //   const userFields = requestedFields
  //     .filter(f => !f.startsWith('address.') && f !== 'address')
  //     .filter(f => ['id', 'name', 'email', 'uid', 'phone', 'description', 'created_at', 'address_id'].includes(f));
  //   const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));
  //   const addressFields = requestedFields
  //     .filter(f => f.startsWith('address.'))
  //     .map(f => f.replace('address.', ''))
  //     .filter(f => ['id', 'street', 'city', 'postal_code', 'country', 'latitude', 'longitude', 'created_at'].includes(f));

  //   console.log('ijoiwjoejoj')
  //   const query = `
  //     SELECT 
  //       ${userFields.length > 0 ? userFields.join(', ') : 'u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id'}
  //       ${includesAddress ? `, COALESCE(
  //         json_build_object(
  //           ${addressFields.length > 0 ? addressFields.map(f => `'${f}', a.${f}`).join(', ') : "'id', a.id"}
  //         ),
  //         '{}'::json
  //       ) AS address` : ''}
  //     FROM users u
  //     ${includesAddress ? 'LEFT JOIN addresses a ON u.address_id = a.id' : ''}
  //     WHERE u.id = $1
  //   `;
  //   const result = await this.pool.query(query, [id]);
  //   return result.rows[0] || null;
  // }

  // async findById(id: number, requestedFields: string[] = []): Promise<User | null> {
  //   const userFields = requestedFields
  //     .filter(f => !f.startsWith('address.') && f !== 'address')
  //     .filter(f => ['id', 'name', 'email', 'uid', 'phone', 'description', 'created_at', 'address_id'].includes(f));
  //   const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));
  //   const addressFields = requestedFields
  //     .filter(f => f.startsWith('address.') && !f.startsWith('address.city.'))
  //     .map(f => f.replace('address.', ''))
  //     .filter(f => ['id', 'street', 'city_id', 'postal_code', 'latitude', 'longitude'].includes(f));
  //   const includesCity = requestedFields.some(f => f.startsWith('address.city.'));
  //   const cityFields = requestedFields
  //     .filter(f => f.startsWith('address.city.') && !f.startsWith('address.city.country.'))
  //     .map(f => f.replace('address.city.', ''))
  //     .filter(f => ['id', 'name'].includes(f));
  //   const includesCountry = requestedFields.some(f => f.startsWith('address.city.country.'));
  //   const countryFields = requestedFields
  //     .filter(f => f.startsWith('address.city.country.'))
  //     .map(f => f.replace('address.city.country.', ''))
  //     .filter(f => ['id', 'name', 'code'].includes(f));

  //   const query = `
  //     SELECT 
  //       ${userFields.length > 0 ? userFields.map(f => `u.${f}`).join(', ') : 'u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id'}
  //       ${includesAddress ? `, COALESCE(
  //         json_build_object(
  //           ${addressFields.length > 0 ? addressFields.map(f => `'${f}', a.${f}`).join(', ') : "'id', a.id"}
  //           ${includesCity ? `, 'city', json_build_object(
  //             ${cityFields.length > 0 ? cityFields.map(f => `'${f}', c.${f}`).join(', ') : "'id', c.id"}
  //             ${includesCountry ? `, 'country', json_build_object(
  //               ${countryFields.length > 0 ? countryFields.map(f => `'${f}', co.${f}`).join(', ') : "'id', co.id"}
  //             )` : ''}
  //           )` : ''}
  //         ),
  //         '{}'::json
  //       ) AS address` : ''}
  //     FROM users u
  //     ${includesAddress ? 'LEFT JOIN addresses a ON u.address_id = a.id' : ''}
  //     ${includesCity ? 'LEFT JOIN cities c ON a.city_id = c.id' : ''}
  //     ${includesCountry ? 'LEFT JOIN countries co ON c.country_id = co.id' : ''}
  //     WHERE u.id = $1
  //   `;
  //   const result = await this.pool.query(query, [id]);
  //   return result.rows[0] || null;
  // }

  // async findAll(requestedFields: string[] = []): Promise<User[]> {
  //   const userFields = requestedFields
  //     .filter(f => !f.startsWith('address.') && f !== 'address')
  //     .filter(f => ['id', 'name', 'email', 'uid', 'phone', 'description', 'created_at', 'address_id'].includes(f));
  //   const includesAddress = requestedFields.includes('address') || requestedFields.some(f => f.startsWith('address.'));
  //   const addressFields = requestedFields
  //     .filter(f => f.startsWith('address.'))
  //     .map(f => f.replace('address.', ''))
  //     .filter(f => ['id', 'street', 'city', 'postal_code', 'country', 'latitude', 'longitude', 'created_at'].includes(f));

  //   console.log(userFields)
  //   const query = `
  //     SELECT 
  //       ${userFields.length > 0 ? userFields.join(', ') : 'u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id'}
  //       ${includesAddress ? `, COALESCE(
  //         json_build_object(
  //           ${addressFields.length > 0 ? addressFields.map(f => `'${f}', a.${f}`).join(', ') : "'id', a.id"}
  //         ),
  //         '{}'::json
  //       ) AS address` : ''}
  //     FROM users u
  //     ${includesAddress ? 'LEFT JOIN addresses a ON u.address_id = a.id' : ''}
  //     ${includesAddress ? 'GROUP BY u.id, u.name, u.email, u.uid, u.phone, u.description, u.created_at, u.address_id' + (addressFields.length > 0 ? ', a.id, ' + addressFields.map(f => `a.${f}`).join(', ') : '') : ''}
  //   `;
  //   const result = await this.pool.query(query);
  //   console.log(result.rows)
  //   return result.rows;
  // }