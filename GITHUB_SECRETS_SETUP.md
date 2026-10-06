# Add GitHub Actions Secrets - Step by Step

## Step 1: Go to Repository Settings

1. Open your GitHub repo: **https://github.com/iadimweb/alternance-offer-crawler**
2. Click **Settings** (top right tab)
3. Click **Secrets and variables** → **Actions** (left sidebar)

## Step 2: Add Each Secret

Click **New repository secret** button for each:

### Secret 1: IKOULA_HOST
- Name: `IKOULA_HOST`
- Value: `178.170.101.34`
- Click **Add secret**

### Secret 2: IKOULA_USER
- Name: `IKOULA_USER`
- Value: `Administrator`
- Click **Add secret**

### Secret 3: IKOULA_SSH_KEY ⚠️ (Multiline)
- Name: `IKOULA_SSH_KEY`
- Value: **Paste ENTIRE SSH key** from `~/.ssh/ikoula_key` 
  - Open the file with: `cat ~/.ssh/ikoula_key`
  - Copy everything from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`
  - Include all lines and line breaks
- Click **Add secret**

### Secret 4: IKOULA_SSH_PORT
- Name: `IKOULA_SSH_PORT`
- Value: `22`
- Click **Add secret**

### Secret 5: DATABASE_URL
- Name: `DATABASE_URL`
- Value: `postgresql://alternance_user:PASSWORD@localhost:5432/alternance_crawler`
  - Replace `PASSWORD` with your actual PostgreSQL password
  - If DB is on different host, replace `localhost` with IP/hostname
- Click **Add secret**

### Secret 6: FIREBASE_SERVICE_ACCOUNT ⚠️ (JSON - Multiline)
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: **Paste ENTIRE JSON** from `_credentials/a-o-c-93892-firebase-adminsdk-fbsvc-0a1b21e675.json`
  - Open the file locally and copy its complete contents
  - Do NOT paste examples from documentation
  - Paste the actual JSON file contents as-is
- Click **Add secret**

### Secret 7: N8N_API_KEY
- Name: `N8N_API_KEY`
- Value: Get from `C:\Users\damie\.n8n-manager\secrets.json` or N8N Cloud dashboard (Settings → API Keys)
- Click **Add secret**

### Secret 8 (Optional): SLACK_WEBHOOK
- Name: `SLACK_WEBHOOK`
- Value: (leave empty or add your webhook URL)
- Click **Add secret**

## Step 3: Verify All Secrets Added

After adding all 7 secrets:
- Go back to Settings → Secrets and variables → Actions
- You should see all 7 secrets listed (values hidden with dots)
- No errors should appear

## ✅ Ready for Deployment!

Your GitHub repo now has all credentials needed for automated deployment via GitHub Actions.

**Next:**
- Push code to `master` branch to trigger workflow
- Or manually trigger workflow from Actions tab
- Monitor deployment logs in Actions section

---

**🔒 Security Reminders:**
- Never edit secrets after creation — delete and recreate if needed
- Never commit credentials to Git
- Rotate API keys periodically
- Keep local `_credentials/` folder private

