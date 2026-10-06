# Deployment Readiness Checklist

## ✅ Phase 1: Infrastructure Setup - COMPLETE

- [x] PostgreSQL database created: `alternance_crawler`
- [x] PostgreSQL user created: `alternance_user` with password
- [x] SSH key generated for Ikoula: `~/.ssh/ikoula_key`
- [x] SSL certificate created: `api.a-o-c.dimensionweb.fr` (Let's Encrypt via Win-ACME)
- [x] Project directory on Ikoula: `F:\Github\alternance-offer-crawler`

---

## ⏳ Phase 2: GitHub Secrets Configuration - IN PROGRESS

**Action Required:** Add secrets to GitHub repository

Follow [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) or use quick reference in [GITHUB_ACTIONS_SECRETS.md](GITHUB_ACTIONS_SECRETS.md)

**Secrets to add (8 total):**
1. [ ] IKOULA_HOST
2. [ ] IKOULA_USER
3. [ ] IKOULA_SSH_KEY (multiline)
4. [ ] IKOULA_SSH_PORT
5. [ ] DATABASE_URL
6. [ ] FIREBASE_SERVICE_ACCOUNT (JSON)
7. [ ] N8N_API_KEY
8. [ ] SLACK_WEBHOOK (optional)

**Time estimate:** 5-10 minutes

---

## ⏳ Phase 3: Initial Manual Deployment Test

**Prerequisites:** 
- [ ] GitHub secrets added (Phase 2)
- [ ] Ikoula server has internet access for package downloads
- [ ] PM2 installed on Ikoula

**Steps:**
1. SSH into Ikoula: `ssh Administrator@178.170.101.34` (or use PuTTY)
2. Navigate to project: `cd F:\Github\alternance-offer-crawler`
3. Clone/update repo: `git clone https://github.com/iadimweb/alternance-offer-crawler.git` (if first time)
4. Run deployment script: `apps/backend/scripts/deploy.bat`
5. Monitor output for errors
6. Verify PM2 app started: `pm2 status`
7. Check logs: `pm2 logs dev-alternance-api`

**Expected result:** Backend API running on localhost:3001, accessible via https://api.a-o-c.dimensionweb.fr

---

## ⏳ Phase 4: GitHub Actions Workflow Test

**Prerequisites:**
- [ ] Manual deployment succeeded (Phase 3)

**Steps:**
1. Go to your GitHub repo → Actions tab
2. Look for workflow: `.github/workflows/backend-deploy.yml`
3. Click "Run workflow" button
4. Select branch: `master`
5. Click "Run workflow"
6. Monitor the workflow run for success/failure

**What it does:**
- TypeScript type checking
- Build backend
- SSH to Ikoula
- Run deploy.bat remotely
- Health check endpoint
- Optional Slack notification

---

## ⏳ Phase 5: Frontend Setup

**Manual steps on Ikoula:**
1. Create IIS site: `a-o-c` (or update existing)
2. Bind HTTPS: `https://api.a-o-c.dimensionweb.fr`
3. Select SSL certificate: `api.a-o-c.dimensionweb.fr` from Win-ACME
4. Configure URL Rewrite: redirect traffic to localhost:3001 (backend API)

**Or wait for:** GitHub Actions to handle IIS setup in future phases

---

## ⏳ Phase 6: N8N Workflows

**Prerequisites:**
- [ ] Backend API deployed and running
- [ ] N8N Cloud account active: https://n8n.srv1195018.hstgr.cloud/

**Create workflows:**
1. **Job Crawler Workflow**
   - Daily trigger (cron schedule)
   - Scrape job boards
   - POST results to: `https://api.a-o-c.dimensionweb.fr/api/crawl/webhook`

2. **OpenAI Validation Workflow**
   - Receive offers from crawler
   - Call ChatGPT for relevance scoring
   - Update Firestore with results

3. **Email Notification Workflow**
   - Daily summary email
   - Uses Gmail SMTP credentials (from N8N Credentials)

---

## ⏳ Phase 7: Firebase Configuration

**Prerequisites:**
- [ ] Firebase project: `a-o-c-93892` created and active

**Setup:**
1. Configure authentication methods (email/password, Google, etc.)
2. Set Firestore security rules
3. Link service account (done via FIREBASE_SERVICE_ACCOUNT secret)
4. Create web app config for frontend

---

## 📋 Current Status

```
Phase 1 (Infrastructure):     ✅ COMPLETE
Phase 2 (GitHub Secrets):     ⏳ IN PROGRESS (you are here)
Phase 3 (Manual Deploy):      ⏹️  READY WHEN PHASE 2 DONE
Phase 4 (GitHub Actions):     ⏹️  READY WHEN PHASE 3 DONE
Phase 5 (Frontend/IIS):       ⏹️  PENDING
Phase 6 (N8N Workflows):      ⏹️  PENDING
Phase 7 (Firebase):           ⏹️  PENDING
```

---

## 🚀 Next Immediate Action

**Add all 8 secrets to GitHub repository** using [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

Once secrets are added, come back here and proceed to Phase 3: Manual Deployment Test.

---

## 📞 Troubleshooting

### GitHub Actions fails with "Connection refused"
- Verify IKOULA_HOST is correct
- Check IKOULA_SSH_KEY is complete private key (not truncated)
- Ensure GitHub runner can reach Ikoula IP (firewall rules)

### SSH connection times out
- Verify SSH port 22 is open on Ikoula
- Check Ikoula server is running and reachable
- Try manual SSH first: `ssh -i ~/.ssh/ikoula_key Administrator@178.170.101.34`

### Database connection fails
- Verify PostgreSQL is running: `net start PostgreSQL14`
- Check DATABASE_URL matches actual config
- Test manually: `psql -U alternance_user -d alternance_crawler -h localhost`

### PM2 app doesn't start
- Check logs: `pm2 logs dev-alternance-api --lines 100`
- Verify Node.js installed: `node --version`
- Verify npm deps installed: `npm install` in `apps/backend/`

---

## 📚 Documentation Reference

- [GITHUB_ACTIONS_SECRETS.md](GITHUB_ACTIONS_SECRETS.md) — Secret values with format guide
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) — Step-by-step GitHub UI instructions
- [IKOULA_ISOLATED_SETUP.md](IKOULA_ISOLATED_SETUP.md) — Server infrastructure setup
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) — Original deployment phases
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Architecture overview
- [.github/workflows/backend-deploy.yml](.github/workflows/backend-deploy.yml) — GitHub Actions workflow

