// camelCase used in UI
export interface InvoiceItem {
  id?: string;
  amount?: number;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  invoice_number: string;
  date: string;

  // Sender details (optional)
  from_name?: string;
  from_email?: string;
  from_address?: string;
  from_phone?: string;
  from_gstin?: string;
  from_pan?: string;

  // Recipient details (optional)
  to_name?: string;
  to_email?: string;
  to_address?: string;
  to_phone?: string;
  to_gstin?: string;
  to_pan?: string;

  // Core fields
  status?: string; // can default to "unpaid"
  items: InvoiceItem[];
  tax_rate: number | string;
  discount: number | string;
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  is_inter_state: boolean;

  // System fields
  user_id?: string;
  public_id?: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Type for creating invoices (excludes server-generated fields)
export type CreateInvoiceData = Omit<InvoiceData, 'user_id' | 'public_id' | 'id' | 'created_at' | 'updated_at'>;

// Type for updating invoices (optional fields for partial updates)
export type UpdateInvoiceData = Partial<CreateInvoiceData> & { id: string };

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