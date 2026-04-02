import { transactions } from "../data/transactions";

function dashboard() {

    const income = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expenses;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-5">Dashboard</h2>

            <div className="grid grid-cols-3 gap-5">
                <div className="bg-white shadow p-5">
                    <h3 className="text-gray-500">Balance</h3>
                    <p className="text-2xl font-bold">₹ {balance.toLocaleString()}</p>
                </div>

                <div className="bg-white shadow p-5 rounded">
                    <h3 className="text-gray-500">Income</h3>
                    <p className="text-2xl font-bold text-green-500">₹ {income.toLocaleString()}</p>
                </div>

                <div className="bg-white shadow p-5 rounded">
                    <h3 className="text-gray-500">Expenses</h3>
                    <p className="text-2xl font-bold text-red-500">₹ {expenses.toLocaleString()}</p>
                </div>

            </div>
        </div>
    );
}

export default dashboard;