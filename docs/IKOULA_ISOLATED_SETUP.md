# Ikoula Deployment — Isolated Setup for alternance-offer-crawler

This guide covers the **isolated setup** of alternance-offer-crawler on the shared Ikoula Windows Server, separate from LetAndB infrastructure.

---

## Architecture Isolation Strategy

```
Ikoula Server (Shared Infrastructure)
│
├── F:\PostgreSQL\18\
│   ├── data\
│   │   ├── letandb (database)
│   │   └── alternance_crawler (database) ← NEW, isolated
│   └── users: letandb_user, alternance_user ← NEW, isolated
│
├── F:\Github\
│   ├── letandb\
│   │   ├── PM2 app: dev-letandb-api ← Existing
│   │   └── Port: 3000
│   │
│   └── alternance-offer-crawler\ ← NEW, isolated
│       ├── PM2 app: dev-alternance-api ← NEW
│       └── Port: 3001
│
└── IIS
    ├── Site: letandb ← Existing
    └── Site: alternance-offer-crawler ← NEW, isolated
```

---

## Step 1 — PostgreSQL Database Setup

### 1.1 Create Dedicated Database User

RDP into Ikoula, open PowerShell:

```powershell
# Connect as superuser (replace with actual psql.exe path if needed)
& "F:\PostgreSQL\18\bin\psql.exe" -U postgres
```

At the `postgres=#` prompt, run:

```sql
-- Create dedicated user for alternance-offer-crawler
CREATE USER alternance_user WITH PASSWORD '<STRONG_PASSWORD_HERE>';

-- Create isolated database
CREATE DATABASE alternance_crawler OWNER alternance_user ENCODING 'UTF8';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE alternance_crawler TO alternance_user;

-- Verify
\l

\q
```

**Store these credentials securely**:
- Username: `alternance_user`
- Password: `<STRONG_PASSWORD_HERE>`
- Database: `alternance_crawler`
- Host: `localhost`
- Port: `5432`

### 1.2 Security — Verify pg_hba.conf

Edit `F:\PostgreSQL\18\data\pg_hba.conf` — confirm localhost-only access:

```
# IPv4 local connections
host    all             all             127.0.0.1/32            scram-sha-256
```

---

## Step 2 — Clone Repository

```powershell
cd F:\Github
git clone https://github.com/iadimweb/alternance-offer-crawler.git
cd alternance-offer-crawler
```

---

## Step 3 — Create Environment File

Create `.env.local` in `F:\Github\alternance-offer-crawler\`:

```env
# ============================================================
# Database
# ============================================================
DATABASE_URL=postgresql://alternance_user:<STRONG_PASSWORD>@localhost:5432/alternance_crawler

# ============================================================
# Node Environment
# ============================================================
NODE_ENV=production
PORT=3001

# ============================================================
# Firebase (from Firebase Console)
# ============================================================
NEXT_PUBLIC_FIREBASE_API_KEY=<YOUR_KEY>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<YOUR_DOMAIN>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<YOUR_PROJECT_ID>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<YOUR_BUCKET>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<YOUR_SENDER_ID>
NEXT_PUBLIC_FIREBASE_APP_ID=<YOUR_APP_ID>

# ============================================================
# Backend API (internal)
# ============================================================
NEXT_PUBLIC_API_URL=https://api-alternance.your-domain.com

# ============================================================
# N8N Workflows
# ============================================================
N8N_URL=https://n8n.your-domain.com
N8N_API_KEY=<YOUR_API_KEY>
N8N_WEBHOOK_SECRET=<SECURE_RANDOM_SECRET>
BACKEND_WEBHOOK_URL=https://api-alternance.your-domain.com/api/crawl/webhook

# ============================================================
# ChatGPT Validation
# ============================================================
OPENAI_API_KEY=<YOUR_OPENAI_KEY>

# ============================================================
# Email Delivery
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<YOUR_EMAIL>
SMTP_PASS=<YOUR_APP_PASSWORD>

# ============================================================
# Job Source APIs (N8N credentials, optional here)
# ============================================================
LINKEDIN_API_KEY=
INDEED_API_KEY=
GOOGLE_CUSTOM_SEARCH_API_KEY=
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=
```

---

## Step 4 — Install Dependencies & Run Migrations

```powershell
cd F:\Github\alternance-offer-crawler

