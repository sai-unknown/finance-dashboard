import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", short: "Home" },
  { to: "/transactions", label: "Transactions", short: "Txns" },
  { to: "/insights", label: "Insights", short: "Stats" },
];

function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 md:hidden safe-area-pb safe-area-pl safe-area-pr"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3 gap-0.5 px-1 py-1.5 xs:gap-1 xs:px-2 xs:py-2">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <li key={link.to} className="min-w-0">
              <Link
                to={link.to}
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg px-1 py-2 text-center text-[11px] font-medium leading-tight transition-all duration-200 ease-out motion-reduce:transition-none active:scale-95 motion-reduce:active:scale-100 xs:text-xs sm:min-h-[48px] ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700"
                }`}
              >
                <span className="hidden xs:inline">{link.label}</span>
                <span className="xs:hidden">{link.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
