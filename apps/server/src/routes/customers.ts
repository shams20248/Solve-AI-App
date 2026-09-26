import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const customers = await db`
      SELECT * FROM customers WHERE user_id = ${req.user?.id}
      ORDER BY created_at DESC
    `;
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Failed to get customers' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, type, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const result = await db`
      INSERT INTO customers (user_id, name, email, phone, type, status)
      VALUES (${req.user?.id}, ${name}, ${email || null}, ${phone || null}, ${type || 'Business'}, ${status || 'Active'})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const customers = await db`
      SELECT * FROM customers WHERE id = ${parseInt(id)} AND user_id = ${req.user?.id}
    `;

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customers[0]);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Failed to get customer' });
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, type, status } = req.body;

    const result = await db`
      UPDATE customers 
      SET name = ${name}, email = ${email}, phone = ${phone}, type = ${type}, status = ${status}, updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${req.user?.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await db`
      DELETE FROM customers WHERE id = ${parseInt(id)} AND user_id = ${req.user?.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

export default router;
