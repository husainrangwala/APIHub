import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.router';
import { apiKeysRouter } from './modules/apikeys/apikeys.router';
import { requireApiKey } from './middlewares/apikey.middleware';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be mounted here as you build them
app.use('/auth', authRouter);
app.use('/api-keys', apiKeysRouter);

// test route — protected by API key (not JWT)
app.get('/test', requireApiKey, (req, res) => {
    res.json({ message: 'Valid API key', user: req.user });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`APIHub running on http://localhost:${PORT}`);
});
