import { InvoiceData } from "@/types/invoice";

export function getInvoicePublicLinkTemplate(invoice: InvoiceData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicUrl = `${baseUrl}/public/invoice/${invoice.public_id}`;

  return `
  <html>
  <body style="margin:0; padding:0; font-family: 'Helvetica', 'Arial', sans-serif; background-color:#f4f4f4; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#1a73e8; padding:20px; text-align:center; color:#fff;">
                <h1 style="margin:0; font-size:24px;">Invoice #${invoice.invoice_number}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 10px;"><strong>From:</strong> ${invoice.from_name} (${invoice.from_email})</p>
                <p style="margin:0 0 10px;"><strong>To:</strong> ${invoice.to_name} (${invoice.to_email})</p>
                <p style="margin:0 0 20px;"><strong>Total Amount:</strong> ₹${invoice.total}</p>

                <p style="margin:0 0 20px;">You can view and download your invoice by clicking the button below:</p>

                <!-- Button -->
                <p style="text-align:center; margin:30px 0;">
                  <a href="${publicUrl}" 
                     style="
                       display:inline-block;
                       padding:14px 28px;
                       background-color:#1a73e8;
                       color:#fff;
                       text-decoration:none;
                       font-weight:bold;
                       border-radius:6px;
                       font-size:16px;
                     ">
                    View Invoice
                  </a>
                </p>

                <p style="margin:20px 0 0; font-size:14px; color:#555;">
                  If the button does not work, copy and paste this link into your browser:<br>
                  <a href="${publicUrl}" style="color:#1a73e8;">${publicUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="border-top:1px solid #e0e0e0;"></td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px; text-align:center; font-size:12px; color:#888;">
                Powered by <strong>BillSmith Invoice</strong>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
