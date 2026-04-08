import z from 'zod';

const CreateApiKeySchema = z.object({
    name: z.string().min(2).max(100),
});

const RevokeApiParamsSchema = z.object({
    id: z.string().uuid(),
});

export { CreateApiKeySchema, RevokeApiParamsSchema };
