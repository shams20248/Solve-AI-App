# Admin Dashboard Documentation

## Owner Account

**Email**: `almoizaledrisi@gmail.com`  
**Default Password**: `admin123456` (change immediately in production)

## Admin Endpoints

### Authentication
```bash
POST /api/admin/login
Body: { "email": "almoizaledrisi@gmail.com", "password": "admin123456" }
Response: { "token": "jwt_token", "email": "...", "role": "admin" }
```

### Dashboard Overview
```bash
GET /api/admin/dashboard
Header: Authorization: Bearer {token}

Response:
{
  "owner": { "email": "almoizaledrisi@gmail.com", "dashboard": "admin" },
  "users": { "total_users": 42 },
  "customers": { "total_customers": 156 },
  "invoices": {
    "total_invoices": 512,
    "paid_amount": 125000,
    "total_amount": 156000
  },
  "subscriptions": {
    "total_subscriptions": 38,
    "active_subscriptions": 35
  },
  "monthlyRevenue": [...],
  "topCustomers": [...]
}
```

### Customers List
```bash
GET /api/admin/customers-list
Header: Authorization: Bearer {token}

Response:
{
  "totalCustomers": 156,
  "customers": [
    {
      "id": 1,
      "name": "Customer Name",
      "email": "customer@example.com",
      "type": "Individual",
      "status": "Active",
      "user_name": "User Name",
      "invoice_count": 12,
      "total_invoiced": 5000,
      "created_at": "2024-09-26T..."
    }
  ]
}
```

### Platform Analytics
```bash
GET /api/admin/analytics
Header: Authorization: Bearer {token}

Response:
{
  "metrics": {
    "total_users": 42,
    "total_customers": 156,
    "total_invoices": 512,
    "total_revenue": 125000,
    "active_subscriptions": 35
  },
  "dailySignups": [...],
  "planDistribution": [...]
}
```

## Security Notes

⚠️ **CRITICAL for Production**:

1. Change the default admin password immediately:
   ```bash
   # Generate a new bcrypt hash
   npm install -g bcryptjs
   node -e "require('bcryptjs').hash('your-new-password', 10, (err, hash) => console.log(hash))"
   # Update the hash in apps/server/src/routes/admin.ts
   ```

2. Set a strong `JWT_SECRET` in `.env`:
   ```bash
   openssl rand -base64 32
   ```

3. Enable HTTPS in production

4. Add IP whitelisting for admin endpoints

5. Enable audit logging for all admin actions

## Usage Flow

1. **Login**:
   ```bash
   curl -X POST http://localhost:4000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"almoizaledrisi@gmail.com","password":"admin123456"}'
   ```

2. **Use token in dashboard**:
   ```bash
   curl -X GET http://localhost:4000/api/admin/dashboard \
     -H "Authorization: Bearer eyJhbGc..."
   ```

3. **View all customers**:
   ```bash
   curl -X GET http://localhost:4000/api/admin/customers-list \
     -H "Authorization: Bearer eyJhbGc..."
   ```

4. **Check platform analytics**:
   ```bash
   curl -X GET http://localhost:4000/api/admin/analytics \
     -H "Authorization: Bearer eyJhbGc..."
   ```
