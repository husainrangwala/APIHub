import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors';
import { hashApiKey } from '../lib/apikey';
import { db } from '../config/db';

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
        if (!keyRecord.isActive) {
            return next(new AppError('API key is revoked', 401));
        }

        (req as { user: { id: string } }).user = {
            id: keyRecord.userId,
        };
        next();
    } catch (error) {
        next(error);
    }
};
