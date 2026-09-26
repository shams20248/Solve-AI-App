import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

router.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    const revenue = await db`
      SELECT COALESCE(SUM(amount), 0) as total FROM invoices 
      WHERE user_id = ${userId} AND status = 'Paid'
    `;

    const expenses = await db`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
      WHERE user_id = ${userId} AND type = 'expense'
    `;

    const activeClients = await db`
      SELECT COUNT(*) as count FROM customers 
      WHERE user_id = ${userId} AND status = 'Active'
    `;

    const pendingInvoices = await db`
      SELECT COUNT(*) as count FROM invoices 
      WHERE user_id = ${userId} AND status = 'Pending'
    `;

    const paidInvoices = await db`
      SELECT COUNT(*) as count FROM invoices 
      WHERE user_id = ${userId} AND status = 'Paid'
    `;

    res.json({
      totalRevenue: revenue[0]?.total || 0,
      totalExpenses: expenses[0]?.total || 0,
      netProfit: (revenue[0]?.total || 0) - (expenses[0]?.total || 0),
      activeClients: activeClients[0]?.count || 0,
      pendingInvoices: pendingInvoices[0]?.count || 0,
      paidInvoices: paidInvoices[0]?.count || 0
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Failed to get dashboard summary' });
  }
});

export default router;
