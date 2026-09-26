import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { initDatabase, closeDatabase } from './db';
import { authMiddleware } from './auth';
import { setupSecurity, apiLimiter, authLimiter } from './security';
import { setCacheHeaders } from './performance';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import dashboardRoutes from './routes/dashboard';
import subscriptionRoutes from './routes/subscriptions';
import aiRoutes from './routes/ai';
import reportRoutes from './routes/reports';
import paymentRoutes from './routes/payment';
import transactionRoutes from './routes/transactions';
import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';
import systemRoutes from './routes/system';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
setupSecurity(app);
app.use(compression());
app.use(setCacheHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(mongoSanitize());

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'solve-ai-server', 
    version: '1.2.0',
    owner: 'almoizaledrisi@gmail.com',
    uptime: process.uptime() 
  });
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);
authMiddleware(app);

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// Protected routes
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Admin only routes
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await initDatabase();
    console.log('✓ Database initialized');
    app.listen(port, () => {
      console.log(`✓ Solve AI server running on http://localhost:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Admin panel: /admin`);
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
