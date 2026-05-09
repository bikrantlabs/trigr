import { createLogger } from "src/shared/logger";
import {
  AuthResult,
  UserRepository,
  PublicUser,
  TokenPair,
  User,
  TokenService,
  Meta,
  AuthService,
} from "../auth.types";
import {
  ConflictError,
  InvalidCodeError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
  UserNotVerifiedError,
} from "src/shared/errors/app-error";
import { hashPassword, verifyPassword } from "../utils/hash-password";
import { LoginBody, RegisterBody } from "../validators/auth.validator";
import { cacheKeys, CacheService } from "src/shared/infra/cache.service";
import { generateVerificationCode } from "../utils/verification-code";
import { config } from "src/shared/config/config";
import { authEvents } from "../events/auth.events";

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
  cacheService: CacheService;
}): AuthService => {
  const { userRepository, tokenService, cacheService } = deps;

  const service: AuthService = {
    async register(data) {
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

      //

      const verificationCode = generateVerificationCode();
      cacheService.set(
        cacheKeys.emailVerification(user.id),
        verificationCode,
        config.VERIFICATION_CODE_EXPIRY_SECONDS,
      );

      authEvents.emit("user.registered", {
        email: user.email,
        userId: user.id,
        code: verificationCode,
      });

      logger.info({ userId: user.id }, "User registered");
      return toPublicUser(user);
    },
    async login(data, meta) {
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

      if (!user.isEmailVerified) {
        throw new UserNotVerifiedError();
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

    async verify(data: { userId: string; code: string }, meta: Meta) {
      // Check
      const { code, userId } = data;

      const _code = await cacheService.get<string>(
        cacheKeys.emailVerification(userId),
      );

      if (!_code || _code !== code) {
        logger.error("User verification failed!");
        throw new InvalidCodeError();
      }
      // Get user from db
      let user = await userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError();
      }
      // Update the email_verified to true
      user = await userRepository.setEmailVerified(userId, true);

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

      cacheService.delete(cacheKeys.emailVerification(userId));

      logger.info("User Verified");

      return {
        user: toPublicUser(user),
        tokens: { accessToken, refreshToken },
      };
    },
    /**
     * Refresh tokens
     */

    async sendVerificationEmail(data) {
      const { code, email } = data;

      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new UnauthorizedError();
      }

      cacheService.set(
        cacheKeys.emailVerification(user.id),
        code,
        config.VERIFICATION_CODE_EXPIRY_SECONDS,
      );

      // Trigger email
    },
    async refresh(rawRefreshToken, meta) {
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

    async logout(rawRefreshToken) {
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
    async getMe(userId) {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }
      return toPublicUser(user);
    },
  };

  return service;
};
