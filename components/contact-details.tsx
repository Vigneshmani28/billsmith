import { useInvoice } from "@/context/invoice-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ContactDetails() {
  const { invoice, updateInvoice } = useInvoice();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Billing Info</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-base">From (You)</h3>
          <div className="space-y-2">
            <Label htmlFor="fromName">Name</Label>
            <Input
              id="fromName"
              value={invoice.from_name}
              onChange={(e) => updateInvoice({ from_name: e.target.value })}
              placeholder="Your name or company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">Email</Label>
            <Input
              id="fromEmail"
              value={invoice.from_email}
              onChange={(e) => updateInvoice({ from_email: e.target.value })}
              placeholder="your@email.com"
              type="email"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-base">To (Client)</h3>
          <div className="space-y-2">
            <Label htmlFor="toName">Name</Label>
            <Input
              id="toName"
              value={invoice.to_name}
              onChange={(e) => updateInvoice({ to_name: e.target.value })}
              placeholder="Client name or company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toEmail">Email</Label>
            <Input
              id="toEmail"
              value={invoice.to_email}
              onChange={(e) => updateInvoice({ to_email: e.target.value })}
              placeholder="client@email.com"
              type="email"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
