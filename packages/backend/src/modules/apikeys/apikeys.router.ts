import { NextFunction, Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { AppError } from '../../lib/errors';
import { createApiKey, listApiKeys, revokeApiKey } from './apikeys.service';
import { CreateApiKeySchema, RevokeApiParamsSchema } from './apikeys.types';

const apiKeysRouter: Router = Router();

apiKeysRouter.use(requireAuth);

apiKeysRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = CreateApiKeySchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User ID missing in request', 400);
        }
        const apiKey = await createApiKey(userId, name);
        res.status(201).json({ message: 'API key created successfully', apiKey });
    } catch (error) {
        next(error);
    }
});

apiKeysRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError('User ID missing in request', 400);
        }
        const keys = await listApiKeys(userId);
        res.json({ apiKeys: keys });
    } catch (error) {
        next(error);
    }
});

apiKeysRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        let keyId = RevokeApiParamsSchema.parse(req.params).id;

        if (!userId) {
            throw new AppError('User ID missing in request', 400);
        }
        if (!keyId) {
            throw new AppError('API key ID is required', 400);
        }

        const revokedKey = await revokeApiKey(userId, keyId);
        res.json({ message: 'API key revoked successfully', apiKey: revokedKey });
    } catch (error) {
        next(error);
    }
});

export { apiKeysRouter };
