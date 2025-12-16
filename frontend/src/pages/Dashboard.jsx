import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/RoomList';
import TenantList from '../components/TenantList';
import CreateComplaint from '../components/CreateComplaint';
import ComplaintList from '../components/ComplaintList';

export default function Dashboard() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-indigo-600">ApnaGuest</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-700">Welcome, {profile?.full_name || user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-indigo-600 px-4 py-2 rounded-md text-white hover:bg-indigo-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {profile?.role === 'admin' && (
                        <div className="space-y-6">
                            <RoomList />
                            <TenantList />
                            <ComplaintList role="admin" userId={user?.id} />
                        </div>
                    )}
                    {profile?.role === 'tenant' && (
                        <div className="space-y-6">
                            <CreateComplaint userId={user?.id} />
                            <ComplaintList role="tenant" userId={user?.id} />
                        </div>
                    )}
                    {profile?.role === 'service_agent' && (
                        <div className="space-y-6">
                            <ComplaintList role="service_agent" userId={user?.id} />
                        </div>
                    )}
                    {!profile?.role && <div>Loading role...</div>}
                </div>
            </main>
        </div>
    );
}
