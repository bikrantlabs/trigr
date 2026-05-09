import { createClient, RedisClientType } from "redis";
import { config } from "../config/config";
import { createLogger } from "../logger";

const logger = createLogger("REDIS");
let redisClient: RedisClientType;

export function getRedisClient(): RedisClientType {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Will throw if not available.
  if (!redisClient) {
    throw new Error("Redis client not initialised. Call connectRedis() first.");
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  redisClient = createClient({ url: config.REDIS_URL });

  redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error");
  });
  redisClient.on("reconnecting", () => {
    logger.warn("Redis reconnecting");
  });
  redisClient.on("ready", () => {
    logger.info("Redis ready");
  });
  await redisClient.connect();
  logger.info("Redis Connected");
}
