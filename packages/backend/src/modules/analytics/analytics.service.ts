import { db } from '../../config/db';
import { apiKeys, requestLogs } from '../../db/schema';
import { sql, eq, and, gte, count, avg } from 'drizzle-orm';

const day = sql<string>`DATE_TRUNC('day', ${requestLogs.createdAt})`;

const getSummary = async (userId: string) => {
    const [stats] = await db
        .select({
            totalRequests: count(requestLogs.id),
            avgResponseTimeMs: avg(requestLogs.responseTimeMs),
            totalErrors: sql`COUNT(*) FILTER (WHERE ${requestLogs.statusCode} >= 400)`,
        })
        .from(requestLogs)
        .where(eq(requestLogs.userId, userId));

    return {
        totalRequests: Number(stats?.totalRequests || 0),
        avgResponseTimeMs: Math.round(Number(stats?.avgResponseTimeMs || 0)),
        totalErrors: Number(stats?.totalErrors || 0),
    };
};

const getDailyUsage = async (userId: string) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usage = await db
        .select({
            date: day,
            requestCount: count(requestLogs.id),
        })
        .from(requestLogs)
        .where(and(eq(requestLogs.userId, userId), gte(requestLogs.createdAt, thirtyDaysAgo)))
        .groupBy(day)
        .orderBy(day);

    return usage.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        requestCount: Number(row.requestCount),
    }));
};

const getKeyBreakdown = async (userId: string) => {
    const breakdown = await db
        .select({
            apiKeyId: requestLogs.apiKeyId,
            keyName: apiKeys.name,
            requestCount: count(requestLogs.id),
            errorCount: sql<number>`COUNT(*) FILTER (WHERE ${requestLogs.statusCode} >= 400)`,
            avgResponseTimeMs: avg(requestLogs.responseTimeMs),
        })
        .from(requestLogs)
        .innerJoin(apiKeys, eq(requestLogs.apiKeyId, apiKeys.id))
        .where(eq(requestLogs.userId, userId))
        .groupBy(requestLogs.apiKeyId, apiKeys.name);

    return breakdown.map((row) => ({
        ...row,
        requestCount: Number(row.requestCount),
        errorCount: Number(row.errorCount),
        avgResponseTimeMs: Math.round(Number(row.avgResponseTimeMs)),
    }));
};

export { getSummary, getDailyUsage, getKeyBreakdown };
