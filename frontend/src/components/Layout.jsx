import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Home,
    ClipboardList,
    CreditCard,
    LogOut,
    CheckSquare
} from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(to)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 mr-3" />
                    <span className="text-xl font-bold text-gray-900">ApnaGuest</span>
                </div>

                <nav className="p-4 space-y-2">
                    {user?.role === 'admin' && (
                        <>
                            <NavLink to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavLink to="/admin/tenants" icon={Users} label="Tenants" />
                            <NavLink to="/admin/rooms" icon={Home} label="Rooms" />
                            <NavLink to="/admin/payments" icon={CreditCard} label="Payments" />
                            <NavLink to="/admin/complaints" icon={ClipboardList} label="Complaints" />
                        </>
                    )}

                    {user?.role === 'tenant' && (
                        <>
                            <NavLink to="/tenant/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavLink to="/tenant/room" icon={Home} label="My Room" />
                            <NavLink to="/tenant/payments" icon={CreditCard} label="Payments" />
                            <NavLink to="/tenant/complaints" icon={ClipboardList} label="Complaints" />
                        </>
                    )}

                    {user?.role === 'service_agent' && (
                        <>
                            <NavLink to="/agent/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <NavLink to="/agent/tasks" icon={CheckSquare} label="My Tasks" />
                        </>
                    )}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
