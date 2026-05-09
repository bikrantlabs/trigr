import { cacheKeys, CacheService } from "src/shared/infra/cache.service";
import { generateVerificationCode } from "../utils/verification-code";
import { config } from "src/shared/config/config";

export type EmailVerificationService = {
  initiateVerification(userId: string, email: string): Promise<void>;
};

export const createEmailVerificationService = (deps: {
  cacheService: CacheService;
}) => {
  const { cacheService } = deps;
  return {
    async initiateVerification(userId: string, email: string) {
      const code = generateVerificationCode();

      await cacheService.set(
        cacheKeys.emailVerification(userId),
        code,
        config.VERIFICATION_CODE_EXPIRY_SECONDS,
      );

      // TODO: Emit event asynchronously
    },
  };
};
