function header({ role, setRole}) {
    return (
        <div className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Finance Dashboard</h1>

            <select 
            className="border rounded p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
            </select>
        </div>
    );
}

export default header;