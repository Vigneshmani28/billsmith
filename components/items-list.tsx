import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import InvoiceItem from "./invoice-item";
import { useInvoice } from "@/context/invoice-context";
import { KeyboardEvent } from "react";

export default function ItemsList() {
  const { invoice, addItem } = useInvoice();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // avoid form submit
      addItem();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-lg md:text-xl">Invoice Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" onKeyDown={handleKeyDown}>
        {invoice.items.map((item, index) => (
          <InvoiceItem
            key={item.id}
            item={item}
            index={index}
            canRemove={invoice.items.length > 1}
          />
        ))}
        <div  className="flex justify-end">
        <Button onClick={addItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}
