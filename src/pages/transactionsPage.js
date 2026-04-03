import { transactions } from "../data/transactions";
import { useState } from "react";

function Transactions({ role }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        category: "",
        amount: "",
        type: "income",
    });

    return (
        <div >
            <h2 className="text-2xl font-bold mb-5">Transactions</h2>


            <div className=" space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Category..."
                    className="mb-4 p-2 border rounded "
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="mb-4 p-2 border rounded"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}>

                    <option Value="all">Filter by Type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                <select
                    className="mb-4 p-2 border rounded"
                    value={setSortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="">Sort by amount</option>
                    <option value="low">Low to High</option>
                    <option value="high">High to Low</option>
                </select>
            </div>

            {role === "admin" && (
                <button className="mb-4 bg-blue-400 text-yellow-50 px-4 py-2 rounded"
                    onClick={() => setShowForm(!showForm)}
                >
                    Add Transaction
                </button>)}

            {showForm && (
                <div className="bg-gray-400 mb-4 p-4 rounded shadow">
                    <h3 className="text-lg font-bold mb-3">Add New Transaction</h3>
                    <input
                        type="text"
                        placeholder="Category"
                        className="border p-2 mr-2"
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Amount"
                        className="border p-2 mr-2"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })
                        }
                    />

                    <select
                        className="border p-2 mr-2"
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })
                        }>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <button
                        className="bg-green-500 text-white px-3 py-2 rounded"
                        onClick={() => console.log(newTransaction)}>
                        Add
                    </button>
                </div>)}

            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200 text-left">
                        <th className="p-3">Category</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Type</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions
                        .filter((t) => t.category.toLowerCase().includes(search.toLocaleLowerCase()))
                        .filter((t) => (filter === "all" ? true : t.type === filter))
                        .sort((a, b) => {
                            if (sortOrder === "low") return a.amount - b.amount;
                            if (sortOrder === "high") return b.amount - a.amount;
                            return 0;
                        })
                        .map((t) => (
                            <tr key={t.id} className="border-t">
                                <td className="p-3">{t.category}</td>
                                <td className="p-3">₹{t.amount}</td>
                                <td className="p-3">{t.type}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default Transactions;