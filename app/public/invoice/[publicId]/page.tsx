"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import InvoicePreview from "@/components/invoice-preview";
import { ContentLoader } from "@/components/loader";
import { AppDispatch, RootState } from "@/store/store";
import { fetchInvoiceByPublicId } from "@/store/slices/invoice/invoicePublic";

export default function PublicInvoicePage() {
  const { publicId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { invoice, loading, error } = useSelector(
    (state: RootState) => state.publicInvoice
  );

  // fetch invoice on mount
  useEffect(() => {
    if (publicId) {
      dispatch(fetchInvoiceByPublicId(publicId as string));
    }
  }, [publicId, dispatch]);

  // handle invalid id
  if (!publicId) {
    return (
      <div className="p-6 text-center text-gray-600">
        Invalid invoice
      </div>
    );
  }

  // show loader while fetching
  if (loading) {
    return <ContentLoader />;
  }

  // handle error or not found
  if (error || !invoice) {
    return (
      <div className="p-6 text-center text-gray-600">
        Invoice not found or not public
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Invoice #{invoice.invoice_number}
      </h1>
      <InvoicePreview invoice={invoice} readOnly={true} />
    </div>
  );
}
