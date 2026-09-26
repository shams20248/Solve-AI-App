import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const offset = (page - 1) * limit;

    const transactions = await db`
      SELECT * FROM transactions
      WHERE user_id = ${req.user?.id}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await db`
      SELECT COUNT(*) as count FROM transactions
      WHERE user_id = ${req.user?.id}
    `;

    res.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total: total[0]?.count || 0,
        pages: Math.ceil((total[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, amount, category, description, referenceId } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: 'Type and amount are required' });
    }

    const result = await db`
      INSERT INTO transactions (user_id, type, amount, category, description, reference_id)
      VALUES (${req.user?.id}, ${type}, ${amount}, ${category || null}, ${description || null}, ${referenceId || null})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

export default router;
