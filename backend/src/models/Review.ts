// src/models/Review.ts
import { Pool } from 'pg';
import pool from '../config/database.js';

export interface Review {
  id: number;
  property_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export class ReviewModel {
  constructor(private pool: Pool) {}

  async create(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const query = `
      INSERT INTO reviews (property_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      review.property_id,
      review.user_id,
      review.rating,
      review.comment,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<Review | null> {
    const query = `SELECT * FROM reviews WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByPropertyId(propertyId: number): Promise<Review[]> {
    const query = `SELECT * FROM reviews WHERE property_id = $1`;
    const result = await this.pool.query(query, [propertyId]);
    return result.rows;
  }

  async update(id: number, review: Partial<Review>): Promise<Review | null> {
    const fields = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(review)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM reviews WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new ReviewModel(pool);