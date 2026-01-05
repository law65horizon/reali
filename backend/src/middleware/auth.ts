import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/auth.js'

// export const authMiddleWare = async (req:Request, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers.authorization?.replace('Bearer ', '')
//         if (token) {
//             const user = await verifyToken(token);
//             (req as any).user = user
//         }
//         next();
//     } catch (error) {
//         res.status(401).json({error: 'Unauthorized'})
//     }
// }

// import { verify } from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// import { User } from "../models/User.js";

// export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   console.log('Auth middleware: token:', token);
//   if (!token) {
//     console.log('No token provided');
//     return next();
//   }
//   try {
//     const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");
//     console.log('Auth middleware: decoded token:', decoded);
//     req.user = decoded as User; // Ensure User interface matches decoded payload
//     next();
//   } catch (error) {
//     console.error('Auth middleware: JWT verification error:', error);
//     next();
//   }
// };