import { supabase } from "../supabase";

// Define the type directly here
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  user_id: string;
  invoice_number: string;
  date: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  to_address: string;
  status: string;
  items: InvoiceItem[];
  tax_rate: number;
  discount: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export async function fetchUserInvoices(userId: string): Promise<InvoiceData[]> {

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data || [];
}

export async function fetchInvoiceById(id: string): Promise<InvoiceData | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fetch invoice error:", error);
    return null;
  }

  return data;
}

export async function updateInvoiceInDB(id: string, data: any) {

  const { error } = await supabase
    .from("invoices")
    .update({
      ...data,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteInvoiceFromDB(id: string) {
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}
