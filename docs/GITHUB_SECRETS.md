# GitHub Actions Secrets — Complete Checklist

Add these secrets to your GitHub repository for automated deployment.

**Location**: Settings → Secrets and variables → Actions

---

## Infrastructure & Access

### IKOULA_HOST
- **Type**: URL/IP Address
- **Required**: ✅ YES
- **Value**: IP or hostname of Ikoula server
- **Example**: `185.xxx.xxx.xxx` or `ikoula.example.com`
- **Note**: Must be accessible over SSH (port 22 or custom)

### IKOULA_USER
- **Type**: String
- **Required**: ✅ YES
- **Value**: SSH username for Ikoula server
- **Example**: `administrator` or `deploy-user`

### IKOULA_SSH_KEY
- **Type**: Multiline text (SSH private key)
- **Required**: ✅ YES
- **Value**: Private SSH key (PEM format)
- **Format**:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  [multiline key content]
  -----END OPENSSH PRIVATE KEY-----
  ```
- **Note**: Generate with `ssh-keygen -t ed25519 -f ikoula-deploy`
- **Warning**: Never commit to git; use Actions secrets only

### IKOULA_SSH_PORT
- **Type**: Number
- **Required**: ❌ NO (defaults to 22)
- **Value**: SSH port
- **Example**: `22` or `2222`

---

## Database

### DATABASE_URL
- **Type**: PostgreSQL connection string
- **Required**: ✅ YES (for production)
- **Value**: Full connection string
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Example**: `postgresql://alternance_user:MyStr0ngPass123!@localhost:5432/alternance_crawler`
- **Note**: URL-encode password if it contains special chars (@, :, /, ?, #, etc.)
- **Security**: Store securely; never hardcode

---

## Firebase

### FIREBASE_SERVICE_ACCOUNT
- **Type**: JSON (multiline)
- **Required**: ✅ YES
- **Value**: Firebase service account credentials
- **Format**:
  ```json
  {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
  }
  ```
- **Get it**: Firebase Console → Settings → Service Accounts → Generate New Private Key

---

## APIs & External Services

### OPENAI_API_KEY
- **Type**: String (API key)
- **Required**: ✅ YES
- **Value**: OpenAI API key for ChatGPT validation
- **Format**: `sk-...` (usually 48+ characters)
- **Get it**: https://platform.openai.com/account/api-keys
- **Cost**: Pay-per-use model; set usage limits in account settings

### N8N_API_KEY
- **Type**: String (API key)
- **Required**: ✅ YES
- **Value**: N8N authentication token for webhook automation
- **Get it**: N8N Dashboard → Account → API Token
- **Scope**: Must have permissions for creating/executing workflows

---

## Webhooks & Notifications

### SLACK_WEBHOOK
- **Type**: URL
- **Required**: ❌ NO (optional, for notifications)
- **Value**: Slack webhook URL for deployment status
- **Format**: `https://hooks.slack.com/services/T[WORKSPACE_ID]/B[BOT_ID]/[TOKEN]`
- **Get it**: Slack Workspace → Apps → Incoming Webhooks → Create New Webhook
- **Use**: Receive alerts when deployments succeed or fail
- **Example**: Check Slack API documentation for actual format

---

## Optional: Frontend Secrets (if Firebase deployment enabled)

### FIREBASE_PROJECT_ID
- **Type**: String
- **Required**: ❌ NO (for frontend only)
- **Value**: Firebase project ID
- **Example**: `alternance-offer-crawler-dev`

### HMAC_SECRET (for WebView signing)
- **Type**: String
- **Required**: ❌ NO (currently unused)
- **Value**: HMAC secret for signing URLs
- **Generate**: `openssl rand -hex 32`

---

## How to Create SSH Key for Ikoula

On your local machine or GitHub:

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -f ikoula-deploy -C "alternance-crawler"

# This creates:
# - ikoula-deploy (PRIVATE KEY) ← Add to GitHub Actions secrets as IKOULA_SSH_KEY
# - ikoula-deploy.pub (PUBLIC KEY) ← Add to Ikoula server

# View the private key (for GitHub)
cat ikoula-deploy

# View the public key (for Ikoula)
cat ikoula-deploy.pub
```

Then on Ikoula server:

```powershell
# Add public key to authorized_keys
Add-Content -Path "C:\Users\<username>\.ssh\authorized_keys" -Value (Get-Content "ikoula-deploy.pub")

# Set proper permissions
icacls "C:\Users\<username>\.ssh\authorized_keys" /inheritance:r /grant:r "$($env:USERNAME):(F)"
```

---

## Step-by-Step: Adding Secrets to GitHub

1. Go to: **Your Repo → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. **Name**: Copy from this document (e.g., `IKOULA_HOST`)
4. **Value**: Paste the actual value
5. Click **Add secret**
6. Repeat for all required secrets

---

## Verification Checklist

After adding all secrets, verify locally:

```bash
# Test SSH access
ssh -i ikoula-deploy administrator@IKOULA_HOST

# Test database connection (after setup)
psql -U alternance_user -d alternance_crawler -c "SELECT 1;"

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-YOUR_KEY"

# Test N8N access
curl https://n8n.your-domain.com/api/v1/me \
  -H "Authorization: Bearer YOUR_N8N_API_KEY"
```

---

## Security Best Practices

✅ **DO**:
- ✅ Use dedicated service accounts (not personal credentials)
- ✅ Rotate SSH keys periodically
- ✅ Use strong passwords (20+ chars with mix of types)
- ✅ Enable IP whitelisting where possible
- ✅ Monitor API usage and set spending limits
- ✅ Keep secrets rotated regularly

❌ **DON'T**:
- ❌ Commit secrets to git (even deleted commits can be recovered)
- ❌ Share credentials in Slack, email, or chat
- ❌ Use personal API keys for production
- ❌ Set overly permissive access (principle of least privilege)
- ❌ Hardcode defaults that work in production
- ❌ Log or expose secrets in error messages

---

## Environment Variables vs. Secrets

| Variable | Storage | Visibility | Used For |
|----------|---------|-----------|----------|
| **Secret** | GitHub Actions secrets | Hidden from logs | Production deployment credentials |
| **Env var** | `.env.local` | Logged (be careful!) | Development configuration |
| **NEXT_PUBLIC_*** | Hardcoded in build | Public! | Frontend-safe values (API keys ≠ secrets) |

---

## Troubleshooting

### "Permission denied (publickey)"
- Check SSH key is added to Ikoula `authorized_keys`
- Verify key permissions: `icacls .\authorized_keys`
- Test locally: `ssh -v -i ikoula-deploy admin@host`

### "secret not found"
- Verify secret name matches exactly (case-sensitive)
- Refresh GitHub page after creating secret
- Check environment constraint (repo vs. org secrets)

### "Invalid DATABASE_URL"
- Test locally: `psql connection-string`
- URL-encode special characters: `:` → `%3A`, `@` → `%40`
- Use connection pooler if needed: `postgresql://user:pass@pgbouncer:6432/db`

---

## Reference: GitHub Actions Secret Usage

In workflows, reference secrets with:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  IKOULA_HOST: ${{ secrets.IKOULA_HOST }}
```

Or in script:

```bash
ssh -i /tmp/key ${{ secrets.IKOULA_USER }}@${{ secrets.IKOULA_HOST }}
```

---

**Once all secrets are configured, GitHub Actions workflows can deploy automatically!**
