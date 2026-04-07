import { useState, useContext, useMemo, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { parseTransactionsCSV } from "../utils/csvTransactions";
import API_BASE from "../config/api.js";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading transactions">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

function Transaction() {
  const {
    transactions,
    setTransactions,
    transactionsLoading,
    transactionsError,
    role,
  } = useContext(AppContext);
  const { showToast } = useToast();
  const csvInputRef = useRef(null);

  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    category: "",
    amount: "",
    type: "income",
    date: todayISO(),
  });

  useEffect(() => {
    if (role !== "admin") {
      setShowForm(false);
      setEditId(null);
      setEditForm({});
      setPendingDelete(null);
    }
  }, [role]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, sortOrder]);

  const filteredData = useMemo(() => {
    return transactions
      .filter((t) =>
        (t.category || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter((t) => (filter === "all" ? true : t.type === filter))
      .sort((a, b) => {
        const na = Number(a.amount);
        const nb = Number(b.amount);
        const va = Number.isFinite(na) ? na : 0;
        const vb = Number.isFinite(nb) ? nb : 0;
        if (sortOrder === "low") return va - vb;
        if (sortOrder === "high") return vb - va;
        return 0;
      });
  }, [transactions, search, filter, sortOrder]);

  const totalFiltered = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  const hasFilters =
    search.trim() !== "" || filter !== "all" || sortOrder !== "";

  const handleAdd = async () => {
    if (role !== "admin") return;
    if (
      !newTransaction.category.trim() ||
      !newTransaction.amount ||
      !newTransaction.date
    ) {
      showToast("Please fill category, amount, and date.");
      return;
    }
    if (Number(newTransaction.amount) <= 0) {
      showToast("Amount must be greater than 0.");
      return;
    }

    const transaction = {
      type: newTransaction.type,
      category: newTransaction.category.trim(),
      amount: Number(newTransaction.amount),
      date: newTransaction.date,
    };

    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) {
        showToast("Could not save transaction. Is the API running?");
        return;
      }
      const saved = await res.json();
      setTransactions((prev) => [...prev, saved]);
      setNewTransaction({
        category: "",
        amount: "",
        type: "income",
        date: todayISO(),
      });
      setShowForm(false);
      showToast("Transaction added.", "success");
    } catch {
      showToast("Could not save transaction. Check your network.");
    }
  };

  const runDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/transactions?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("Could not delete transaction.");
        return;
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast("Transaction deleted.", "success");
    } catch {
      showToast("Could not delete transaction.");
    }
  };

  const handleUpdate = async () => {
    if (role !== "admin") return;
    if (!editForm.category?.trim()) {
      showToast("Category is required.");
      return;
    }
    if (!editForm.amount || editForm.amount <= 0) {
      showToast("Amount must be greater than 0.");
      return;
    }
    if (!editForm.date || !/^\d{4}-\d{2}-\d{2}$/.test(editForm.date)) {
      showToast("Please set a valid date (YYYY-MM-DD).");
      return;
    }

    const payload = {
      id: editForm.id,
      type: editForm.type,
      category: editForm.category.trim(),
      amount: Number(editForm.amount),
      date: editForm.date,
    };

    try {
      const res = await fetch(`${API_BASE}/api/transactions?id=${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        showToast("Could not update transaction.");
        return;
      }
      setTransactions((prev) =>
        prev.map((item) => (item.id === editForm.id ? payload : item))
      );
      setEditId(null);
      showToast("Transaction updated.", "success");
    } catch {
      showToast("Could not update transaction.");
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || role !== "admin") return;

    let text;
    try {
      text = await file.text();
    } catch {
      showToast("Could not read the file.");
      return;
    }

    const parsed = parseTransactionsCSV(text);
    if (!parsed.ok) {
      const msg =
        parsed.errors.slice(0, 4).join(" ") +
        (parsed.errors.length > 4 ? ` (+${parsed.errors.length - 4} more)` : "");
      showToast(msg || "Invalid CSV.");
      return;
    }

    const added = [];
    for (const row of parsed.rows) {
      try {
        const res = await fetch(`${API_BASE }/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
        if (res.ok) added.push(await res.json());
      } catch {
        break;
      }
    }

    if (added.length) {
      setTransactions((prev) => [...prev, ...added]);
    }

    if (added.length === parsed.rows.length) {
      showToast(`Imported ${added.length} transaction(s).`, "success");
    } else {
      showToast(
        `Imported ${added.length} of ${parsed.rows.length}. Some rows failed or the API stopped responding.`
      );
    }
  };

  const PaginationBar = () => {
    if (totalFiltered === 0) return null;
    return (
      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-gray-200">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900 dark:text-gray-200">
            {totalFiltered}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Per page</span>
            <select
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            Previous
          </button>
          <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (transactionsLoading) {
    return (
      <div className="min-h-[50vh]">
        <TransactionsSkeleton />
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete transaction?"
        message={
          pendingDelete
            ? `Remove “${pendingDelete.label}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const id = pendingDelete.id;
          setPendingDelete(null);
          await runDelete(id);
        }}
      />

      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
          Transactions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Search, filter, import CSV, and manage entries. Editing requires the
          admin role.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <input
          type="text"
          placeholder="Search by category…"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Default order</option>
          <option value="low">Amount: low → high</option>
          <option value="high">Amount: high → low</option>
        </select>
      </div>

      {role === "admin" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100 dark:focus:ring-offset-gray-950"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add transaction"}
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCSVImport}
          />
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            onClick={() => csvInputRef.current?.click()}
          >
            Import CSV
          </button>
        </div>
      )}

      {role === "admin" && showForm && (
        <div className="motion-reduce:animate-none flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-scale-in dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:flex-wrap sm:items-end">
          <input
            type="text"
            placeholder="Category"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:min-w-[120px] sm:flex-1"
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, category: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Amount"
            min="0"
            step="any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-32"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto"
            value={newTransaction.type}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, type: e.target.value })
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <label className="flex w-full flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 sm:w-auto">
            Date
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-40"
              value={newTransaction.date}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, date: e.target.value })
              }
            />
          </label>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            Save
          </button>
        </div>
      )}

      {role === "admin" && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          CSV columns:{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
            type, amount, category, date
          </code>{" "}
          (header row required; date format YYYY-MM-DD; type: income or expense).
        </p>
      )}

      {transactions.length === 0 && (
        <div className="motion-reduce:animate-none flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center animate-fade-in dark:border-gray-600 dark:bg-gray-900">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No transactions yet
          </p>
          <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Switch to <strong className="font-semibold">Admin</strong> and add
            your first transaction, import a 
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
              .csv
            </code> file with following columns: type, amount, category, date.
          </p>
        </div>
      )}

      {transactions.length > 0 && filteredData.length === 0 && (
        <div className="motion-reduce:animate-none rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center animate-fade-in dark:border-gray-700 dark:bg-gray-900">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            No matches
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {hasFilters
              ? "Try clearing search or filters to see all transactions."
              : "Adjust your filters to see results."}
          </p>
          {hasFilters && (
            <button
              type="button"
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setSortOrder("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {filteredData.length > 0 && (
        <>
          <div className="lg:hidden">
            <ul className="space-y-3" aria-label="Transaction list">
              {paginatedData.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editId === t.id && role === "admin" ? (
                        <input
                          className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                        />
                      ) : (
                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {t.category || "—"}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {editId === t.id && role === "admin" ? (
                          <input
                            type="date"
                            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                            value={editForm.date || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        ) : (
                          <>
                            {(t.date && String(t.date).split("T")[0]) || "—"}{" "}
                            <span className="font-medium uppercase text-gray-600 dark:text-gray-300">
                              · {t.type}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {editId === t.id && role === "admin" ? (
                        <input
                          type="number"
                          className="w-28 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              amount: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <p
                          className={`text-lg font-semibold tabular-nums ${t.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                            }`}
                        >
                          ₹{t.amount?.toLocaleString?.() ?? t.amount}
                        </p>
                      )}
                    </div>
                  </div>
                  {editId === t.id && role === "admin" && (
                    <select
                      className="mt-3 w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, type: e.target.value })
                      }
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  )}
                  {role === "admin" && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          if (editId === t.id) handleUpdate();
                          else {
                            setEditId(t.id);
                            setEditForm({
                              ...t,
                              date:
                                (t.date && String(t.date).split("T")[0]) ||
                                todayISO(),
                            });
                          }
                        }}
                        className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-indigo-600 active:bg-indigo-50 dark:text-indigo-400 dark:active:bg-indigo-950/50"
                      >
                        {editId === t.id ? "Save" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            id: t.id,
                            label: t.category || "this row",
                          })
                        }
                        className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <PaginationBar />
          </div>

          <div className="hidden lg:block">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm transition-shadow duration-200 [scrollbar-gutter:stable] hover:shadow-md motion-reduce:hover:shadow-sm dark:border-gray-700">
              <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm xl:min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Category
                    </th>
                    <th className="w-28 px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Amount
                    </th>
                    <th className="w-24 px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Type
                    </th>
                    <th className="w-36 px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Date
                    </th>
                    {role === "admin" && (
                      <th className="w-40 px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {paginatedData.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors duration-150 hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3">
                        {editId === t.id && role === "admin" ? (
                          <input
                            className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
                            {t.category || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-900 dark:text-gray-100">
                        {editId === t.id && role === "admin" ? (
                          <input
                            type="number"
                            className="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                            value={editForm.amount}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                amount: Number(e.target.value),
                              })
                            }
                          />
                        ) : (
                          `₹ ${t.amount?.toLocaleString?.() ?? t.amount}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editId === t.id && role === "admin" ? (
                          <select
                            className="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                            value={editForm.type}
                            onChange={(e) =>
                              setEditForm({ ...editForm, type: e.target.value })
                            }
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        ) : (
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                            {t.type}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-200">
                        {editId === t.id && role === "admin" ? (
                          <input
                            type="date"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                            value={editForm.date || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        ) : (
                          (t.date && String(t.date).split("T")[0]) || "—"
                        )}
                      </td>
                      {role === "admin" && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (editId === t.id) handleUpdate();
                                else {
                                  setEditId(t.id);
                                  setEditForm({
                                    ...t,
                                    date:
                                      (t.date && String(t.date).split("T")[0]) ||
                                      todayISO(),
                                  });
                                }
                              }}
                              className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              {editId === t.id ? "Save" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingDelete({
                                  id: t.id,
                                  label: t.category || "this row",
                                })
                              }
                              className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <PaginationBar />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Transaction;
