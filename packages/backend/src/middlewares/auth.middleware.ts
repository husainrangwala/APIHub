import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { decodeJwt } from '../utils/auth.utils';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next(new AppError('Authorization header missing or malformed', 401));
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = decodeJwt(token) as { id: string; email: string };
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new AppError('Invalid or expired token', 401);
        }
        next(error);
    }
};
