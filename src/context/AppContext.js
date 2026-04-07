import { createContext, useState, useEffect } from "react";
import API_BASE from "../config/api.js";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    let cancelled = false;
    setTransactionsLoading(true);
    setTransactionsError(null);

    fetch(`${API_BASE}/api/transactions`)
      .then((res) => {
        if (!res.ok) throw new Error("Bad response");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const normalized = Array.isArray(data)
          ? data.map((t) => ({
              ...t,
              amount: Number(t?.amount) || 0,
            }))
          : [];
        setTransactions(normalized);
        setTransactionsError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setTransactionsError(
          "Could not load transactions. Check that the `/transactions` API is reachable."
        );
        setTransactions([]);
      })
      .finally(() => {
        if (!cancelled) setTransactionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        transactions,
        setTransactions,
        transactionsLoading,
        transactionsError,
        role,
        setRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
