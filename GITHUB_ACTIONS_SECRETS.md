# GitHub Actions Secrets Configuration

Add these secrets to your GitHub repository to enable CI/CD deployment.

**Location:** Settings → Secrets and variables → Actions → New repository secret

---

## 1️⃣ Ikoula Server Access (4 secrets)

### IKOULA_HOST
```
178.170.101.34
```

### IKOULA_USER
```
Administrator
```

### IKOULA_SSH_KEY
Paste the **complete private SSH key** from `~/.ssh/ikoula_key`

The key should start with:
```
-----BEGIN OPENSSH PRIVATE KEY-----
```

And end with:
```
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **Include the entire key content, including the BEGIN/END lines.**

### IKOULA_SSH_PORT
```
22
```

---

## 2️⃣ Database Connection (1 secret)

### DATABASE_URL
```
postgresql://alternance_user:PASSWORD@localhost:5432/alternance_crawler
```

Replace `PASSWORD` with the actual PostgreSQL password you set during database setup (`pwdSQLZO26!`)

---

## 3️⃣ Firebase Integration (1 secret)

### FIREBASE_SERVICE_ACCOUNT
Copy the **entire JSON content** from: `_credentials/a-o-c-93892-firebase-adminsdk-fbsvc-0a1b21e675.json`

The JSON should contain your service account credentials with these fields:
```
type, project_id, private_key_id, private_key, client_email, client_id, auth_uri, token_uri, etc.
```

⚠️ **DO NOT paste the actual JSON here.** Instead:
1. Open `_credentials/a-o-c-93892-firebase-adminsdk-fbsvc-0a1b21e675.json` locally
2. Copy the entire content
3. Paste it directly into the GitHub secret value field

---

## 4️⃣ N8N Integration (1 secret)

### N8N_API_KEY
Copy from: `C:\Users\damie\.n8n-manager\secrets.json` (N8N_API_KEY field)

Or retrieve from N8N Cloud dashboard: Settings → API Keys → Copy your API key

The value should be a JWT token starting with `eyJ...`

---

## 5️⃣ Optional: Slack Notifications

### SLACK_WEBHOOK
```
[Leave empty if not using Slack, or add your webhook URL]
```

---

## 📋 Quick Checklist

Add these secrets in order:

- [ ] IKOULA_HOST
- [ ] IKOULA_USER
- [ ] IKOULA_SSH_KEY (multiline)
- [ ] IKOULA_SSH_PORT
- [ ] DATABASE_URL
- [ ] FIREBASE_SERVICE_ACCOUNT (JSON, multiline)
- [ ] N8N_API_KEY
- [ ] SLACK_WEBHOOK (optional)

---

## ✅ Verification

After adding secrets, verify in GitHub:
1. Go to your repo → Settings → Secrets and variables → Actions
2. All 7 secrets should appear in the list (values hidden)
3. Click each to confirm it saved correctly (don't edit after adding)

---

## 🚀 Next Steps

1. **Deploy Script**: Run `apps/backend/scripts/deploy.bat` manually first to test
2. **GitHub Actions**: Trigger workflow manually or push to `master` branch
3. **Monitor**: Check Actions tab for workflow status and logs
4. **Verify**: SSH into Ikoula and check PM2: `pm2 status`

---

## ⚠️ Security Notes

- **Never** commit secrets to Git
- **Never** share `IKOULA_SSH_KEY` or `FIREBASE_SERVICE_ACCOUNT` publicly
- Rotate credentials periodically (especially N8N API key)
- Keep `_credentials/requiered_credentials.txt` local-only (in `.gitignore`)

