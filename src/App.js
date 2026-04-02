import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-5">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
