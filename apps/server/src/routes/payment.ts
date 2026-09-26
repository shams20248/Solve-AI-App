import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-04-10' as any
});

const router = Router();

const planPrices: Record<string, { amount: number; currency: string; interval: string }> = {
  'Starter-monthly': { amount: 2900, currency: 'usd', interval: 'month' },
  'Starter-semi': { amount: 17400, currency: 'usd', interval: 'month' }, // 6 months
  'Starter-annual': { amount: 34800, currency: 'usd', interval: 'year' },
  'Growth-monthly': { amount: 7900, currency: 'usd', interval: 'month' },
  'Growth-semi': { amount: 47400, currency: 'usd', interval: 'month' }, // 6 months
  'Growth-annual': { amount: 94800, currency: 'usd', interval: 'year' },
  'Enterprise-monthly': { amount: 14900, currency: 'usd', interval: 'month' },
  'Enterprise-semi': { amount: 89400, currency: 'usd', interval: 'month' }, // 6 months
  'Enterprise-annual': { amount: 178800, currency: 'usd', interval: 'year' }
};

router.post('/create-checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const user = req.user!;

    const priceKey = `${plan}-${billingCycle}`;
    const priceData = planPrices[priceKey];

    if (!priceData) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: priceData.currency,
            product_data: {
              name: `${plan} Plan - ${billingCycle}`,
              description: `Solve AI ${plan} subscription`
            },
            unit_amount: priceData.amount,
            recurring: {
              interval: priceData.interval as 'month' | 'year',
              interval_count: billingCycle === 'semi' ? 6 : 1
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      customer_email: user.email
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ message: 'Failed to retrieve session' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).send('Webhook Error');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const subscription = session.subscription;

        // Find user by email and create subscription record
        const users = await db`SELECT id FROM users WHERE email = ${session.customer_email}`;
        if (users.length > 0) {
          await db`
            INSERT INTO subscriptions (user_id, plan, stripe_subscription_id, status)
            VALUES (${users[0].id}, ${'Growth'}, ${subscription}, ${'active'})
            ON CONFLICT DO NOTHING
          `;
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await db`
          UPDATE subscriptions 
          SET status = ${'cancelled'}
          WHERE stripe_subscription_id = ${subscription.id}
        `;
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

router.get('/billing-history', requireAuth, async (req: AuthRequest, res) => {
  try {
    const subscriptions = await db`
      SELECT * FROM subscriptions
      WHERE user_id = ${req.user?.id}
      ORDER BY created_at DESC
    `;
    res.json(subscriptions);
  } catch (error) {
    console.error('Billing history error:', error);
    res.status(500).json({ message: 'Failed to get billing history' });
  }
});

export default router;
