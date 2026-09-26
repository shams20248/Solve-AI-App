import { Router } from 'express';
import { db } from '../db';
import { AuthRequest, requireAuth } from '../auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const invoices = await db`
      SELECT i.*, c.name as customer_name FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ${req.user?.id}
      ORDER BY i.created_at DESC
    `;
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to get invoices' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { customerId, amount, description, dueDate, invoiceNumber } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: 'Customer ID and amount are required' });
    }

    const newInvoiceNumber = invoiceNumber || `INV-${Date.now()}`;

    const result = await db`
      INSERT INTO invoices (user_id, customer_id, invoice_number, amount, description, due_date, status)
      VALUES (${req.user?.id}, ${customerId}, ${newInvoiceNumber}, ${amount}, ${description || ''}, ${dueDate || null}, 'Pending')
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const invoices = await db`
      SELECT i.*, c.name as customer_name FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${parseInt(id)} AND i.user_id = ${req.user?.id}
    `;

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoices[0]);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Failed to get invoice' });
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, amount, description } = req.body;

    const paidAt = status === 'Paid' ? new Date() : null;

    const result = await db`
      UPDATE invoices 
      SET status = ${status}, amount = ${amount}, description = ${description}, paid_at = ${paidAt}, updated_at = NOW()
      WHERE id = ${parseInt(id)} AND user_id = ${req.user?.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await db`
      DELETE FROM invoices WHERE id = ${parseInt(id)} AND user_id = ${req.user?.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
});

export default router;
