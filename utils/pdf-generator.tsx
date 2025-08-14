import { jsPDF } from "jspdf";
import { InvoiceData } from "@/types/invoice";
import autoTable from "jspdf-autotable";
import { OwnerInfo, Services } from "@/lib/contants";

export const generatePDF = (invoice: InvoiceData) => {
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  const doc = new jsPDF();
  const itemsPerPage = 5;
  const itemChunks = chunkArray(invoice.items, itemsPerPage);

  // Function to add header content
  const addHeader = (y: number) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(OwnerInfo.name, 20, y);

    doc.setFontSize(11);
    doc.text(`PAN - ${OwnerInfo.pan}`, 20, y + 6);
    doc.setFont("Helvetica", "normal");
    doc.text(`Office Branches - ${OwnerInfo.office_braches}`, 20, y + 12);

    // Right-aligned Head Office info
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Head Office :", 200, y, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.text(`${OwnerInfo.head_office.door_no},`, 200, y + 6, { align: "right" });
    doc.text(`${OwnerInfo.head_office.address},`, 200, y + 12, {
      align: "right",
    });
    doc.text(`${OwnerInfo.head_office.city}.`, 200, y + 18, { align: "right" });

    // Yellow strip with "INVOICE"
    y += 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const stripHeight = 12;

    const leftStripWidth = pageWidth * 0.65;
    const gapWidth = pageWidth * 0.2;
    const rightStripWidth = pageWidth * 0.15;

    doc.setFillColor(255, 204, 0);
    doc.rect(0, y, leftStripWidth, stripHeight, "F");
    doc.rect(leftStripWidth + gapWidth, y, rightStripWidth, stripHeight, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0);
    const textX = leftStripWidth + gapWidth / 2;
    doc.text("INVOICE", textX, y + 9.5, { align: "center" });

    y += 20;

    // Invoice To
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("Invoice to:", 20, y);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    let offsetY = y + 6;

    // Optional: to_name
    if (invoice.to_name) {
      doc.text(invoice.to_name, 20, offsetY);
      offsetY += 4;
    }

    // Optional: to_email
    if (invoice.to_email) {
      doc.text(invoice.to_email, 20, offsetY);
      offsetY += 4;
    }

    // Optional: to_address split by last comma
    if (invoice.to_address) {
      const parts = invoice.to_address.split(",").map((p) => p.trim());
      if (parts.length > 1) {
        const last = parts.pop(); // Pincode or last item
        const line1 = parts.join(", ");
        doc.text(line1, 20, offsetY);
        offsetY += 4;
        doc.text(String(last), 20, offsetY);
        offsetY += 4;
      } else {
        doc.text(invoice.to_address, 20, offsetY);
        offsetY += 4;
      }
    }

    // Invoice Meta
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Invoice Number :", 150, y, { align: "right" });
    doc.text(`#${invoice.invoice_number}`, 190, y, { align: "right" });
    doc.text("Invoice Date :", 150, y + 6, { align: "right" });
    doc.setFont("Helvetica", "bold");
    doc.text(`${invoice.date}`, 190, y + 6, { align: "right" });

    return y + 10;
  };

  // Function to add payment info and totals side by side
  const addPaymentAndTotals = (y: number, isLastPage: boolean) => {
    // === Left side: Payment Info ===
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment Info:", 20, y);

    // Set base font
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");

    // Payment Info details
    doc.setFont("Helvetica", "bold");
    doc.text("Account NO :", 20, y + 6);
    doc.setFont("Helvetica", "normal");
    doc.text(OwnerInfo.bank_account.account_number, 50, y + 6);

    doc.setFont("Helvetica", "bold");
    doc.text("A/C Name :", 20, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.text(OwnerInfo.bank_account.account_name, 50, y + 12);

    doc.setFont("Helvetica", "bold");
    doc.text("Bank Details :", 20, y + 18);
    doc.setFont("Helvetica", "normal");
    doc.text(OwnerInfo.bank_account.bank_name, 50, y + 18);

    doc.setFont("Helvetica", "bold");
    doc.text("IFSC Code :", 20, y + 24);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(0);
    doc.text(OwnerInfo.bank_account.ifsc, 50, y + 24);

    // === Right side: Totals (only on last page) ===
    if (isLastPage) {
      let currentY = y;

      // Subtotal
      doc.setFont("Helvetica", "bold");
      doc.text("Sub Total :", 150, currentY, { align: "right" });
      doc.text(`${invoice.subtotal.toLocaleString()}`, 190, currentY, {
        align: "right",
      });
      currentY += 6;

      // Discount (conditionally render)
      if (Number(invoice.discount) !== 0) {
        doc.setFont("Helvetica", "bold");
        doc.text("Discount :", 150, currentY, { align: "right" });
        doc.text(
          `-${Number(invoice.discount).toLocaleString()}`,
          190,
          currentY,
          { align: "right" }
        );
        currentY += 6;
      }

      // Yellow Tax Strip
      doc.setFillColor(255, 204, 0);
      doc.rect(130, currentY - 4, 70, 8, "F");
      doc.setTextColor(0);
      doc.setFont("Helvetica", "bold");
      // Show "Tax: (tax_rate%)"
      doc.text(`Tax: (${invoice.tax_rate}%)`, 150, currentY + 2, {
        align: "right",
      });
      // Show tax amount instead of tax_rate%
      doc.text(`${invoice.tax_amount}`, 190, currentY + 2, { align: "right" });

      currentY += 12;

      // Total
      doc.setFontSize(13);
      doc.setFont("Helvetica", "bold");
      doc.text("Total :", 150, currentY, { align: "right" });
      doc.text(`${invoice.total.toLocaleString()}`, 190, currentY, {
        align: "right",
      });
    }

    return y + 30;
  };

  // Function to add services section
  const addServices = (y: number) => {
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.text("Accounting Tax & Other Services:", 20, y + 4);

    // Box setup
    const boxX = 20;
    const boxY = y + 8;
    const boxW = 170;
    const boxH = 46;
    const paddingX = 6;
    const paddingY = 6;

    doc.setDrawColor(60);
    doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4);

    // Grid columns and bullet styling
    const bullet = "•";
    const fontSize = 9;
    const col1X = boxX + paddingX + 5;
    const col2X = boxX + boxW / 3 + 2;
    const col3X = boxX + (boxW / 3) * 2 + 2;
    let rowY = boxY + paddingY + 4;

    // Set font for items
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(fontSize);

    function chunkArray<T>(array: T[], size: number): T[][] {
      const result: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    }

    // Services array
    const services = chunkArray(Services, 3);

    // Draw services with bullets
    services.forEach((row) => {
      doc.text(`${bullet}`, col1X - 4, rowY);
      doc.text(row[0], col1X, rowY);

      doc.text(`${bullet}`, col2X - 4, rowY);
      doc.text(row[1], col2X, rowY);

      doc.text(`${bullet}`, col3X - 4, rowY);
      doc.text(row[2], col3X, rowY);

      rowY += 6;
    });

    return rowY + 12;
  };

  // Function to add footer content
  const addFooter = (
    y: number,
    isLastPage: boolean = false,
    currentPage: number,
    totalPages: number
  ) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const stripHeightValue = 1;
    const stripY = y;

    // Yellow line across full width
    doc.setFillColor(255, 204, 0);
    doc.rect(0, stripY, pageWidth, stripHeightValue, "F");

    // Footer content spacing
    const footerY = stripY + 10;
    const colWidth = pageWidth / 3;

    // === Column 1: Contact Info ===
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("+91 9566135117", 10, footerY);

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.text("vyasarnaresh@gmail.com", 10, footerY + 5);

    // === Column 2: Quotes (centered) ===
    doc.setFont("Helvetica", "italic");
    doc.setTextColor(0, 51, 153);
    doc.setFontSize(10);
    doc.text(
      `"A day without laughter is a day wasted."\n"Be with Smiley face" | "Help the needy."`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    // === Column 3: Thank You Section ===
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text("Thank you for your business.", pageWidth - 10, footerY, {
      align: "right",
    });

    doc.setFont("Helvetica", "bold");
    doc.text("Terms & Conditions -", pageWidth - 10, footerY + 5, {
      align: "right",
    });

    doc.setFont("Helvetica", "normal");
    doc.text(
      "30 DAYS Credit from date of invoice.",
      pageWidth - 10,
      footerY + 10,
      {
        align: "right",
      }
    );

    // === Vertical Separators ===
    doc.setDrawColor(100);
    doc.setLineWidth(0.2);

    // Line after 1st column
    doc.line(colWidth, stripY + 4, colWidth, footerY + 10);

    // Line after 2nd column
    doc.line(colWidth * 2, stripY + 4, colWidth * 2, footerY + 10);

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.text(
      `Page ${currentPage} of ${totalPages}`,
      pageWidth / 2,
      footerY + 20,
      { align: "center" }
    );
  };

  // Process each page
  itemChunks.forEach((chunk, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let y = 22;
    y = addHeader(y);

    // Add items table
    autoTable(doc, {
      startY: y + 15,
      head: [
        [
          { content: "SL.", styles: { halign: "center" } },
          { content: "Item Description", styles: { halign: "left" } },
          { content: "Price", styles: { halign: "center" } },
          { content: "Qty", styles: { halign: "center" } },
          { content: "Total", styles: { halign: "center" } },
        ],
      ],
      body: chunk.map((item, i) => [
        {
          content: (i + 1 + index * itemsPerPage).toString().padStart(2, "0"),
          styles: { halign: "center" },
        },
        { content: item.description, styles: { halign: "left" } },
        {
          content: `${Number(item.rate).toLocaleString()}`,
          styles: { halign: "center" },
        },
        { content: item.quantity.toString(), styles: { halign: "center" } },
        {
          content: `${Number(item.amount).toLocaleString()}`,
          styles: { halign: "center" },
        },
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [56, 57, 69],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.1,
        cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
        minCellHeight: 12,
      },
      columnStyles: {
        0: { cellWidth: "auto", halign: "center" },
        1: { cellWidth: "wrap", halign: "left" },
        2: { cellWidth: "auto", halign: "center" },
        3: { cellWidth: "auto", halign: "center" },
        4: { cellWidth: "auto", halign: "center" },
      },
      bodyStyles: {
        valign: "middle",
        lineWidth: 0.1,
      },
    });

    // Calculate positions for remaining sections
    const tableHeight = chunk.length * 10 + 30; // Approximate table height
    let currentY = y + 15 + tableHeight;

    // Add payment info and totals (side by side)
    currentY = addPaymentAndTotals(currentY, index === itemChunks.length - 1);

    // Add services section
    currentY = addServices(currentY);

    // Add footer
    addFooter(
      currentY,
      index === itemChunks.length - 1,
      index + 1,
      itemChunks.length
    );
  });

  // Save PDF
  doc.save(`invoice-${invoice.invoice_number}.pdf`);
};
