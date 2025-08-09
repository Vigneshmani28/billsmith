import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useInvoice } from "@/context/invoice-context";
import { format } from "date-fns";
import { useState } from "react";

export default function BasicDetails() {
  const { invoice, updateInvoice } = useInvoice();
  const [date, setDate] = useState<Date | undefined>(
    invoice.date ? new Date(invoice.date) : undefined
  );

  const handleDateSelect = (selected: Date | undefined) => {
    setDate(selected);
    if (selected) {
      updateInvoice({ date: format(selected, "yyyy-MM-dd") }); // store in ISO format
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Number */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            value={invoice.invoice_number}
            onChange={(e) => updateInvoice({ invoice_number: e.target.value })}
            id="invoiceNumber"
            placeholder="e.g. INV-001"
          />
        </div>

        {/* Date with shadcn Calendar */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !date && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
