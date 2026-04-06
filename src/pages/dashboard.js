import { useContext, useState, useMemo } from "react";
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
  Legend,
} from "recharts";
import { useMediaQuery } from "../hooks/useMediaQuery";

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-72 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="motion-reduce:animate-none flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center animate-fade-in dark:border-gray-600 dark:bg-gray-900">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl dark:bg-indigo-950">
        📊
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        No transactions yet
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        When your API returns data, you will see balance, income, expenses, and
        charts here. Add transactions from the Transactions page (admin role).
      </p>
    </div>
  );
}

function Dashboard() {
  const { transactions, transactionsLoading, transactionsError } =
    useContext(AppContext);
  const isSmUp = useMediaQuery("(min-width: 640px)");
  const isMdUp = useMediaQuery("(min-width: 768px)");

  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const expenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const balance = income - expenses;

  const categoryData = useMemo(
    () =>
      Object.values(
        transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, curr) => {
            const cat = curr.category || "Other";
            if (!acc[cat]) acc[cat] = { category: cat, value: 0 };
            acc[cat].value += curr.amount;
            return acc;
          }, {})
      ),
    [transactions]
  );

  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear()
  );

  const years = useMemo(() => {
    const ys = [
      ...new Set(
        transactions.map((t) => new Date(t.date).getFullYear())
      ),
    ].sort((a, b) => b - a);
    return ys.length ? ys : [new Date().getFullYear()];
  }, [transactions]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthlyTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
          date.getFullYear() === selectedYear && date.getMonth() + 1 === month
        );
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
  }, [transactions, selectedYear]);

  const pieColors = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

  if (transactionsLoading) {
    return (
      <div className="min-h-[60vh]">
        <PageSkeleton />  
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
      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Dashboard
        </h2>
        <EmptyDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Dashboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Overview of your balances and spending patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Balance
          </h3>
          <p className="mt-2 break-all text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100 sm:break-normal">
            ₹{balance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Income
          </h3>
          <p className="mt-2 break-all text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:break-normal">
            ₹{income.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm sm:col-span-2 lg:col-span-1 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Expenses
          </h3>
          <p className="mt-2 break-all text-2xl font-bold tabular-nums text-red-600 dark:text-red-400 sm:break-normal">
            ₹{expenses.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:shadow-md motion-reduce:hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Monthly balance
          </h3>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[220px] w-full min-w-0 xs:h-[240px] sm:h-[280px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{
                left: isSmUp ? 0 : -8,
                right: isSmUp ? 8 : 4,
                top: 4,
                bottom: isSmUp ? 0 : 4,
              }}
            >
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={isSmUp ? 12 : 10}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={isSmUp ? 12 : 10}
                width={isMdUp ? 48 : 36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:shadow-md motion-reduce:hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h3 className="mb-4 text-center text-base font-semibold text-gray-900 dark:text-gray-100">
          Category breakdown
        </h3>
        {categoryData.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No expense categories to show yet.
          </p>
        ) : (
          <div className="h-[240px] w-full min-w-0 xs:h-[260px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, bottom: isSmUp ? 4 : 0 }}>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={isSmUp ? "72%" : "68%"}
                  label={
                    isSmUp
                      ? ({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                      : false
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.category}
                      fill={pieColors[index % pieColors.length]}
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
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
