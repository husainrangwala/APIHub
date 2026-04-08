import { redis } from '../config/redis';

export const MAX_REQUESTS_PER_WINDOW = Number(process.env.MAX_REQUESTS_PER_WINDOW) || 100;
export const WINDOW_SIZE_SECONDS = Number(process.env.WINDOW_SIZE_SECONDS) || 60;

export const checkRateLimit = async (
    identifier: string,
): Promise<{
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
}> => {
    const windowIndex = Math.floor(Date.now() / 1000 / WINDOW_SIZE_SECONDS);
    const redisKey = `rate_limit:${identifier}:${windowIndex}`;
    const pipeline = redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, WINDOW_SIZE_SECONDS);

    const results = await pipeline.exec();
    if (!results) {
        throw new Error('Failed to execute Redis pipeline for rate limiting');
    }

    const [err, currentCount] = results[0] as [Error | null, number];
    if (err) throw err;

    const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount);
    const windowStartTime = windowIndex * WINDOW_SIZE_SECONDS;
    const ttl = windowStartTime + WINDOW_SIZE_SECONDS - Math.floor(Date.now() / 1000);

    return {
        allowed: currentCount <= MAX_REQUESTS_PER_WINDOW,
        remaining,
        resetInSeconds: ttl > 0 ? ttl : WINDOW_SIZE_SECONDS,
    };
};
