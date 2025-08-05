import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useInvoice } from "@/context/invoice-context";

export default function BasicDetails() {
  const { invoice, updateInvoice } = useInvoice();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            value={invoice.invoice_number}
            onChange={(e) => updateInvoice({ invoice_number: e.target.value })}
            id="invoiceNumber"
            placeholder="e.g. INV-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            onChange={(e) => updateInvoice({ date: e.target.value })}
            value={invoice.date}
          />
        </div>
      </CardContent>
    </Card>
  );
}
