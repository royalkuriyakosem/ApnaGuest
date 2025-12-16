export default function AgentDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Agent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Assigned Tasks</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Completed Today</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">0</p>
                </div>
            </div>
        </div>
    );
}
