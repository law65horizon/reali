import { Address } from "cluster";
import UserModel, { User } from "../../models/User.js";
import {getEmailTransporter} from "../../utils/emailTransport.js";
import { createUser } from "./user.js";
import Jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from "crypto"
import { Pool } from "pg";
import pool from "../../config/database.js";
import bcrypt from "bcryptjs";
import SessionManager from "../../middleware/session.js";
import { register } from "module";
import redisClient from "../../config/redis.js";
import message from "./message.js";

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
const CODE_SALT = process.env.CODE_SALT || crypto.randomBytes(16).toString('hex'); // Env for prod
const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 600, // 10 minutes
  MAX_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 3600, // 1 hour
  MAX_REQUESTS_PER_HOUR: 3,
};

// ============================================
// OTP MANAGER (Redis-based)
// ============================================

class OTPManager {
  // Generate and store OTP
  static async generateOTP(email: string): Promise<string> {
    // Check rate limit
    const rateLimitKey = `otp:ratelimit:${email}`;
    const requestCount = parseInt((await redisClient.incr(rateLimitKey))?.toString());
    
    if (requestCount === 1) {
      await redisClient.expire(rateLimitKey, OTP_CONFIG.RATE_LIMIT_WINDOW);
    }
    
    if (requestCount > OTP_CONFIG.MAX_REQUESTS_PER_HOUR) {
      const ttl = parseInt((await redisClient.ttl(rateLimitKey))?.toString());
      throw new Error(
        `Too many requests. Please try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store in Redis with multiple keys for different purposes
    const otpKey = `otp:code:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    // Store OTP (overwrites any existing OTP for this email)
    await redisClient.setEx(otpKey, OTP_CONFIG.EXPIRY_SECONDS, otp);
    
    // Reset attempts counter
    await redisClient.setEx(attemptsKey, OTP_CONFIG.EXPIRY_SECONDS, '0');

    return otp;
  }

  // Verify OTP
  static async verifyOTP(email: string, code: string): Promise<boolean> {
    const otpKey = `otp:code:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    // Check if OTP exists
    const storedOTP = await redisClient.get(otpKey);
    if (!storedOTP) {
      throw new Error('OTP expired or not found. Please request a new code.');
    }

    // Check attempts
    const attempts = parseInt((await redisClient.get(attemptsKey))?.toString() || '0');
    if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      // Delete OTP after max attempts
      await Promise.all([
        redisClient.del(otpKey),
        redisClient.del(attemptsKey),
      ]);
      throw new Error('Too many failed attempts. Please request a new code.');
    }

    // Verify OTP
    if (storedOTP !== code) {
      // Increment attempts
      await redisClient.incr(attemptsKey);
      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - attempts - 1;
      throw new Error(
        `Invalid code. ${remainingAttempts} attempt(s) remaining.`
      );
    }

    // OTP is valid - delete it (one-time use)
    await Promise.all([
      redisClient.del(otpKey),
      redisClient.del(attemptsKey),
    ]);

    return true;
  }

  // Check if OTP exists (for debugging)
  static async otpExists(email: string): Promise<boolean> {
    const otpKey = `otp:code:${email}`;
    return (await redisClient.exists(otpKey)) === 1;
  }

  // Get remaining TTL
  static async getRemainingTime(email: string): Promise<number> {
    const otpKey = `otp:code:${email}`;
    return parseInt((await redisClient.ttl(otpKey)).toString());
  }
}

export default {
  Query: {
    me: async (_, __, { user, }) => {
      if (!user) throw new Error('Not authenticated');
      
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user.userId]
      );
      
      if (result.rows.length === 0) throw new Error('User not found');
      
      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        phone: result.rows[0].phone,
        // role: result.rows[0].role,
        // emailVerified: result.rows[0].email_verified,
        createdAt: result.rows[0].created_at,
      };
    },

    // Get active sessions
    activeSessions: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');

      const sessions = await SessionManager.getUserActiveSessions(user.id);

      return sessions.map((session: any) => ({
        sessionId: session.sessionId,
        deviceId: session.deviceId,
        createdAt: new Date(session.createdAt).toISOString(),
        lastActivity: new Date(session.lastActivity).toISOString(),
      }));
    },
  },

  Mutation: {
    login: async (_:any, {email, password, deviceInfo}:any, {db}) => {
      console.log(email, password, deviceInfo)
      try {
        let result = await pool.query(
          'SELECT id, email, name, password FROM users WHERE email = $1',
          [email]
        );
        if (!result.rows[0]) {
          throw new Error('Invalid credentials')
        }

        const user = result.rows[0];
        console.log({user})

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error('Invalid credentials')
        }

        // const {accessToken, refreshToken, sessionId} = await SessionManager.createSession(
        //   user.id,
        //   {
        //     email: user.email,
        //     role: 'user',
        //     deviceId: deviceInfo?.deviceId
        //   }
        // );

        return {
          success: true,
          message: 'Logged In successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    register: async (_: any, { input }: { input: User & { address: Address } }, __: any, info: any) => {
      try {
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [input.email]
        );

        if (existingUser.rows.length > 0) {
          throw new Error('Email already registered')
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await UserModel.create({...input, password: hashedPassword})

        // const {accessToken, refreshToken} = await SessionManager.createSession(
        //   user.id,
        //   {email: user.email},
        // );

        return {
          success: true,
          message: 'User created successfully',
          user
        }
      } catch (error) {
        console.log('Register error:', error)
        throw error;
      }
      // const user = UserModel.create()
    },

    sendVerificationCode: async (_, { email },) => {
      // Validate email format
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        const otp = await OTPManager.generateOTP(email) 

        console.log({otp})

        const info = await getEmailTransporter().sendMail({
          from: '"Real Estate App" <noreply@realestate.com>',
          to: email,
          subject: 'Your Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Real Estate App</h2>
              <p style="font-size: 16px; color: #666;">Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
                <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #2563eb;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 20px;">
                This code expires in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
            </div>
          `,
        });

        console.log("msos")

        // Log preview URL for development (Ethereal only)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview Email:', previewUrl);
        }

