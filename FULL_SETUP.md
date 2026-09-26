# Solve AI App - Complete Setup Guide

## 🚀 Quick Start

### With Docker (Recommended)

```bash
# Clone and setup
git clone https://github.com/shams20248/Solve-AI-App.git
cd Solve-AI-App

# Copy environment template
cp .env.example .env

# Start services
docker-compose up -d
```

Access at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Database**: localhost:5432

### Without Docker (Local Dev)

```bash
# Install dependencies
npm install

# Setup PostgreSQL database
psql -U postgres
CREATE USER solve_ai_user WITH PASSWORD 'solve_ai_password_123';
CREATE DATABASE solve_ai_db OWNER solve_ai_user;
\q

# Configure .env
echo 'DATABASE_URL=postgres://solve_ai_user:solve_ai_password_123@localhost:5432/solve_ai_db' >> .env

# Run backend
npm run dev:server

# Run frontend (in another terminal)
npm run dev:web
```

---

## 🔐 Environment Variables

Create `.env` file in root:

```env
# Server
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgres://solve_ai_user:solve_ai_password_123@localhost:5432/solve_ai_db

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

---

## 📊 Features Included

### ✅ Core Accounting
- Customer management
- Invoice management
- Expense tracking
- Financial dashboard
- Multiple language support (AR/EN/FR)

### ✅ AI Analytics
- Automated insights generation
- Cash flow prediction
- Revenue forecasting
- Customer analytics
- Financial recommendations

### ✅ Advanced Reporting
- Financial summaries
- Revenue reports
- Expense analysis
- Customer performance
- Customizable date ranges

### ✅ Payment Processing
- Stripe integration
- Subscription management
- Multiple billing cycles (Monthly/Semi-annual/Annual)
- Webhook support
- Payment history

### ✅ Security
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input sanitization
- Security headers (Helmet)
- CORS protection

### ✅ Performance
- Gzip compression
- Caching strategy
- Query optimization
- Pagination support
- Database indexing

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Customers
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Invoices
```
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

### Dashboard
```
GET    /api/dashboard/summary
```

### AI Analytics
```
GET    /api/ai/insights
POST   /api/ai/analyze-cash-flow
POST   /api/ai/predict-revenue
```

### Reporting
```
GET    /api/reports/financial-summary
GET    /api/reports/revenue-report
GET    /api/reports/expense-report
GET    /api/reports/customer-analytics
```

### Payment
```
POST   /api/payment/create-checkout
GET    /api/payment/session/:sessionId
POST   /api/payment/webhook
GET    /api/payment/billing-history
```

### Transactions
```
GET    /api/transactions
POST   /api/transactions
```

---

## 🛠 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create solve-ai-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git push heroku main
```

### Deploy to AWS EC2

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo usermod -a -G docker ec2-user

# Clone and run
git clone https://github.com/shams20248/Solve-AI-App.git
cd Solve-AI-App
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy to Vercel (Frontend)

```bash
vercel --prod
```

---

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test AI Insights
```bash
curl -X GET http://localhost:4000/api/ai/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Reports
```bash
curl -X GET http://localhost:4000/api/reports/financial-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  plan VARCHAR(50) DEFAULT 'Starter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  type VARCHAR(50),
  balance DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active'
);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  invoice_number VARCHAR(50) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  due_date DATE
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan VARCHAR(50) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active'
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50),
  amount DECIMAL(10, 2),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS/SSL
- [ ] Setup Stripe keys for production
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Setup database backups
- [ ] Enable database encryption
- [ ] Configure firewall rules
- [ ] Setup monitoring and alerting

---

## 📞 Support

For issues or questions, open an issue on GitHub:
https://github.com/shams20248/Solve-AI-App/issues

---

## 📄 License

MIT License - see LICENSE file for details
