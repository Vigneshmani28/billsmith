import { useInvoice } from "@/context/invoice-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function TaxAndTotals() {
  const { invoice, updateInvoice } = useInvoice();

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
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
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
        </div>

        <div className="space-y-2 text-sm border-t md:border-none pt-4 md:pt-0">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>&#8377;{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tax ({typeof invoice.tax_rate === "number" ? invoice.tax_rate : 0}%):
            </span>
            <span>&#8377;{invoice.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount:</span>
            <span> - &#8377;{typeof invoice.discount === "number" ? invoice.discount.toFixed(2) : "0.00"}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total:</span>
            <span>&#8377;{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
