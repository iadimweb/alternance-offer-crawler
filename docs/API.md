# API Documentation

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.your-domain.com`

## Authentication
All endpoints require a valid Firebase JWT token in the `Authorization` header:
```
Authorization: Bearer <Firebase JWT Token>
```

---

## Endpoints

### Health Check
```
GET /api/health
```
**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Search Configurations

#### Get All Configs
```
GET /api/configs
```
**Response**: `200 OK`
```json
[
  {
    "id": "config-1",
    "domain": "Audiovisual",
    "specialty": "Sound",
    "keywords": ["mixing", "studio"],
    "locations": ["Paris", "Lyon"],
    "enabledSources": ["LinkedIn", "Indeed"],
    "regionPriorities": [{"region": "Ile-de-France", "priority": 1}],
    "isActive": true,
    "lastCrawlAt": "2024-01-15T06:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
]
```

#### Create/Update Config
```
POST /api/config
Content-Type: application/json

{
  "id": "config-1",
  "domain": "Audiovisual",
  "specialty": "Sound",
  "keywords": ["mixing", "studio"],
  "locations": ["Paris", "Lyon"],
  "enabledSources": ["LinkedIn", "Indeed"],
  "regionPriorities": [{"region": "Ile-de-France", "priority": 1}]
}
```
**Response**: `200 OK`
```json
{
  "id": "config-1",
  "domain": "Audiovisual",
  ...
}
```

---

### Job Offers

#### Get All Offers
```
GET /api/offers?status=all&limit=100&offset=0
```
**Query Parameters**:
- `status`: `all`, `accepted`, `rejected` (default: `all`)
- `limit`: Results per page (default: `100`)
- `offset`: Pagination offset (default: `0`)

**Response**: `200 OK`
```json
[
  {
    "id": "offer-1",
    "title": "Audio Engineer (Alternance)",
    "company": "Sony France",
    "location": "Paris",
    "source": "LinkedIn",
    "url": "https://linkedin.com/...",
    "relevanceScore": 0.92,
    "isRelevant": true,
    "aiComment": "Perfect match: sound engineering role, located in Paris, requires BTS level",
    "status": "validated",
    "crawledAt": "2024-01-15T06:00:00Z"
  }
]
```

#### Get Offer Details
```
GET /api/offers/:id
```
**Response**: `200 OK`
```json
{
  "id": "offer-1",
  "title": "Audio Engineer (Alternance)",
  "company": "Sony France",
  "location": "Paris",
  "source": "LinkedIn",
  "url": "https://linkedin.com/...",
  "description": "We are looking for...",
  "relevanceScore": 0.92,
  "isRelevant": true,
  "aiComment": "Perfect match: sound engineering...",
  "userComment": "Very interested",
  "userOverride": false,
  "status": "validated",
  "sentInEmailAt": "2024-01-15T07:00:00Z",
  "crawledAt": "2024-01-15T06:00:00Z"
}
```

#### Update Offer (User Override)
```
PATCH /api/offers/:id
Content-Type: application/json

{
  "isRelevant": true,
  "userComment": "This looks very promising!",
  "userOverride": true
}
```
**Response**: `200 OK`

---

### Crawler Webhooks

#### Receive Crawled Offers (N8N → Backend)
```
POST /api/crawl/webhook
Content-Type: application/json
X-N8N-Webhook-Secret: <BACKEND_WEBHOOK_SECRET>

{
  "configId": "config-1",
  "offers": [
    {
      "title": "Audio Engineer",
      "company": "Sony",
      "location": "Paris",
      "source": "LinkedIn",
      "url": "https://linkedin.com/...",
      "description": "We are looking for...",
      "sourceId": "linkedin-123456",
      "hashId": "hash-abc123"
    }
  ]
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "offersProcessed": 15,
  "newOffers": 12,
  "duplicates": 3
}
```

#### Trigger Manual Crawl
```
POST /api/crawl/trigger
Content-Type: application/json

{
  "configId": "config-1"
}
```
**Response**: `202 Accepted`
```json
{
  "message": "Crawl triggered",
  "crawlId": "crawl-abc123"
}
```

#### Get Crawl Status
```
GET /api/crawl/status/:crawlId
```
**Response**: `200 OK`
```json
{
  "id": "crawl-abc123",
  "status": "running",
  "startedAt": "2024-01-15T10:30:00Z",
  "totalFound": 45,
  "processed": 15
}
```

---

### Statistics & Analytics

#### Get Crawler Stats
```
GET /api/stats/crawler?days=7
```
**Query Parameters**:
- `days`: Number of days to look back (default: `7`)

**Response**: `200 OK`
```json
{
  "period": "last 7 days",
  "totalCrawls": 7,
  "totalOffersFound": 125,
  "totalOffersValidated": 98,
  "acceptanceRate": 0.72,
  "avgOffersPerCrawl": 17.8,
  "dailyBreakdown": [
    {
      "date": "2024-01-15",
      "offersFound": 18,
      "offersAccepted": 14,
      "duplicates": 2
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Status Codes
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing/invalid Firebase token
- `403 Forbidden`: No permission to access resource
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Webhook endpoints**: No limit (trusted source)

Headers in response:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp of reset time
