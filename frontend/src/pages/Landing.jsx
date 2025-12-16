import { Link } from 'react-router-dom';
import Squares from '../components/Squares';

export default function Landing() {
    return (
        <div className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col items-center justify-center text-white">
            <div className="absolute inset-0 z-0">
                <Squares
                    speed={0.5}
                    squareSize={40}
                    direction='diagonal'
                    borderColor='#333'
                    hoverFillColor='#222'
                />
            </div>

            <div className="relative z-10 text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    ApnaGuest
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
                    Modern PG Management System. Seamlessly manage rooms, tenants, and maintenance.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/login"
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-indigo-500/30"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register-tenant"
                        className="px-8 py-3 bg-transparent border border-gray-500 hover:border-white hover:bg-white/5 rounded-lg font-semibold transition-all duration-200"
                    >
                        Register as Tenant
                    </Link>
                    <Link
                        to="/register"
                        className="px-8 py-3 text-gray-400 hover:text-white text-sm flex items-center justify-center"
                    >
                        Other Roles
                    </Link>
                </div>
            </div>
        </div>
    );
}
