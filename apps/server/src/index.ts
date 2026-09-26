import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './db';
import { authMiddleware } from './auth';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import dashboardRoutes from './routes/dashboard';
import subscriptionRoutes from './routes/subscriptions';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'solve-ai-server', version: '0.2.0' });
});

// Apply auth middleware
authMiddleware(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');

    app.listen(port, () => {
      console.log(`Solve AI server running on http://localhost:${port}`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void start();
