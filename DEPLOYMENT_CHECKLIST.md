# Deployment Checklist & Required Credentials

Complete this checklist to deploy alternance-offer-crawler to production on Ikoula.

---

## ✅ Phase 1: Infrastructure Preparation (Ikoula Server)

- [ ] **PostgreSQL Setup**
  - [ ] PostgreSQL 18 installed on Ikoula
  - [ ] User `alternance_user` created with strong password
  - [ ] Database `alternance_crawler` created and owned by `alternance_user`
  - [ ] Security: Verify `pg_hba.conf` allows only localhost connections
  - **Credentials needed**:
    - Database host: `localhost` (or Ikoula hostname)
    - Database port: `5432`
    - Database name: `alternance_crawler`
    - Database user: `alternance_user`
    - Database password: `[STRONG_PASSWORD]` ← NEEDED

- [ ] **Project Directory**
  - [ ] Repository cloned to `F:\Github\alternance-offer-crawler\`
  - [ ] `.env.local` created with all values filled in
  - [ ] Dependencies installed: `npm ci`
  - [ ] Database migrations run: `npx prisma migrate deploy`

- [ ] **PM2 Process Manager**
  - [ ] PM2 installed globally: `npm install -g pm2`
  - [ ] Application started: `pm2 start ... --name "dev-alternance-api"`
  - [ ] PM2 set to auto-start on Windows reboot: `pm2 startup windows-startup`
  - [ ] Current status verified: `pm2 status`

- [ ] **IIS Reverse Proxy**
  - [ ] IIS URL Rewrite Module installed
  - [ ] New site created: `alternance-offer-crawler`
  - [ ] HTTPS binding configured: `api-alternance.your-domain.com`
  - [ ] SSL certificate assigned (existing wildcard or new cert)
  - [ ] Reverse proxy rule created pointing to `http://localhost:3001`
  - [ ] Health check passing: `curl https://api-alternance.your-domain.com/api/health`
  - **Credentials needed**:
    - Domain name: `api-alternance.your-domain.com` ← NEEDED
    - SSL certificate: (existing or path) ← NEEDED

---

## ✅ Phase 2: External Services & APIs

- [ ] **Firebase Project**
  - [ ] Project created at https://console.firebase.google.com (EU region)
  - [ ] Web app registered
  - [ ] Authentication enabled (Email, Google, Apple)
  - [ ] Service account key generated and downloaded
  - **Credentials needed**:
    - `FIREBASE_PROJECT_ID` ← NEEDED
    - `FIREBASE_API_KEY` ← NEEDED
    - `FIREBASE_AUTH_DOMAIN` ← NEEDED
    - `FIREBASE_SERVICE_ACCOUNT` (JSON) ← NEEDED

- [ ] **OpenAI / ChatGPT**
  - [ ] Account created at https://platform.openai.com
  - [ ] API key generated
  - [ ] Usage limits set in account settings
  - **Credentials needed**:
    - `OPENAI_API_KEY` ← NEEDED

