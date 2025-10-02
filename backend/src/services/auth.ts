// src/services/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = async (token: string): Promise<User> => {
  return jwt.verify(token, env.JWT_SECRET) as User;
};