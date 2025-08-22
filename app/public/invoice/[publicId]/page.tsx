// app/public/invoice/[publicId]/page.tsx
import { supabase } from "@/lib/supabase";
import InvoicePreview from "@/components/invoice-preview";

interface PublicInvoicePageProps {
  params: { publicId: string };
}

export default async function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const { publicId } = params;

  // fetch the public invoice
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("public_id", publicId)
    .eq("is_public", true)
    .single();

  if (!invoice) {
    return (
      <div className="p-6 text-center text-gray-600">
        Invoice not found or not public
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">Invoice #{invoice.invoice_number}</h1>

      <InvoicePreview invoice={invoice} readOnly={true} />
    </div>
  );
}
