"use client";

import { initialInvoiceData } from "@/lib/constants";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { calculateTotals } from "@/utils/calculations";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface InvoiceContextType {
  invoice: InvoiceData;
  updateInvoice: (updates: Partial<InvoiceData>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  setFullInvoice: (data: InvoiceData) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: InvoiceData;
}) {
  const [invoice, setInvoice] = useState<InvoiceData>(
    initialData || initialInvoiceData
  );

  // ✅ Setter to fully override invoice
  const setFullInvoice = (data: InvoiceData) => {
    const { subtotal, tax_amount, discount, total } = calculateTotals(
      data.items,
      data.tax_rate,
      data.discount
    );
    setInvoice({
      ...data,
      subtotal,
      tax_amount,
      discount,
      total,
    });
  };

  const updateInvoice = (updates: Partial<InvoiceData>) => {
  const merged = { ...invoice, ...updates };

  const { subtotal, tax_amount, discount, total } = calculateTotals(
    merged.items,
    merged.tax_rate,
    merged.discount
  );

  setInvoice({
    ...merged,
    subtotal,
    tax_amount,
    discount,
    total,
  });
};


  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    updateInvoice({ items: [...invoice.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (invoice.items.length > 1) {
      const newItems = invoice.items.filter((_, i) => i !== index);
      updateInvoice({ items: newItems });
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const quantity = Number(newItems[index].quantity || 0);
      const rate = Number(newItems[index].rate || 0);
      newItems[index].amount = quantity * rate;
    }

    updateInvoice({ items: newItems });
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        updateInvoice,
        addItem,
        removeItem,
        updateItem,
        setFullInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
}
