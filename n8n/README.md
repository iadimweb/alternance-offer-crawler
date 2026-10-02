# N8N Workflows

This folder contains N8N workflow definitions for the alternance offer crawler.

## Workflows

### 1. Daily Crawler Workflow (`daily-crawler.json`)
- **Trigger**: Daily schedule (6 AM UTC)
- **Actions**:
  1. Fetch active search configs from database
  2. For each enabled source (LinkedIn, Indeed, Apec, Google Search):
     - Execute crawl with credentials from N8N
     - Extract job offers
  3. Store raw offers temporarily
  4. Deduplicate against existing offers
  5. Send new offers to ChatGPT validation

### 2. ChatGPT Validation Workflow (`validate-offers.json`)
- **Trigger**: Webhook from crawler
- **Actions**:
  1. Receive batch of offers
  2. For each offer:
     - Prepare validation prompt with search criteria
     - Call ChatGPT API
     - Extract relevance score (0-1)
     - Extract justification
  3. Store validation results
  4. Trigger email workflow

### 3. Daily Email Workflow (`send-email.json`)
- **Trigger**: After validation completes
- **Actions**:
  1. Query validated offers (isRelevant = true)
  2. Group by user
  3. Generate HTML email with:
     - New relevant offers
     - Quick stats
     - Direct links
  4. Send via SMTP
  5. Mark offers as sent

### 4. On-Demand Crawl Workflow (`on-demand-crawl.json`)
- **Trigger**: Manual trigger from web UI
- **Actions**: Same as daily crawler but triggered immediately

## Setup Instructions

1. **Export workflows from N8N** and save as `.json` files in this folder
2. **Store credentials in N8N UI** (never commit credentials):
   - LinkedIn API (if available)
   - Indeed API
   - Google Custom Search API (for Google Search)
   - OpenAI API Key (for ChatGPT)
   - SMTP credentials (for email)
   - Backend API webhook URL
3. **Configure N8N variables**:
   - `API_URL`: Backend API URL
   - `OPENAI_API_KEY`: ChatGPT API key
   - `BACKEND_WEBHOOK_SECRET`: Webhook signing secret
4. **Set up scheduling**:
   - Daily crawler: Cron expression or N8N scheduler
   - Validation: Triggered by crawler webhook
   - Email: Triggered by validation webhook

## Workflow Input/Output Schemas

### Crawler → Validation
```json
{
  "configId": "string",
  "offers": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "source": "string",
      "url": "string",
      "description": "string"
    }
  ]
}
```

### Validation Response
```json
{
  "offerId": "string",
  "relevanceScore": 0.85,
  "isRelevant": true,
  "justification": "string"
}
```

## Testing

1. **Test crawler** in N8N editor before scheduling
2. **Test email format** with sample offers
3. **Verify deduplication** by running crawler twice
4. **Check ChatGPT prompt** with various job descriptions

## Monitoring

- Check N8N dashboard for workflow execution logs
- Monitor backend logs for webhook failures
- Set up N8N notifications for workflow failures
- Weekly: Review false positives/negatives and adjust ChatGPT prompt

## Prompt Template (ChatGPT Validation)

```
You are a job offer relevance validator for BTS (alternance) students.

Search Criteria:
- Domain: {domain}
- Specialty: {specialty}
- Keywords: {keywords}
- Locations: {locations}

Job Offer:
Title: {title}
Company: {company}
Location: {location}
Description: {description}

Task:
1. Evaluate relevance (0-1 score)
2. Determine if this offer should be sent to the student (true/false)
3. Provide brief justification

Respond in JSON:
{
  "relevanceScore": number,
  "isRelevant": boolean,
  "justification": "string"
}
```
