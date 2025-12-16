import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CreateRequest({ userId }) {
    const [description, setDescription] = useState('');
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
        if (!roomId) {
            setMessage('Error: You are not assigned to a room.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('maintenance_requests')
                .insert([{ user_id: userId, room_id: roomId, description }]);

            if (error) throw error;
            setMessage('Request submitted successfully!');
            setDescription('');
            window.location.reload(); // Simple reload to refresh list
        } catch (error) {
            setMessage('Error submitting request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Request Maintenance</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Describe the issue in your room.</p>
                </div>
                <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                    <div className="w-full sm:max-w-xs">
                        <label htmlFor="description" className="sr-only">Description</label>
                        <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Leaking tap, broken light, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
                {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
            </div>
        </div>
    );
}
