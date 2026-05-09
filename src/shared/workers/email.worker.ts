import { createWorker } from "../infra/events/worker";
import { logger } from "../logger";

export function startEmailWorker() {
  return createWorker("auth_email", {
    "send-verification-email": async (payload) => {
      // TODO: Send email.
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      logger.info({ email: payload.email }, "Verification email sent");
    },
    "send-welcome-email": async (payload) => {
      // TODO: Send email.
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      logger.info({ email: payload.email }, "Welcome email sent");
    },
  });
}
