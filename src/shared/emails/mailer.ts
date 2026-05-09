import { createTransport } from "nodemailer";
import { config } from "../config/config";

export const transporter = createTransport({
  host: config.EMAIL_HOST,
  from: config.EMAIL_FROM,
  port: config.EMAIL_PORT,
  secure: config.NODE_ENV === "development" ? false : true, // Mailpit does NOT use TLS
});
