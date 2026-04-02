import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import Header from "./components/header";

function App() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />
        <div className="p-5">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;