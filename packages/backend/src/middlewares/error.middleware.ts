import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ status: 'error', message: err.message });
    }

    if (err instanceof ZodError) {
        return res
            .status(400)
            .json({
                status: 'error',
                message: 'Validation error',
                errors: err.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
            });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }

    console.error('Unhandled error:', err);
    return res
        .status(500)
        .json({
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        });
};
