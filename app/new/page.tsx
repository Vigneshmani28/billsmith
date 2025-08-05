"use client";

import InvoiceForm from "@/components/invoice-form";
import InvoicePreview from "@/components/invoice-preview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/loader";
import { useInvoice } from "@/context/invoice-context";
import { initialInvoiceData } from "@/lib/constants";

export default function NewInvoicePage() {
  const [showPreview, setShowPreview] = useState(false);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const {setFullInvoice} = useInvoice();

  useEffect(() => {
    if(isLoaded && userId) {
      console.log("setting initial invoice data");
      setFullInvoice(initialInvoiceData)
    }
  }, [isLoaded, userId])

  if (!isLoaded) return <FullPageLoader />;
  if (!userId) {
    router.push("/sign-in");
    return null;
  }

  if (showPreview) {
    return <InvoicePreview onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
