import { getRedisClient } from "./cache";

export type CacheService = {
  /**
   * Store a value with optional TTL (seconds).
   * Serialises to JSON — works for any serialisable value.
   */
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

  /**
   * Retrieve and deserialise a value. Returns null if key doesn't exist.
   */
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /**
   * Increment a counter. Used for rate limiting.
   * Returns the new value after increment.
   */
  increment(key: string, ttlSeconds?: number): Promise<number>;
  /**
   * Atomically set multiple values. Used for token rotation (invalidate old, set new).
   */
  mset(
    entries: { key: string; value: unknown; ttlSeconds?: number }[],
  ): Promise<void>;
};

export const cacheService: CacheService = {
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = getRedisClient();
    const serialised = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialised);
    } else {
      await client.set(key, serialised);
    }
  },

  /**
   * Retrieve and deserialise a value. Returns null if key doesn't exist.
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    const raw = await client.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  },

  async delete(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const count = await client.exists(key);
    return count > 0;
  },

  /**
   * Increment a counter. Used for rate limiting.
   * Returns the new value after increment.
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const client = getRedisClient();
    const newValue = await client.incr(key);
    // Set TTL only on first increment — subsequent calls shouldn't reset the window
    if (newValue === 1 && ttlSeconds) {
      await client.expire(key, ttlSeconds);
    }
    return newValue;
  },

  /**
   * Atomically set multiple values. Used for token rotation (invalidate old, set new).
   */
  async mset(
    entries: { key: string; value: unknown; ttlSeconds?: number }[],
  ): Promise<void> {
    const client = getRedisClient();
    const pipeline = client.multi();
    for (const { key, value, ttlSeconds } of entries) {
      const serialised = JSON.stringify(value);
      if (ttlSeconds) {
        pipeline.setEx(key, ttlSeconds, serialised);
      } else {
        pipeline.set(key, serialised);
      }
    }
    await pipeline.exec();
  },
};

export const cacheKeys = {
  // Verify email after register
  emailVerification: (emailHash: string) => `auth:email_verify:${emailHash}`,
  emailVerificationCooldown: (emailHash: string) =>
    `auth:email_verify_cooldown:${emailHash}`,
};
