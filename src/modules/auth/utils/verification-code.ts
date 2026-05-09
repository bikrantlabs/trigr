import crypto from "crypto";
export function generateVerificationCode() {
  const MIN = 100000;
  const MAX = 999999;
  return crypto.randomInt(MIN, MAX + 1).toString();
}
