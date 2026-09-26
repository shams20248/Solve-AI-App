import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'solve-ai-server' });
});

app.get('/api/summary', (_req, res) => {
  res.json({
    totalRevenue: '$148.5K',
    activeAccounts: 486,
    aiInsights: 32,
    paidInvoices: 94
  });
});

app.get('/api/plans', (_req, res) => {
  res.json([
    {
      name: 'Starter',
      price: '$29/mo',
      description: 'Perfect for early-stage businesses and freelancers.',
      features: ['Accounting dashboard', 'Basic reports', 'AI assistant', 'Email support'],
      popular: false
    },
    {
      name: 'Growth',
      price: '$79/mo',
      description: 'For expanding teams that need deeper insights.',
      features: ['Everything in Starter', 'Advanced analytics', 'Multi-user access', 'Smart recommendations'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$149/mo',
      description: 'For organizations managing complex financial operations.',
      features: ['Custom workflows', 'Priority onboarding', 'Dedicated support', 'Audit trail'],
      popular: false
    }
  ]);
});

app.listen(port, () => {
  console.log(`Solve AI server is running on http://localhost:${port}`);
});
