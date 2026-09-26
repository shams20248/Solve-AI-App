import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';

const router = Router();

// Admin owner account (hardcoded for security)
const ADMIN_EMAIL = 'almoizaledrisi@gmail.com';
const ADMIN_PASSWORD_HASH = '$2a$10$UbWOoLcJAIv5nZ7eLf8vO.VD3S1Hn0jEoK8qF2X9pL5mQ7R2qJ6Cy'; // 'admin123456' hashed

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = require('jsonwebtoken').sign(
      { email: ADMIN_EMAIL, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, email: ADMIN_EMAIL, role: 'admin' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get admin dashboard stats
    const userStats = await db`
      SELECT COUNT(*) as total_users FROM users
    `;

    const customerStats = await db`
      SELECT COUNT(*) as total_customers FROM customers
    `;

    const invoiceStats = await db`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(amount) as total_amount
      FROM invoices
    `;

    const subscriptionStats = await db`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions
      FROM subscriptions
    `;

    const revenueData = await db`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue
      FROM invoices
      WHERE status = 'Paid'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    const topCustomers = await db`
      SELECT c.name, COUNT(i.id) as invoice_count, SUM(i.amount) as total_value
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      GROUP BY c.id, c.name
      ORDER BY total_value DESC
      LIMIT 10
    `;

    res.json({
      owner: {
        email: ADMIN_EMAIL,
        dashboard: 'admin',
        lastUpdated: new Date().toISOString()
      },
      users: userStats[0],
      customers: customerStats[0],
      invoices: invoiceStats[0],
      subscriptions: subscriptionStats[0],
      monthlyRevenue: revenueData,
      topCustomers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

router.get('/customers-list', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const customers = await db`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.type,
        c.status,
        u.name as user_name,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(i.amount), 0) as total_invoiced,
        c.created_at
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN invoices i ON c.id = i.customer_id
      GROUP BY c.id, c.name, c.email, c.type, c.status, u.name, c.created_at
      ORDER BY c.created_at DESC
    `;

    res.json({ totalCustomers: customers.length, customers });
  } catch (error) {
    console.error('Customers list error:', error);
    res.status(500).json({ message: 'Failed to load customers' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Platform analytics
    const dailySignups = await db`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as signups
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const planDistribution = await db`
      SELECT plan, COUNT(*) as count
      FROM users
      GROUP BY plan
    `;

    const platformMetrics = await db`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT SUM(amount) FROM invoices WHERE status = 'Paid') as total_revenue,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions
    `;

    res.json({
      metrics: platformMetrics[0],
      dailySignups,
      planDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

export default router;
