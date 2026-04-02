import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.router';

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
// app.use('/api-keys', apiKeysRouter)

app.listen(PORT, () => {
    console.log(`APIHub running on http://localhost:${PORT}`);
});
