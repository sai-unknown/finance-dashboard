import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const { transactions } = useContext(AppContext);

  // ------------------------- Income & Expenses Calculation -------------------------
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  // ------------------------- Category-wise Expense Data -------------------------
  const categoryData = Object.values(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => {
        if (!acc[curr.category]) {
          acc[curr.category] = { category: curr.category, value: 0 };
        }
        acc[curr.category].value += curr.amount;
        return acc;
      }, {})
  );

  // ------------------------- Year Selection -------------------------
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = [
    ...new Set(transactions.map((t) => new Date(t.date).getFullYear())),
  ];

  // ------------------------- Monthly Balance Data -------------------------
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === selectedYear && date.getMonth() + 1 === month;
    });

    const inc = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const exp = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      balance: inc - exp,
    };
  });

  // ------------------------- PieChart Colors -------------------------
  const pieColors = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-5 space-y-5">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Dashboard</h2>

      {/* ------------------------- Summary Cards ------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Balance */}
        <div className="bg-white shadow-lg p-5 rounded-lg">
          <h3 className="text-gray-500">Balance</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₹ {balance.toLocaleString()}
          </p>
        </div>

        {/* Income */}
        <div className="bg-white shadow-lg p-5 rounded-lg">
          <h3 className="text-gray-500">Income</h3>
          <p className="text-2xl font-bold text-green-500">
            ₹ {income.toLocaleString()}
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white shadow-lg p-5 rounded-lg">
          <h3 className="text-gray-500">Expenses</h3>
          <p className="text-2xl font-bold text-red-500">
            ₹ {expenses.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ------------------------- Monthly Balance Line Chart ------------------------- */}
      <div className="bg-white p-5 mt-5 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Monthly Balance</h3>
          <select
            className="border p-2 rounded focus:outline-none focus:ring focus:border-indigo-300"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#4F46E5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ------------------------- Category-wise Pie Chart ------------------------- */}
      <div className="bg-white p-5 mt-5 rounded-lg shadow-lg">
        <h3 className="mb-3 font-bold text-center text-gray-700">
          Category-wise Breakdown
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;