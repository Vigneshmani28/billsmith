"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useInvoice } from "@/context/invoice-context";
import { updateInvoiceInDB } from "@/lib/supabase/fetchInvoices";

export default function EditableInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const { invoice, updateInvoice, addItem, removeItem, updateItem } = useInvoice();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      await updateInvoiceInDB(invoiceId, invoice);
      router.push("/");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update invoice");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Invoice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="From Name"
          className="border p-2 rounded"
          value={invoice.from_name}
          onChange={(e) => updateInvoice({ from_name: e.target.value })}
        />
        <input
          placeholder="From Email"
          className="border p-2 rounded"
          value={invoice.from_email}
          onChange={(e) => updateInvoice({ from_email: e.target.value })}
        />
        <input
          placeholder="To Name"
          className="border p-2 rounded"
          value={invoice.to_name}
          onChange={(e) => updateInvoice({ to_name: e.target.value })}
        />
        <input
          placeholder="To Email"
          className="border p-2 rounded"
          value={invoice.to_email}
          onChange={(e) => updateInvoice({ to_email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        {invoice.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
            <input
              className="border p-2 rounded"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <input
              type="number"
              className="border p-2 rounded"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
            />
            <input
              type="number"
              className="border p-2 rounded"
              value={item.rate}
              onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
            />
            <div>₹{item.amount.toFixed(2)}</div>
            <Button variant="destructive" onClick={() => removeItem(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={addItem}>Add Item</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Tax Rate (%)"
          className="border p-2 rounded"
          value={invoice.tax_rate}
          onChange={(e) => updateInvoice({ tax_rate: Number(e.target.value) })}
        />
        <div className="p-2">
          <p>Subtotal: ₹{invoice.subtotal.toFixed(2)}</p>
          <p>Tax: ₹{invoice.tax_amount.toFixed(2)}</p>
          <p className="font-bold">Total: ₹{invoice.total.toFixed(2)}</p>
        </div>
      </div>

      <Button onClick={handleSubmit}>Save Changes</Button>
    </div>
  );
}
