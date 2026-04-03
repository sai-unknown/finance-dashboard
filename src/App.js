import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import Header from "./components/header";
import Transactions from "./pages/transactionsPage";
import { useState } from "react";

function App() {
  const [role, setRole] = useState("viewer");

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header role={role} setRole={setRole} />
        <div className="p-5">
          <Dashboard />
          <Transactions role={role} />
        </div>
      </div>
    </div>
  );
}

export default App;