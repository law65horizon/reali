// services/stripeService.ts
import { Pool } from 'pg';
import pool from '../config/database.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

interface BookingDetails {
  id: number;
  unit_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  guest_count: number;
  currency: string;
  room_type_name?: string;
  property_title?: string;
  status: string;
}

export class StripeService {

  constructor(private pool: Pool) {}

  /**
   * Create a Stripe Checkout Session for booking payment
   */
  async createCheckoutSession(
    bookingId: number,
    user: any,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ clientSecret: string }> {
    const client = await this.pool.connect();
    // let successUrl = 'exp://localhost:8081/--/payment-success?bookingId=${bookingId}`'
    // let cancelUrl = 'exp://localhost:8081/--/payment-cancel?bookingId=${bookingId}`'
    // let bookingId = 37;
    // console.log({successUrl, cancelUrl})
    try {
        console.log({successUrl, user, bookingId})
      // Fetch booking details
      const bookingQuery = `
        SELECT 
          b.id, b.unit_id, b.guest_id, b.check_in, b.check_out,
          b.total_price, b.guest_count, b.currency, b.status,
          rt.name as room_type_name,
          p.title as property_title
        FROM bookings b
        INNER JOIN room_units ru ON b.unit_id = ru.id
        INNER JOIN room_types rt ON ru.room_type_id = rt.id
        INNER JOIN properties p ON rt.property_id = p.id
        WHERE b.id = $1 AND b.guest_id = $2;
      `;
      
      const bookingResult = await client.query(bookingQuery, [bookingId, 2]);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found or unauthorized');
      }

      const booking: BookingDetails = bookingResult.rows[0];

      // Check if booking is in valid state for payment
      if (booking.status === 'cancelled') {
        throw new Error('Cannot process payment for cancelled booking');
      }

      // Check if payment already exists
      const existingPayment = await client.query(
        `SELECT id, status FROM payments WHERE booking_id = $1 AND status != 'cancelled'`,
        [bookingId]
      );

      if (existingPayment.rows.length > 0 && existingPayment.rows[0].status === 'succeeded') {
        throw new Error('Payment already completed for this booking');
      }

      // Calculate line items
      const nights = Math.ceil(
        (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      const customer = await stripe.customers.create({
        name: user.name,
        email: user.email
      })

      const customerSession = await stripe.customerSessions.create({
        customer: customer.id,
        components: {
            mobile_payment_element: {
                enabled: true,
                features: {
                    payment_method_save: 'enabled',
                    payment_method_redisplay: 'enabled',
                    payment_method_remove: 'enabled'
                }
            }
        }
      })

      const paymentIntent = await stripe.paymentIntents.create({
        // payment_method_types: ['card', 'amazon_pay'],
        customer: customer.id,
        amount: Math.round(booking.total_price * 100), // Convert to cents
        currency: booking.currency.toLowerCase() || 'usd',
        setup_future_usage: 'off_session',
        metadata: {
            booking_id: bookingId.toString(),
            user_id: user.id.toString(),
            check_in: booking.check_in,
            check_out: booking.check_out,
        },
        automatic_payment_methods: {
            enabled: true
        }
       });

        // Create Stripe checkout session
    //   const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card', 'amazon_pay'],
    //     line_items: [
    //       {
    //         price_data: {
    //           currency: booking.currency.toLowerCase() || 'usd',
    //           product_data: {
    //             name: `${booking.property_title} - ${booking.room_type_name}`,
    //             description: `${nights} night(s) | ${booking.guest_count} guest(s)\nCheck-in: ${booking.check_in}\nCheck-out: ${booking.check_out}`,
    //             images: [], // Add property images if available
    //           },
    //           unit_amount: Math.round(booking.total_price * 100), // Convert to cents
    //         },
    //         quantity: 1,
    //       },
    //     ],
    //     mode: 'payment',
    //     success_url: successUrl,
    //     cancel_url: cancelUrl,
    //     client_reference_id: bookingId.toString(),
    //     customer_email: await this.getUserEmail(userId),
    //     metadata: {
    //       booking_id: bookingId.toString(),
    //       user_id: userId.toString(),
    //       check_in: booking.check_in,
    //       check_out: booking.check_out,
    //     },
    //     expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    //     // payment_intent_data: paymentIntent.transfer_data,
    //   });

      // Store payment record
      await client.query(
        `INSERT INTO payments (booking_id, stripe_checkout_session_id, stripe_payment_intent_id, amount, currency, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (stripe_checkout_session_id) DO UPDATE
         SET updated_at = CURRENT_TIMESTAMP`,
        [
          bookingId,
          paymentIntent.id,
          paymentIntent.id,
          booking.total_price,
          booking.currency,
          'pending',
          JSON.stringify({ session_url: 'customerSession.object' }),
        ]
      );
      return {
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const client = await this.pool.connect();

    console.log({we: 'webhook'})
    try {
      await client.query('BEGIN');

      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('checkout.session.completed')
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutCompleted(session, client);
          break;
        }

        case 'payment_intent.succeeded': {
          console.log('payment_intent.succeeded')
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentSucceeded(paymentIntent, client);
          break;
        }

        case 'payment_intent.payment_failed': {
          console.log('payment_intent.payment_failed')
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentFailed(paymentIntent, client);
          break;
        }

        case 'charge.refunded': {
          console.log('charge.refunded')
          const charge = event.data.object as Stripe.Charge;
          await this.handleRefund(charge, client);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error handling webhook:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process refund for a booking
   */
  async processRefund(
    bookingId: number,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId: string }> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get payment details
      const paymentResult = await client.query(
        `SELECT id, stripe_payment_intent_id, amount, status 
         FROM payments 
         WHERE booking_id = $1 AND status = 'succeeded'
         ORDER BY created_at DESC
         LIMIT 1`,
        [bookingId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('No successful payment found for this booking');
      }

      const payment = paymentResult.rows[0];
      const refundAmount = amount || payment.amount;

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100),
        reason: reason ? 'requested_by_customer' : undefined,
        metadata: {
          booking_id: bookingId.toString(),
        },
      });

      // Record refund
      await client.query(
        `INSERT INTO payment_refunds (payment_id, stripe_refund_id, amount, reason, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [payment.id, refund.id, refundAmount, reason || 'Customer requested', 'succeeded']
      );

      // Update payment status
      await client.query(
        `UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.id]
      );

      // Update booking payment status
      await client.query(
        `UPDATE bookings 
         SET payment_status = 'refunded', status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [bookingId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing refund:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Private helper methods

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    client: any
  ): Promise<void> {
    const bookingId = session.client_reference_id;

    await client.query(
      `UPDATE payments 
       SET stripe_payment_intent_id = $1, status = 'processing', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_checkout_session_id = $2`,
      [session.payment_intent, session.id]
    );

    await client.query(
      `UPDATE bookings 
       SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [bookingId]
    );

    // TODO: Send confirmation email to guest
  }

  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    client: any
  ): Promise<void> {
    await client.query(
      `UPDATE payments 
       SET status = 'succeeded', payment_method = $1, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = $2`,
      [paymentIntent.payment_method, paymentIntent.id]
    );
  }

  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
    client: any
  ): Promise<void> {
    await client.query(
      `UPDATE payments 
       SET status = 'failed', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    // Get booking ID from payment
    const result = await client.query(
      `SELECT booking_id FROM payments WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    if (result.rows.length > 0) {
      await client.query(
        `UPDATE bookings 
         SET status = 'pending', payment_status = 'unpaid', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [result.rows[0].booking_id]
      );
    }
  }

  private async handleRefund(charge: Stripe.Charge, client: any): Promise<void> {
    await client.query(
      `UPDATE payments 
       SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = $1`,
      [charge.payment_intent]
    );
  }

  private async getUserEmail(userId: number): Promise<string> {
    const result = await this.pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.email || '';
  }
}

export default new StripeService(pool);

// ==================== 5. GraphQL Resolvers ====================
// graphql/resolvers/payment.ts

// import { Pool } from 'pg';
// import { StripeService } from '../../services/stripeService';

// export const paymentResolvers = {
//   Query: {
//     getPayment: async (_: any, { bookingId }: { bookingId: number }, context: any) => {
//       const { userId, pool } = context;
      
//       if (!userId) {
//         throw new Error('Authentication required');
//       }

//       const result = await pool.query(
//         `SELECT p.* 
//          FROM payments p
//          INNER JOIN bookings b ON p.booking_id = b.id
//          WHERE p.booking_id = $1 AND b.guest_id = $2
//          ORDER BY p.created_at DESC
//          LIMIT 1`,
//         [bookingId, userId]
//       );

//       if (result.rows.length === 0) {
//         return null;
//       }

//       const payment = result.rows[0];
//       return {
//         id: payment.id,
//         bookingId: payment.booking_id,
//         amount: parseFloat(payment.amount),
//         currency: payment.currency,
//         status: payment.status,
//         paymentMethod: payment.payment_method,
//         createdAt: payment.created_at,
//       };
//     },

//     getPaymentHistory: async (_: any, { userId }: { userId: number }, context: any) => {
//       const { userId: contextUserId, pool } = context;

//       if (!contextUserId || contextUserId !== userId) {
//         throw new Error('Unauthorized');
//       }

//       const result = await pool.query(
//         `SELECT p.* 
//          FROM payments p
//          INNER JOIN bookings b ON p.booking_id = b.id
//          WHERE b.guest_id = $1
//          ORDER BY p.created_at DESC`,
//         [userId]
//       );

//       return result.rows.map((payment: any) => ({
//         id: payment.id,
//         bookingId: payment.booking_id,
//         amount: parseFloat(payment.amount),
//         currency: payment.currency,
//         status: payment.status,
//         paymentMethod: payment.payment_method,
//         createdAt: payment.created_at,
//       }));
//     },
//   },

//   Mutation: {
//     createCheckoutSession: async (
//       _: any,
//       { bookingId, successUrl, cancelUrl }: { bookingId: number; successUrl: string; cancelUrl: string },
//       context: any
//     ) => {
//       const { userId, pool } = context;

//       if (!userId) {
//         throw new Error('Authentication required');
//       }

//       const stripeService = new StripeService(pool);

//       try {
//         const session = await stripeService.createCheckoutSession(
//           bookingId,
//           userId,
//           successUrl,
//           cancelUrl
//         );

//         return session;
//       } catch (error: any) {
//         console.error('Error creating checkout session:', error);
//         throw new Error(error.message || 'Failed to create checkout session');
//       }
//     },

//     processRefund: async (
//       _: any,
//       { bookingId, amount, reason }: { bookingId: number; amount?: number; reason?: string },
//       context: any
//     ) => {
//       const { userId, pool } = context;

//       if (!userId) {
//         throw new Error('Authentication required');
//       }

//       // Verify user owns the booking or is admin
//       const bookingCheck = await pool.query(
//         `SELECT guest_id FROM bookings WHERE id = $1`,
//         [bookingId]
//       );

//       if (bookingCheck.rows.length === 0) {
//         throw new Error('Booking not found');
//       }

//       if (bookingCheck.rows[0].guest_id !== userId) {
//         throw new Error('Unauthorized');
//       }

//       const stripeService = new StripeService(pool);

//       try {
//         const result = await stripeService.processRefund(bookingId, amount, reason);
//         return {
//           success: result.success,
//           refundId: result.refundId,
//           message: 'Refund processed successfully',
//         };
//       } catch (error: any) {
//         console.error('Error processing refund:', error);
//         return {
//           success: false,
//           refundId: null,
//           message: error.message || 'Failed to process refund',
//         };
//       }
//     },
//   },
// };

