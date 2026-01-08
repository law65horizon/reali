import { NextFunction, Request, Response } from "express";
import SessionManager from "./session.js";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // return res.status(401).json({error: 'No token provided'})
    (req as any).user = null;
    return next()
  }

  const token = authHeader.replace('Bearer ', '')
  const sessionData = await SessionManager.verifyAccessToken(token)

  console.log(sessionData)
  if (!sessionData) {
    // return res.status(402).json({error: "Invalid or expired token"})
    (req as any).user = null;
    return next()
  }

  (req as any).user = {
    id: sessionData.userId,
    email: sessionData.email,
    role: sessionData.role
  }

  next()

}