import { sendAccountVerficationEmail } from "../emails/account-verification";
import { sendWelcomeEmail } from "../emails/welcome";
import { createWorker } from "../infra/events/worker";
import { logger } from "../logger";

export function startEmailWorker() {
  return createWorker("auth_email", {
    "send-verification-email": async (payload) => {
      await sendAccountVerficationEmail(payload.email, payload.code);
      logger.info({ email: payload.email }, "Verification email sent");
    },
    "send-welcome-email": async (payload) => {
      await sendWelcomeEmail(payload.email);
      logger.info({ email: payload.email }, "Welcome email sent");
    },
  });
}
