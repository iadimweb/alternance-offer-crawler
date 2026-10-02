import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple auth middleware (Firebase token verification should be added)
app.use((req: Request, res: Response, next: NextFunction) => {
  // TODO: Verify Firebase JWT token
  // For now, we'll add a user ID to the request
  (req as any).userId = 'user-placeholder';
  next();
});

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get all configs for user
app.get('/api/configs', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const configs = await prisma.searchConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

// Create or update config
app.post('/api/config', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      id,
      domain,
      specialty,
      keywords,
      locations,
      enabledSources,
      regionPriorities,
    } = req.body;

    const config = await prisma.searchConfig.upsert({
      where: { id: id || 'new' },
      create: {
        userId,
        domain,
        specialty,
        keywords,
        locations,
        enabledSources,
        regionPriorities,
      },
      update: {
        domain,
        specialty,
        keywords,
        locations,
        enabledSources,
        regionPriorities,
        updatedAt: new Date(),
      },
    });

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Get all offers for user
app.get('/api/offers', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const status = (req.query.status as string) || 'all';

    const where: any = { userId };
    if (status === 'accepted') {
      where.isRelevant = true;
    } else if (status === 'rejected') {
      where.isRelevant = false;
    }

    const offers = await prisma.jobOffer.findMany({
      where,
      orderBy: { crawledAt: 'desc' },
      take: 100,
    });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Trigger manual crawl (webhook from N8N)
app.post('/api/crawl/webhook', async (req: Request, res: Response) => {
  try {
    const { configId, offers } = req.body;

    // Validate N8N webhook signature (should be added)

    // Process offers and store in database
    const createdOffers = [];
    for (const offer of offers) {
      const jobOffer = await prisma.jobOffer.upsert({
        where: { url: offer.url },
        create: {
          userId: 'placeholder', // Get from N8N context
          title: offer.title,
          company: offer.company,
          location: offer.location,
          source: offer.source,
          url: offer.url,
          description: offer.description,
          sourceId: offer.sourceId,
          hashId: offer.hashId,
        },
        update: {
          updatedAt: new Date(),
        },
      });
      createdOffers.push(jobOffer);
    }

    res.json({
      success: true,
      offersProcessed: createdOffers.length,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
