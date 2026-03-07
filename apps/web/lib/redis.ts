import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(redisUrl, {
        maxRetriesPerRequest: null,
    });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

/**
 * Cache utility with tenant-based prefixing
 */
export const cache = {
    async get(tenantId: string, key: string) {
        const data = await redis.get(`${tenantId}:${key}`);
        return data ? JSON.parse(data) : null;
    },
    async set(tenantId: string, key: string, value: any, ttlInSeconds = 3600) {
        await redis.set(
            `${tenantId}:${key}`,
            JSON.stringify(value),
            "EX",
            ttlInSeconds
        );
    },
    async del(tenantId: string, key: string) {
        await redis.del(`${tenantId}:${key}`);
    },
    async flushTenant(tenantId: string) {
        const keys = await redis.keys(`${tenantId}:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
};
