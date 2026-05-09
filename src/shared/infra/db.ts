import { Pool } from "pg";
import { logger } from "../logger";

let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return pool;
};

export const connectDB = async () => {
  const client = await getPool().connect();
  client.release();
  logger.info("Database connected");
};
