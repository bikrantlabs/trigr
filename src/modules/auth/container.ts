import { getPool } from "src/shared/infra/db";
import { createTokenRepository } from "./repository/token.repository";
import { createAuthService } from "./services/auth.service";
import { createUserRepository } from "./repository/user.repository";
import { createTokenService } from "./services/token.service";
import { cacheService } from "src/shared/infra/cache.service";

const pool = getPool();

const tokenRepository = createTokenRepository(pool);
const userRepository = createUserRepository(pool);
export const tokenService = createTokenService({ tokenRepository });
export const authService = createAuthService({
  tokenService,
  userRepository,
  cacheService,
});
