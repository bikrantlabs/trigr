/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
  pgm.sql(`
      CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
    );
    `);
  pgm.sql(`
    CREATE TABLE refresh_tokens (
      id TEXT PRIMARY KEY,
      userId UUID NOT NULL,
      tokenHash TEXT NOT NULL,
      expiresAt TIMESTAMP NOT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
      revokedAt TIMESTAMP,
      userAgent TEXT,
      ipAddress TEXT,

      CONSTRAINT fk_user
        FOREIGN KEY(userId)
        REFERENCES users(id)
        ON DELETE CASCADE
    );
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS refresh_tokens;
    `);
  pgm.sql(`
    DROP TABLE IF EXISTS users;
    `);
  pgm.sql(`
    DROP EXTENSION IF EXISTS pgcrypto;
    `);
};
