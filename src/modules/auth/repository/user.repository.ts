import { CreateUserData, UserRepository, User } from "../auth.types";
import { DbUser } from "src/shared/db.types";
import { Pool } from "pg";

export const createUserRepository = (pool: Pool): UserRepository => {
  return {
    async findByEmail(email: string): Promise<User | null> {
      const { rows } = await pool.query<DbUser>(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      if (!rows[0]) {
        return null;
      }
      return {
        id: rows[0].id,
        createdAt: new Date(rows[0].created_at),
        email: rows[0].email,
        isActive: rows[0].is_active,
        isEmailVerified: rows[0].is_email_verified,
        passwordHash: rows[0].password_hash,
        updatedAt: new Date(rows[0].updated_at),
      };
    },
    async findById(id: string): Promise<User | null> {
      const { rows } = await pool.query<DbUser>(
        "SELECT * FROM users WHERE id = $1",
        [id],
      );
      if (!rows[0]) {
        return null;
      }
      return {
        id: rows[0].id,
        createdAt: new Date(rows[0].created_at),
        email: rows[0].email,
        isActive: rows[0].is_active,
        isEmailVerified: rows[0].is_email_verified,
        passwordHash: rows[0].password_hash,
        updatedAt: new Date(rows[0].updated_at),
      };
    },
    create: async (data: CreateUserData): Promise<User> => {
      const { rows } = await pool.query<DbUser>(
        "INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING *",
        [data.email, data.passwordHash],
      );

      if (!rows[0]) {
        throw new Error("Failed to create error");
      }

      return {
        id: rows[0].id,
        createdAt: new Date(rows[0].created_at),
        email: rows[0].email,
        isActive: rows[0].is_active,
        isEmailVerified: rows[0].is_email_verified,
        passwordHash: rows[0].password_hash,
        updatedAt: new Date(rows[0].updated_at),
      };
    },
    setEmailVerified: async (
      userId: string,
      verified: boolean,
    ): Promise<User> => {
      const { rows } = await pool.query<User>(
        "UPDATE users SET is_email_verified = $1 WHERE id=$2 RETURNING *",
        [verified, userId],
      );
      return rows[0] as User;
    },
  };
};
