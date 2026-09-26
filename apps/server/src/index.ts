import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
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

const app = express();
const port = Number(process.env.PORT || 4000);

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
setupSecurity(app);
app.use(compression());
app.use(setCacheHeaders);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'solve-ai-server' }));
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
authMiddleware(app);

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  await initDatabase();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Solve AI server listening on port ${port}`);
  });
  const shutdown = async () => {
    server.close();
    await closeDatabase();
    process.exit(0);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
