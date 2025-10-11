// context/currency-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type CurrencyContextType = {
  currency: string;
  locale: string;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState("INR");
  const [locale, setLocale] = useState("en-IN");

  return (
    <CurrencyContext.Provider value={{ currency, locale, setCurrency, setLocale }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
