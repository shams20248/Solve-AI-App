import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

// Generate AI insights from financial data
async function generateInsights(userId: number) {
  try {
    const invoiceData = await db`
      SELECT COUNT(*) as total_invoices, 
             SUM(amount) as total_amount,
             AVG(amount) as avg_amount
      FROM invoices 
      WHERE user_id = ${userId}
    `;

    const paidData = await db`
      SELECT COUNT(*) as paid_count,
             SUM(amount) as paid_amount
      FROM invoices 
      WHERE user_id = ${userId} AND status = 'Paid'
    `;

    const expenseData = await db`
      SELECT COUNT(*) as expense_count,
             SUM(amount) as expense_amount
      FROM transactions 
      WHERE user_id = ${userId} AND type = 'expense'
    `;

    const customerData = await db`
      SELECT COUNT(*) as active_customers
      FROM customers 
      WHERE user_id = ${userId} AND status = 'Active'
    `;

    const totalInvoices = invoiceData[0]?.total_invoices || 0;
    const paidInvoices = paidData[0]?.paid_count || 0;
    const totalRevenue = invoiceData[0]?.total_amount || 0;
    const totalExpenses = expenseData[0]?.expense_amount || 0;
    const activeCustomers = customerData[0]?.active_customers || 0;

    const recommendations = [];
    const insights = [];

    // Generate recommendations based on data
    if (paidInvoices === 0 && totalInvoices > 0) {
      recommendations.push('Focus on invoice follow-up: No invoices have been paid yet.');
      insights.push({ type: 'warning', message: 'Payment rate is 0%' });
    } else if (totalInvoices > 0) {
      const paymentRate = (paidInvoices / totalInvoices) * 100;
      if (paymentRate < 50) {
        recommendations.push(`Improve collection: Only ${paymentRate.toFixed(1)}% of invoices are paid.`);
        insights.push({ type: 'alert', message: `Payment rate: ${paymentRate.toFixed(1)}%` });
      } else {
        insights.push({ type: 'success', message: `Strong payment rate: ${paymentRate.toFixed(1)}%` });
      }
    }

    if (totalExpenses > totalRevenue * 0.5) {
      recommendations.push('Optimize expenses: Current expenses are high relative to revenue.');
      insights.push({ type: 'warning', message: 'Expense ratio is high' });
    }

    if (activeCustomers < 5 && totalInvoices > 0) {
      recommendations.push('Expand customer base: Focus on acquiring new customers.');
      insights.push({ type: 'info', message: 'Growing customer base is key' });
    }

    if (totalRevenue > 0 && totalExpenses > 0) {
      const profit = totalRevenue - totalExpenses;
      const profitMargin = (profit / totalRevenue) * 100;
      insights.push({ type: 'success', message: `Profit margin: ${profitMargin.toFixed(1)}%` });
    }

    return {
      summary: {
        totalInvoices,
        paidInvoices,
        totalRevenue: parseFloat(totalRevenue),
        totalExpenses: parseFloat(totalExpenses),
        activeCustomers
      },
      insights,
      recommendations,
      forecast: {
        estimatedNextMonthRevenue: parseFloat(totalRevenue) * 1.1,
        trend: 'growing'
      }
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}

router.get('/insights', requireAuth, async (req: AuthRequest, res) => {
  try {
    const insights = await generateInsights(req.user?.id!);
    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

router.post('/analyze-cash-flow', requireAuth, async (req: AuthRequest, res) => {
  try {
    const lastMonthData = await db`
      SELECT DATE_TRUNC('month', created_at) as month,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ${req.user?.id} AND created_at >= NOW() - INTERVAL '3 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    const analysis = {
      cashFlowTrend: lastMonthData.map(row => ({
        month: row.month,
        netCashFlow: (row.income || 0) - (row.expense || 0)
      })),
      recommendation: 'Monitor cash flow closely and maintain a buffer for unexpected expenses'
    };

    res.json(analysis);
  } catch (error) {
    console.error('Cash flow analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze cash flow' });
  }
});

router.post('/predict-revenue', requireAuth, async (req: AuthRequest, res) => {
  try {
    const recentRevenue = await db`
      SELECT SUM(amount) as total
      FROM invoices
      WHERE user_id = ${req.user?.id} AND status = 'Paid' AND paid_at >= NOW() - INTERVAL '30 days'
    `;

    const currentRevenue = recentRevenue[0]?.total || 0;
    const predictedRevenue = parseFloat(currentRevenue) * 1.15; // 15% growth prediction

    res.json({
      currentMonthRevenue: parseFloat(currentRevenue),
      predictedNextMonthRevenue: predictedRevenue,
      growthRate: 15,
      confidence: 0.78
    });
  } catch (error) {
    console.error('Revenue prediction error:', error);
    res.status(500).json({ message: 'Failed to predict revenue' });
  }
});

export default router;
