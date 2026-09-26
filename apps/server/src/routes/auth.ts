import { Router } from 'express';
import { db } from '../db';
import { hashPassword, comparePasswords, generateToken, AuthRequest, requireAuth } from '../auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, companyName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await db`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const result = await db`
      INSERT INTO users (email, password_hash, name, company_name, role, plan)
      VALUES (${email}, ${passwordHash}, ${name}, ${companyName || ''}, 'user', 'Starter')
      RETURNING id, email, name, role
    `;

    const user = result[0];
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await db`SELECT id, email, password_hash, name, role, plan FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isValid = await comparePasswords(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await db`SELECT id, email, name, role, plan, company_name FROM users WHERE id = ${req.user?.id}`;
    const user = users[0];
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;
