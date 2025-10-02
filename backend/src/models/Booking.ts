
import { Pool } from 'pg';
import pool from '../config/database.js';

export interface Booking {
  id: number;
  property_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export class BookingModel {
  constructor(private pool: Pool) {}

  async create(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
    const query = `
      INSERT INTO bookings (property_id, user_id, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      booking.property_id,
      booking.user_id,
      booking.start_date,
      booking.end_date,
      booking.status,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<Booking | null> {
    const query = `SELECT * FROM bookings WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Booking[]> {
    const query = `SELECT * FROM bookings`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async update(id: number, updates: Partial<Booking>): Promise<Booking | null> {
    const fields = [];
    const values = [];
    let index = 1;
    if (updates.status) {
      fields.push(`status = $${index++}`);
      values.push(updates.status);
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM bookings WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new BookingModel(pool);