// camelCase used in UI
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number | string;
  rate: number | string;
  amount: number;
}

export interface InvoiceData {
  invoice_number: string;
  date: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  to_address : string;
  status: string;
  items: InvoiceItem[];
  tax_rate: number | string;
  discount: number | string;
  subtotal: number;
  tax_amount: number;
  total: number;
  user_id?:string
  public_id?: string;
  id?:string
  created_at?: string;
}


export enum InvoiceStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  PARTIAL = "partial",
  OVERDUE = "overdue",
}