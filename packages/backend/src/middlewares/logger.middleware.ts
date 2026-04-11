import type { Request, Response, NextFunction } from 'express';
import { NewRequestLog, requestLogs } from '../db/schema';
import { db } from '../config/db';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
        // only log if request has an authenticated user
        if (!req.user) return;

        const responseTimeMs = Date.now() - startTime;

        const logData: NewRequestLog = {
            userId: req.user.id,
            apiKeyId: req.apiKeyId || null,
            method: req.method,
            endpoint: req.path,
            statusCode: res.statusCode,
            responseTimeMs,
        };

        db.insert(requestLogs)
            .values(logData)
            .catch((error) => {
                console.error(' [ERROR] Failed to save request log:', error);
            });
    });

    next();
};
