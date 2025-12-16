import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TenantList() {
    const [tenants, setTenants] = useState([]);
    const [pendingTenants, setPendingTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchTenants(), fetchPendingTenants(), fetchRooms()]);
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

    const fetchPendingTenants = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/pending-tenants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingTenants(data);
            }
        } catch (error) {
            console.error('Error fetching pending tenants:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/rooms/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const openApproveModal = (tenantId) => {
        setSelectedTenantId(tenantId);
        setSelectedRoomId('');
        setShowApproveModal(true);
    };

    const closeApproveModal = () => {
        setShowApproveModal(false);
        setSelectedTenantId(null);
        setSelectedRoomId('');
    };

    const handleApprove = async () => {
        if (!selectedRoomId) {
            alert('Please select a room');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/admin/approve-tenant/${selectedTenantId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ room_id: parseInt(selectedRoomId) })
            });

            if (response.ok) {
                fetchData();
                alert('Tenant approved and room allocated successfully');
                closeApproveModal();
            } else {
                const errorData = await response.json();
                alert(`Failed to approve tenant: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving tenant:', error);
            alert('Error approving tenant');
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading tenants...</div>;

    const availableRooms = rooms.filter(room => room.status === 'available');

    const TenantTable = ({ data, title, isPending }) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 mt-6">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    {title}
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Total: {data.length}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name / Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            {isPending && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {(tenant.full_name || tenant.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {tenant.full_name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {tenant.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {isPending ? 'Pending' : 'Approved'}
                                    </span>
                                </td>
                                {isPending && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => openApproveModal(tenant.id)}
                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={isPending ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No tenants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <TenantTable data={pendingTenants} title="Pending Approvals" isPending={true} />
            <TenantTable data={tenants} title="All Tenants" isPending={false} />

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Approve Tenant & Allocate Room</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 mb-4">
                                    Select a room to allocate to this tenant.
                                </p>
                                <select
                                    value={selectedRoomId}
                                    onChange={(e) => setSelectedRoomId(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a Room</option>
                                    {availableRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            Room {room.room_number} ({room.type}) - ₹{room.price}
                                        </option>
                                    ))}
                                </select>
                                {availableRooms.length === 0 && (
                                    <p className="text-red-500 text-xs mt-2">No available rooms!</p>
                                )}
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    id="ok-btn"
                                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    onClick={handleApprove}
                                    disabled={availableRooms.length === 0}
                                >
                                    Confirm Approval
                                </button>
                                <button
                                    id="cancel-btn"
                                    className="mt-3 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    onClick={closeApproveModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
