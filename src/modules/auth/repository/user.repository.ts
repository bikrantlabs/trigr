import { getPool } from "src/shared/db";
import { CreateUserData, IUserRepository, User } from "../auth.types";

export const userRepository: IUserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const { rows } = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    return rows[0] ?? null;
  },
  create: async (data: CreateUserData): Promise<User> => {
    const pool = getPool();
    const { rows } = await pool.query<User>(
      "INSERT INTO users(email, passwordHash) VALUES($1, $2) RETURNING *",
      [data.email, data.passwordHash],
    );

    if (!rows[0]) {
      throw new Error("Failed to create error");
    }

    return rows[0];
  },
};
