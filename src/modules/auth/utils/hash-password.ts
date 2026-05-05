import bcrypt from "bcryptjs";
import { config } from "src/shared/config/config";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, config.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
