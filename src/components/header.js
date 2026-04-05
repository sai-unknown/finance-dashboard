import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Header() {
  const { role, setRole } = useContext(AppContext);

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0 z-10">
      {/* Dashboard Title */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Finance Dashboard
      </h1>

      {/* Right Controls: Role + Dark Mode */}
      <div className="flex items-center space-x-4">
        {/* Role Selector */}
        <div className="flex items-center">
          <label className="mr-2 text-gray-600 dark:text-gray-300 font-medium">
            Role:
          </label>
          <select
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

      </div>
    </header>
  );
}

export default Header;