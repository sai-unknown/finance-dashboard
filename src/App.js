import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/sidebar";
import MobileNav from "./components/MobileNav";
import Header from "./components/header";
import Dashboard from "./pages/dashboard";
import Transaction from "./pages/transactionsPage";
import Insights from "./pages/insights";

function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden px-3 pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] xs:px-4 xs:pt-4 sm:px-5 sm:pt-5 md:pb-8 md:pl-6 md:pr-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto w-full max-w-[1600px] 3xl:max-w-[1800px]">
            <div
              key={location.pathname}
              className="motion-reduce:animate-none animate-page-in"
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transaction />} />
                <Route path="/insights" element={<Insights />} />
              </Routes>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
