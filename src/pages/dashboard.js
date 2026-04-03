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

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

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

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const years = [
    ...new Set(
      transactions.map((t) => new Date(t.date).getFullYear())
    ),
  ];

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() + 1 === month
      );
    });

    const inc = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const exp = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      month: new Date(0, i).toLocaleString("default", {
        month: "short",
      }),
      balance: inc - exp,
    };
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-5">Dashboard</h2>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white shadow p-5">
          <h3 className="text-gray-500">Balance</h3>
          <p className="text-2xl font-bold">
            ₹ {balance.toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">Income</h3>
          <p className="text-2xl font-bold text-green-500">
            ₹ {income.toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">Expenses</h3>
          <p className="text-2xl font-bold text-red-500">
            ₹ {expenses.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 mt-5 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Monthly Balance</h3>

          <select
            className="border p-2 rounded"
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number(e.target.value))
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-5 mt-5 rounded shadow">
        <h3 className="mb-3 font-bold text-center">
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
                <Cell
                  key={index}
                  fill={`hsl(${(index * 50) % 360}, 70%, 60%)`}
                />
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