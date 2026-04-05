import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/insights", label: "Insights" },
  ];

  return (
    <div className="hidden md:flex fixed top-0 left-0 h-screen w-64 p-6 bg-white dark:bg-gray-800 shadow flex-col">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">Menu</h2>

      <ul className="flex flex-col space-y-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block px-4 py-2 rounded-lg transition-colors 
                  ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;