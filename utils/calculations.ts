import type { InvoiceItem } from "../types/invoice"

export const calculateTotals = (items: InvoiceItem[], taxRate: number | string) => {
  const subtotal = items.reduce((sum, item) => {
    const amount = typeof item.amount === "number" ? item.amount : 0
    return sum + amount
  }, 0)

  const rate = typeof taxRate === "number" ? taxRate : taxRate === "" ? 0 : Number(taxRate)
  const tax_amount = (subtotal * rate) / 100
  const total = subtotal + tax_amount

  return { subtotal, tax_amount, total }
}
