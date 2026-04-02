import { transactions } from "../data/transactions";
import { data } from "../data/monthly_balc";
import {
    LineChart
    , Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

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

            <div className="bg-white p-5 mt-5 rounded shadow">
                {/* <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold">Monthly Balance</h3>
                    <select className="border rounded p-2">
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                    </select>
                </div> */}
                <h3 className="mb-3 font-bold" flex justify-center> Balance Over Time </h3>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="balance" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default dashboard;