// auth.resolvers.ts - Optimized with Redis OTP and Hybrid Sessions
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import pool from '../../config/database.js';
import redisClient from '../../config/redis.js';
import SessionManager from '../../config/sessionManager.js';
import UserModel, { User } from '../../models/User.js';
import { getEmailTransporter } from '../../utils/emailTransport.js';
import { Address } from '../../models/Address.js';

// ============================================
// CONFIGURATION
// ============================================

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
    const requestCount = await redisClient.incr(rateLimitKey);
    
    if (requestCount === 1) {
      await redisClient.expire(rateLimitKey, OTP_CONFIG.RATE_LIMIT_WINDOW);
    }
    
    if (requestCount > OTP_CONFIG.MAX_REQUESTS_PER_HOUR) {
      const ttl = await redisClient.ttl(rateLimitKey);
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
    const attempts = parseInt((await redisClient.get(attemptsKey)) || '0');
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
    return await redisClient.ttl(otpKey);
  }
}

// ============================================
// RESOLVERS
// ============================================

export default {
  Query: {
    me: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated');

      const result = await pool.query(
        'SELECT id, email, name, phone, created_at FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        phone: result.rows[0].phone,
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
    // ============================================
    // TRADITIONAL LOGIN (Email + Password)
    // ============================================
    login: async (
      _: any,
      { email, password, deviceInfo }: any,
      { req }: any
    ) => {
      try {
        // Find user
        const result = await pool.query(
          'SELECT id, email, name, password FROM users WHERE email = $1',
          [email]
        );

        if (result.rows.length === 0) {
          throw new Error('Invalid credentials');
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error('Invalid credentials');
        }

        // Create session
        const { accessToken, refreshToken, sessionId } =
          await SessionManager.createSession(user.id, {
            email: user.email,
            role: 'user',
            deviceId: deviceInfo?.deviceId || req.headers['user-agent'],
          });

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    // ============================================
    // REGISTER (Email + Password)
    // ============================================
    register: async (
      _: any,
      { input }: { input: User & { address: Address } }
    ) => {
      try {
        // Check if user exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [input.email]
        );

        if (existingUser.rows.length > 0) {
          throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create user
        const user = await UserModel.create({
          ...input,
          password: hashedPassword,
        });

        // Create session
        const { accessToken, refreshToken } =
          await SessionManager.createSession(user.id, {
            email: user.email,
          });

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },

    // ============================================
    // SEND OTP (Passwordless Login/Register)
    // ============================================
    sendVerificationCode: async (
      _: any,
      { email }: { email: string },
      { req }: any
    ) => {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Generate OTP (stored in Redis)
        const otp = await OTPManager.generateOTP(email);

        // Send email
        const info = await getEmailTransporter().sendMail({
          from: '"Real Estate App" <noreply@realestate.com>',
          to: email,
          subject: 'Your Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome to Real Estate App</h2>
              <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                Your verification code is:
              </p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                <h1 style="font-size: 48px; letter-spacing: 12px; margin: 0; color: #ffffff; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${otp}
                </h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #666; margin: 0;">
                  ⏰ This code expires in <strong>10 minutes</strong>
                </p>
                <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">
                  🔒 You have <strong>5 attempts</strong> to enter the correct code
                </p>
              </div>
              <p style="font-size: 13px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                If you didn't request this code, please ignore this email. Someone may have entered your email address by mistake.
              </p>
            </div>
          `,
        });

        // Log preview URL for development
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview Email:', previewUrl);
        }

        // Get remaining time for response
        const expiresIn = await OTPManager.getRemainingTime(email);

        return {
          success: true,
          message: 'Verification code sent to your email',
          expiresIn: expiresIn > 0 ? expiresIn : 600,
          previewUrl: previewUrl || null,
        };
      } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
      }
    },

    // ============================================
    // VERIFY OTP (Passwordless Login/Register)
    // ============================================
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

    // ============================================
    // REFRESH ACCESS TOKEN
    // ============================================
    refreshAccessToken: async (
      _: any,
      { refreshToken }: { refreshToken: string }
    ) => {
      try {
        const tokens = await SessionManager.refreshAccessToken(refreshToken);

        if (!tokens) {
          throw new Error('Invalid or expired refresh token');
        }

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      } catch (error) {
        console.error('Refresh token error:', error);
        throw error;
      }
    },

    // ============================================
    // LOGOUT (Single Device)
    // ============================================
    logout: async (_: any, __: any, { user, sessionId, req }: any) => {
      if (!user || !sessionId) {
        throw new Error('Not authenticated');
      }

      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await SessionManager.deleteSession(sessionId, token);

        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    // ============================================
    // LOGOUT ALL DEVICES
    // ============================================
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

    // ============================================
    // UPDATE PROFILE
    // ============================================
    updateProfile: async (
      _: any,
      { name, phone }: { name?: string; phone?: string },
      { user }: any
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const result = await pool.query(
          `UPDATE users 
           SET name = COALESCE($1, name), 
               phone = COALESCE($2, phone)
           WHERE id = $3 
           RETURNING id, email, name, phone, created_at`,
          [name, phone, user.id]
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        return result.rows[0];
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },

    // ============================================
    // CHANGE PASSWORD
    // ============================================
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
};