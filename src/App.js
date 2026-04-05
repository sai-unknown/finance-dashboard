import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import Dashboard from "./pages/dashboard";
import Transaction from "./pages/transactionsPage";
import Insights from "./pages/insights";
import { useEffect } from "react";

function App() {

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <Router>
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="flex-1 md:ml-64 p-4 md:p-6">
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

  // return (
  //   <Router>
  //     <div className="flex bg-gray-100 min-h-screen">
  //       <Sidebar />
  //       <div className="flex-1">
  //         <Header />
  //         <div className="p-5">
  //           <Routes>
  //             <Route path="/" element={<Dashboard />} />
  //             <Route path="/transactions" element={<Transaction />} />
  //             <Route path="/insights" element={<Insights />} />
  //           </Routes>
  //         </div>
  //       </div>
  //     </div>
  //   </Router>
  // );