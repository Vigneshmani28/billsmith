import { useInvoice } from "@/context/invoice-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useCurrency } from "@/context/currency-context";
import { Currency } from "./Currency";
import { useMemo } from "react";

export default function TaxAndTotals() {
  const { invoice, updateInvoice } = useInvoice();
  const { currency } = useCurrency();

  // Check if both parties are in same state based on GSTIN prefix
  const isSameState = useMemo(() => {
    const fromGstin = invoice.from_gstin || "";
    const toGstin = invoice.to_gstin || "";

    if (fromGstin.length >= 2 && toGstin.length >= 2) {
      return fromGstin.substring(0, 2) === toGstin.substring(0, 2);
    }
    return false;
  }, [invoice.from_gstin, invoice.to_gstin]);

  // Calculate tax breakdown
  const taxBreakdown = useMemo(() => {
    const taxRate = typeof invoice.tax_rate === "number" ? invoice.tax_rate : 0;
    const taxAmount = invoice.tax_amount || 0;

    if (isSameState) {
      // Split between CGST and SGST (each gets half)
      const cgst = taxAmount / 2;
      const sgst = taxAmount / 2;
      return {
        cgst: { rate: taxRate / 2, amount: cgst },
        sgst: { rate: taxRate / 2, amount: sgst },
        igst: { rate: 0, amount: 0 }
      };
    } else {
      // All tax goes to IGST
      return {
        cgst: { rate: 0, amount: 0 },
        sgst: { rate: 0, amount: 0 },
        igst: { rate: taxRate, amount: taxAmount }
      };
    }
  }, [invoice.tax_rate, invoice.tax_amount, isSameState]);

  // Generic change handler for numeric fields
  const handleFieldChange = (field: "tax_rate" | "discount", value: string) => {
    if (value === "") {
      updateInvoice({ [field]: "" });
    } else {
      const numValue = Number.parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        if (field === "tax_rate" && numValue > 100) return; // cap tax rate at 100%
        updateInvoice({ [field]: numValue });
      }
    }
  };

  // Reset invalid or empty values on blur
  const handleBlur = (field: "tax_rate" | "discount") => {
    const value = invoice[field];
    const isInvalid = value === "" || isNaN(Number(value));
    if (isInvalid) {
      updateInvoice({ [field]: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Tax & Totals</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">GST Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={invoice.tax_rate}
              onChange={(e) => handleFieldChange("tax_rate", e.target.value)}
              onBlur={() => handleBlur("tax_rate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              value={invoice.discount}
              onChange={(e) => handleFieldChange("discount", e.target.value)}
              onBlur={() => handleBlur("discount")}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Tax Type: {isSameState ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}</p>
            {invoice.from_gstin && invoice.to_gstin && (
              <p className="text-xs">
                From: {invoice.from_gstin.substring(0, 2)} | To: {invoice.to_gstin.substring(0, 2)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm border-t md:border-none pt-4 md:pt-0">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span><Currency amount={invoice.subtotal} /></span>
          </div>

          {isSameState ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  CGST ({taxBreakdown.cgst.rate.toFixed(2)}%):
                </span>
                <span><Currency amount={taxBreakdown.cgst.amount} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  SGST ({taxBreakdown.sgst.rate.toFixed(2)}%):
                </span>
                <span><Currency amount={taxBreakdown.sgst.amount} /></span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                IGST ({taxBreakdown.igst.rate.toFixed(2)}%):
              </span>
              <span><Currency amount={taxBreakdown.igst.amount} /></span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount:</span>
            <span> - <Currency amount={typeof invoice.discount === "number" ? invoice.discount : 0} /></span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total:</span>
            <span><Currency amount={invoice.total} /></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
