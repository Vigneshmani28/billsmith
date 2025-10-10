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
import { Currency } from "./Currency";

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

  // Check if both parties are in same state based on GSTIN prefix
  const isSameState = (() => {
    const fromGstin = invoice.from_gstin || "";
    const toGstin = invoice.to_gstin || "";

    if (fromGstin.length >= 2 && toGstin.length >= 2) {
      return fromGstin.substring(0, 2) === toGstin.substring(0, 2);
    }
    return false;
  })();

  // Calculate tax breakdown
  const taxBreakdown = (() => {
    const taxRate = typeof invoice.tax_rate === "number" ? invoice.tax_rate : 0;
    const taxAmount = invoice.tax_amount || 0;

    if (isSameState) {
      // Split between CGST and SGST (each gets half)
      const cgst = taxAmount / 2;
      const sgst = taxAmount / 2;
      return {
        cgst: { rate: taxRate / 2, amount: cgst },
        sgst: { rate: taxRate / 2, amount: sgst },
        igst: { rate: 0, amount: 0 },
      };
    } else {
      // All tax goes to IGST
      return {
        cgst: { rate: 0, amount: 0 },
        sgst: { rate: 0, amount: 0 },
        igst: { rate: taxRate, amount: taxAmount },
      };
    }
  })();

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
      // Check if both parties are in same state based on GSTIN prefix
      const fromGstin = invoice.from_gstin || "";
      const toGstin = invoice.to_gstin || "";
      const isInterState =
        fromGstin.length >= 2 && toGstin.length >= 2
          ? fromGstin.substring(0, 2) !== toGstin.substring(0, 2)
          : false;

      const payload = {
        invoice_number: invoice.invoice_number,
        date: invoice.date,
        tax_rate: Number(invoice.tax_rate),
        discount: Number(invoice.discount),
        is_inter_state: isInterState,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        ...Object.fromEntries(
          Object.entries({
            from_name: invoice.from_name,
            from_email: invoice.from_email,
            from_address: invoice.from_address,
            from_phone: invoice.from_phone,
            from_gstin: invoice.from_gstin,
            from_pan: invoice.from_pan,
            to_name: invoice.to_name,
            to_email: invoice.to_email,
            to_address: invoice.to_address,
            to_phone: invoice.to_phone,
            to_gstin: invoice.to_gstin,
            to_pan: invoice.to_pan,
          }).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ""
          )
        ),
      };

      console.log("Saving invoice with payload:", payload);

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
                <h2 className="text-xl font-bold">
                  {invoice.from_name}
                </h2>
                <p className="text-sm font-semibold">
                  PAN - {invoice.from_pan}
                </p>
                <p className="text-sm">
                  GSTIN - {invoice.from_gstin}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">From:</p>
                <p>
                  {invoice.from_address}
                </p>
                <p>{invoice.from_phone}</p>
                <p>{invoice.from_email}</p>
              </div>
            </div>

            {/* INVOICE Header Section with Yellow Bands */}
            <div className="relative h-28 w-full">
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
                <p>{invoice.to_phone}</p>
                <p>{invoice.to_gstin}</p>
                <p>{invoice.to_pan}</p>
                <p>
                  {invoice.to_address}
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
                  <th className="p-2 border text-left">SL.</th>
                  <th className="p-2 border text-left">Item Description</th>
                  <th className="p-2 border text-left">Price</th>
                  <th className="p-2 border text-left">Qty</th>
                  <th className="p-2 border text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="text-sm">
                    <td className="p-2 border">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="p-2 border">{item.description}</td>
                    <td className="p-2 border text-left">
                      {Number(item.rate).toFixed(2)}
                    </td>
                    <td className="p-2 border text-left">{item.quantity}</td>
                    <td className="p-2 border text-left">
                      {Number(item.amount).toFixed(2)}
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
                  {invoice.from_name || OwnerInfo.bank_account.account_name}
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
                  <span>
                    <Currency amount={invoice.subtotal} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-red-600">
                    -<Currency amount={Number(invoice.discount)} />
                  </span>
                </div>

                {isSameState ? (
                  <>
                    <div className="flex justify-between font-semibold px-2 py-1 rounded">
                      <span>CGST ({taxBreakdown.cgst.rate.toFixed(1)}%):</span>
                      <span>
                        <Currency amount={taxBreakdown.cgst.amount} />
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold px-2 py-1 rounded">
                      <span>SGST ({taxBreakdown.sgst.rate.toFixed(1)}%):</span>
                      <span>
                        <Currency amount={taxBreakdown.sgst.amount} />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-semibold px-2 py-1 rounded">
                    <span>IGST ({taxBreakdown.igst.rate.toFixed(1)}%):</span>
                    <span>
                      <Currency amount={taxBreakdown.igst.amount} />
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>
                    <Currency amount={invoice.total} />
                  </span>
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
                <p className="font-semibold">{invoice.from_phone || "+91 9566135117"}</p>
                <p>{invoice.from_email || OwnerInfo.email}</p>
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
