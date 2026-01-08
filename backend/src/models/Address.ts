import { Pool } from "pg";
import pool from "../config/database.js";

export interface Address {
    id: number;
    street: string;
    city: string;
    postal_code?: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

export class AddressModel {
    constructor(public pool: Pool) {}

    async findById(id: number): Promise<Address | null> {
        const query = `SELECT * FROM addresses WHERE id = $1`;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
}

export default new AddressModel(pool);