import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

const plans = {
  Starter: { price: 29, features: ['Accounting dashboard', 'Basic reports', 'AI assistant', 'Email support'] },
  Growth: { price: 79, features: ['Everything in Starter', 'Advanced analytics', 'Multi-user access', 'Smart recommendations'] },
  Enterprise: { price: 149, features: ['Custom workflows', 'Dedicated support', 'Audit trail', 'Priority onboarding'] }
};

router.get('/plans', (_req, res) => {
  const plansList = Object.entries(plans).map(([name, data]) => ({
    name,
    price: `$${data.price}/mo`,
    description: `Perfect for ${name.toLowerCase()} businesses`,
    features: data.features,
    popular: name === 'Growth'
  }));
  res.json(plansList);
});

router.get('/my-subscription', requireAuth, async (req: AuthRequest, res) => {
  try {
    const subscriptions = await db`
      SELECT * FROM subscriptions 
      WHERE user_id = ${req.user?.id} AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `;

    if (subscriptions.length === 0) {
      return res.json({ message: 'No active subscription' });
    }

    res.json(subscriptions[0]);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to get subscription' });
  }
});

router.post('/subscribe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { plan, billingCycle } = req.body;

    if (!plan || !billingCycle) {
      return res.status(400).json({ message: 'Plan and billing cycle are required' });
    }

    const planData = plans[plan as keyof typeof plans];
    if (!planData) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const cycleMultiplier = { monthly: 1, semi: 6, annual: 12 }[billingCycle as string] || 1;
    const price = planData.price * cycleMultiplier;

    const endsAt = new Date();
    if (billingCycle === 'monthly') endsAt.setMonth(endsAt.getMonth() + 1);
    else if (billingCycle === 'semi') endsAt.setMonth(endsAt.getMonth() + 6);
    else if (billingCycle === 'annual') endsAt.setFullYear(endsAt.getFullYear() + 1);

    const result = await db`
      INSERT INTO subscriptions (user_id, plan, price, billing_cycle, status, ends_at)
      VALUES (${req.user?.id}, ${plan}, ${price}, ${billingCycle}, 'active', ${endsAt})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Failed to subscribe' });
  }
});

router.post('/cancel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await db`
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = ${req.user?.id} AND status = 'active'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'No active subscription to cancel' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

export default router;
