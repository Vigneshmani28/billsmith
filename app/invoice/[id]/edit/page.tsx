"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useInvoice } from "@/context/invoice-context";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchInvoiceById,
  updateInvoiceInDB,
} from "@/lib/supabase/fetchInvoices";
import { InvoiceData, InvoiceStatus } from "@/types/invoice";
import { toast } from "sonner";
import { ContentLoader } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { invoice, setFullInvoice } = useInvoice();

  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const loadInvoice = async () => {
      // Only fetch and set invoice if not already set
      if (invoice && invoice.invoice_number) {
        const data = await fetchInvoiceById(id as string);
        if (!data) {
          alert("Invoice not found");
          router.push("/");
          return;
        }

        setFullInvoice({
          invoice_number: data.invoice_number,
          date: data.date,
          from_name: data.from_name,
          from_email: data.from_email,
          to_name: data.to_name,
          to_email: data.to_email,
          to_address: data.to_address,
          status: data.status,
          items: data.items,
          tax_rate: data.tax_rate,
          subtotal: data.subtotal,
          tax_amount: data.tax_amount,
          discount: data.discount,
          total: data.total,
        });
      }
      setLoading(false);
    };

    loadInvoice();
  }, []);

  const handleSave = async () => {
    try {
      const updatedInvoice: InvoiceData = {
        ...invoice,
        id: id as string,
        user_id: userId!,
        created_at: new Date().toISOString(), // optional: update this if needed
      };

      await updateInvoiceInDB(id as string, updatedInvoice);
      toast.success("Invoice updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update invoice");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // show default prompt
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (!isLoaded || loading) return <ContentLoader />;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Edit Invoice</h1>
            <p className="text-gray-600">Update and save your invoice</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Invoice Status Dropdown */}
            <div className="min-w-[160px]">
              <Select
                value={invoice.status}
                onValueChange={(value: InvoiceStatus) =>
                  setFullInvoice({ ...invoice, status: value })
                }
              >
                <SelectTrigger className="w-full border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  {Object.values(InvoiceStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <Button
              variant="outline"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Back to Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {showPreview ? (
          <InvoicePreview
            onBack={() => setShowPreview(false)}
            id={id as string}
          />
        ) : (
          <InvoiceForm />
        )}
      </div>
    </div>
  );
}
