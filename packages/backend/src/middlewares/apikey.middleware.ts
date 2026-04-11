import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors';
import { hashApiKey } from '../lib/apikey';
import { db } from '../config/db';
import { apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';

export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawKey = req.headers['x-api-key'];
        if (!rawKey || typeof rawKey !== 'string') {
            return next(new AppError('API key missing', 401));
        }

        const keyHash = hashApiKey(rawKey);
        const keyRecord = await db.query.apiKeys.findFirst({
            where: (apiKeys, { eq }) => eq(apiKeys.keyHash, keyHash),
        });

        if (!keyRecord) {
            return next(new AppError('Invalid API key', 401));
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, keyRecord.userId),
        });

        if (!keyRecord.isActive) {
            return next(new AppError('API key is revoked', 401));
        }

        db.update(apiKeys)
            .set({ requestCount: (keyRecord.requestCount || 0) + 1 })
            .where(eq(apiKeys.id, keyRecord.id))
            .execute()
            .catch((err) => {
                console.error('Failed to update API key request count:', err);
            });

        req.user = {
            id: keyRecord.userId,
            email: user?.email || '',
        };
        req.apiKeyId = keyRecord.id;
        next();
    } catch (error) {
        next(error);
    }
};