- [ ] **N8N Cloud**
  - [ ] Account created or access confirmed
  - [ ] API key generated
  - [ ] Workflows created (crawler, validation, email)
  - **Credentials needed**:
    - `N8N_URL` ← NEEDED (e.g., https://your-n8n.cloud)
    - `N8N_API_KEY` ← NEEDED

- [ ] **Email Service**
  - [ ] SMTP credentials configured (Gmail, Office365, SendGrid, etc.)
  - [ ] Test email sent successfully
  - **Credentials needed**:
    - `SMTP_HOST` ← NEEDED
    - `SMTP_PORT` ← NEEDED
    - `SMTP_USER` ← NEEDED
    - `SMTP_PASS` (app password, not account password) ← NEEDED

---

## ✅ Phase 3: GitHub Configuration

- [ ] **GitHub Repository**
  - [ ] Repository created at https://github.com/yadimweb/alternance-offer-crawler
  - [ ] Repository made public (or private, your choice)
  - [ ] Initial commit pushed

- [ ] **SSH Key for CI/CD**
  - [ ] SSH key pair generated: `ssh-keygen -t ed25519 -f ikoula-deploy`
  - [ ] Private key (ikoula-deploy) saved securely
  - [ ] Public key (ikoula-deploy.pub) added to Ikoula `authorized_keys`
  - [ ] SSH access verified: `ssh -i ikoula-deploy user@IKOULA_HOST`

- [ ] **GitHub Actions Secrets**
  - [ ] Infrastructure secrets:
    - [ ] `IKOULA_HOST` = IP or hostname ← NEEDED
    - [ ] `IKOULA_USER` = SSH username ← NEEDED
    - [ ] `IKOULA_SSH_KEY` = Private key content ← NEEDED
    - [ ] `IKOULA_SSH_PORT` = 22 (or custom)
  
  - [ ] Database secrets:
    - [ ] `DATABASE_URL` = `postgresql://alternance_user:PASSWORD@localhost:5432/alternance_crawler` ← NEEDED
  
  - [ ] Firebase secrets:
    - [ ] `FIREBASE_SERVICE_ACCOUNT` = JSON credentials ← NEEDED
  
  - [ ] API secrets:
    - [ ] `OPENAI_API_KEY` ← NEEDED
    - [ ] `N8N_API_KEY` ← NEEDED
  
  - [ ] Optional notifications:
    - [ ] `SLACK_WEBHOOK` = Slack webhook URL (optional)

---

## ✅ Phase 4: Testing & Verification

- [ ] **Local Development**
  - [ ] `npm install` runs successfully
  - [ ] `npm run dev --workspace=apps/frontend` starts on port 3000
  - [ ] `npm run dev --workspace=apps/backend` starts on port 3001
  - [ ] Frontend can reach backend at `http://localhost:3001/api/health`
  - [ ] Configuration page loads and can save settings

- [ ] **Database**
  - [ ] Migrations run without errors: `npm run db:migrate --workspace=apps/backend`
  - [ ] Tables created: `SELECT * FROM _prisma_migrations;`
  - [ ] Data can be inserted and retrieved

- [ ] **Ikoula Deployment**
  - [ ] Manual deploy test: `cd F:\Github\alternance-offer-crawler && call apps\backend\scripts\deploy.bat`
  - [ ] PM2 app running: `pm2 status` shows `dev-alternance-api` as online
  - [ ] Health check passes: `curl https://api-alternance.your-domain.com/api/health`
  - [ ] Log check: `pm2 logs dev-alternance-api` shows no errors

- [ ] **GitHub Actions**
  - [ ] Trigger test deploy: Push to master branch
  - [ ] GitHub Actions workflow runs successfully
  - [ ] Health check passes after deploy
  - [ ] No errors in workflow logs

- [ ] **N8N Workflows**
  - [ ] Crawler workflow executes successfully
  - [ ] Sample offers are created in database
  - [ ] Validation workflow processes offers
  - [ ] Email workflow sends test email

---

## 📋 Complete Credentials Needed (Summary)

Copy this list and gather all values before starting deployment:

```
[IKOULA SERVER]
IKOULA_HOST:              ___________________
IKOULA_USER:              ___________________
IKOULA_SSH_KEY:           [Paste multiline private key]
IKOULA_SSH_PORT:          22 (default)
IKOULA_PROJECT_PATH:      F:\Github\alternance-offer-crawler

[DATABASE]
DB_HOST:                  localhost
DB_PORT:                  5432
DB_NAME:                  alternance_crawler
DB_USER:                  alternance_user
DB_PASSWORD:              ___________________ (STRONG!)
DATABASE_URL:             postgresql://alternance_user:PASSWORD@localhost:5432/alternance_crawler

[FIREBASE]
FIREBASE_PROJECT_ID:      ___________________
FIREBASE_API_KEY:         ___________________
FIREBASE_AUTH_DOMAIN:     ___________________
FIREBASE_SERVICE_ACCOUNT: [Paste JSON]

[DOMAIN & SSL]
API_DOMAIN:               api-alternance.your-domain.com
SSL_CERTIFICATE_PATH:     ___________________

[APIS & SERVICES]
OPENAI_API_KEY:           sk-_______________________
N8N_URL:                  https://n8n.your-domain.com
N8N_API_KEY:              _______________________

[EMAIL]
SMTP_HOST:                ___________________
SMTP_PORT:                587 (typically)
SMTP_USER:                ___________________
SMTP_PASS:                ___________________ (app password!)

[OPTIONAL]
SLACK_WEBHOOK:            https://hooks.slack.com/...
```

---

## 🚀 Ready to Deploy?

Once all items are checked and all credentials gathered:

1. **Add GitHub Secrets** (Settings → Secrets and variables → Actions)
2. **Run Manual Test**: `git push master`
3. **Monitor Deployment**: GitHub Actions → workflow run
4. **Verify**: `curl https://api-alternance.your-domain.com/api/health`
5. **Check Logs**: PM2 logs on Ikoula server

**Full automated CI/CD is then ready!** Every future push to master will automatically:
- ✅ Type-check code
- ✅ Build backend
- ✅ SSH deploy to Ikoula
- ✅ Run migrations
- ✅ Restart PM2
- ✅ Health check verification

---

**For detailed setup instructions, see:**
- [IKOULA_ISOLATED_SETUP.md](IKOULA_ISOLATED_SETUP.md)
- [GITHUB_SECRETS.md](GITHUB_SECRETS.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
