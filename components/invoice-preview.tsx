"use client";

import { Download, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useInvoice } from "@/context/invoice-context";
import { formatDate } from "@/utils/formatters";
import { generatePDF } from "@/utils/pdf-generator";
import { supabase } from "@/lib/supabase"; // make sure this is set up
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface InvoicePreviewProps {
  onBack: () => void;
  id?: string; // Optional ID for editing existing invoices
}

export default function InvoicePreview({ onBack, id }: InvoicePreviewProps) {
  const { invoice } = useInvoice();
  const { user } = useUser();

  const handleDownloadPDF = () => {
    generatePDF(invoice);
  };

 const handleSaveInvoice = async () => {
  if (!user) {
    alert("You must be logged in to save invoice.");
    return;
  }

  const { error } = await supabase.from("invoices").insert([
    {
      user_id: user.id,
      invoice_number: invoice.invoice_number,
      date: invoice.date,
      from_name: invoice.from_name,
      from_email: invoice.from_email,
      to_name: invoice.to_name,
      to_email: invoice.to_email,
      items: invoice.items,
      tax_rate: invoice.tax_rate,
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      total: invoice.total,
    },
  ]);

  if (error) {
    console.error("Error saving invoice:", error);
    toast.error("Failed to save invoice.");
  } else {
    toast.success("Invoice saved successfully!");
    onBack();
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoice Preview</h1>
          <div className="space-x-2">
            {!id && (
              <Button variant="outline" onClick={onBack}>
                Back to Edit
              </Button>
            )}
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {!id && (
              <Button onClick={handleSaveInvoice}>
              <Save className="w-4 h-4 mr-2" />
              Save Invoice
            </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                <p className="text-gray-600">#{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Date: {formatDate(invoice.date)}
                </p>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">From:</h3>
                <p className="font-medium">{invoice.from_name}</p>
                <p className="text-gray-600">{invoice.from_email}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">To:</h3>
                <p className="font-medium">{invoice.to_name}</p>
                <p className="text-gray-600">{invoice.to_email}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">
                      ${typeof item.rate === "number" ? item.rate.toFixed(2) : "0.00"}
                    </td>
                    <td className="py-2 text-right">
                      ${typeof item.amount === "number" ? item.amount.toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Tax ({typeof invoice.tax_rate === "number" ? invoice.tax_rate : 0}%):
                  </span>
                  <span>${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
