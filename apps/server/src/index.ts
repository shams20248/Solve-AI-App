import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { initDatabase, closeDatabase } from './db';
import { authMiddleware, requireAuth } from './auth';
import { setupSecurity, apiLimiter, authLimiter } from './security';
import { setupCompression, setCacheHeaders } from './performance';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import dashboardRoutes from './routes/dashboard';
import subscriptionRoutes from './routes/subscriptions';
import aiRoutes from './routes/ai';
import reportRoutes from './routes/reports';
import paymentRoutes from './routes/payment';
import transactionRoutes from './routes/transactions';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Security and performance middleware
setupSecurity(app);
setupCompression(app);
app.use(setCacheHeaders);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(mongoSanitize());

// Health check (no rate limit)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'solve-ai-server', 
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// Apply auth middleware
authMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('✓ Database initialized');

    app.listen(port, () => {
      console.log(`✓ Solve AI server running on http://localhost:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

void start();
