import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import DarkModeToggle from "./darkModeToggle";

function Header() {
  const { role, setRole } = useContext(AppContext);

  return (
    <header className="safe-area-pt sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/90 xs:px-4 sm:px-6 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:font-bold">
          Finance Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DarkModeToggle />
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 sm:flex-initial sm:text-base">
            <span className="shrink-0">Role</span>
            <select
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:min-w-[8rem] sm:flex-initial"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

export default Header;
