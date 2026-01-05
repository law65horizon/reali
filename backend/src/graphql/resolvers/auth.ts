import { Address } from "cluster";
import UserModel, { User } from "../../models/User.js";
import {getEmailTransporter} from "../../utils/emailTransport.js";
import { createUser } from "./user.js";
import Jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import crypto from "crypto"
import { Pool } from "pg";

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

export default {
    Query: {
        me: async (_, __, { user, db }) => {
          if (!user) throw new Error('Not authenticated');
          
          const result = await db.query(
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
    },

    Mutation: {
    sendVerificationCode: async (_, { email }, { db, rateLimiter }) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Rate limiting: Check if user has requested too many codes recently
      const recentCodes = await db.query(
        `SELECT COUNT(*) as count FROM verification_codes 
         WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
        [email]
      );

    //   if (parseInt(recentCodes.rows[0].count) >= 3) {
    //     throw new Error('Too many requests. Please try again in an hour.');
    //   }
      // Generate 6-digit code
      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Invalidate old unused codes for this email
      await UserModel.pool.query(
        'UPDATE verification_codes SET used = true WHERE email = $1 AND used = false',
        [email]
      );

      // Store new code
      await db.query(
        `INSERT INTO verification_codes (email, code, expires_at) 
         VALUES ($1, $2, $3)`,
        [email, code, expiresAt]
      );

      // Send email

      console.log('iwoiwoiewo', code)
      const info = await getEmailTransporter().sendMail({
        from: '"Real Estate App" <noreply@realestate.com>',
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Real Estate App</h2>
            <p style="font-size: 16px; color: #666;">Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #2563eb;">${code}</h1>
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

      console.log("isoiso")
      return {
        success: true,
        message: 'Verification code sent to your email',
        previewUrl: previewUrl || null,
      };
    },

    verifyCode: async (_, { input }: { input: User & { address: Address, email: string, code: string } }, { db, req }, info: any) => {
      // Fetch verification code
      console.log({input})
      // Find or create user
      let userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [input.email]
      );

      console.log(input.email, input.code)
      
      const result = await db.query(
        `SELECT * FROM verification_codes 
         WHERE email = $1 AND code = $2 AND used = false 
         AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [input.email, input.code]
      );
      console.log('result')
      if (result.rows.length === 0) {
        // Increment attempts for rate limiting
        await db.query(
          `UPDATE verification_codes 
           SET attempts = attempts + 1 
           WHERE email = $1 AND code = $2 AND used = false`,
          [input.email, input.code]
        );
        console.log('iss')
        // throw new Error('Invalid or expired code');
      }

      const verificationCode = result.rows[0];

      console.log({verificationCode})
      // Check attempt limit
      if (verificationCode.attempts >= 5) {
        throw new Error('Too many failed attempts. Please request a new code.');
      }

      console.log('oiwo', verificationCode)

      // Mark code as used
      await db.query(
        'UPDATE verification_codes SET used = true WHERE id = $1',
        [verificationCode.id]
      );
    console.log('ioewwow')


      

      let user;
      if (userResult.rows.length === 0) {
        // Create new user
        user = await createUser(input, info)
      } else {
        user = userResult.rows[0]
      }

      // Generate tokens
      console.log({user})
      const accessToken = Jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = crypto.randomBytes(64).toString('hex');

      // Store refresh token
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      };

      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, device_info, expires_at) 
         VALUES ($1, $2, $3, $4)`,
        [
          user.id, 
          refreshToken, 
          JSON.stringify(deviceInfo),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        ]
      );

      return {
        accessToken,
        refreshToken,
        // user: {
        //   id: user.id,
        //   email: user.email,
        //   fullName: user.full_name,
        //   phone: user.phone,
        //   role: user.role,
        //   emailVerified: user.email_verified,
        //   createdAt: user.created_at,
        // },
        user
      };
    },

    refreshAccessToken: async (_, { refreshToken }, { db }) => {
      console.log({rowios: refreshToken})
      const result = await db.query(
        `SELECT rt.*, u.* FROM refresh_tokens rt
         JOIN users u ON rt.user_id = u.id
         WHERE rt.token = $1 AND rt.expires_at > NOW()`,
        [refreshToken]
      );

      console.log({resul: result.rows[0]})
      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      const row = result.rows[0];

      const accessToken = Jwt.sign(
        { 
          id: row.user_id, 
          name: row.name,
          email: row.email, 
          role: row.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      console.log({successfull: accessToken})

      return {
        accessToken,
        refreshToken, // Return same refresh token
        user: {
          name: row.name,
          email: row.email,
          id: row.user_id
        }
      };
    },

    logout: async (_, { refreshToken }, { db, user }: {db: Pool, user: any}) => {
      if (!user) throw new Error('Not authenticated');

      await db.query(
        'DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2',
        [refreshToken, user.userId]
      );

      return true;
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
  },
}