import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

function Insights() {
  const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Download states (MOVED TO TOP — IMPORTANT)
  const [downloadFormat, setDownloadFormat] = useState("json");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load transactions. Please try again.");
        setLoading(false);
      });
  }, []);

  // ✅ DOWNLOAD HANDLER
  const handleDownload = () => {
    if (downloadFormat === "json") {
      const blob = new Blob(
        [JSON.stringify(transactions, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    if (downloadFormat === "csv") {
      const headers = ["id", "type", "amount", "category", "date"];

      const rows = transactions.map(t =>
        [t.id, t.type, t.amount, t.category, t.date].join(",")
      );

      const csvContent = [headers.join(","), ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading insights...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">{error}</div>;
  }

  if (!transactions.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No transactions found.
      </div>
    );
  }

  const expenses = transactions.filter(t => t.type === "expense");
  const totalExpenses = expenses.reduce((a, t) => a + t.amount, 0);

  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] =
      (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const pieData = Object.entries(categoryTotals).map(
    ([name, value]) => ({ name, value })
  );

  const lineData = Object.entries(categoryTotals).map(
    ([month, amount]) => ({ month, amount })
  );

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, t) => a + t.amount, 0);

  const savingsRate =
    income > 0
      ? (((income - totalExpenses) / income) * 100).toFixed(1)
      : 0;

  const expenseRatio =
    income > 0
      ? (totalExpenses / income).toFixed(2)
      : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Financial Insights</h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Top Category</p>
          <h2>{topCategory?.[0]}</h2>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Savings Rate</p>
          <h2>{savingsRate}%</h2>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Expense Ratio</p>
          <h2>{expenseRatio}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="amount" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DOWNLOAD CARD */}
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">Download</h2>

        <div className="group overflow-hidden rounded-xl bg-gradient-to-tr from-cyan-800 via-cyan-700 to-cyan-500 text-white relative">

          <div className="p-4">
            <h3 className="text-xl font-bold">Get Your Document</h3>
            <p className="text-sm opacity-80">
              Format: {downloadFormat.toUpperCase()}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex w-full">

            {/* DOWNLOAD BUTTON */}
            <button
              onClick={handleDownload}
              className="w-1/2 py-3 flex justify-center bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
            >
              <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" height="100" className="w-6 h-6  stroke-cyan-800">
						<path stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none" d="M18.3,65.8v4A11.9,11.9,0,0,0,30.2,81.7H69.8A11.9,11.9,0,0,0,81.7,69.8v-4M65.8,50,50,65.8m0,0L34.2,50M50,65.8V18.3" className="">
						</path>
					</svg>
            </button>

            {/* DROPDOWN BUTTON */}
            <div className="relative w-1/2">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full py-3 flex justify-center bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
              >
                <p className="font-semibold">Choose formate</p>
              </button>

              {showDropdown && (
                <div className="absolute right-2 bottom-12 bg-white text-black shadow-lg rounded-lg w-28 z-50">
                  <button
                    onClick={() => {
                      setDownloadFormat("json");
                      setShowDropdown(false);
                    }}
                    className="block w-full px-3 py-2 hover:bg-gray-100"
                  >
                    JSON
                  </button>

                  <button
                    onClick={() => {
                      setDownloadFormat("csv");
                      setShowDropdown(false);
                    }}
                    className="block w-full px-3 py-2 hover:bg-gray-100"
                  >
                    CSV
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;