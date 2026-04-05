import { type } from "@testing-library/user-event/dist/type";
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
  const [format, setFormat] = useState("json")
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

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const savingsRate = totalIncome
    ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
    : 0;

  const expenseRatio = totalIncome
    ? ((totalExpenses / totalIncome) * 100).toFixed(1)
    : 0;

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

  // Top category insight
  if (topCategoryInsight) {
    aiInsights.push(topCategoryInsight);
  }

  // Month-over-month category growth
  categoryGrowthInsights.forEach(c => {
    if (c.change > 0) {
      aiInsights.push(`⚠️ ${c.category} spending increased by ${c.change}% compared to last month.`);
    } else if (c.change < 0) {
      aiInsights.push(`✅ ${c.category} spending decreased by ${Math.abs(c.change)}% compared to last month.`);
    } else {
      aiInsights.push(`ℹ️ ${c.category} spending remained stable.`);
    }
  });

  // Overall spending alert
  if (totalExpenses > 30000) {
    aiInsights.push(`⚠️ Your total expenses are high this month: ₹${totalExpenses}. Consider reviewing your spending.`);
  } else if (totalExpenses > 15000) {
    aiInsights.push(`🙂 Your spending is moderate: ₹${totalExpenses}. Keep monitoring your expenses.`);
  } else {
    aiInsights.push(`😄 Great! Your spending is low this month: ₹${totalExpenses}.`);
  }

  // Savings rate insight
  if (savingsRate < 10) {
    aiInsights.push(`⚠️ Your savings rate is low (${savingsRate}%). Try to save more for future goals.`);
  } else {
    aiInsights.push(`✅ Your savings rate is healthy (${savingsRate}%).`);
  }

  const lineData = Object.entries(monthlyData).map(
    ([month, amount]) => ({
      month,
      amount,
    })
  );

  // DOWNLOAD FUNCTION

  const convertData = () => {
    if (format === "json") {
      return {
        content: JSON.stringify(transactions, null, 2),
        type: "application/json",
        extension: "json",
      };
    }

    if (format === "csv") {
      const headers = Object.keys(transactions[0]).join(",");
      const rows = transactions.map(t =>
        Object.values(t).join(",")
      );

      return {
        content: [headers, ...rows].join("\n"),
        type: "text/csv",
        extension: "csv",
      };
    }
  };

  const handleDownload = () => {
    if (!transactions.length) return;

    const { content, type, extension } = convertData();

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions.${extension}`;
    a.click();

    URL.revokeObjectURL(url);
  };


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
          <p className="text-sm text-gray-500">Card 1</p>
          <h2 className="text-lg">Other Insights</h2>
        </div>


        <div className="bg-white shadow rounded-2xl p-4 space-y-2">
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
        </div>

        <div className="bg-white shadow rounded-2xl p-4 transition transform hover:scale-105 hover:shadow-lg">
          <p className="text-sm text-gray-500">Card 2</p>
          <h2 className="text-lg">Other Insights</h2>
        </div>
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
                <a
                  onClick={handleDownload}
                  className="cursor-pointer hover:opacity-90 py-3 bg-cyan-50 w-full flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    className="w-6 h-6 stroke-cyan-800"
                  >
                    <path
                      strokeWidth="8"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                      d="M18.3,65.8v4A11.9,11.9,0,0,0,30.2,81.7H69.8A11.9,11.9,0,0,0,81.7,69.8v-4M65.8,50,50,65.8m0,0L34.2,50M50,65.8V18.3"
                    />
                  </svg>

                  <span className="text-sm font-medium text-cyan-800">.{format}
                  </span>
                </a>
                <a className="cursor-pointer hover:opacity-90 py-3 bg-cyan-50 w-full flex justify-center gap-2"
                  onClick={() =>
                    setFormat(prev => (prev === "json" ? "csv" : "json"))
                  }>
                  <div class="rounded-full w-6 h-6  stroke-cyan-800 bg-clip-padding backdrop-filter border-max border-gray-100 text-gray-100 drop-shadow-lg flex items-center justify-center">
                    <p className="text-cyan-800">.{format === "json" ? "csv" : "json"}</p>
                  </div>
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