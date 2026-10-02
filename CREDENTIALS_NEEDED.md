# 🚀 Deployment Ready — Required Credentials Summary

The alternance-offer-crawler project is now ready for production deployment on Ikoula with full CI/CD automation.

---

## 📋 What You Need to Provide

Fill in these details to proceed with deployment. All are required except optional items marked with ⭐.

### 1️⃣ Ikoula Server Access
```
IKOULA_HOST:              [IP Address or Hostname]
                          Example: 185.x.x.x or ikoula.company.com

IKOULA_USER:              [SSH Username]
                          Example: administrator or deploy-user

IKOULA_SSH_KEY:           [Private SSH Key Content]
                          Generate: ssh-keygen -t ed25519 -f ikoula-deploy
                          Paste the entire ikoula-deploy file content

IKOULA_SSH_PORT:          [SSH Port, default 22]
                          Usually: 22
```

### 2️⃣ PostgreSQL Database
```
DATABASE_PASSWORD:        [Strong Password, 20+ chars]
                          Must include: uppercase, lowercase, numbers, symbols
                          Example: Xk7@mP2$qL9&wR4vN8

DATABASE_URL:             [Auto-generated after password]
                          Format: postgresql://alternance_user:PASSWORD@localhost:5432/alternance_crawler
```

### 3️⃣ Firebase Project
```
FIREBASE_PROJECT_ID:      [From Firebase Console]
                          Example: alternance-crawler-dev

FIREBASE_API_KEY:         [From Firebase Console → Settings → Web API Key]

FIREBASE_AUTH_DOMAIN:     [From Firebase Console]
                          Example: alternance-crawler-dev.firebaseapp.com

FIREBASE_SERVICE_ACCOUNT: [From Firebase Console → Settings → Service Accounts]
                          Download as JSON and paste entire file content
```

### 4️⃣ OpenAI / ChatGPT
```
OPENAI_API_KEY:           [From https://platform.openai.com/account/api-keys]
                          Starts with: sk-
                          Set usage limits in account settings
```

### 5️⃣ N8N Workflow Automation
```
N8N_URL:                  [Your N8N instance URL]
                          Example: https://n8n.company.com

N8N_API_KEY:              [From N8N Dashboard → Account → API Token]
```

### 6️⃣ Email Service (SMTP)
```
SMTP_HOST:                [Email provider SMTP server]
                          Gmail: smtp.gmail.com
                          Office365: smtp.office365.com

SMTP_PORT:                [SMTP port]
                          Usually: 587 (TLS) or 465 (SSL)

SMTP_USER:                [Email address or username]
                          Example: notifications@company.com

SMTP_PASS:                [App-specific password, NOT account password]
                          Gmail: Generate in Security settings
                          Office365: Generate in Microsoft Account security
```

### 7️⃣ Domain & SSL
```
API_DOMAIN:               [Your API domain]
                          Example: api-alternance.company.com

SSL_CERTIFICATE:          [Path to SSL certificate on server]
                          Or use existing wildcard cert if available
                          Example: *.company.com
```

### 8️⃣ Optional — Notifications
```
⭐ SLACK_WEBHOOK:         [Optional: Slack webhook for deployment alerts]
                          From: Slack Workspace → Apps → Incoming Webhooks
```

---

## 🔄 Next Steps

### Step 1: Gather Credentials
Copy the template above and fill in all values. Keep this document secure.

### Step 2: Create Ikoula Setup
Follow: [`docs/IKOULA_ISOLATED_SETUP.md`](docs/IKOULA_ISOLATED_SETUP.md)
- Create PostgreSQL database and user
- Clone repository to `F:\Github\alternance-offer-crawler\`
- Create `.env.local` with credentials
- Test PM2 and IIS setup

### Step 3: Configure GitHub Actions
Follow: [`docs/GITHUB_SECRETS.md`](docs/GITHUB_SECRETS.md)
1. Go to: GitHub Repo → Settings → Secrets and variables → Actions
2. Add each credential as a secret (use exact names from list above)
3. Generate SSH key and add public key to Ikoula

### Step 4: Test Deployment
Follow: [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
- Run manual deployment script
- Verify health check passes
- Test GitHub Actions workflow

### Step 5: Enable Automation
- Push to master branch → GitHub Actions auto-deploys
- Monitor workflow logs
- Verify N8N workflows execute daily

---

## 📚 Documentation Structure

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT_CHECKLIST.md** | Complete step-by-step checklist |
| **docs/IKOULA_ISOLATED_SETUP.md** | Server configuration guide |
| **docs/GITHUB_SECRETS.md** | Credentials & security reference |
| **docs/DEPLOYMENT.md** | General deployment architecture |
| **docs/DEVELOPMENT.md** | Local development setup |
| **docs/API.md** | REST API endpoints |
| **docs/SCHEMA.md** | Database schema reference |

---

## 🔐 Security Reminders

✅ **DO:**
- Store credentials securely (use GitHub Actions secrets, not env files)
- Use strong, unique passwords (20+ characters)
- Rotate SSH keys periodically
- Enable IP whitelisting where possible
- Set OpenAI usage limits to prevent surprise bills

❌ **DON'T:**
- Commit `.env.local` or any credentials to git
- Share credentials in Slack, email, or chat
- Use personal credentials for production
- Expose secrets in logs or error messages
- Use the same password for multiple services

---

## 🎯 Quick Reference: Required Secret Names (for GitHub)

Copy-paste these exact names when adding GitHub Actions secrets:

```
IKOULA_HOST
IKOULA_USER
IKOULA_SSH_KEY
IKOULA_SSH_PORT
DATABASE_URL
FIREBASE_SERVICE_ACCOUNT
FIREBASE_PROJECT_ID
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
OPENAI_API_KEY
N8N_URL
N8N_API_KEY
SLACK_WEBHOOK (optional)
```

---

## ❓ Questions?

Refer to the troubleshooting sections in:
- [IKOULA_ISOLATED_SETUP.md → Troubleshooting](docs/IKOULA_ISOLATED_SETUP.md#troubleshooting)
- [GITHUB_SECRETS.md → Troubleshooting](docs/GITHUB_SECRETS.md#troubleshooting)

---

**Once all credentials are provided, deployment takes ~30 minutes to complete.** ✅
