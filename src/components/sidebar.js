import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/insights", label: "Insights" },
  ];

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="safe-area-pt fixed left-0 top-0 z-10 flex h-screen max-h-[100dvh] w-64 flex-col overflow-y-auto overscroll-contain border-r border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        <h2 className="mb-8 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Menu
        </h2>
        <nav aria-label="Desktop">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
