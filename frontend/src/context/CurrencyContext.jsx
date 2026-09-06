import { createContext, useContext, useState } from "react";

const currencies = {
  INR: { label: "Indian Rupee", symbol: "₹", rate: 1 },
  USD: { label: "US Dollar", symbol: "$", rate: 1 / 83 },
  JPY: { label: "Japanese Yen", symbol: "¥", rate: 1.8 },
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem("tb_currency") || "INR");

  function chooseCurrency(value) {
    if (!currencies[value]) return;
    localStorage.setItem("tb_currency", value);
    setCurrency(value);
  }

  function formatCurrency(value) {
    const amount = Number(value) || 0;
    const selected = currencies[currency];
    return `${selected.symbol}${(amount * selected.rate).toLocaleString(undefined, {
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, currencies, chooseCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
