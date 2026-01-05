
import { Pool } from 'pg';
import pool from '../config/database.js';
import { User } from './User.js';
import { Unit } from './Property.js';
import { calculateNights, formatDate } from '../utils/helperFuncs.js';

export interface Booking {
  id: number
  unit: Unit
  guest: User
  guest_id?: number
  checkIn: Date
  checkOut: Date
  totalPrice: number
  currency?: string  
  status: string
  source?: string
  createdAt?: string
}

export interface BookingResult {
  success: boolean;
  message: string;
  booking: Booking;
  errors: string[];
}

export interface BookingInput {
  guestId: number
  checkIn: Date
  checkOut: Date
  roomTypeId: number
}



export class BookingModel {
  constructor(private pool: Pool) {}

  async calculateBookingPrice({roomTypeId, checkIn, checkOut}: Omit<BookingInput ,'guestId'>) {
    const nights = calculateNights(checkIn, checkOut);
    const useNightlyRates = nights < 7;
    
    // Get room type details
    const roomTypeResult = await pool.query(
      'SELECT * FROM room_types WHERE id = $1',
      [roomTypeId]
    );
    const roomType = roomTypeResult.rows[0];
    
    if (!roomType) {
      throw new Error('Room type not found');
    }

    let subtotal = 0;
    let nightlyRateDetails: any[] = [];
    let periodRate = null;
    let periodType = null;
    let discount = 0;
    let discountPercent = 0;

    if (useNightlyRates) {
      // Use nightly rates from rate_calendar
      const rateQuery = `
        SELECT date, nightly_rate
        FROM rate_calendar
        WHERE room_type_id = $1
        AND date >= $2
        AND date < $3
        ORDER BY date ASC
      `;
      
      const rateResult = await pool.query(rateQuery, [
        roomTypeId,
        formatDate(checkIn),
        formatDate(checkOut)
      ]);
      
      nightlyRateDetails = rateResult.rows.map((row: any) => ({
        date: row.date,
        rate: parseFloat(row.nightly_rate)
      }));
      
      subtotal = nightlyRateDetails.reduce((sum, day) => sum + day.rate, 0);
    } else {
      // Use period rates (weekly/monthly)
      if (nights >= 28) {
        // Monthly rate
        const months = Math.floor(nights / 30);
        periodRate = roomType.monthly_rate;
        periodType = 'monthly';
        subtotal = periodRate * months;
        
        // Check for duration discounts
        const discountQuery = `
          SELECT discount_percent
          FROM room_duration_discounts
          WHERE room_type_id = $1 AND stay_type = 'monthly'
        `;
        const discountResult = await pool.query(discountQuery, [roomTypeId]);
        
        if (discountResult.rows.length > 0) {
          discountPercent = parseFloat(discountResult.rows[0].discount_percent);
          discount = subtotal * (discountPercent / 100);
          subtotal -= discount;
        }
      } else if (nights >= 7) {
        // Weekly rate
        const weeks = Math.floor(nights / 7);
        periodRate = roomType.weekly_rate || roomType.base_price * 7;
        periodType = 'weekly';
        subtotal = periodRate * weeks;
        
        // Check for duration discounts
        const discountQuery = `
          SELECT discount_percent
          FROM room_duration_discounts
          WHERE room_type_id = $1 AND stay_type = 'weekly'
        `;
        const discountResult = await pool.query(discountQuery, [roomTypeId]);
        
        if (discountResult.rows.length > 0) {
          discountPercent = parseFloat(discountResult.rows[0].discount_percent);
          discount = subtotal * (discountPercent / 100);
          subtotal -= discount;
        }
      }
    }

    // Calculate fees
    const cleaningFee = 50; // Could be from property settings
    const serviceFeePercent = 10;
    const serviceFee = subtotal * (serviceFeePercent / 100);
    const total = subtotal + cleaningFee + serviceFee;

    return {
      roomTypeId,
      checkIn,
      checkOut,
      nights,
      useNightlyRates,
      breakdown: {
        subtotal,
        nightlyRateDetails: useNightlyRates ? nightlyRateDetails : null,
        periodRate,
        periodType,
        cleaningFee,
        serviceFee,
        serviceFeePercent,
        discount,
        discountPercent
      },
      total,
      currency: roomType.currency || 'USD'
    };
  }

