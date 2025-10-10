"use client";

import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentLoader } from "@/components/loader";
import { useInvoice } from "@/context/invoice-context";
import { initialInvoiceData } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";

export default function NewInvoicePage() {
  const [showPreview, setShowPreview] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { setFullInvoice } = useInvoice();

  useEffect(() => {
    if (!loading && user?._id) {
      console.log("Setting initial invoice data");
      setFullInvoice(initialInvoiceData);
    }
  }, [loading, user]);

  if (loading) return <ContentLoader />;

  if (!user) {
    router.push("/login");
    return null;
  }

  if (showPreview) {
    return <InvoicePreview onBack={() => setShowPreview(false)} />;
  }

  // Default form view
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Create Invoice</h1>
            <p className="text-gray-600">Fill out the details below</p>
          </div>
          <Button onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        <InvoiceForm />
      </div>
    </div>
  );
}
