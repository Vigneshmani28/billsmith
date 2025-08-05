import type { InvoiceData } from "../types/invoice"

export const initialInvoiceData: InvoiceData = {
  invoice_number: `INV-${Date.now()}`,
  date: new Date().toISOString().split("T")[0],
  from_name: "",
  from_email: "",
  to_name: "",
  to_email: "",
  items: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }, ],
  tax_rate: 10,
  subtotal: 0,
  tax_amount: 0,
  total: 0,
}
