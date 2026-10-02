# Alternance Offer Crawler

Daily automation system to search and validate internship/alternance job offers with AI-powered filtering and email delivery.

## Architecture

```
alternance-offer-crawler/
├── apps/
│   ├── frontend/          # Next.js UI (config + history view)
│   │   └── ...
│   └── backend/           # Express API (Node.js)
│       └── ...
├── packages/
│   └── shared/            # Shared types, utilities
├── n8n/                   # N8N workflow exports
├── docs/                  # Documentation
└── docker/                # Docker configs
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js + React + TypeScript | Web UI for config, search criteria, history |
| **Backend** | Express + Prisma | REST API, database management |
| **Database** | PostgreSQL | Job offers, search configs, deduplication |
| **Workflow** | N8N | Daily crawler, ChatGPT validation, email |
| **Auth** | Firebase Auth | User authentication |
| **Real-time** | Firestore | Live offer updates during crawl |
| **Email** | N8N native | Daily summary delivery |

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run migrations
npm run db:migrate

# Start dev servers
npm run dev
```

## Key Features

1. **Web Configuration UI**
   - Set search domain (audiovisual, IT, etc.)
   - Specify specialty/role
   - Add keywords, location filters, geographic prioritization
   - Enable/disable job sources (websites + Google search)

2. **Automated Daily Crawler** (N8N)
   - Crawl selected job sites via credentials
   - Google search fallback
   - Deduplicate offers in database
   - Chain with ChatGPT validation

3. **AI Validation** (ChatGPT via N8N)
   - Validate offer relevance against search criteria
   - Check alignment with BTS study level
   - Generate relevance scores
   - Provide justification for rejection

4. **History & Review**
   - View all crawled offers with metadata
   - Search, filter, sort
   - See why offers were accepted/rejected
   - Manual override capability

5. **Daily Email Summary**
   - New relevant offers
   - Summary statistics
   - Direct links to full offers
   - Sent each morning

## Environment Setup

Create `.env.local` in project root:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alternance_crawler

# N8N
N8N_URL=https://n8n.your-domain.com
N8N_API_KEY=...

# ChatGPT (used by N8N)
OPENAI_API_KEY=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

## Deployment

- **Frontend**: Firebase Hosting (auto-deploy from master)
- **Backend**: Windows Server/Ikoula (PM2 + IIS)
- **Database**: PostgreSQL on Ikoula
- **Workflows**: N8N Cloud

See CI/CD setup in `.github/workflows/`

## Documentation

### 🚀 Getting Started
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** ← **START HERE** for production
- **[Ikoula Isolated Setup](./docs/IKOULA_ISOLATED_SETUP.md)** ← Step-by-step server configuration
- **[GitHub Secrets Configuration](./docs/GITHUB_SECRETS.md)** ← Required for CI/CD automation

### 📚 Reference Documentation
- [API Documentation](./docs/API.md) — All REST endpoints
- [Database Schema](./docs/SCHEMA.md) — Prisma schema & queries
- [Local Development Setup](./docs/DEVELOPMENT.md) — Dev environment guide
- [Deployment Guide](./docs/DEPLOYMENT.md) — General deployment architecture
- [N8N Workflows](./n8n/README.md) — Crawler & validation workflows

---

**Project Status**: Ready for deployment (isolated Ikoula infrastructure)
