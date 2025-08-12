// app/api/send-invoice/route.ts
import { sendInvoiceEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();

  try {
    await sendInvoiceEmail({ to, subject, html });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
}
