import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

function Transaction() {
  const { transactions, setTransactions, role } = useContext(AppContext);

  // ------------------------- State Management -------------------------
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    category: "",
    amount: "",
    type: "income",
  });

  // ------------------------- Fetch Transactions -------------------------
  useEffect(() => {
    fetch("http://localhost:5000/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  // ------------------------- Handlers -------------------------
  const handleAdd = async () => {
    if (!newTransaction.category.trim() || !newTransaction.amount) {
      alert("Please fill all fields");
      return;
    }
    if (newTransaction.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const transaction = {
      ...newTransaction,
      amount: Number(newTransaction.amount),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("http://localhost:5000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      const saved = await res.json();
      setTransactions([...transactions, saved]);
      setNewTransaction({ category: "", amount: "", type: "income" });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/transactions/${id}`, { method: "DELETE" });
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleUpdate = async () => {
    if (!editForm.category.trim()) {
      alert("Category is required");
      return;
    }
    if (!editForm.amount || editForm.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    await fetch(`http://localhost:5000/transactions/${editForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setTransactions(transactions.map((item) => (item.id === editForm.id ? editForm : item)));
    setEditId(null);
  };

  // ------------------------- Filter & Sort Transactions -------------------------
  const filteredData = transactions
    .filter((t) => t.category.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .sort((a, b) => {
      if (sortOrder === "low") return a.amount - b.amount;
      if (sortOrder === "high") return b.amount - a.amount;
      return 0;
    });

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-5 space-y-5">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Transactions</h2>

      {/* ------------------------- Search & Filter ------------------------- */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Category..."
          className="p-2 border rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Filter by Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="p-2 border rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Sort by Amount</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
      </div>

      {/* ------------------------- Add Transaction Form ------------------------- */}
      {role === "admin" && (
        <button
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          Add Transaction
        </button>
      )}

      {showForm && (
        <div className="bg-white p-4 mb-4 rounded shadow-md flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Category"
            className="border p-2 rounded flex-1 min-w-[120px]"
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, category: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 rounded flex-1 min-w-[120px]"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />
          <select
            className="border p-2 rounded"
            value={newTransaction.type}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, type: e.target.value })
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
          >
            Add
          </button>
        </div>
      )}

      {/* ------------------------- No Transactions ------------------------- */}
      {filteredData.length === 0 && (
        <p className="text-gray-500">No transactions found</p>
      )}

      {/* ------------------------- Transactions Table ------------------------- */}
      {filteredData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Type</th>
                {role === "admin" && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">
                    {editId === t.id ? (
                      <input
                        className="border p-1 rounded w-full"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                      />
                    ) : (
                      t.category
                    )}
                  </td>
                  <td className="p-3">
                    {editId === t.id ? (
                      <input
                        type="number"
                        className="border p-1 rounded w-full"
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm({ ...editForm, amount: Number(e.target.value) })
                        }
                      />
                    ) : (
                      `₹ ${t.amount}`
                    )}
                  </td>
                  <td className="p-3">
                    {editId === t.id ? (
                      <select
                        className="border p-1 rounded w-full"
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value })
                        }
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    ) : (
                      t.type.toUpperCase()
                    )}
                  </td>
                  {role === "admin" && (
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          if (editId === t.id) handleUpdate();
                          else {
                            setEditId(t.id);
                            setEditForm(t);
                          }
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        {editId === t.id ? "Save" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Transaction;