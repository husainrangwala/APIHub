import { and, eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { apiKeys, NewApiKey } from '../../db/schema';
import { generateApiKey, hashApiKey } from '../../lib/apikey';
import { AppError } from '../../lib/errors';

const createApiKey = async (userId: string, name: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);

        const newApiKey: NewApiKey = {
            userId,
            keyHash,
            name,
        };

        const [createdKey] = await db.insert(apiKeys).values(newApiKey).returning();
        if (!createdKey) {
            throw new Error('Failed to create API key');
        }
        return {
            id: createdKey.id,
            name: createdKey.name,
            createdAt: createdKey.createdAt,
            rawKey,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Create API Key Error:', error);
        throw Error('Internal Server Error');
    }
};
const listApiKeys = async (userId: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const keys = await db.query.apiKeys.findMany({
            where: (apiKeys, { eq }) => eq(apiKeys.userId, userId),
            orderBy: (apiKeys, { desc }) => desc(apiKeys.createdAt),
            columns: {
                id: true,
                name: true,
                isActive: true,
                requestCount: true,
                createdAt: true,
            },
        });

        return keys;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('List API Keys Error:', error);
        throw Error('Internal Server Error');
    }
};

const revokeApiKey = async (userId: string, keyId: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const key = await db
            .update(apiKeys)
            .set({ isActive: false })
            .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
            .returning();
        if (!key) {
            throw new AppError('API key not found', 404);
        }
        const [updatedKey] = key;
        return {
            id: updatedKey.id,
            name: updatedKey.name,
            isActive: updatedKey.isActive,
            requestCount: updatedKey.requestCount,
            createdAt: updatedKey.createdAt,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Revoke API Key Error:', error);
        throw Error('Internal Server Error');
    }
};

export { createApiKey, listApiKeys, revokeApiKey };
