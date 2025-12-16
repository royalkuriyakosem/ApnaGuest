import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wrench, User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function ComplaintList({ role, userId }) {
    const [complaints, setComplaints] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
        if (role === 'admin') {
            fetchAgents();
        }
    }, [role]);

    const fetchAgents = async () => {
        try {
            const { data, error } = await supabase
                .from('service_agents')
                .select('id, service_type, profile:user_id(full_name)')
                .eq('is_approved', true); // Only approved agents

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            let query = supabase
                .from('complaints')
                .select(`
          *,
          rooms:room_id (room_number),
          tenant:tenant_id (full_name),
          agent:agent_id (
            id,
            profile:user_id (full_name)
          )
        `)
                .order('created_at', { ascending: false });

            if (role === 'tenant') {
                query = query.eq('tenant_id', userId);
            } else if (role === 'service_agent') {
                // For agents, we need to find their agent_id first
                const { data: agentData } = await supabase.from('service_agents').select('id').eq('user_id', userId).single();
                if (agentData) {
                    query = query.eq('agent_id', agentData.id);
                }
            }

            const { data, error } = await query;

            if (error) throw error;
            setComplaints(data || []);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status: newStatus })
                .eq('id', complaintId);

            if (error) throw error;
            fetchComplaints(); // Refresh
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAssignAgent = async (complaintId, agentId) => {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({
                    agent_id: agentId,
                    status: 'assigned'
                })
                .eq('id', complaintId);

            if (error) throw error;
            fetchComplaints();
        } catch (error) {
            console.error('Error assigning agent:', error);
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading complaints...</div>;

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 mt-6">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    {role === 'service_agent' ? 'My Tasks' : 'Complaints'}
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Total: {complaints.length}
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
                            {(role === 'service_agent' || role === 'admin') && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {complaints.map((complaint) => (
                            <tr key={complaint.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={complaint.description}>
                                                {complaint.description}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase">
                                                {complaint.service_type}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                                            complaint.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                                        {complaint.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Tenant: {complaint.tenant?.full_name || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Wrench className="w-4 h-4 text-gray-400" />
                                            Agent: {complaint.agent?.profile?.full_name || 'Unassigned'}
                                        </div>
                                        {complaint.rooms && (
                                            <div className="text-xs text-gray-400">
                                                Room: {complaint.rooms.room_number}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {(role === 'service_agent' || role === 'admin') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {role === 'service_agent' && complaint.status !== 'resolved' && (
                                            <div className="flex gap-2">
                                                {complaint.status === 'assigned' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                                                        className="text-blue-600 hover:text-blue-900 text-xs font-semibold"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {complaint.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                                                        className="text-green-600 hover:text-green-900 text-xs font-semibold"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {role === 'admin' && complaint.status === 'open' && (
                                            <select
                                                className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                onChange={(e) => handleAssignAgent(complaint.id, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Assign Agent</option>
                                                {agents
                                                    .filter(a => a.service_type === complaint.service_type)
                                                    .map(agent => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.profile?.full_name} ({agent.service_type})
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
