import { useInvoice } from "@/context/invoice-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function TaxAndTotals() {
  const { invoice, updateInvoice } = useInvoice();

  const handleTaxRateChange = (value: string) => {
    if (value === "") {
      updateInvoice({ tax_rate: "" });
    } else {
      const numValue = Number.parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        updateInvoice({ tax_rate: numValue });
      }
    }
  };

  const handleTaxRateBlur = () => {
    if (invoice.tax_rate === "" || isNaN(Number(invoice.tax_rate))) {
      updateInvoice({ tax_rate: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Tax & Totals</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={invoice.tax_rate}
            onChange={(e) => handleTaxRateChange(e.target.value)}
            onBlur={handleTaxRateBlur}
          />
        </div>

        <div className="space-y-2 text-sm border-t md:border-none pt-4 md:pt-0">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tax ({typeof invoice.tax_rate === "number" ? invoice.tax_rate : 0}%):
            </span>
            <span>${invoice.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
