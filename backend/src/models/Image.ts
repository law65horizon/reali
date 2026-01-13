import { Pool } from "pg";
import pool from "../config/database.js";

export interface Image {
    id: number;
    property_id: number;
    image_url: string;
    meta_data?: string;
    created_at: Date;
}

export class ImageModel {
    constructor(private pool: Pool) {}

    async findByPropertyId(property_id: number): Promise<Image[]> {
        const query = `SELECT * FROM images WHERE property_id = $1`;
        console.log('property_id', property_id)
        const result = await this.pool.query(query, [property_id]);
        // console.log(result.rows)
        return result.rows;
    }
}

export default new ImageModel(pool);