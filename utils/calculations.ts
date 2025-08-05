import type { InvoiceItem } from "../types/invoice"

export const calculateTotals = (
  items: InvoiceItem[],
  taxRate: number | string,
  discount: number | string
) => {
  const subtotal = items.reduce((sum, item) => {
    const amount = typeof item.amount === "number" ? item.amount : 0;
    return sum + amount;
  }, 0);

  const rate = !isNaN(Number(taxRate)) ? Number(taxRate) : 0;
  const discountValue = !isNaN(Number(discount)) ? Number(discount) : 0;

  const tax_amount = (subtotal * rate) / 100;
  const totalBeforeDiscount = subtotal + tax_amount;
  const total = totalBeforeDiscount - discountValue;

  return {
    subtotal,
    tax_amount,
    discount: discountValue,
    total: total < 0 ? 0 : total
  };
};
