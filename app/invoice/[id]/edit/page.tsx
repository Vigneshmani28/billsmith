"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoice } from "@/context/invoice-context";
import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Eye, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "@/types/invoice";
import { toast } from "sonner";
import { ContentLoader } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  clearInvoice,
  fetchInvoiceById,
} from "@/store/slices/invoice/invoiceByIdSlice";
import { updateInvoice } from "@/store/slices/invoice/updateInvoice";
import isEqual from "lodash.isequal";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  function normalizeInvoiceForCompare(data: any): any {
  return {
    invoice_number: data.invoice_number,
    date: data.date,
    from_name: data.from_name,
    from_email: data.from_email,
    to_name: data.to_name,
    to_email: data.to_email,
    to_address: data.to_address,
    status: data.status,
    tax_rate: Number(data.tax_rate),
    discount: Number(data.discount),
    subtotal: Number(data.subtotal),
    tax_amount: Number(data.tax_amount),
    total: Number(data.total),
    items: data.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
    })),
  };
}

  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.updateInvoice);

  const {
    invoice: data,
    loading: invoiceLoading,
    error,
  } = useSelector((state: RootState) => state.invoiceById);

  const { invoice, setFullInvoice } = useInvoice();
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [authLoading, user, router]);

  // Fetch invoice on id change
  useEffect(() => {
    if (id && user) {
      dispatch(fetchInvoiceById(id as string));
    }
  }, [id, user, dispatch]);

  // Sync Redux invoice data into context
  useEffect(() => {
    if (data) {
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
  }, [data]);

  const isUnchanged =
  data && isEqual(
    normalizeInvoiceForCompare(data),
    normalizeInvoiceForCompare(invoice)
  );

  // Clear invoice when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearInvoice());
    };
  }, [dispatch]);

  const handleSave = async () => {
    try {
      // Restructure payload
      const payload = {
        invoice_number: invoice.invoice_number,
        date: invoice.date,
        from_name: invoice.from_name,
        from_email: invoice.from_email,
        to_name: invoice.to_name,
        to_email: invoice.to_email,
        to_address: invoice.to_address,
        status: invoice.status,
        tax_rate: Number(invoice.tax_rate),
        discount: Number(invoice.discount),
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      };

      await dispatch(
        updateInvoice({ id: id as string, data: payload })
      ).unwrap();

      toast.success("Invoice updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update invoice");
    }
  };

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // show default prompt
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Loading state
  if (invoiceLoading) {
    return <ContentLoader />;
  }

  // Error / not found
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-medium">Invoice not found</p>
      </div>
    );
  }

  // Main content
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
            <Button onClick={handleSave} disabled={loading || !!isUnchanged}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? "Saving..." : "Save Changes"}
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
