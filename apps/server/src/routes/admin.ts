import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const router = Router();
const adminEmail = process.env.ADMIN_EMAIL || 'almoizaledrisi@gmail.com';
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const jwtSecret = process.env.JWT_SECRET;

function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !jwtSecret) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, jwtSecret) as { email?: string; role?: string };
    if (payload.email !== adminEmail || payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  if (!adminPasswordHash || !jwtSecret) {
    return res.status(503).json({ message: 'Admin authentication is not configured' });
  }

  const { email, password } = req.body || {};
  if (email !== adminEmail || typeof password !== 'string') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, adminPasswordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email: adminEmail, role: 'admin' }, jwtSecret, { expiresIn: '24h' });
  return res.json({ token, email: adminEmail, role: 'admin' });
});

router.get('/dashboard', requireAdmin, async (_req, res) => {
  try {
    const [users, customers, invoices, subscriptions] = await Promise.all([
      db`SELECT COUNT(*)::int AS total_users FROM users`,
      db`SELECT COUNT(*)::int AS total_customers FROM customers`,
      db`SELECT COUNT(*)::int AS total_invoices, COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'), 0) AS paid_amount, COALESCE(SUM(amount), 0) AS total_amount FROM invoices`,
      db`SELECT COUNT(*)::int AS total_subscriptions, COUNT(*) FILTER (WHERE status = 'active')::int AS active_subscriptions FROM subscriptions`
    ]);

    return res.json({
      owner: { email: adminEmail, dashboard: 'admin', lastUpdated: new Date().toISOString() },
      users: users[0], customers: customers[0], invoices: invoices[0], subscriptions: subscriptions[0]
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

router.get('/customers-list', requireAdmin, async (_req, res) => {
  try {
    const customers = await db`SELECT id, name, email, type, status, created_at FROM customers ORDER BY created_at DESC`;
    return res.json({ totalCustomers: customers.length, customers });
  } catch (error) {
    console.error('Admin customers error:', error);
    return res.status(500).json({ message: 'Failed to load customers' });
  }
});

export default router;
