import { createLogger } from "src/shared/logger";
import { AuthResult, PublicUser, RegisterInput, User } from "../auth.types";
import { userRepository } from "../repository/user.repository";
import { ConflictError } from "src/shared/errors/app-error";
import { hashPassword } from "../utils/hash-password";
import { tokenService } from "./token.service";

const logger = createLogger("Auth Service");

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    createdAt: user.createdAt,
    email: user.email,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async register(
    data: RegisterInput,
    meta: { ipAddress: string | null; userAgent: string | null },
  ): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      email: data.email,
      passwordHash,
    });

    logger.info({ userId: user.id }, "User registered");

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id, user.email);

    const { token: refreshToken, jti } = tokenService.generateRefreshToken(
      user.id,
    );

    await tokenService.persistRefreshToken({
      jti,
      rawToken: refreshToken,
      userId: user.id,
      meta,
    });

    return {
      user: toPublicUser(user),
      tokens: { accessToken, refreshToken },
    };
  },
};
