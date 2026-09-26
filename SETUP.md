# Solve AI App - Setup & Running Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- npm or yarn

## Quick Start with Docker

### 1. Using Docker Compose (Recommended)

```bash
# Make the script executable (on Linux/Mac)
chmod +x start.sh

# Run the entire stack
./start.sh
```

This will:
- Start PostgreSQL database on port 5432
- Start backend server on port 4000
- Start frontend on port 5173

### 2. Manual Docker Compose

```bash
docker-compose up -d --build
```

### 3. Local Development (Without Docker)

#### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Windows - Download from postgresql.org
```

#### Step 2: Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE USER solve_ai_user WITH PASSWORD 'solve_ai_password_123';
CREATE DATABASE solve_ai_db OWNER solve_ai_user;
\q
```

#### Step 3: Configure Environment
Create `.env` in root:
```bash
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=postgres://solve_ai_user:solve_ai_password_123@localhost:5432/solve_ai_db
```

#### Step 4: Install Dependencies
```bash
npm install
```

#### Step 5: Run Backend
```bash
npm run dev:server
```

#### Step 6: Run Frontend (in another terminal)
```bash
npm run dev:web
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health
- **Database**: localhost:5432

## Test Credentials

### Register a New Account
1. Visit http://localhost:5173
2. Click "Register" or "Create Account"
3. Fill in your details:
   - Name: John Doe
   - Company: Acme Corp
   - Email: john@example.com
   - Password: password123
4. Submit to create account

### Or Use Demo Login
After registration, you can log in with your credentials.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Dashboard
- `GET /api/dashboard/summary` - Financial summary

### Subscriptions
- `GET /api/subscriptions/plans` - List all plans
- `GET /api/subscriptions/my-subscription` - Current subscription
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `POST /api/subscriptions/cancel` - Cancel subscription

## Stopping the Application

### Docker
```bash
docker-compose down
```

### Local Development
Press `Ctrl+C` in each terminal running the dev servers.

## Database Migrations

Database tables are automatically created on server startup via the `initDatabase()` function in `db.ts`.

## Building for Production

```bash
# Build all apps
npm run build

# View built output
ls -la apps/web/dist
ls -la apps/server/dist
```

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml or .env
# Or kill the process:
kill -9 $(lsof -t -i:4000)  # Backend
kill -9 $(lsof -t -i:5173)  # Frontend
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Or check Docker container
docker ps | grep postgres
```

### Clear Everything
```bash
# Remove containers and volumes
docker-compose down -v

# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
npm install
```

## Next Steps

1. **Add More Features**:
   - Inventory management
   - Payroll system
   - Advanced reporting
   - AI analytics

2. **Deploy to Production**:
   - Use cloud providers: AWS, GCP, Azure, or Heroku
   - Configure environment variables
   - Set up CI/CD pipeline

3. **Enhance Security**:
   - Add rate limiting
   - Implement CSRF protection
   - Add input validation
   - Set up HTTPS/SSL

4. **Performance Optimization**:
   - Add caching
   - Implement pagination
   - Add database indexing
   - Set up CDN for static files

## Support & Documentation

For more information, check the README.md in the root directory.
