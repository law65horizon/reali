import { Stripe } from 'stripe'
import BookingModel from '../../models/Booking.js';
import StripeService from '../../models/StripeService.js';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
    typescript: true
});
export default {
    Query: {
        getPayment: async (_: any, { bookingId }: { bookingId: number }, {db, user}:  {db: Pool, user: any}) => {
            // const { userId, pool } = context;
            
            if (!user) {
              throw new Error('Unauthorized');
            }

            const result = await db.query(
              `SELECT p.* 
               FROM payments p
               INNER JOIN bookings b ON p.booking_id = b.id
               WHERE p.booking_id = $1 AND b.guest_id = $2
               ORDER BY p.created_at DESC
               LIMIT 1`,
              [bookingId, user.userId]
            );

            if (result.rows.length === 0) {
              return null;
            }

            const payment = result.rows[0];
            return {
              id: payment.id,
              bookingId: payment.booking_id,
              amount: parseFloat(payment.amount),
              currency: payment.currency,
              status: payment.status,
              paymentMethod: payment.payment_method,
              createdAt: payment.created_at,
            };
        },

        getPaymentHistory: async (_: any, { userId }: { userId: number }, {db, user}:  {db: Pool, user: any}) => {
            if (!user || user.userId !== userId) {
              throw new Error('Unauthorized');
            }

            const result = await db.query(
              `SELECT p.* 
               FROM payments p
               INNER JOIN bookings b ON p.booking_id = b.id
               WHERE b.guest_id = $1
               ORDER BY p.created_at DESC`,
              [userId]
            );

            return result.rows.map((payment: any) => ({
              id: payment.id,
              bookingId: payment.booking_id,
              amount: parseFloat(payment.amount),
              currency: payment.currency,
              status: payment.status,
              paymentMethod: payment.payment_method,
              createdAt: payment.created_at,
            }));
        },
    },
    Mutation: {
        createPaymentIntent: async (_: any, { input }: any ) => {
            console.log({input})
            const { bookingId, amount, currency } = input;

            // Optional: validate booking exists & belongs to user
            // const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) }});
            const booking = await BookingModel.findById(parseInt(bookingId))
            if (!booking) throw new Error("Booking not found.");

            const paymentIntent = await stripe.paymentIntents.create({
              amount,
              currency,
              metadata: {
                bookingId: String(bookingId)
              },
              automatic_payment_methods: {
                enabled: true
              },
              
            });

            // await stripe.checkout.sessions.create({
            //     payment_intent_data: paymentIntent.id, // link the session with the created payment intent
            //     success_url: 'https://your-success-url.com?session_id={CHECKOUT_SESSION_ID}', // Define your success URL here
            //     cancel_url: 'https://your-cancel-url.com',
            // })


            return {
              clientSecret: paymentIntent.client_secret!,
              publishableKey: 'pk_test_51O5EKFEMz6QQdgMEosyoo1yD40SBHJmHcAudyYazrEk8r45xGH2p5nY7FwBNkCfs3tUncdGT0Twmh1ZYquejG3qz00dHkJJ5ev'
            };
        },

        createCheckoutSession: async (
            _: any,
            { input }: { input: {bookingId: string, successUrl: string, cancelUrl: string} },
            {user}
        ) => {
          const {bookingId, successUrl, cancelUrl} = input
        
            if (!user) {
              throw new Error('Authentication required');
            }

            console.log({user})
        
            // const stripeService = new StripeService(pool);
        
            try {
              const session = await StripeService.createCheckoutSession(
                parseInt(bookingId),
                user,
                successUrl,
                cancelUrl,
                
              );
        
              return session;
            } catch (error: any) {
              console.error('Error creating checkout session:', error);
              throw new Error(error.message || 'Failed to create checkout session');
            }
        },
        
        processRefund: async (
            _: any,
            { bookingId, amount, reason }: { bookingId: number; amount?: number; reason?: string },
            {user, db}: {db: Pool, user: any}
        ) => {
        
            if (!user) {
              throw new Error('Authentication required');
            }
        
            // Verify user owns the booking or is admin
            const bookingCheck = await db.query(
              `SELECT guest_id FROM bookings WHERE id = $1`,
              [bookingId]
            );
        
            if (bookingCheck.rows.length === 0) {
              throw new Error('Booking not found');
            }
        
            if (bookingCheck.rows[0].guest_id !== user.userId) {
              throw new Error('Unauthorized');
            }
        
            // const stripeService = new StripeService(pool);
        
            try {
              const result = await StripeService.processRefund(bookingId, amount, reason);
              return {
                success: result.success,
                refundId: result.refundId,
                message: 'Refund processed successfully',
              };
            } catch (error: any) {
              console.error('Error processing refund:', error);
              return {
                success: false,
                refundId: null,
                message: error.message || 'Failed to process refund',
              };
            }
        },
    }
}