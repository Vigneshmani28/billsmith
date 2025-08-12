// lib/mailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "smtp.zoho.in",
  host: "smtp.zoho.in",
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true if SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvoiceEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const info = await transporter.sendMail({
  from: `"Invoice App" <${process.env.SMTP_USER}>`,
  to,
  subject: "Your Invoice",
  text: "Hello, please find your invoice attached.",
  html
});

  console.log("Email sent:", info.messageId);
}
