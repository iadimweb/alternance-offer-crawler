# Database Schema

PostgreSQL database schema for the alternance offer crawler.

## Tables

### Users
Stores user accounts linked to Firebase Auth.

```sql
users
├── id (CUID)
├── email (UNIQUE)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

**Relationships**:
- One-to-many: User → SearchConfigs
- One-to-many: User → JobOffers

---

### SearchConfigs
User's search preferences and job source selection.

```sql
search_configs
├── id (CUID, PRIMARY KEY)
├── userId (CUID, FOREIGN KEY → users.id)
├── domain (STRING)
├── specialty (STRING)
├── keywords (STRING[])
├── locations (STRING[])
├── enabledSources (STRING[])
├── regionPriorities (JSON)
├── isActive (BOOLEAN)
├── createdAt (TIMESTAMP)
├── updatedAt (TIMESTAMP)
└── lastCrawlAt (TIMESTAMP, nullable)
```

**Indexes**:
- `users.id` (foreign key)

**Example**:
```json
{
  "id": "config-123",
  "userId": "user-456",
  "domain": "Audiovisual",
  "specialty": "Sound",
  "keywords": ["mixing", "post-production"],
  "locations": ["Paris", "Lyon"],
  "enabledSources": ["LinkedIn", "Indeed"],
  "regionPriorities": [
    {"region": "Ile-de-France", "priority": 1},
    {"region": "Rhone-Alpes", "priority": 2}
  ],
  "isActive": true,
  "lastCrawlAt": "2024-01-15T06:00:00Z"
}
```

---

### JobOffers
All crawled job offers with validation results.

```sql
job_offers
├── id (CUID, PRIMARY KEY)
├── userId (CUID, FOREIGN KEY → users.id)
├── title (STRING)
├── company (STRING)
├── location (STRING)
├── source (STRING) -- LinkedIn, Indeed, Apec, etc.
├── url (STRING, UNIQUE)
├── description (TEXT, nullable)
├── sourceId (STRING, nullable) -- Original ID from source
├── hashId (STRING, UNIQUE, nullable) -- title+company+location hash
├── isDuplicate (BOOLEAN)
├── relevanceScore (FLOAT)
├── isRelevant (BOOLEAN)
├── aiComment (TEXT, nullable)
├── validatedAt (TIMESTAMP, nullable)
├── userComment (TEXT, nullable)
├── userOverride (BOOLEAN)
├── status (STRING) -- pending, validated, sent, archived
├── sentInEmailAt (TIMESTAMP, nullable)
├── crawledAt (TIMESTAMP)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

**Indexes**:
- `users.id` (foreign key)
- `crawledAt` (for range queries)
- `isRelevant` (for filtering)
- `status` (for filtering)

**Status Flow**:
1. `pending` → Crawled, awaiting validation
2. `validated` → ChatGPT validation complete
3. `sent` → Included in email to user
4. `archived` → Manually archived by user

---

### CrawlLogs
Tracks each crawler execution for debugging and monitoring.

```sql
crawl_logs
├── id (CUID, PRIMARY KEY)
├── configId (STRING) -- Reference to search config
├── startedAt (TIMESTAMP)
├── completedAt (TIMESTAMP, nullable)
├── status (STRING) -- running, completed, failed
├── totalFound (INT)
├── newOffers (INT)
├── duplicates (INT)
├── errorMessage (TEXT, nullable)
└── logs (TEXT, nullable) -- JSON stringified logs
```

**Indexes**:
- `configId`
- `startedAt`

**Example**:
```json
{
  "id": "crawl-789",
  "configId": "config-123",
  "startedAt": "2024-01-15T06:00:00Z",
  "completedAt": "2024-01-15T06:15:30Z",
  "status": "completed",
  "totalFound": 42,
  "newOffers": 38,
  "duplicates": 4,
  "errorMessage": null,
  "logs": "[...json logs...]"
}
```

---

## Queries

### Find new offers from last crawl
```sql
SELECT * FROM job_offers
WHERE userId = $1
  AND status = 'pending'
  AND crawledAt > NOW() - INTERVAL '1 day'
ORDER BY crawledAt DESC;
```

### Find duplicates by hash
```sql
SELECT hashId, COUNT(*) as count
FROM job_offers
WHERE userId = $1 AND isDuplicate = false
GROUP BY hashId
HAVING COUNT(*) > 1;
```

### Get accepted offers for email delivery
```sql
SELECT * FROM job_offers
WHERE userId = $1
  AND isRelevant = true
  AND status = 'validated'
  AND sentInEmailAt IS NULL
  AND crawledAt > NOW() - INTERVAL '1 day'
ORDER BY relevanceScore DESC;
```

### Crawler performance metrics
```sql
SELECT 
  DATE(startedAt) as date,
  COUNT(*) as crawl_count,
  SUM(totalFound) as total_offers,
  SUM(newOffers) as new_offers,
  SUM(duplicates) as duplicates,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_crawls
FROM crawl_logs
WHERE configId = $1 AND startedAt > NOW() - INTERVAL '30 days'
GROUP BY DATE(startedAt)
ORDER BY date DESC;
```

---

## Migrations

Run migrations with:
```bash
npx prisma migrate deploy
```

Seed database with:
```bash
npx prisma db seed
```

---

## Backup & Maintenance

- **Daily backups**: Recommended (store in separate region)
- **Retention policy**: Keep offer history for 1 year minimum
- **Cleanup**: Archive offers older than 6 months
- **Indexes**: Monitor index usage and update as needed

---

## Performance Considerations

1. **Partitioning**: Consider partitioning `job_offers` by `crawledAt` for large datasets
2. **Full-text search**: Add `tsvector` on `title` and `description` for advanced search
3. **Caching**: Cache search configs in Redis (TTL: 1 hour)
4. **Connection pooling**: Use PgBouncer for optimal connection management
5. **Read replicas**: Consider for analytics queries
