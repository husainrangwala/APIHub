import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.router';
import { apiKeysRouter } from './modules/apikeys/apikeys.router';
import { requireApiKey } from './middlewares/apikey.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimitMiddleware } from './middlewares/ratelimit.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { analyticsRouter } from './modules/analytics/analytics.router';
import { requireAuth } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/api-keys', requireAuth, requestLogger, apiKeysRouter);
app.use('/analytics', requireAuth, requestLogger, analyticsRouter);

// test route — protected by API key (not JWT)
app.get('/test', requireAuth, requireApiKey, rateLimitMiddleware, requestLogger, (req, res) => {
    res.json({ message: 'Valid API key', user: req.user });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`APIHub running on http://localhost:${PORT}`);
});
