import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { getDailyUsage, getKeyBreakdown, getSummary } from './analytics.service';
import { AppError } from '../../lib/errors';

const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const summary = await getSummary(userId);
        res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
        next(error);
    }
});

analyticsRouter.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const dailyUsage = await getDailyUsage(userId);
        res.status(200).json({ status: 'success', data: dailyUsage });
    } catch (error) {
        next(error);
    }
});

analyticsRouter.get('/keys', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const keyBreakdown = await getKeyBreakdown(userId);
        res.status(200).json({ status: 'success', data: keyBreakdown });
    } catch (error) {
        next(error);
    }
});

export { analyticsRouter };
