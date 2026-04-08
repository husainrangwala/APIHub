import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { decodeJwt } from '../utils/auth.utils';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Authorization header missing or malformed', 401));
        }
        const token = authHeader.split(' ')[1];
        const decoded = decodeJwt(token) as { id: string; email: string };
        if (!decoded) {
            return next(new AppError('Invalid token', 401));
        }
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Invalid or expired token', 401));
        }
        next(error);
    }
};
