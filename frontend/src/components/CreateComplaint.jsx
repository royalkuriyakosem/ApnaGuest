import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CreateComplaint({ userId }) {
    const [description, setDescription] = useState('');
    const [serviceType, setServiceType] = useState('plumber');
    const [roomId, setRoomId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTenantRoom();
    }, [userId]);

    const fetchTenantRoom = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('room_id')
                .eq('user_id', userId)
                .single();

            if (data) setRoomId(data.room_id);
        } catch (error) {
            console.error('Error fetching tenant room:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const { error } = await supabase
                .from('complaints')
                .insert([{
                    tenant_id: userId,
                    room_id: roomId,
                    description,
                    service_type: serviceType
                }]);

            if (error) throw error;
            setMessage('Complaint submitted successfully!');
            setDescription('');
            setServiceType('plumber');
            window.location.reload(); // Simple reload to refresh list
        } catch (error) {
            setMessage('Error submitting complaint: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Report an Issue</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Describe the issue and select the type of service needed.</p>
                </div>
                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                        <select
                            id="serviceType"
                            name="serviceType"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                        >
                            <option value="plumber">Plumber</option>
                            <option value="electrician">Electrician</option>
                            <option value="cleaner">Cleaner</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Leaking tap, broken light, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
                {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
            </div>
        </div>
    );
}
