import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

router.get('/financial-summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Revenue by category
    const revenueByCustomer = await db`
      SELECT c.name, SUM(i.amount) as total
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ${userId} AND i.status = 'Paid' AND i.paid_at >= ${startDate}
      GROUP BY c.name
      ORDER BY total DESC
    `;

    // Monthly trend
    const monthlyTrend = await db`
      SELECT DATE_TRUNC('month', paid_at) as month,
             COUNT(*) as invoice_count,
             SUM(amount) as total_amount
      FROM invoices
      WHERE user_id = ${userId} AND status = 'Paid' AND paid_at >= ${startDate}
      GROUP BY DATE_TRUNC('month', paid_at)
      ORDER BY month DESC
    `;

    // Invoice status breakdown
    const invoiceStatusBreakdown = await db`
      SELECT status, COUNT(*) as count, SUM(amount) as total
      FROM invoices
      WHERE user_id = ${userId}
      GROUP BY status
    `;

    // Customer performance
    const topCustomers = await db`
      SELECT c.id, c.name, COUNT(i.id) as invoice_count, SUM(i.amount) as total_value
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name
      ORDER BY total_value DESC
      LIMIT 5
    `;

    res.json({
      revenueByCustomer,
      monthlyTrend,
      invoiceStatusBreakdown,
      topCustomers
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ message: 'Failed to generate financial summary' });
  }
});

router.get('/revenue-report', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const period = (req.query.period as string) || '30'; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await db`
      SELECT 
        DATE(paid_at) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_revenue
      FROM invoices
      WHERE user_id = ${userId} AND status = 'Paid' AND paid_at >= ${startDate}
      GROUP BY DATE(paid_at)
      ORDER BY date DESC
    `;

    const summary = await db`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        AVG(amount) as average_transaction
      FROM invoices
      WHERE user_id = ${userId} AND status = 'Paid' AND paid_at >= ${startDate}
    `;

    res.json({
      period: `${days} days`,
      startDate,
      summary: summary[0],
      dailyData: revenueData
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ message: 'Failed to generate revenue report' });
  }
});

router.get('/expense-report', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const expensesByCategory = await db`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = ${userId} AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC
    `;

    const monthlyExpenses = await db`
      SELECT DATE_TRUNC('month', created_at) as month,
             SUM(amount) as total
      FROM transactions
      WHERE user_id = ${userId} AND type = 'expense'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({
      expensesByCategory,
      monthlyExpenses
    });
  } catch (error) {
    console.error('Expense report error:', error);
    res.status(500).json({ message: 'Failed to generate expense report' });
  }
});

router.get('/customer-analytics', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const customerMetrics = await db`
      SELECT 
        COUNT(DISTINCT id) as total_customers,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'VIP' THEN 1 END) as vip_customers,
        AVG(balance) as average_balance
      FROM customers
      WHERE user_id = ${userId}
    `;

    const customerRetention = await db`
      SELECT c.id, c.name, COUNT(i.id) as invoice_count
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name
      HAVING COUNT(i.id) > 0
      ORDER BY COUNT(i.id) DESC
    `;

    res.json({
      metrics: customerMetrics[0],
      retention: customerRetention
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ message: 'Failed to generate customer analytics' });
  }
});

export default router;
