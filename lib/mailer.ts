// lib/mailer.ts
import { InvoiceData } from "@/types/invoice";
import nodemailer from "nodemailer";
import { getInvoiceEmailTemplate } from "./emailTemplates";

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_HOST,
  host: process.env.SMTP_HOST,
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
  invoice
}: {
  to: string;
  subject: string;
  invoice: InvoiceData;
}) {
  const html = getInvoiceEmailTemplate(invoice);

  const info = await transporter.sendMail({
    from: `"Invoice App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: `Invoice #${invoice.invoice_number} from ${invoice.from_name} - Total ₹${invoice.total}`,
    html,
  });

  console.log("Email sent:", info.messageId);
}
