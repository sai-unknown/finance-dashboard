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

  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <div className="animate-pulse text-gray-400">
          Loading insights...
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No transactions found. Start adding some to see insights!
      </div>
    );
  }

  const expenses = transactions.filter(t => t.type === "expense");
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals = {};
  expenses.forEach(t => {
    categoryTotals[t.category] =
      (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const now = new Date();
  const currentMonth = now.getMonth();
  const lastMonth = (currentMonth - 1 + 12) % 12;
  const currentYear = now.getFullYear();

  const currentMonthExpense = expenses
    .filter(t => {
      const d = new Date(t.date);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const lastMonthExpense = expenses
    .filter(t => {
      const d = new Date(t.date);
      return (
        d.getMonth() === lastMonth &&
        d.getFullYear() ===
        (currentMonth === 0 ? currentYear - 1 : currentYear)
      );
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const difference = currentMonthExpense - lastMonthExpense;

  let insightMessage = "";

  if (totalExpenses > 30000) {
    insightMessage = `⚠️ Your spending is high, especially in ${topCategory?.[0] || "some categories"
      }.`;
  } else if (totalExpenses > 15000) {
    insightMessage =
      "🙂 You're doing well, but keep an eye on your spending.";
  } else {
    insightMessage =
      "😄 Great job! You're managing your finances well.";
  }

  const pieData = Object.entries(categoryTotals).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const monthlyData = {};

  expenses.forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    monthlyData[key] =
      (monthlyData[key] || 0) + t.amount;
  });

  const categoryPercentages = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      category,
      percent: ((amount / totalExpenses) * 100).toFixed(1),
    })
  );

  const topCategoryInsight = topCategory
    ? `You spent most on ${topCategory[0]} (${(
      (topCategory[1] / totalExpenses) *
      100
    ).toFixed(1)}%)`
    : "";

  const categoryGrowthInsights = Object.keys(categoryTotals).map(
    category => {
      const current = expenses
        .filter(t => {
          const d = new Date(t.date);
          return (
            t.category === category &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        })
        .reduce((a, t) => a + t.amount, 0);

      const previous = expenses
        .filter(t => {
          const d = new Date(t.date);
          return (
            t.category === category &&
            d.getMonth() === lastMonth &&
            d.getFullYear() ===
            (currentMonth === 0 ? currentYear - 1 : currentYear)
          );
        })
        .reduce((a, t) => a + t.amount, 0);

      if (previous === 0) return null;

      const change = ((current - previous) / previous) * 100;

      return {
        category,
        change: change.toFixed(1),
      };
    }
  ).filter(Boolean);

  const aiInsights = [];

  if (topCategoryInsight) aiInsights.push(topCategoryInsight);

  categoryGrowthInsights.forEach(c => {
    if (c.change > 0) {
      aiInsights.push(
          `${c.category} spending increased by ${c.change}%`
      );
    } else if (c.change < 0) {
      aiInsights.push(
        `${c.category} spending decreased by ${Math.abs(
          c.change
        )}%`
      );
    }
  });

  const lineData = Object.entries(monthlyData).map(
    ([month, amount]) => ({
      month,
      amount,
    })
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Financial Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Top Spending Category</p>
          <h2 className="text-xl font-semibold">
            {topCategory?.[0] || "N/A"}
          </h2>
          <p className="text-gray-600">
            ₹ {topCategory?.[1] || 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Monthly Comparison</p>
          <h2 className="text-xl font-semibold">
            ₹ {currentMonthExpense} vs ₹ {lastMonthExpense}
          </h2>
          <p className="text-gray-600">
            {difference > 0
              ? `↑ ₹${difference} more than last month`
              : `↓ ₹${Math.abs(difference)} less than last month`}
          </p>
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Insight</p>
          <p className="text-lg">{insightMessage}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex justify-center">
            Spending by Category
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex justify-center">
            Monthly Spending Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4F46E5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4">
          Smart Insights
        </h2>

        <ul className="space-y-2">
          {aiInsights.map((insight, i) => (
            <li
              key={i}
              className="text-gray-700 bg-gray-50 p-2 rounded-lg"
            >
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Insights;