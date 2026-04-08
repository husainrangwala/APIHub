import type { Request, Response, NextFunction } from 'express';
import { checkRateLimit, MAX_REQUESTS_PER_WINDOW } from '../lib/ratelimiter';

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id;

    if (!identifier) {
        return res.status(400).json({ error: 'Missing identifier for rate limiting' });
    }
    const { allowed, remaining, resetInSeconds } = await checkRateLimit(identifier);

    res.set({
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': resetInSeconds,
    });

    if (!allowed) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    next();
};
