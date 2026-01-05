import { Pool } from 'pg';
import Stripe from 'stripe';
import express from 'express'
import {StripeService} from '../models/StripeService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

export function createWebhookRouter(pool: Pool) {
  const router = express.Router();

  router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const sig = req.headers['stripe-signature'];
      console.log({wor: sig})
      if (!sig) {
        return res.status(400).send('Missing stripe-signature header');
      }

      let event: Stripe.Event;

      try {
        console.log({sig, pe: process.env.STRIPE_WEBHOOK_SECRET, re: req.body})
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      const stripeService = new StripeService(pool);

      try {
        await stripeService.handleWebhookEvent(event);
        return res.json({ received: true }); // Ensure you return the response
      } catch (error: any) {
        console.error('Error handling webhook:', error);
        return res.status(500).json({ error: error.message }); // Ensure you return the response
      }
    } 
  );

  return router;
}