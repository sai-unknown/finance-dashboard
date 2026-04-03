import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Dashboard from "./pages/dashboard";
import Transaction from "./pages/transactionsPage";
import Insights from "./pages/insights";

function App() {
  return (
    <Router>
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />

        <div className="flex-1">
          <Header />

          <div className="p-5">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transaction />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;