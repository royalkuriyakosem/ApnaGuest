import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        total_tenants: 0,
        pending_approvals: 0,
        total_rooms: 0,
        active_complaints: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Total Tenants</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_tenants}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.pending_approvals}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Total Rooms</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_rooms}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Active Complaints</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.active_complaints}</p>
                </div>
            </div>
        </div>
    );
}
