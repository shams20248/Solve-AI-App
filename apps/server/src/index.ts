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

const dashboardData = {
  kpis: {
    revenue: '$148.5K',
    expenses: '$67.2K',
    netProfit: '$81.3K',
    activeClients: 486,
    aiInsights: 32,
    invoicesPaid: 94
  },
  summary: {
    cashFlow: '+12.4%',
    burnRate: '$18.2K',
    overdueInvoices: 9,
    forecast: '$210K'
  }
};

const plans = [
  {
    name: 'Starter',
    price: '$29/mo',
    description: 'Perfect for freelancers and small businesses.',
    features: ['Accounting dashboard', 'Basic reports', 'AI assistant', 'Email support'],
    popular: false
  },
  {
    name: 'Growth',
    price: '$79/mo',
    description: 'Best for scaling companies with more workflows.',
    features: ['Everything in Starter', 'Advanced analytics', 'Multi-user access', 'Smart recommendations'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$149/mo',
    description: 'Built for complex organizations and teams.',
    features: ['Custom workflows', 'Dedicated support', 'Audit trail', 'Priority onboarding'],
    popular: false
  }
];

const invoices = [
  { id: 'INV-1042', client: 'BlueStone Ltd', value: '$8,400', status: 'Paid', due: '2026-09-18' },
  { id: 'INV-1046', client: 'NorthPeak', value: '$5,980', status: 'Pending', due: '2026-09-25' },
  { id: 'INV-1050', client: 'Aster Labs', value: '$12,300', status: 'Paid', due: '2026-09-22' },
  { id: 'INV-1054', client: 'Nova Works', value: '$2,740', status: 'Overdue', due: '2026-09-10' }
];

const customers = [
  { name: 'BlueStone Ltd', type: 'Business', balance: '$18,600', status: 'Active' },
  { name: 'NorthPeak', type: 'SME', balance: '$10,300', status: 'Active' },
  { name: 'Aster Labs', type: 'Startup', balance: '$25,200', status: 'VIP' },
  { name: 'Nova Works', type: 'Agency', balance: '$3,900', status: 'Monitoring' }
];

const reports = [
  { title: 'Cash flow forecast', value: '+12.4%' },
  { title: 'Expense efficiency', value: '86%' },
  { title: 'AI recommendations', value: '24 cards' }
];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'solve-ai-server' });
});

app.get('/api/dashboard', (_req, res) => {
  res.json(dashboardData);
});

app.get('/api/plans', (_req, res) => {
  res.json(plans);
});

app.get('/api/invoices', (_req, res) => {
  res.json(invoices);
});

app.get('/api/customers', (_req, res) => {
  res.json(customers);
});

app.get('/api/reports', (_req, res) => {
  res.json(reports);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  return res.json({
    success: true,
    user: {
      id: 'user_101',
      name: 'Demo Admin',
      email,
      role: 'admin'
    },
    token: 'demo-token-123'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, plan } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  return res.status(201).json({
    success: true,
    user: {
      id: 'user_102',
      name,
      email,
      plan: plan || 'Growth'
    }
  });
});

app.post('/api/ai/analyze', (req, res) => {
  const { text } = req.body || {};

  res.json({
    summary: 'Current profitability is healthy. Revenue is growing by 12.4%, while expense control remains stable.',
    recommendations: [
      'Reduce travel expenses by 8%.',
      'Increase premium invoicing automation.',
      'Focus on high-margin clients in Q4.'
    ],
    sentiment: 'positive',
    input: text || 'No input provided.'
  });
});

app.listen(port, () => {
  console.log(`Solve AI server is running on http://localhost:${port}`);\n});
