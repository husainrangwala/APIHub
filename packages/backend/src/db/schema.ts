import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    firstName: text('first_name').notNull().default(''),
    lastName: text('last_name').default(''),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    keyHash: text('key_hash').notNull().unique(),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    requestCount: integer('request_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const requestLogs = pgTable('request_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
    method: text('method').notNull(),
    endpoint: text('endpoint').notNull(),
    statusCode: integer('status_code').notNull(),
    responseTimeMs: integer('response_time_ms').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type RequestLog = typeof requestLogs.$inferSelect;
export type NewRequestLog = typeof requestLogs.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
