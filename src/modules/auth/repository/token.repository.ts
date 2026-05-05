import { getPool } from "src/shared/db";
import { CreateTokenData, RefreshToken } from "src/modules/auth/auth.types";
import { config } from "src/shared/config/config";
import { parseExpiryToMs } from "src/shared/utils/date";

export const tokenRepository = {
  create: async (data: CreateTokenData) => {
    const pool = getPool();
    const { userId, expiresAt, tokenHash, id, ipAddress, userAgent } = data;
    await pool.query(
      "INSERT INTO refresh_tokens(id, userId, tokenHash, expiresAt, ipAddress, userAgent) VALUES($1, $2, $3, $4, $5, $6) ",
      [id, userId, tokenHash, expiresAt, ipAddress, userAgent],
    );
  },

  findById: async (id: string) => {
    const pool = getPool();
    const { rows } = await pool.query<RefreshToken>(
      "SELECT * FROM refresh_tokens WHERE id = $1",
      [id],
    );
    return rows[0] ?? null;
  },
  revokeById: async (id: string) => {
    const pool = getPool();
    await pool.query(
      "UPDATE FROM refresh_tokens SET revokedAt = $1 WHERE id = $2",
      [new Date(), id],
    );
  },

  delete: async (id: string) => {
    const pool = getPool();
    await pool.query("DELETE FROM refresh_tokens WHERE id=$1", [id]);
  },
  deleteExpired: async () => {
    const pool = getPool();
    const time = new Date(
      Date.now() - parseExpiryToMs(config.REFRESH_TOKEN_EXPIRY),
    );
    await pool.query("DELETE FROM refresh_tokens WHERE expiresAt = $1", [time]);
  },

  revokeAllForUser: async (userId: string) => {
    const pool = getPool();
    await pool.query(
      "UPDATE FROM refresh_tokens SET revokedAt = $1 WHERE userId = $2 AND revokedAt = $3",
      [new Date(), userId, null],
    );
  },
};
