// src/models/Message.ts
import { Pool } from 'pg';
import pool from '../config/database.js';

export interface Message {
  id: number;
  chat_id: string;
  sender_id: number;
  content: string;
  created_at: string;
}

export class MessageModel {
  constructor(private pool: Pool) {}

  async create(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const query = `
      INSERT INTO messages (chat_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.pool.query(query, [message.chat_id, message.sender_id, message.content]);
    return result.rows[0];
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    const query = `SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at`;
    const result = await this.pool.query(query, [chatId]);
    return result.rows;
  }
}

export default new MessageModel(pool);