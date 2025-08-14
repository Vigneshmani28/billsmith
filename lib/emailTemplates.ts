import { InvoiceData } from "@/types/invoice";
import { OwnerInfo } from "./contants";

export function getInvoiceEmailTemplate(invoice: InvoiceData) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice #${invoice.invoice_number}</title>
<style>
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8fafc;
    margin: 0;
    padding: 0;
    color: #333;
    line-height: 1.6;
  }
  .container {
    max-width: 640px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .header {
    background-color: #1976d2;
    padding: 25px 20px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  .header p {
    margin: 4px 0 0;
    font-size: 14px;
    opacity: 0.9;
  }
  .content {
    padding: 30px;
  }
  .info-box {
    background: #f8fafc;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 25px;
  }
  .info-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #1976d2;
  }
  .info-row {
    display: flex;
    margin-bottom: 15px;
  }
  .info-col {
    flex: 1;
  }
  .info-label {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .info-value {
    color: #334155;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
  }
  .items-table th {
    background: #f1f5f9;
    padding: 12px 15px;
    text-align: left;
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    border-bottom: 2px solid #e2e8f0;
  }
  .items-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #e2e8f0;
  }
  .items-table tr:last-child td {
    border-bottom: none;
  }
  .totals-table {
    width: 100%;
    margin: 25px 0;
  }
  .totals-table td {
    padding: 8px 0;
  }
  .totals-table .label {
    text-align: right;
    padding-right: 15px;
    color: #64748b;
  }
  .totals-table .value {
    text-align: right;
    font-weight: 500;
  }
  .total-row {
    font-weight: 600;
    font-size: 16px;
    color: #1976d2;
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
  }
  .bank-details {
    background: #f8fafc;
    border-radius: 6px;
    padding: 20px;
    margin-top: 30px;
  }
  .bank-details h3 {
    margin-top: 0;
    color: #1976d2;
    font-size: 16px;
  }
  .bank-row {
    display: flex;
    margin-bottom: 8px;
  }
  .bank-label {
    font-weight: 600;
    min-width: 120px;
    color: #64748b;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 13px;
    color: #94a3b8;
  }
  .footer a {
    color: #1976d2;
    text-decoration: none;
  }
</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Invoice #${invoice.invoice_number}</h1>
      <p>Issued on ${new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="margin: 0 0 20px;">Dear <strong>${invoice.to_name}</strong>,</p>
      <p style="margin: 0 0 25px;">Thank you for your business. Below you'll find the details of your invoice. Please review the information and let us know if you have any questions.</p>

      <!-- From/To Info -->
      <div class="info-box">
        <div class="info-row">
          <div class="info-col">
            <div class="info-title">From</div>
            <div class="info-value">
              <strong>${OwnerInfo.name}</strong><br>
              ${OwnerInfo.head_office.door_no}, ${OwnerInfo.head_office.address}<br>
              ${OwnerInfo.head_office.city}<br>
              PAN: ${OwnerInfo.pan}<br>
              ${OwnerInfo.email}
            </div>
          </div>
          <div class="info-col">
            <div class="info-title">Bill To</div>
            <div class="info-value">
              <strong>${invoice.to_name}</strong><br>
              ${invoice.to_address}<br>
              ${invoice.to_email}
            </div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>₹${Number(item.rate).toFixed(2)}</td>
              <td>₹${(Number(item.rate) * Number(item.quantity)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <table class="totals-table">
        <tr>
          <td class="label">Subtotal:</td>
          <td class="value">₹${invoice.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="label">Tax (${invoice.tax_rate}%):</td>
          <td class="value">₹${invoice.tax_amount.toFixed(2)}</td>
        </tr>
        ${Number(invoice.discount) > 0 ? `
        <tr>
          <td class="label">Discount:</td>
          <td class="value">-₹${Number(invoice.discount).toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td class="label">Total Amount:</td>
          <td class="value">₹${invoice.total.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Payment Details -->
      <div class="bank-details">
        <h3>Payment Information</h3>
        <div class="bank-row">
          <div class="bank-label">Bank Name:</div>
          <div>${OwnerInfo.bank_account.bank_name}</div>
        </div>
        <div class="bank-row">
          <div class="bank-label">Account Name:</div>
          <div>${OwnerInfo.bank_account.account_name}</div>
        </div>
        <div class="bank-row">
          <div class="bank-label">Account Number:</div>
          <div>${OwnerInfo.bank_account.account_number}</div>
        </div>
        <div class="bank-row">
          <div class="bank-label">IFSC Code:</div>
          <div>${OwnerInfo.bank_account.ifsc}</div>
        </div>
      </div>

      <!-- Footer -->
<div class="footer">
  <p>If you have any questions about this invoice, please reply to this email or contact us at <a href="mailto:${OwnerInfo.email}">${OwnerInfo.email}</a>.</p>
  <p>Thank you for choosing ${OwnerInfo.name}.</p>
  <div style="border-top: 1px solid #e2e8f0; margin-top: 20px; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
    Powered by <span style="color: #1976d2;">BillSmith Invoices</span>
  </div>
</div>
    </div>
  </div>
</body>
</html>
  `;
}
