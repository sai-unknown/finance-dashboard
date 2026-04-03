import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <AppContext.Provider
      value={{ transactions, setTransactions, role, setRole }}
    >
      {children}
    </AppContext.Provider>
  );
}