import { supabase } from "./supabase";
import { InvoiceData } from "@/types/invoice";

export async function saveInvoice(userId: string, invoice: InvoiceData) {
  const { error } = await supabase.from("invoices").insert({
    user_id: userId,
    invoice_number: invoice.invoice_number,
    date: invoice.date,
    from_name: invoice.from_name,
    from_email: invoice.from_email,
    to_name: invoice.to_name,
    to_email: invoice.to_email,
    items: invoice.items,
    tax_rate: invoice.tax_rate,
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    total: invoice.total,
  });

  if (error) {
    console.error("Error saving invoice:", error.message);
    throw new Error("Failed to save invoice");
  }
}
