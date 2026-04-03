import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Header() {
  const { role, setRole } = useContext(AppContext);

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Finance Dashboard</h1>

      <select
        className="border p-2 rounded"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}

export default Header;