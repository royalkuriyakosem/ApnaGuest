import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wrench, User, Calendar, AlertCircle } from 'lucide-react';

export default function MaintenanceList({ role, userId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            let query = supabase
                .from('maintenance_requests')
                .select(`
          *,
          rooms:room_id (room_number),
          requester:user_id (full_name),
          assignee:assigned_to (full_name)
        `)
                .order('created_at', { ascending: false });

            if (role === 'tenant') {
                query = query.eq('user_id', userId);
            } else if (role === 'service_agent') {
                query = query.eq('assigned_to', userId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 mt-6">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    Maintenance Requests
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Total: {requests.length}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issue
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={request.description}>
                                                {request.description}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Room {request.rooms?.room_number}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {request.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Req: {request.requester?.full_name || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wrench className="w-4 h-4 text-gray-400" />
                                            Agent: {request.assignee?.full_name || 'Unassigned'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
