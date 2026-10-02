# Development Setup Guide

Get the alternance-offer-crawler project running locally.

## Prerequisites

- **Node.js 18+** ([https://nodejs.org](https://nodejs.org))
- **npm 9+** or **yarn**
- **PostgreSQL 14+** ([https://www.postgresql.org](https://www.postgresql.org))
- **Git**
- **Docker** (optional, for PostgreSQL)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/alternance-offer-crawler.git
cd alternance-offer-crawler
npm install
```

### 2. Environment Setup

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
# Important: Firebase credentials, Database URL, API keys
```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb alternance_crawler

# Create user
createuser crawler_dev --password

# Update .env.local
DATABASE_URL=postgresql://crawler_dev:password@localhost:5432/alternance_crawler
```

#### Option B: Docker (Easier)
```bash
docker run --name postgres-alternance \
  -e POSTGRES_DB=alternance_crawler \
  -e POSTGRES_USER=crawler_dev \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Database Migrations

```bash
npm run db:migrate --workspace=apps/backend
# Or for interactive migration creation:
npm run migrate:dev --workspace=apps/backend
```

### 5. Start Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev --workspace=apps/frontend
# Runs on http://localhost:3000
```

**Terminal 2 - Backend**:
```bash
npm run dev --workspace=apps/backend
# Runs on http://localhost:3001
```

**Terminal 3 - Prisma Studio** (optional, for database GUI):
```bash
npm run studio --workspace=apps/backend
# Runs on http://localhost:5555
```

---

## Project Structure

```
apps/
├── frontend/              # Next.js app
│   ├── src/
│   │   ├── app/          # Pages and layouts
│   │   ├── components/   # React components
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   └── package.json
│
└── backend/              # Express API
    ├── src/
    │   ├── index.ts      # Main entry point
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   └── utils/        # Utilities
    ├── prisma/
    │   ├── schema.prisma # Database schema
    │   └── seed.ts       # Seed script
    └── package.json

n8n/                      # N8N workflows
├── README.md
└── daily-crawler.json    # Example workflow

docs/                     # Documentation
├── API.md               # API documentation
├── SCHEMA.md            # Database schema
├── DEPLOYMENT.md        # Deployment guide
└── DEVELOPMENT.md       # This file

.github/workflows/        # GitHub Actions
├── frontend-deploy.yml
└── backend-deploy.yml
```

---

## Common Commands

### Frontend
```bash
npm run dev --workspace=apps/frontend      # Start dev server
npm run build --workspace=apps/frontend    # Build for production
npm run lint --workspace=apps/frontend     # Run ESLint
npm run type-check --workspace=apps/frontend  # Check TypeScript
```

### Backend
```bash
npm run dev --workspace=apps/backend       # Start dev server
npm run build --workspace=apps/backend     # Build for production
npm run type-check --workspace=apps/backend   # Check TypeScript
npm run lint --workspace=apps/backend      # Run ESLint
npm run migrate:dev --workspace=apps/backend  # Create migration
npm run db:migrate --workspace=apps/backend   # Run migrations
npm run seed --workspace=apps/backend      # Seed database
```

### Database
```bash
npx prisma studio                          # GUI database browser
npx prisma db push                         # Sync schema to database
npx prisma migrate reset                   # Reset database
```

---

## Firebase Setup (Local Development)

### Option 1: Use Firebase Emulator
```bash
npm install -g firebase-tools
firebase emulators:start --project=demo
```

### Option 2: Connect to Cloud Firebase
1. Create Firebase project at https://console.firebase.google.com
2. Get credentials from Project Settings
3. Add to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON={...}
```

---

## N8N Development Workflows

### Local N8N Instance
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Access at: http://localhost:5678

### Testing Webhooks
```bash
# Get webhook URL and test with curl
curl -X POST http://localhost:3001/api/crawl/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "test-config",
    "offers": [...]
  }'
```

---

## Debugging

### Frontend
- **VS Code Debugger**: Install "Debugger for Firefox/Chrome" extension
- **Browser DevTools**: F12 in browser
- **Next.js logs**: Check terminal where `npm run dev` is running

### Backend
- **VS Code Debugger**: Automatically attaches when using `tsx watch`
- **Breakpoints**: Set in VS Code and debug
- **Logs**: Check terminal where `npm run dev` is running

### Database
```bash
# Connect directly with psql
psql alternance_crawler -U crawler_dev

# Check migrations
select * from _prisma_migrations;

# Query data
select count(*) from users;
select * from search_configs;
```

---

## Testing

### Frontend Tests (To be added)
```bash
npm run test --workspace=apps/frontend
npm run test:watch --workspace=apps/frontend
```

### Backend Tests (To be added)
```bash
npm run test --workspace=apps/backend
npm run test:watch --workspace=apps/backend
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL in .env.local
# Make sure database exists
psql -l
```

### Prisma Schema Issues
```bash
# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

### npm Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Tips

1. **Frontend**: Use React DevTools Profiler to find slow components
2. **Backend**: Use `npm run dev` for hot reload, avoid rebuilding
3. **Database**: Check query performance with `EXPLAIN ANALYZE`
4. **N8N**: Test workflows individually before chaining

---

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with clear message: `git commit -m "feat: description"`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request
6. Wait for CI/CD checks to pass
7. Request review
8. Merge after approval

---

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

Happy coding! 🚀
