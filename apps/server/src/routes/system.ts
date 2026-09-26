import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (decoded.email !== 'almoizaledrisi@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const systemInfo = {
      version: '1.2.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'PostgreSQL',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    res.json(systemInfo);
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({ message: 'Failed to get system info' });
  }
});

export default router;
