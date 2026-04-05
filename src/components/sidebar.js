import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="hidden md:flex fixed top-0 left-0 h-screen w-64 p-4 bg-white dark:bg-gray-600 shadow overflow-y-auto flex-col text-rose-50 ">
      <h2 className="text-2xl font-bold mb-5">Menu</h2>

      <ul>
        <li className="mb-3">
          <Link to="/">Dashboard</Link>
        </li>

        <li className="mb-3">
          <Link to="/transactions">Transactions</Link>
        </li>

        <li className="mb-3">
          <Link to="/insights">Insights</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
