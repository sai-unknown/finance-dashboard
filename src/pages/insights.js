import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery } from "../hooks/useMediaQuery";

function InsightsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading insights">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function Insights() {
  const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];
  const {
    transactions,
    transactionsLoading,
    transactionsError,
  } = useContext(AppContext);
  const [format, setFormat] = useState("json");
  const isSmUp = useMediaQuery("(min-width: 640px)");
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const {
    topCategory,
    currentMonthExpense,
    lastMonthExpense,
    difference,
    insightMessage,
    pieData,
    lineData,
    aiInsights,
  } = useMemo(() => {
    const expensesList = transactions.filter((t) => t.type === "expense");
    const totExp = expensesList.reduce((acc, t) => acc + t.amount, 0);

    const catTotals = {};
    expensesList.forEach((t) => {
      const c = t.category || "Other";
      catTotals[c] = (catTotals[c] || 0) + t.amount;
    });

    const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    const now = new Date();
    const curM = now.getMonth();
    const lstM = (curM - 1 + 12) % 12;
    const curY = now.getFullYear();

    const curMonthExp = expensesList
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === curM && d.getFullYear() === curY;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const lastMonthExp = expensesList
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === lstM &&
          d.getFullYear() === (curM === 0 ? curY - 1 : curY)
        );
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const diff = curMonthExp - lastMonthExp;

    let msg = "";
    if (totExp > 30000)
      msg = `High spending, especially in ${top?.[0] || "some categories"}.`;
    else if (totExp > 15000)
      msg = "You're doing well, but keep monitoring spending.";
    else msg = "Great job! You're managing your finances well.";

    const pie = Object.entries(catTotals).map(([name, value]) => ({
      name,
      value,
    }));

    const monthly = {};
    expensesList.forEach((t) => {
      const d = new Date(t.date);
      const key = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[key] = (monthly[key] || 0) + t.amount;
    });
    const line = Object.entries(monthly).map(([month, amount]) => ({
      month,
      amount,
    }));

    const inc = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const sav = inc
      ? (((inc - totExp) / inc) * 100).toFixed(1)
      : 0;

    const topInsight =
      top && totExp > 0
        ? `You spent most on ${top[0]} (${((top[1] / totExp) * 100).toFixed(1)}%)`
        : "";

    const insights = [];
    if (topInsight) insights.push(topInsight);
    Object.keys(catTotals).forEach((category) => {
      const current = expensesList
        .filter(
          (t) =>
            new Date(t.date).getMonth() === curM && t.category === category
        )
        .reduce((a, t) => a + t.amount, 0);
      const previous = expensesList
        .filter(
          (t) =>
            new Date(t.date).getMonth() === lstM && t.category === category
        )
        .reduce((a, t) => a + t.amount, 0);
      if (previous === 0) return;
      const change = ((current - previous) / previous) * 100;
      if (change > 0)
        insights.push(
          `${category} spending increased by ${change.toFixed(1)}% vs last month.`
        );
      else if (change < 0)
        insights.push(
          `${category} spending decreased by ${Math.abs(change).toFixed(1)}% vs last month.`
        );
      else insights.push(`${category} spending remained stable.`);
    });
    if (totExp > 30000)
      insights.push(
        `Total expenses tracked: ₹${totExp.toLocaleString()}. Consider reviewing spending.`
      );
    else if (totExp > 15000)
      insights.push(
        `Moderate total spending: ₹${totExp.toLocaleString()}. Keep monitoring.`
      );
    else
      insights.push(
        `Lower total spending: ₹${totExp.toLocaleString()}.`
      );
    if (Number(sav) < 10)
      insights.push(`Savings rate is low (${sav}%). Try to save more.`);
    else insights.push(`Savings rate looks healthy (${sav}%).`);

    return {
      expenses: expensesList,
      totalExpenses: totExp,
      categoryTotals: catTotals,
      topCategory: top,
      currentMonthExpense: curMonthExp,
      lastMonthExpense: lastMonthExp,
      difference: diff,
      insightMessage: msg,
      pieData: pie,
      lineData: line,
      aiInsights: insights,
      totalIncome: inc,
      savingsRate: sav,
      currentMonth: curM,
      lastMonth: lstM,
    };
  }, [transactions]);

  const convertData = () => {
    if (format === "json")
      return {
        content: JSON.stringify(transactions, null, 2),
        type: "application/json",
        extension: "json",
      };
    if (format === "csv" && transactions[0]) {
      const headers = Object.keys(transactions[0]).join(",");
      const rows = transactions.map((t) => Object.values(t).join(","));
      return {
        content: [headers, ...rows].join("\n"),
        type: "text/csv",
        extension: "csv",
      };
    }
    return {
      content: "",
      type: "text/csv",
      extension: "csv",
    };
  };

  const handleDownload = () => {
    if (!transactions.length) return;
    const { content, type, extension } = convertData();
    if (!content) return;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (transactionsLoading) {
    return (
      <div className="min-h-[50vh]">
        <InsightsSkeleton />
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="motion-reduce:animate-none rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center animate-fade-in dark:border-red-900/50 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {transactionsError}
        </p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Financial insights
        </h1>
        <div className="motion-reduce:animate-none flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center animate-fade-in dark:border-gray-600 dark:bg-gray-900">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Nothing to analyze yet
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Add transactions first. Insights, charts, and export will appear
            here once data is available.
          </p>
        </div>
      </div>
    );
  }

  const cardBase =
    "rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Financial insights
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Trends, summaries, and exportable transaction data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Top spending category",
            value: topCategory?.[0] || "N/A",
            sub: topCategory ? `₹ ${topCategory[1].toLocaleString()}` : null,
          },
          {
            label: "This month vs last (expenses)",
            value: `₹${currentMonthExpense.toLocaleString()} vs ₹${lastMonthExpense.toLocaleString()}`,
            sub:
              difference > 0
                ? `Up ₹${difference.toLocaleString()}`
                : `Down ₹${Math.abs(difference).toLocaleString()}`,
          },
          {
            label: "Summary",
            value: insightMessage,
            sub: null,
          },
        ].map((card, i) => (
          <div key={i} className={cardBase}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <h2 className="mt-2 break-words text-base font-semibold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
              {card.value}
            </h2>
            {card.sub && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={cardBase}>
          <h2 className="mb-4 text-center text-base font-semibold text-gray-900 dark:text-gray-100">
            Spending by category
          </h2>
          <div className="h-[220px] w-full min-w-0 xs:h-[240px] sm:h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No expense data yet.
                </p>
              ) : (
                <PieChart margin={{ top: 4, bottom: isSmUp ? 4 : 0 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isSmUp ? "70%" : "65%"}
                    label={isSmUp}
                    isAnimationActive
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  {!isSmUp && (
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  )}
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="mb-4 text-center text-base font-semibold text-gray-900 dark:text-gray-100">
            Monthly spending trend
          </h2>
          <div className="h-[220px] w-full min-w-0 xs:h-[240px] sm:h-[260px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{
                  left: isSmUp ? 0 : -6,
                  right: isSmUp ? 8 : 4,
                  top: 4,
                  bottom: isSmUp ? 0 : 2,
                }}
              >
                <XAxis
                  dataKey="month"
                  fontSize={isSmUp ? 11 : 9}
                  stroke="#9CA3AF"
                  interval="preserveStartEnd"
                />
                <YAxis
                  fontSize={isSmUp ? 11 : 9}
                  stroke="#9CA3AF"
                  width={isMdUp ? 44 : 32}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardBase}>
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Smart insights
        </h2>
        <ul className="space-y-2">
          {aiInsights.map((insight, i) => (
            <li
              key={i}
              className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm leading-relaxed text-gray-800 dark:bg-gray-800/80 dark:text-gray-200"
            >
              {insight}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cardBase} w-full max-w-full sm:max-w-md`}>
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          Download
        </h2>
        <div className="overflow-hidden rounded-xl bg-gradient-to-tr from-cyan-800 via-cyan-700 to-cyan-500 text-gray-50">
          <div className="relative z-10 flex h-44 flex-col justify-between p-4 sm:h-48">
            <div>
              <span className="text-xl font-bold sm:text-2xl">
                Export transactions
              </span>
              <p className="mt-2 text-sm text-cyan-100/90">
                Download as {format.toUpperCase()} or switch format below.
              </p>
            </div>
            <div className="flex w-full flex-col border-t border-white/10 min-[400px]:flex-row">
              <button
                type="button"
                onClick={handleDownload}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 bg-cyan-50 py-3 text-sm font-medium text-cyan-900 hover:bg-cyan-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="h-6 w-6 shrink-0 stroke-cyan-800"
                  aria-hidden
                >
                  <path
                    strokeWidth="8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fill="none"
                    d="M18.3,65.8v4A11.9,11.9,0,0,0,30.2,81.7H69.8A11.9,11.9,0,0,0,81.7,69.8v-4M65.8,50,50,65.8m0,0L34.2,50M50,65.8V18.3"
                  />
                </svg>
                .{format}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormat((prev) => (prev === "json" ? "csv" : "json"))
                }
                className="flex min-h-[48px] flex-1 items-center justify-center border-t border-white/10 bg-cyan-50/90 py-3 text-sm font-medium text-cyan-900 hover:bg-cyan-100 min-[400px]:border-l min-[400px]:border-t-0"
              >
                Switch to .{format === "json" ? "csv" : "json"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;
