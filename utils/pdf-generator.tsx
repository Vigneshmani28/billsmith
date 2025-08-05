import { jsPDF } from "jspdf";
import { InvoiceData } from "@/types/invoice";

export const generatePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.text("Your Company Name", 20, y);
  doc.setFontSize(12);
  doc.text("123 Main Street, City, Country", 20, y + 6);
  doc.text("Email: contact@example.com | Phone: +1234567890", 20, y + 12);
  doc.setFontSize(24);
  doc.text("INVOICE", 150, y, { align: "right" });

  y += 30;

  // Invoice Info
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, y, { align: "right" });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 150, y + 6, { align: "right" });

  // From/To section
  y += 20;
  doc.setFontSize(14);
  doc.text("Bill From", 20, y);
  doc.text("Bill To", 110, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`${invoice.from_name}\n${invoice.from_email}`, 20, y);
  doc.text(`${invoice.to_name}\n${invoice.to_email}`, 110, y);

  y += 20;

  // Items Table Header
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.setFillColor(230, 230, 230);
  doc.rect(20, y, 170, 8, "F");
  doc.text("Description", 22, y + 6);
  doc.text("Qty", 110, y + 6);
  doc.text("Rate", 130, y + 6);
  doc.text("Amount", 160, y + 6);

  y += 10;

  // Items
  invoice.items.forEach((item) => {
    doc.text(item.description, 22, y);
    doc.text(item.quantity.toString(), 110, y);
    doc.text(`$${Number(item.rate).toFixed(2)}`, 130, y);
    doc.text(`$${item.amount.toFixed(2)}`, 160, y);
    y += 8;
  });

  // Totals + Bank info side by side
  y += 10;
  doc.line(20, y, 190, y);
  y += 10;

  // Left: Bank Info
  doc.setFontSize(12);
  doc.text("Bank Account Details", 20, y);
  doc.setFontSize(10);
  y += 6;
  doc.text("Account Name: Your Company", 20, y);
  doc.text("Bank Name: ABC Bank", 20, y + 6);
  doc.text("A/C No: 123456789", 20, y + 12);
  doc.text("IFSC: ABCD0123456", 20, y + 18);

  // Right: Totals
  y -= 6;
  doc.text("Subtotal:", 140, y);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, 170, y, { align: "right" });
  doc.text(`Tax (${invoice.tax_rate}%):`, 140, y + 6);
  doc.text(`$${invoice.tax_amount.toFixed(2)}`, 170, y + 6, { align: "right" });
  doc.setFontSize(12);
  doc.text("Total:", 140, y + 14);
  doc.text(`$${invoice.total.toFixed(2)}`, 170, y + 14, { align: "right" });

  y += 30;

  // Services Grid (3x3)
  doc.setDrawColor(150);
  doc.roundedRect(20, y, 170, 40, 3, 3);
  doc.setFontSize(11);
  const services = [
    "Web Development", "SEO Optimization", "UI/UX Design",
    "Consulting", "Support", "Cloud Hosting",
    "Marketing", "Security Audit", "Analytics",
  ];
  let gridX = 25;
  let gridY = y + 10;
  services.forEach((srv, i) => {
    doc.text(srv, gridX, gridY);
    gridX += 55;
    if ((i + 1) % 3 === 0) {
      gridX = 25;
      gridY += 10;
    }
  });

  y += 50;

  // Footer: Thank you note
  doc.setFontSize(12);
  doc.text("Thank you for your business!", 105, y, { align: "center" });

  y += 10;

  // Terms & Conditions
  doc.setFontSize(10);
  doc.text("Terms & Conditions", 20, y);
  doc.setFontSize(9);
  doc.text(
    "Payment is due within 15 days. Late payments may incur a fee.\nPlease contact us for any queries related to this invoice.",
    20,
    y + 6
  );

  // Save
  doc.save(`invoice-${invoice.invoice_number}.pdf`);
};