  async create(booking: BookingInput): Promise<BookingResult> {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN');
      const { guestId, checkIn, checkOut, roomTypeId } = booking;

      // Validate dates
      const nights = calculateNights(checkIn, checkOut);
      if (nights < 1) {
        throw new Error('Check-out must be after check-in');
      }

      // Check minimum stay requirement
      const minStayQuery = `
        SELECT COALESCE(MIN(min_stay), 1) as min_stay
        FROM rate_calendar
        WHERE room_type_id = $1
          AND date >= $2
          AND date < $3
      `;
      const minStayResult = await client.query(minStayQuery, [
        roomTypeId,
        formatDate(checkIn),
        formatDate(checkOut)
      ]);

      const minStay = minStayResult.rows[0]?.min_stay || 1;
      if (nights < minStay) {
        return {
          success: false,
          message: `Minimum stay of ${minStay} night(s) required`,
          booking: null,
          errors: [`Minimum stay requirement not met: ${minStay} nights`]
        };
      }

      // Check if dates are blocked
      const blockedQuery = `
        SELECT COUNT(*) as blocked_count
        FROM rate_calendar
        WHERE room_type_id = $1
          AND date >= $2
          AND date < $3
          AND is_blocked = true
      `;
      const blockedResult = await client.query(blockedQuery, [
        roomTypeId,
        formatDate(checkIn),
        formatDate(checkOut)
      ]);
      if (parseInt(blockedResult.rows[0].blocked_count) > 0) {
        return {
          success: false,
          message: 'Some dates in your selection are not available',
          booking: null,
          errors: ['Selected dates contain blocked periods']
        };
      }

      //Find available unit
      const unitQuery = `
        SELECT ru.id
        FROM room_units ru
        WHERE ru.room_type_id = $1
          And ru.status = 'active'
          AND ru.id NOT IN (
            SELECT b.unit_id
            FROM bookings b
            WHERE b.status = 'confirmed'
              AND NOT (b.check_out <= $2 OR b.check_in >= $3)
          )
        LIMIT 1
      `

      const unitResult = await client.query(unitQuery, [
        roomTypeId,
        formatDate(checkIn),
        formatDate(checkOut)
      ])

      if (unitResult.rows.length === 0) {
        return {
          success: false,
          message: 'No units available for selected dates',
          booking: null,
          errors: ['All units are booked for this period']
        };
      }

      const unitId = unitResult.rows[0].id;

      console.log({ososo: 'idsos'})
      const priceCalc = await this.calculateBookingPrice({roomTypeId, checkIn, checkOut})

      console.log({priceCalc})
      const bookingQuery = `
        INSERT INTO bookings (
          unit_id, guest_id, check_in, check_out,
          total_price, currency, status, source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const bookingResult = await client.query(bookingQuery, [
        unitId,
        guestId,
        formatDate(checkIn),
        formatDate(checkOut),
        priceCalc.total,
        priceCalc.currency,
        'confirmed',
        'mobile app'
      ])

      await client.query('COMMIT')

      return {
        success: true,
        message: 'Booking created successfully',
        booking: bookingResult.rows[0],
        errors: []
      }      
    } catch (error) {
        await client.query('ROLLBACK');
        throw error
    } finally {
      client.release()
    }    
  }

  async myBookings({userId, status}: {userId: string, status: string}): Promise<Booking[]> {
    let query = 'SELECT * FROM bookings WHERE guest_id = $1';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status.toLowerCase());
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Booking | null> {
    console.log({id})
    const query = `SELECT * FROM bookings WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    // console.log({result})
    return result.rows[0] || null;
  }

  async findAll(): Promise<Booking[]> {
    const query = `SELECT * FROM bookings`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async update(id: number, updates: Partial<Booking>): Promise<Booking | null> {
    const fields = [];
    const values = [];
    let index = 1;
    if (updates.status) {
      fields.push(`status = $${index++}`);
      values.push(updates.status);
    }
    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM bookings WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateBookingStatus ({ bookingId, status }: { bookingId: number; status: string }) {
      // Check if user is admin/host (implement your auth logic)
      // const isAdmin = context.user?.role === 'admin';
      const isAdmin = true;
      
      if (!isAdmin) {
        return {
          success: false,
          message: 'Unauthorized',
          booking: null,
          errors: ['Only administrators can update booking status']
        };
      }

      try {
        const updateQuery = `
          UPDATE bookings
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        const result = await pool.query(updateQuery, [
          status.toLowerCase(),
          bookingId
        ]);

        if (result.rows.length === 0) {
          return {
            success: false,
            message: 'Booking not found',
            booking: null,
            errors: ['Booking does not exist']
          };
        }

        return {
          success: true,
          message: 'Booking status updated successfully',
          booking: result.rows[0],
          errors: []
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
          booking: null,
          errors: [error.message]
        };
      }
  }

  async cancelBooking ({ bookingId, userId }: { bookingId: number, userId: number }): Promise<BookingResult> {
    console.log('iosiosioiowjo')
    try {
      // Verify booking belongs to user
      const verifyQuery = `
        SELECT * FROM bookings
        WHERE id = $1 AND guest_id = $2
      `;
      console.log('iosiosi')
      const verifyResult = await pool.query(verifyQuery, [bookingId, userId]);
      console.log({verifyResult: verifyResult.rows[0]})
      if (verifyResult.rows.length === 0) {
        return {
          success: false,
          message: 'Booking not found',
          booking: null,
          errors: ['Booking does not exist or does not belong to you']
        };
      }

      const booking = verifyResult.rows[0];
      
      if (booking.status === 'cancelled') {
        return {
          success: false,
          message: 'Booking is already cancelled',
          booking,
          errors: ['Booking already cancelled']
        };
      }

      // Update booking status
      const updateQuery = `
        UPDATE bookings
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [bookingId]);

      return {
        success: true,
        message: 'Booking cancelled successfully',
        booking: updateResult.rows[0],
        errors: []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        booking: null,
        errors: [error.message]
      };
    }
  }
}

export default new BookingModel(pool);