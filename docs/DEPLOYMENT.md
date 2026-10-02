# Deployment Guide

Complete deployment instructions for alternance-offer-crawler.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Users (Browser)                                             │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐      ┌──────────────────────┐
│ Firebase        │      │ Frontend             │
│ ├─ Auth         │◄────►│ ├─ Next.js (React)   │
│ ├─ Hosting      │      │ └─ Deployed via GH   │
│ └─ Firestore    │      │    Actions           │
└──────────────────┘      └─────────┬────────────┘
                                    │
                                    ▼
                          ┌──────────────────────┐
                          │ Ikoula Windows       │
                          │ ├─ IIS (reverse     │
                          │ │   proxy)           │
                          │ ├─ PM2 (process     │
                          │ │   manager)         │
                          │ ├─ Node.js API      │
                          │ │   (Express)        │
                          │ └─ PostgreSQL       │
                          └─────────┬────────────┘
                                    │
                      ┌─────────────┼─────────────┐
                      ▼             ▼             ▼
                  ┌─────────┐   ┌────────┐   ┌──────────┐
                  │ GitHub  │   │ N8N    │   │ Email    │
                  │ Actions │   │ Cloud  │   │ Service  │
                  │ (CI/CD) │   │        │   │ (SMTP)   │
                  └─────────┘   └────────┘   └──────────┘
```

---

## Prerequisites

1. **GitHub Account** with repo
2. **Firebase Project** (EU region for GDPR)
3. **N8N Cloud** account with API access
4. **Ikoula Windows Server** with:
   - Node.js 18+
   - PostgreSQL 14+
   - IIS configured as reverse proxy
   - PM2 installed globally
5. **Sendmail/SMTP** service configured

---

## Environment Setup

### 1. Firebase Setup

#### Create Firebase Project
```bash
# Go to https://console.firebase.google.com
# Create new project with EU location
```

#### Enable Services
1. **Authentication**
   - Enable Email/Password sign-in
   - Enable Google Sign-In
   - Add authorized redirect URIs

2. **Firestore**
   - Create database (EU region)
   - Set security rules

3. **Hosting**
   - Initialize Firebase Hosting

#### Get Service Account Key
```bash
# In Firebase Console:
# Settings > Service Accounts > Generate New Private Key
# Save as JSON in .env.local
```

### 2. Database Setup (Ikoula)

```bash
# Connect to Windows Server via SSH/RDP
# Install PostgreSQL 14
# Create database and user

createdb alternance_crawler
createuser crawler_user --password
```

Update `.env.local`:
```
DATABASE_URL=postgresql://crawler_user:password@localhost:5432/alternance_crawler
```

### 3. N8N Setup

1. Log in to N8N Cloud
2. Create new workflow project
3. Generate API key: Settings > Credentials > API Key
4. Create webhooks for:
   - Daily crawler trigger
   - Validation workflow
   - Email workflow

Store in `.env.local`:
```
N8N_API_KEY=your_key_here
N8N_URL=https://your-n8n-instance.com
```

### 4. Secrets in GitHub

Add to GitHub Actions secrets:
```
FIREBASE_SERVICE_ACCOUNT=<JSON>
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
N8N_API_KEY=...
IKOULA_SSH_KEY=...
IKOULA_SSH_USER=...
IKOULA_SSH_HOST=...
```

---

## Deployment Steps

### 1. Frontend Deployment (Firebase Hosting)

```bash
# Ensure Firebase CLI is installed
npm install -g firebase-tools

# Authenticate
firebase login

# In workspace root
firebase init hosting

# Build and deploy manually
npm run build --workspace=apps/frontend
firebase deploy --only hosting
```

**Automated via GitHub Actions**: See `.github/workflows/frontend-deploy.yml`

### 2. Backend Deployment (Ikoula Server)

#### Manual Setup
```bash
# SSH into Ikoula
ssh user@ikoula-server

# Clone repository
git clone https://github.com/your-org/alternance-offer-crawler.git
cd alternance-offer-crawler

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with actual values

# Install PM2 globally (if not already)
npm install -g pm2

# Run migrations
npm run db:migrate --workspace=apps/backend

# Start backend with PM2
pm2 start apps/backend/dist/index.js --name "api" --watch

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

#### IIS Configuration
```powershell
# Install IIS URL Rewrite Module
# Create reverse proxy to http://localhost:3001

# In IIS:
# 1. Add website pointing to temporary folder
# 2. Add URL Rewrite rules to proxy to localhost:3001
# 3. Configure SSL certificate
```

**Automated via GitHub Actions**: See `.github/workflows/backend-deploy.yml`

### 3. Database Migrations (Automated)

Migrations run automatically during deployment:
```bash
npm run db:migrate --workspace=apps/backend
```

### 4. N8N Workflows

1. Export workflows from N8N UI as JSON
2. Store in `/n8n` folder
3. Import into N8N via UI or API
4. Configure credentials in N8N (never commit credentials)
5. Set up scheduling for daily crawler

---

## GitHub Actions CI/CD

### Frontend Workflow (`.github/workflows/frontend-deploy.yml`)
```yaml
on:
  push:
    branches: [master]
    paths:
      - 'apps/frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build --workspace=apps/frontend
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

### Backend Workflow (`.github/workflows/backend-deploy.yml`)
```yaml
on:
  push:
    branches: [master]
    paths:
      - 'apps/backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build --workspace=apps/backend
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.IKOULA_SSH_HOST }}
          username: ${{ secrets.IKOULA_SSH_USER }}
          key: ${{ secrets.IKOULA_SSH_KEY }}
          script: |
            cd alternance-offer-crawler
            git pull origin master
            npm ci
            npm run db:migrate --workspace=apps/backend
            pm2 reload api --update-env
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Frontend
curl https://your-domain.com/

# Backend
curl https://api.your-domain.com/api/health

# Database
psql -U crawler_user -d alternance_crawler -c "SELECT COUNT(*) FROM users;"
```

### Logs
```bash
# PM2 logs
pm2 logs api

# PostgreSQL logs
tail -f /var/lib/postgresql/data/log/*

# N8N logs
# Check N8N dashboard
```

### Backup Strategy
```bash
# Daily PostgreSQL backup
pg_dump alternance_crawler | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload to S3/Cloud Storage
aws s3 cp backup_*.sql.gz s3://your-bucket/backups/
```

### Scaling Considerations
- **Database**: Add read replicas for analytics queries
- **Backend**: Use load balancer for multiple API instances
- **Frontend**: Cache static assets in CloudFlare
- **N8N**: Upgrade plan for higher execution limits

---

## Rollback Procedures

### Frontend Rollback
```bash
firebase hosting:versions:list
firebase hosting:channels:deploy rollback-branch
```

### Backend Rollback
```bash
git revert <commit-hash>
git push origin master
# GitHub Actions will redeploy
```

---

## Security Checklist

- [ ] Firebase security rules configured
- [ ] Database backups automated
- [ ] SSL certificates valid
- [ ] Secrets never committed to git
- [ ] N8N credentials stored in UI only
- [ ] IP whitelisting configured (if needed)
- [ ] API rate limiting enabled
- [ ] Webhooks signed with secret
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
