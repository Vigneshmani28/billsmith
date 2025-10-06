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
  updated_at?: string;
}


export enum InvoiceStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  OVERDUE = "overdue",
}

export type BankAccount = {
  accountNumber: string;
  holderName: string;
  ifsc: string;
  branch: string;
};

export type OwnerInfo = {
  ownerName: string;
  gstin: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPan: string;
  ownerAddress: string;
  bankAccount: BankAccount;
};