        const expiresIn = await OTPManager.getRemainingTime(email);


        console.log("isoiso")
        return {
          success: true,
          message: 'Verification code sent to your email',
          previewUrl: previewUrl || null,
        };
      } catch (error) {
        throw error
      }
    },

    verifyCode: async (
      _: any,
      {
        input,
      }: {
        input: Partial<User> & { address?: Address; email: string; code: string };
      },
      { req }: any
    ) => {
      try {
        // Verify OTP (stored in Redis)
        await OTPManager.verifyOTP(input.email, input.code);
    
        // Check if user exists
        let userResult = await pool.query(
          'SELECT id, email, name, phone, created_at FROM users WHERE email = $1',
          [input.email]
        );
    
        let user;
    
        if (userResult.rows.length === 0) {
          // New user - create account
          if (!input.name) {
            throw new Error('Name is required for new users');
          }
    
          // Create user without password (passwordless auth)
          user = await UserModel.create({
            email: input.email,
            name: input.name,
            phone: input.phone,
            password: null, // Passwordless - using OTP only
            address: input.address,
          } as any);
        } else {
          // Existing user - just login
          user = userResult.rows[0];
        }
    
        // Create session (hybrid JWT + Redis)
        const { accessToken, refreshToken, sessionId } =
          await SessionManager.createSession(user.id, {
            email: user.email,
            role: 'user',
            deviceId: req.headers['user-agent'],
          });
    
        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            createdAt: user.created_at,
          },
          isNewUser: userResult.rows.length === 0,
        };
      } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
      }
    },

    refreshAccessToken: async (_, { refreshToken }) => {
      try {
        const tokens = await SessionManager.refreshAccessToken(refreshToken);

        if(!tokens) {
          throw new Error('Invalid or expired refresh')
        }

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      } catch (error) {
        
      }
      
    },

    logout: async (_: any, __: any, { user, req }: any) => {
      console.log('logging out')
      if (!user) {
        throw new Error('Not authenticated token');
      }
      console.log('logging outs')

      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await SessionManager.deleteSession(user.sessionId, token);

        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    logoutAllDevices: async (_: any, __: any, { user }: any) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const count = await SessionManager.deleteAllUserSessions(user.id);

        return {
          success: true,
          message: `Logged out from ${count} device(s)`,
        };
      } catch (error) {
        console.error('Logout all error:', error);
        throw error;
      }
    },

    updateProfile: async (_, { fullName, phone }, { db, user }) => {
      if (!user) throw new Error('Not authenticated');

      const result = await db.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name), 
             phone = COALESCE($2, phone),
             updated_at = NOW()
         WHERE id = $3 
         RETURNING *`,
        [fullName, phone, user.userId]
      );

      const updated = result.rows[0];

      return {
        id: updated.id,
        email: updated.email,
        fullName: updated.full_name,
        phone: updated.phone,
        role: updated.role,
        emailVerified: updated.email_verified,
        createdAt: updated.created_at,
      };
    },

    changePassword: async (
      _: any,
      { currentPassword, newPassword }: any,
      { user, sessionId }: any
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
    
      try {
        // Get user with password
        const result = await pool.query(
          'SELECT password FROM users WHERE id = $1',
          [user.id]
        );
    
        if (result.rows.length === 0) {
          throw new Error('User not found');
        }
    
        const dbUser = result.rows[0];
    
        // Check if user has a password (passwordless users need to set one first)
        if (!dbUser.password) {
          // First-time password setup
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
            hashedPassword,
            user.id,
          ]);
    
          return {
            success: true,
            message: 'Password set successfully',
          };
        }
    
        // Verify current password
        const validPassword = await bcrypt.compare(
          currentPassword,
          dbUser.password
        );
    
        if (!validPassword) {
          throw new Error('Current password is incorrect');
        }
    
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update password
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
          hashedPassword,
          user.id,
        ]);
    
        // Logout from all other devices
        const allSessions = await SessionManager.getUserActiveSessions(user.id);
        for (const session of allSessions) {
          if ((session as any).sessionId !== sessionId) {
            await SessionManager.deleteSession((session as any).sessionId);
          }
        }
    
        return {
          success: true,
          message: 'Password changed successfully',
        };
      } catch (error) {
        console.error('Change password error:', error);
        throw error;
      }
    },
  },
}