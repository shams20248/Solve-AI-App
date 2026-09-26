# Deploy to Production - Complete Guide

## 🌍 Deployment Options

### Option 1: Deploy to Railway.app (Recommended - Easy)

#### Prerequisites
- GitHub account
- Railway account (railway.app)

#### Steps

1. **Connect GitHub Repository**
   - Go to railway.app and sign in
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account
   - Select repository: `Solve-AI-App`

2. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add these variables:
   ```env
   PORT=4000
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   JWT_SECRET=<generate-strong-secret>
   DATABASE_URL=<Railway PostgreSQL URL>
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   BNB_TREASURY_ADDRESS=0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b
   ```

3. **Add PostgreSQL Database**
   - Click "+ New"
   - Select "PostgreSQL"
   - Railway will auto-generate DATABASE_URL

4. **Deploy**
   - Railway auto-deploys on push to main
   - Backend: `https://your-project-name.up.railway.app`
   - Frontend: Deploy separately to Vercel

---

### Option 2: Deploy to Render.com (Free Tier Available)

#### Prerequisites
- Render.com account
- GitHub repository

#### Steps

1. **Create PostgreSQL Database**
   - Go to render.com
   - Click "New +" > "PostgreSQL"
   - Name: `solve-ai-db`
   - Region: Choose closest to your users
   - Note the External Database URL

2. **Deploy Backend**
   - Click "New +" > "Web Service"
   - Connect GitHub repository
   - Branch: `main`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variables:
   ```env
   PORT=4000
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   JWT_SECRET=<strong-secret>
   DATABASE_URL=<from PostgreSQL service>
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   BNB_TREASURY_ADDRESS=0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b
   ```
   - Plan: Free or Paid
   - Deploy

3. **Deploy Frontend**
   - Follow Vercel instructions below

---

### Option 3: Deploy to Vercel (Frontend)

#### Prerequisites
- Vercel account (vercel.com)
- GitHub repository

#### Steps

1. **Login to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Configure Environment**
   - Create `.env.production` in `apps/web`:
   ```env
   VITE_API_URL=https://your-backend-api.com
   ```

4. **Setup Domain**
   - Go to Vercel dashboard
   - Select project > Settings > Domains
   - Add your custom domain

---

### Option 4: Deploy to AWS (Full Control)

#### Prerequisites
- AWS account
- EC2, RDS, Route 53 knowledge

#### Quick Setup with Docker

1. **Create EC2 Instance**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ec2-user@your-ip
   
   # Install Docker
   sudo yum update -y
   sudo yum install docker -y
   sudo usermod -a -G docker ec2-user
   newgrp docker
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and Deploy**
   ```bash
   git clone https://github.com/shams20248/Solve-AI-App.git
   cd Solve-AI-App
   
   # Create .env for production
   cat > .env << EOF
   PORT=4000
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   JWT_SECRET=$(openssl rand -base64 32)
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   BNB_TREASURY_ADDRESS=0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b
   EOF
   
   # Start services
   docker-compose -f docker-compose.yml up -d
   ```

3. **Setup SSL with Let's Encrypt**
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   sudo certbot certonly --standalone -d your-domain.com
   ```

---

### Option 5: Deploy to Heroku (Legacy but Still Works)

#### Steps

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create solve-ai-app-prod

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
heroku config:set BNB_TREASURY_ADDRESS=0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

---

## 🔒 Pre-Production Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS/SSL
- [ ] Add Stripe production keys
- [ ] Setup database backups
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Setup monitoring (Sentry, New Relic, etc.)
- [ ] Setup logging (CloudWatch, DataDog, etc.)
- [ ] Enable database encryption
- [ ] Configure firewall rules
- [ ] Setup DNS records
- [ ] Enable CDN for static files
- [ ] Setup email notifications
- [ ] Create admin backup account
- [ ] Document deployment procedures
- [ ] Setup auto-scaling
- [ ] Enable API rate limiting per user
- [ ] Configure webhook security

---

## 📊 Recommended Architecture

```
┌─────────────────────────┐
│   Cloudflare CDN        │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Frontend (Vercel)      │
│  - React + Vite         │
│  - Static Assets        │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  API Gateway/LB         │
│  - SSL Termination      │
│  - Rate Limiting        │
└────────────┬────────────┘
             │
┌────────────▼��───────────┐
│  Backend (Railway/AWS)  │
│  - Express.js           │
│  - Auto-scaling         │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  PostgreSQL (RDS)       │
│  - Daily Backups        │
│  - High Availability    │
└─────────────────────────┘
```

---

## 🚀 Post-Deployment

1. **Verify Health**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Test Admin Panel**
   ```bash
   curl -X POST https://your-api-domain.com/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"almoizaledrisi@gmail.com","password":"your-password"}'
   ```

3. **Setup Monitoring**
   - Configure Sentry for error tracking
   - Setup uptime monitoring (Pingdom, UptimeRobot)
   - Enable performance monitoring

4. **Enable Backups**
   - Database backups (daily)
   - File backups (if applicable)
   - Version control (GitHub)

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**CORS Error**
- Update CLIENT_URL in backend .env
- Verify frontend domain matches

**Payment Processing Fails**
- Verify STRIPE_SECRET_KEY is correct
- Check Stripe webhook configuration

**Admin Login Issues**
- Verify JWT_SECRET is set
- Check credentials in database

---

## 🎯 Next Steps

1. Choose deployment platform
2. Setup custom domain
3. Configure SSL certificate
4. Setup monitoring and alerts
5. Enable automated backups
6. Create deployment documentation
7. Setup CI/CD pipeline
8. Configure admin notifications

**Recommended**: Start with Railway or Render for easiest setup!
