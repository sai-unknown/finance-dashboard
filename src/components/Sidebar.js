function Sidebar() {
    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-5">
            <h2 className="text-2xl font-bold mb-5">Menu</h2>
            <ul>
                <li className="mb-2">Dashboard</li>
                <li className="mb-2">Transactions</li>
                <li className="mb-2">Insights</li>
            </ul>
        </div>
    );
}

export default Sidebar;