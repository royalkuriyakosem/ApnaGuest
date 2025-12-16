import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function TenantDashboard() {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Loading...</div>;

    if (!profile) return <div className="p-4 text-center">Error loading profile.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tenant Dashboard</h1>

            {!profile.is_approved && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Your account is currently <strong>Pending Approval</strong>. You will be notified once an admin approves your registration.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {profile.is_approved && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Your account is <strong>Approved</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-600" />
                    My Room Details
                </h2>
                {profile.room ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Room Number</p>
                            <p className="text-xl font-bold text-gray-900">{profile.room.room_number}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="text-xl font-bold text-gray-900">₹{profile.room.rent}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        {profile.is_approved ? "No room allocated yet." : "Room will be allocated upon approval."}
                    </p>
                )}
            </div>
        </div>
    );
}
