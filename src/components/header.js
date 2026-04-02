function header() {
    return (
        <div className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Finance Dashboard</h1>

            <select className="border rounded p-2">
                <option>Viewer</option>
                <option>Admin</option>
            </select>
        </div>
    );
}

export default header;