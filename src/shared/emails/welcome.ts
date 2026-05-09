import { transporter } from "./mailer";

export async function sendWelcomeEmail(email: string) {
  await transporter.sendMail({
    from: "test@myapp.local",
    to: email,
    subject: "Welcome!",
    text: "Welcome!",
    html: `<body style="font-family:sans-serif;"> <h1>Welcome ${email}. Happy Coding!</h1>`,
  });
}
