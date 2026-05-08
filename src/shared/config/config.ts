import { z } from "zod";
import "dotenv/config";
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(8000),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // JWT
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 chars"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 chars"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  REFRESH_TOKEN_COOKIE_KEY: z.string().default("refresh_token"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(10), // stricter for login
  REGISTER_RATE_LIMIT_MAX: z.coerce.number().default(5),

  // Bcrypt
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // App
  CORS_ORIGIN: z.string().default("*"),
  API_PREFIX: z.string().default("/api/v1"),
});

// Throws at startup if env is misconfigured — better than crashing mid-request
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