# Install dependencies
npm ci

# Generate Prisma client
cd apps\backend
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed

# Build backend
npm run build

cd ..\..
```

---

## Step 5 — Configure PM2

### 5.1 Install PM2 Globally (if not already done)

```powershell
npm install -g pm2
```

### 5.2 Create PM2 Application

```powershell
cd F:\Github\alternance-offer-crawler

# Start the app with PM2
pm2 start "npm start --workspace=apps/backend" --name "dev-alternance-api" --env-file .env.local

# Make PM2 auto-restart on Windows reboot
pm2 startup windows-startup --service-user "<YOUR_WINDOWS_USER>" --service-name "PM2-alternance"

# Save PM2 configuration
pm2 save

# Verify it's running
pm2 status
```

---

## Step 6 — IIS Reverse Proxy Setup

### 6.1 Install IIS URL Rewrite Module

If not already installed, run as Administrator:

```powershell
# Download and install URL Rewrite Module (if needed)
# https://www.iis.net/downloads/microsoft/url-rewrite
```

### 6.2 Create New IIS Website

1. Open **Internet Information Services (IIS) Manager**
2. Right-click **Sites** → **Add Website**

**Website Settings:**
- **Site name**: `alternance-offer-crawler`
- **Physical path**: `C:\inetpub\alternance-offer-crawler` (create this folder)
- **Binding**:
  - Type: `https`
  - IP: `All Unassigned`
  - Port: `443`
  - Host name: `api-alternance.your-domain.com`
  - SSL certificate: (use existing wildcard cert or generate new one)

### 6.3 Configure URL Rewrite Rule

1. Select the new site → **URL Rewrite** (double-click)
2. **Add Rule** → **Reverse Proxy**
3. **Inbound Rule**:
   - Rewrite URL: `http://localhost:3001/{R:0}`
   - Check: "Append query string"
4. Click **Apply**

### 6.4 Verify HTTPS

```powershell
# Test from PowerShell on Ikoula
$response = Invoke-WebRequest -Uri "https://api-alternance.your-domain.com/api/health" -SkipCertificateCheck
$response.StatusCode  # Should be 200
```

---

## Step 7 — GitHub Actions Secrets

Add these secrets to your GitHub repo (**Settings → Secrets and variables → Actions**):

| Secret Name | Value | Example |
|---|---|---|
| `IKOULA_HOST` | Ikoula server hostname/IP | `185.x.x.x` or `ikoula.example.com` |
| `IKOULA_USER` | SSH username | `ubuntu` or `Administrator` |
| `IKOULA_SSH_KEY` | Private SSH key (multiline) | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `IKOULA_SSH_PORT` | SSH port | `22` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://alternance_user:password@localhost:5432/alternance_crawler` |
| `OPENAI_API_KEY` | ChatGPT API key | `sk-...` |
| `N8N_API_KEY` | N8N API key | `n8n-...` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (multiline) | `{"type": "service_account", ...}` |
| `SLACK_WEBHOOK` | (Optional) Slack webhook for notifications | `https://hooks.slack.com/...` |

---

## Step 8 — Automated Deployment via GitHub Actions

The workflow in `.github/workflows/backend-deploy.yml` will automatically:

1. ✅ Run TypeScript checks
2. ✅ Build the backend
3. ✅ SSH into Ikoula
4. ✅ Run `packages/api/scripts/deploy.bat` (see below)
5. ✅ Restart PM2 with new code
6. ✅ Health check `/api/health`

**When it deploys:**
- Every push to `master` branch in `apps/backend/` or `.github/workflows/backend-deploy.yml`
- Can also trigger manually via GitHub UI

---

## Step 9 — Deployment Script

Create `F:\Github\alternance-offer-crawler\packages\api\scripts\deploy.bat`:

(See separate file: `DEPLOY.BAT`)

---

## Manual Deployment (if needed)

If GitHub Actions fails or you need to deploy manually:

