import { transporter } from "./mailer";

export async function sendAccountVerficationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: "test@myapp.local",
    to: email,
    subject: "Verify your email",
    text: "Verify your email",
    html: `<h1 style="font-family:sans-serif;">Please verify your email using the following code.</h1><p>${code}</p>`,
  });
}
