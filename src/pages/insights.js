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

  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load transactions. Please try again.");
        setLoading(false)
      });
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

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
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
    <div className="p-4 md:p-6 space-y-6">
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

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Card2</p>
          <h2 className="text-lg">Details</h2>
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Card2</p>
          <h2 className="text-lg">Details</h2>
        </div>

        {/* <div className="bg-white shadow rounded-2xl p-4 space-y-2">
          <h2 className="text-lg font-semibold mb-4">
            Insights Ratio
          </h2>
          <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
            <p>Savings Rate</p>
            <h2>{savingsRate}%</h2>
          </div>

          <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
            <p>Expense Ratio</p>
            <h2>{expenseRatio}</h2>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex justify-center">
            Spending by Category
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            {pieData.length === 0 ? (
              <p className="text-gray-500">No expense data found to display.</p>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  isAnimationActive={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>)}
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4 flex justify-center">
            Monthly Spending Trend
          </h2>

          <ResponsiveContainer width="100%" height={250}>
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

      <div className="bg-white shadow rounded-2xl p-4 w-max">
        <h2 className="text-lg font-semibold mb-4">
          Download
        </h2>

        {/* Element from Uiverse.io by Javierrocadev */}
        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <div className="group overflow-hidden bg-neutral-50 rounded-xl bg-gradient-to-tr from-cyan-800 via-cyan-700 to-cyan-500 text-gray-50">
            <div className="before:duration-700 before:absolute before:w-28 before:h-28 before:bg-transparent before:blur-none before:border-8 before:opacity-50 before:rounded-full before:-left-4 before:-top-12 w-64 h-48  flex flex-col justify-between relative z-10 group-hover:before:top-28 group-hover:before:left-44 group-hover:before:scale-125 group-hover:before:blur">
              <div className="text p-3 flex flex-col justify-evenly h-full">
                <span className="font-bold text-2xl">Get Your Document</span>
                <p className="subtitle">Access your document instantly, simply click the download link.</p>
              </div>
              <div className="w-full flex flex-row justify-between z-10">
                <a className="hover:opacity-90 py-3 bg-cyan-50 w-full flex justify-center" href="#">
                  <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" height="100" class="w-6 h-6  stroke-cyan-800">
                    <path stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none" d="M18.3,65.8v4A11.9,11.9,0,0,0,30.2,81.7H69.8A11.9,11.9,0,0,0,81.7,69.8v-4M65.8,50,50,65.8m0,0L34.2,50M50,65.8V18.3" class="">
                    </path>
                  </svg>
                </a>
                <a className="hover:opacity-90 py-3 bg-cyan-50 w-full flex justify-center" href="#">
                  <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" height="100" class="w-6 h-6  stroke-cyan-800">
                    <path stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none" d="M21.9,50h0M50,50h0m28.1,0h0M25.9,50a4,4,0,1,1-4-4A4,4,0,0,1,25.9,50ZM54,50a4,4,0,1,1-4-4A4,4,0,0,1,54,50Zm28.1,0a4,4,0,1,1-4-4A4,4,0,0,1,82.1,50Z">
                    </path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default Insights;