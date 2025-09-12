"use client";

import { Download, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useInvoice } from "@/context/invoice-context";
import { generatePDF } from "@/utils/pdf-generator";
import { toast } from "sonner";
import { OwnerInfo, Services } from "@/lib/contants";
import { InvoiceData } from "@/types/invoice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useState } from "react";
import { createInvoice } from "@/store/slices/invoice/createInvoice";
import { useRouter } from "next/navigation";

interface InvoicePreviewProps {
  onBack?: () => void;
  id?: string;
  invoice?: InvoiceData;
  readOnly?: boolean;
}

export default function InvoicePreview({
  onBack,
  id,
  invoice: propInvoice,
  readOnly,
}: InvoicePreviewProps) {
  const { invoice: contextInvoice } = useInvoice();
  const invoice = propInvoice ?? contextInvoice;

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.createInvoice);
  const router = useRouter();

  const servicesPerColumn = Math.ceil(Services.length / 3);
  const servicesColumns = [
    Services.slice(0, servicesPerColumn),
    Services.slice(servicesPerColumn, servicesPerColumn * 2),
    Services.slice(servicesPerColumn * 2),
  ];

  const handleDownloadPDF = () => {
    generatePDF(invoice);
  };

  const handleSaveInvoice = async () => {
    try {
      const payload = {
        invoice_number: invoice.invoice_number,
        date: invoice.date,
        from_name: invoice.from_name,
        from_email: invoice.from_email,
        to_name: invoice.to_name,
        to_email: invoice.to_email,
        to_address: invoice.to_address,
        tax_rate: Number(invoice.tax_rate),
        discount: Number(invoice.discount),
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

      const response = await dispatch(
        createInvoice({ data: payload })
      ).unwrap();

      toast.success("Invoice saved successfully!");
      if (response?._id) {
        router.push(`/invoice/${response._id}/edit`);
      } else if (onBack) {
        onBack();
      }
      if (onBack) onBack();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice.");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoice Preview</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
            {/* Only show Back and Save if not readOnly */}
            {!readOnly && !id && (
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full sm:w-auto"
              >
                Back to Edit
              </Button>
            )}

            {/* Always show Download PDF */}
            <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            {!readOnly && !id && (
              <Button
                onClick={handleSaveInvoice}
                disabled={
                  loading ||
                  !invoice.items.length ||
                  !invoice.to_name ||
                  !invoice.from_name
                }
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Invoice
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Card className="border shadow-md">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{OwnerInfo.name}</h2>
                <p className="text-sm font-semibold">PAN - {OwnerInfo.pan}</p>
                <p className="text-sm">
                  Office Branches - {OwnerInfo.office_braches}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">Head Office:</p>
                <p>Door No - {OwnerInfo.head_office.door_no},</p>
                <p>{OwnerInfo.head_office.address},</p>
                <p>{OwnerInfo.head_office.city}.</p>
              </div>
            </div>

            {/* INVOICE Header Section with Yellow Bands */}
            <div className="relative mb-8 h-28 w-full">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex items-center">
                <div className="h-12 flex-1 bg-yellow-400" />
                <h2 className="text-4xl font-bold tracking-widest text-black px-6 whitespace-nowrap">
                  INVOICE
                </h2>
                <div className="h-12 w-48 bg-yellow-400" />
              </div>
            </div>

            {/* To Details and Invoice Meta */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-semibold">Invoice to:</h3>
                <p className="font-medium">{invoice.to_name}</p>
                <p>{invoice.to_email}</p>
                <p>
                  {invoice.to_address ||
                    "23, first street, Nangooram Nagar, Guduvanchery - 603202"}
                </p>
              </div>
              <div className="text-sm text-right">
                <p>
                  <span className="font-semibold">Invoice Number:</span> #
                  {invoice.invoice_number}
                </p>
                <p>
                  <span className="font-semibold">Invoice Date:</span>{" "}
                  {invoice.date}
                </p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8 border">
              <thead>
                <tr className="bg-gray-200 text-left text-sm font-medium">
                  <th className="p-2 border">SL.</th>
                  <th className="p-2 border">Item Description</th>
                  <th className="p-2 border text-right">Price</th>
                  <th className="p-2 border text-center">Qty</th>
                  <th className="p-2 border text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="text-sm">
                    <td className="p-2 border">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="p-2 border">{item.description}</td>
                    <td className="p-2 border text-right">
                      &#8377;{Number(item.rate).toFixed(2)}
                    </td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border text-right">
                      &#8377;{Number(item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payment Info + Totals */}
            <div className="flex justify-between mb-8">
              <div className="text-sm space-y-1">
                <p className="font-semibold">Payment Info:</p>
                <p>
                  <span className="font-semibold">Account:</span>{" "}
                  {OwnerInfo.bank_account.account_number}
                </p>
                <p>
                  <span className="font-semibold">A/C Name:</span>{" "}
                  {OwnerInfo.bank_account.account_name}
                </p>
                <p>
                  <span className="font-semibold">Bank Details:</span>{" "}
                  {OwnerInfo.bank_account.bank_name}
                </p>
                <p>
                  <span className="font-semibold">IFSC Code:</span>{" "}
                  {OwnerInfo.bank_account.ifsc}
                </p>
              </div>
              <div className="w-64 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>&#8377;{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-red-600">
                    -&#8377;{invoice.discount}
                  </span>
                </div>
                <div className="flex justify-between bg-yellow-300 font-semibold px-2 py-1 rounded">
                  <span>Tax: ({invoice.tax_rate}%)</span>
                  <span>&#8377;{invoice.tax_amount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>&#8377;{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Services List */}
            <p className="font-semibold mb-2">
              Accounting Tax & Other Services:
            </p>
            <div className="border p-4 text-sm mb-8 rounded-xl">
              <div className="grid grid-cols-3 gap-2">
                {servicesColumns.map((column, index) => (
                  <ul key={index} className="list-disc pl-4">
                    {column.map((service, serviceIndex) => (
                      <li key={serviceIndex}>{service}</li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>

            <div className="bg-yellow-400 h-1 w-full mb-6"></div>

            {/* Footer */}
            <div className="flex justify-between items-start text-xs">
              <div>
                <p className="font-semibold">+91 9566135117</p>
                <p>{OwnerInfo.email}</p>
              </div>
              <div className="italic text-center text-blue-700">
                <p>"A day without laughter is a day wasted."</p>
                <p>"Be with Smiley face" | "Help the needy."</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Thank you for your business.</p>
                <p className="text-gray-500">Terms & Conditions -</p>
                <p className="text-gray-500">
                  30 DAYS Credit from date of invoice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
