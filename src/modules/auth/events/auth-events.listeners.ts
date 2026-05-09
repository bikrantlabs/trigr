import { getQueue } from "src/shared/infra/events/queue";
import { authEvents } from "./auth.events";

export function registerAuthEventListener() {
  const authEmailQueue = getQueue("auth_email");
  authEvents.on("user.verification_code", async (data) => {
    // Add job to email queue.
    await authEmailQueue.add("send-verification-email", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });
  });

  authEvents.on("user.verified", async (data) => {
    await authEmailQueue.add("send-welcome-email", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });
  });
}
