import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, CheckCircle, Clock, AlertCircle, XCircle, Search } from 'lucide-react';

export default function AdminRentMatrix() {
    const [tenants, setTenants] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchTenants(), fetchPayments()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTenants = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/tenants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTenants(data);
            }
        } catch (error) {
            console.error('Error fetching tenants:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/payments/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    // Generate last 12 months
    const getMonths = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
        }
        return months;
    };

    const months = getMonths();

    // Helper to get payment status for a tenant and month
    const getPaymentStatus = (tenantId, month) => {
        const payment = payments.find(p => p.tenant_id === tenantId && p.month_for === month);
        return payment ? payment.status : null;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500 mx-auto" />;
            case 'overdue': return <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />;
            default: return <span className="text-gray-300 text-xs">-</span>;
        }
    };

    const filteredTenants = tenants.filter(tenant =>
        (tenant.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4 text-center text-gray-500">Loading matrix...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Rent Payment Matrix</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search tenants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                                Tenant
                            </th>
                            {months.map(month => (
                                <th key={month} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {(tenant.full_name || tenant.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{tenant.full_name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{tenant.email}</div>
                                        </div>
                                    </div>
                                </td>
                                {months.map(month => {
                                    const status = getPaymentStatus(tenant.id, month);
                                    return (
                                        <td key={month} className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                {getStatusIcon(status)}
                                                {status && <span className="text-[10px] uppercase font-semibold mt-1 text-gray-500">{status}</span>}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {filteredTenants.length === 0 && (
                            <tr>
                                <td colSpan={months.length + 1} className="px-6 py-4 text-center text-gray-500">
                                    No tenants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-600">Overdue</span>
                </div>
            </div>
        </div>
    );
}
