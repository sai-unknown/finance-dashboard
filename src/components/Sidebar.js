import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className=" h-fill bg-gray-900 text-white p-5">
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