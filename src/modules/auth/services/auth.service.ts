import { createLogger } from "src/shared/logger";
import {
  AuthResult,
  UserRepository,
  PublicUser,
  TokenPair,
  User,
  TokenService,
} from "../auth.types";
import {
  ConflictError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
} from "src/shared/errors/app-error";
import { hashPassword, verifyPassword } from "../utils/hash-password";
import { LoginBody, RegisterBody } from "../validators/auth.validator";

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

export const createAuthService = (deps: {
  userRepository: UserRepository;
  tokenService: TokenService;
}) => {
  const { userRepository, tokenService } = deps;

  const service = {
    async register(
      data: RegisterBody,
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

      logger.info({ userId: user.id }, "User registered");

      return {
        user: toPublicUser(user),
        tokens: { accessToken, refreshToken },
      };
    },
    async login(
      data: LoginBody,
      meta: { userAgent: string | null; ipAddress: string | null },
    ): Promise<AuthResult> {
      const { email, password } = data;
      const user = await userRepository.findByEmail(email);

      // Verify password
      // Dummy hash to prevent against timing attacks
      const dummyHash =
        "$2b$12$dummy.hash.to.prevent.timing.attacks.from.revealing.existence";
      const match = await verifyPassword(
        password,
        user?.passwordHash ?? dummyHash,
      );

      if (!user || !match) {
        throw new InvalidCredentialsError();
      }

      if (!user.isActive) {
        throw new InvalidCredentialsError();
      }

      // Generate tokens:
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

      logger.info({ userId: user.id }, "User Logged in");

      return {
        user: toPublicUser(user),
        tokens: { accessToken, refreshToken },
      };
    },

    /**
     * Refresh tokens
     */
    async refresh(
      rawRefreshToken: string,
      meta: { userAgent: string | null; ipAddress: string | null },
    ): Promise<TokenPair> {
      const payload = await tokenService.validateRefreshToken(rawRefreshToken);

      const user = await userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedError();
      }

      const tokens = await tokenService.rotateRefreshToken({
        email: user.email,
        meta,
        oldJti: payload.jti,
        userId: user.id,
      });

      logger.info({ userId: user.id }, "Token Refreshed");

      return tokens;
    },

    async logout(rawRefreshToken: string): Promise<void> {
      try {
        const payload =
          tokenService.verifyRefreshTokenSignature(rawRefreshToken);
        await tokenService.revokeToken(payload.jti);
        logger.info({ userId: payload.sub }, "User logged out");
      } catch {
        // If token is already invalid/expired, treat logout as success
        logger.debug(
          "Logout called with invalid/expired token — treating as success",
        );
      }
    },

    /**
     * Get current user profile from access token.
     */
    async getMe(userId: string): Promise<PublicUser> {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }
      return toPublicUser(user);
    },
  };

  return service;
};
