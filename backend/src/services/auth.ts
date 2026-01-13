// src/services/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { NextFunction, Request } from 'express';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '1d' });
};

 // JWT Verification Middleware
export const verifyToken = ({req, next}: {req: Request, next?: NextFunction}) => {
  // console.log({req})
  const authHeader = req.headers.authorization;

  // console.log({ssio: authHeader})
  
  if (!authHeader) {
    (req as any).user = null;
    return next();
  }
  // console.log({authHeader})
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    (req as any).user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log({decoded});
    (req as any).user = decoded;
    next();
  } catch (err) {
    (req as any).user = null;
    // console.log({err})
    next();
  }
};
