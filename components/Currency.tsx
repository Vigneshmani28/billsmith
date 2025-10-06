'use client';

import { useCurrency } from "@/context/currency-context";

type CurrencyProps = {
  amount: number;
};

export const Currency = ({ amount }: CurrencyProps) => {
  const { currency, locale } = useCurrency();

  return (
    <span>
      {new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)}
    </span>
  );
};
