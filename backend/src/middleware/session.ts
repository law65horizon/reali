// sessionManager.ts - Hybrid JWT + Redis Session Management
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis.js';

// ============================================
// TYPES & INTERFACES
// ============================================

interface SessionData {
  userId: number;
  email?: string;
  role?: string;
  deviceId?: string;
  createdAt: number;
  lastActivity: number;
}

interface JWTPayload {
  userId: number;
  sessionId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user?: any
}

// ============================================
// CONFIGURATION
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

const TTL = {
  ACCESS_TOKEN: 30 * 60, // 30 minutes
  REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days
  SESSION_REDIS: 30 * 24 * 60 * 60, // 30 days (matches refresh token)
  DRAFT: 24 * 60 * 60, // 24 hours
  BLACKLIST: 30 * 60, // 30 minutes (matches access token)
};

// ============================================
// SESSION MANAGER CLASS
// ============================================

export class SessionManager {
  // ============================================
  // CREATE SESSION (Login)
  // ============================================
  
  static async createSession(
    userId: number,
    userData: Partial<SessionData> = {}
  ): Promise<TokenPair> {
    const sessionId = uuidv4();
    const now = Date.now();

    // Session data stored in Redis
    const sessionData: SessionData = {
      userId,
      email: userData.email,
      role: userData.role,
      deviceId: userData.deviceId,
      createdAt: now,
      lastActivity: now,
    };

    // Store session in Redis with TTL
    await redisClient.setEx(
      `session:${sessionId}`,
      TTL.SESSION_REDIS,
      JSON.stringify(sessionData)
    );

    // Add to user's active sessions set
    await redisClient.sAdd(`user:${userId}:sessions`, sessionId);
    await redisClient.expire(`user:${userId}:sessions`, TTL.SESSION_REDIS);

    // Generate tokens
    const accessToken = this.generateAccessToken(userId, sessionId, userData);
    const refreshToken = this.generateRefreshToken(userId, sessionId);

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {id: sessionData.userId, email: sessionData.email}
    };
  }

  // ============================================
  // VERIFY & GET SESSION
  // ============================================

  static async verifyAccessToken(token: string): Promise<SessionData | null> {
    
    try {
      // const token = tokenHeadear.replace('Bearer ', '')
      // 1. Verify JWT signature and expiration
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // console.log({payload})
      // 2. Check if token is blacklisted (for logout before expiry)
      const isBlacklisted = await redisClient.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        return null;
      }

      // 3. Check if session still exists in Redis
      const sessionData = await this.getSessionFromRedis(payload.sessionId);
      if (!sessionData.success) {
        return null;
      }

      // 4. Update last activity (async, don't wait)
      this.updateLastActivity(payload.sessionId).catch(err => 
        console.error('Failed to update activity:', err)
      );

      return sessionData.session;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        console.log('Invalid token');
      }
      return null;
    }
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================

  static async refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JWTPayload;

      console.log('refreshToken')
      console.log({payload})
      // Check if session exists
      console.time('redis')
      const data = await this.getSessionFromRedis(payload.sessionId);
      console.timeEnd('redis')
      if (!data.success) {
        return null;
      }
      console.log({session: data.session})
      const user = {
        id: data.session.userId,
        email: data.session.email
      }

      console.log({user})

      // Generate new access token (keep same refresh token)
      const newAccessToken = this.generateAccessToken(
        data.session.userId,
        payload.sessionId,
        { email: data.session.email, role: data.session.role }
      );

      return {
        accessToken: newAccessToken,
        refreshToken, // Return same refresh token
        sessionId: payload.sessionId,
        user
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  static async deleteSession(sessionId: string, accessToken?: string): Promise<boolean> {
    try {
      // 1. Get session to find userId
      const sessionData = await this.getSessionFromRedis(sessionId);
      
      // 2. Delete session from Redis
      await redisClient.del(`session:${sessionId}`);

      // 3. Remove from user's active sessions
      if (sessionData.session) {
        await redisClient.sRem(`user:${sessionData.session.userId}:sessions`, sessionId);
      }

      // 4. Blacklist the access token (if provided) to invalidate before expiry
      if (accessToken) {
        await redisClient.setEx(
          `blacklist:${accessToken}`,
          TTL.BLACKLIST,
          '1'
        );
      }

      return true;
    } catch (error) {
      console.error('Delete session error:', error);
      return false;
    }
  }

  // ============================================
  // LOGOUT ALL DEVICES
  // ============================================

  static async deleteAllUserSessions(userId: number): Promise<number> {
    try {
      // Get all session IDs for user
      const sessionIds: any = await redisClient.sMembers(`user:${userId}:sessions`);

      if (sessionIds.length === 0) {
        return 0;
      }

      // Delete all sessions
      const pipeline = redisClient.multi();
      sessionIds.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(`user:${userId}:sessions`);

      await pipeline.exec();

      return sessionIds.length;
    } catch (error) {
      console.error('Delete all sessions error:', error);
      return 0;
    }
  }

  // ============================================
  // GET ACTIVE SESSIONS
  // ============================================

  static async getUserActiveSessions(userId: number): Promise<SessionData[]> {
    try {
      const sessionIds:any = await redisClient.sMembers(`user:${userId}:sessions`);

      if (sessionIds.length === 0) {
        return [];
      }

      const sessions: SessionData[] = [];
      for (const sessionId of sessionIds) {
        const data = await this.getSessionFromRedis(sessionId);
        if (data) {
          sessions.push({ ...data, sessionId } as any);
        }
      }

      return sessions;
    } catch (error) {
      console.error('Get active sessions error:', error);
      return [];
    }
  }

  // ============================================
  // DRAFT MANAGEMENT
  // ============================================

  static async saveDraft(userId: number, draftType: string, draftData: any): Promise<void> {
    const key = `draft:${draftType}:${userId}`;
    await redisClient.setEx(key, TTL.DRAFT, JSON.stringify(draftData));
  }

  static async getDraft(userId: number, draftType: string): Promise<any | null> {
    const key = `draft:${draftType}:${userId}`;
    const data = (await redisClient.get(key))?.toString();
    return data ? JSON.parse(data) : null;
  }

  static async deleteDraft(userId: number, draftType: string): Promise<boolean> {
    const key = `draft:${draftType}:${userId}`;
    const result = (await redisClient.del(key)).toString();
    return parseInt(result) > 0;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static generateAccessToken(
    userId: number,
    sessionId: string,
    userData: Partial<SessionData> = {}
  ): string {
    const payload: JWTPayload = {
      userId,
      sessionId,
      email: userData.email,
      role: userData.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TTL.ACCESS_TOKEN,
    });
  }

  private static generateRefreshToken(userId: number, sessionId: string): string {
    const payload: JWTPayload = {
      userId,
      sessionId,
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: TTL.REFRESH_TOKEN,
    });
  }

  static async getSessionFromRedis(sessionId: string): Promise<{
    success: boolean,
    message: string,
    session: SessionData | null
  }> {
    try {
      const data:any = await redisClient.get(`session:${sessionId}`);
      const session: SessionData = JSON.parse(data)
      if (!session) return {
        success: false,
        message: 'session not found',
        session: null
      };

      return {
        success: true,
        message: 'Session Found',
        session: session
      };
    } catch (error) {
      console.error('Redis get session error:', error);
      return null;
    }
  }

  private static async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const data = await this.getSessionFromRedis(sessionId);
      if (data.success) {
        data.session.lastActivity = Date.now();
        await redisClient.setEx(
          `session:${sessionId}`,
          TTL.SESSION_REDIS,
          JSON.stringify(data.session)
        );
      }
    } catch (error) {
      // Don't throw - this is non-critical
      console.error('Update activity error:', error);
    }
  }

  // ============================================
  // SESSION METADATA
  // ============================================

  static async updateSessionMetadata(
    sessionId: string,
    metadata: Partial<SessionData>
  ): Promise<boolean> {
    try {
      const existing = await this.getSessionFromRedis(sessionId);
      if (!existing.success) return false;

      const updated = { ...existing.session, ...metadata };
      await redisClient.setEx(
        `session:${sessionId}`,
        TTL.SESSION_REDIS,
        JSON.stringify(updated)
      );

      return true;
    } catch (error) {
      console.error('Update metadata error:', error);
      return false;
    }
  }

  // ============================================
  // CLEANUP (Run periodically)
  // ============================================

  static async cleanupExpiredSessions(): Promise<number> {
    // This is handled automatically by Redis TTL
    // But you can implement additional cleanup logic here
    console.log('Expired sessions are automatically cleaned by Redis TTL');
    return 0;
  }
}

// ============================================
// APOLLO/EXPRESS CONTEXT HELPER
// ============================================

export async function createContext({ req, res }: { req: any; res: any }) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      req,
      res,
      user: null,
      sessionId: null,
      ip: req.ip,
    };
  }

  const token = authHeader.replace('Bearer ', '');
  const sessionData = await SessionManager.verifyAccessToken(token);

  return {
    req,
    res,
    user: sessionData ? {
      id: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
    } : null,
    sessionId: sessionData ? (jwt.decode(token) as any)?.sessionId : null,
    ip: req.ip,
  };
}

export default SessionManager;