```powershell
# RDP into Ikoula
cd F:\Github\alternance-offer-crawler

# Pull latest code
git pull origin master

# Install dependencies
npm ci

# Navigate to backend
cd apps\api

# Generate Prisma
npx prisma generate

# Build
npm run build

# Migrate database
npx prisma migrate deploy

# Go back to root
cd ..\..

# Restart PM2
pm2 restart dev-alternance-api --update-env
```

---

## Monitoring & Logs

### View PM2 Logs

```powershell
# Real-time logs
pm2 logs dev-alternance-api

# Last 100 lines
pm2 logs dev-alternance-api --lines 100

# Restart if needed
pm2 restart dev-alternance-api
pm2 stop dev-alternance-api
pm2 start dev-alternance-api
```

### Check API Status

```bash
# From any machine
curl https://api-alternance.your-domain.com/api/health

# Should return:
# {"status":"ok","timestamp":"2026-10-02T10:30:00Z"}
```

### PostgreSQL Verification

```powershell
# Connect to alternance database
& "F:\PostgreSQL\18\bin\psql.exe" -U alternance_user -d alternance_crawler

# Check tables
\dt

# View migrations
SELECT * FROM _prisma_migrations;

# Exit
\q
```

---

## Troubleshooting

### PM2 App Won't Start

```powershell
# Check PM2 error logs
pm2 logs dev-alternance-api --err

# Check if port 3001 is in use
netstat -ano | findstr :3001

# Restart PM2
pm2 restart dev-alternance-api --update-env
```

### Database Connection Error

```powershell
# Verify PostgreSQL is running
Get-Service -Name "postgresql*"

# Test connection
& "F:\PostgreSQL\18\bin\psql.exe" -U alternance_user -d alternance_crawler -c "SELECT 1;"

# Verify .env.local has correct DATABASE_URL
type .env.local | findstr DATABASE_URL
```

### IIS Reverse Proxy Not Working

```powershell
# Verify site is running in IIS Manager
Get-WebSite | Select Name, State

# Check binding
Get-WebBinding | Select Protocol, BindingInformation

# Test localhost directly
curl http://localhost:3001/api/health
```

### GitHub Actions Deploy Failure

1. Check GitHub Actions log: **Actions tab → workflow run → Logs**
2. Look for SSH connection errors or database migration failures
3. If SSH fails: Verify `IKOULA_HOST`, `IKOULA_USER`, `IKOULA_SSH_KEY` in secrets
4. If database fails: Check `.env.local` and PostgreSQL service

---

## Maintenance Checklist

- [ ] **Weekly**: Check PM2 logs for errors
- [ ] **Weekly**: Verify crawl jobs are running (check N8N)
- [ ] **Monthly**: Backup PostgreSQL database
- [ ] **Monthly**: Review job offer deduplication effectiveness
- [ ] **Quarterly**: Update dependencies (`npm update`)
- [ ] **Annual**: Renew SSL certificate
- [ ] **Annual**: Review database performance and indexes

---

## SSL Certificate Management

For HTTPS on `api-alternance.your-domain.com`:

**Option 1: Use existing wildcard cert** (if LetAndB has `*.your-domain.com`)
- Copy cert to IIS and bind to new site

**Option 2: Generate new cert via Let's Encrypt**
```powershell
# Use ACME.NET or similar to get free cert
# Then import into IIS
```

See `E:\DEV\LetAndB\docs\ssl-renewal-procedure.md` for renewal steps.

---

## Completion Checklist

- [ ] PostgreSQL database created (`alternance_crawler`)
- [ ] PostgreSQL user created (`alternance_user`)
- [ ] Repository cloned to `F:\Github\alternance-offer-crawler`
- [ ] `.env.local` configured with all values
- [ ] Dependencies installed (`npm ci`)
- [ ] Migrations ran (`npx prisma migrate deploy`)
- [ ] PM2 app started (`dev-alternance-api`)
- [ ] IIS site created and bound to domain
- [ ] URL Rewrite rule configured for reverse proxy
- [ ] GitHub Actions secrets configured
- [ ] `deploy.bat` script created
- [ ] Manual deployment tested
- [ ] `/api/health` returns 200 OK
- [ ] PM2 configured to auto-start on reboot
- [ ] Database backups automated

---

**Once all steps are complete, the alternance-offer-crawler is ready for production with full CI/CD automation!**
