import crypto from "crypto";

export function hashEmail(email: string) {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}
