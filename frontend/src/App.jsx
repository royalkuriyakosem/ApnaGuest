import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import TenantRegister from './pages/TenantRegister';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTenants from './pages/admin/AdminTenants';
import AdminRooms from './pages/admin/AdminRooms';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminPayments from './pages/admin/AdminPayments';
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantRoom from './pages/tenant/TenantRoom';
import TenantPayments from './pages/tenant/TenantPayments';
import TenantComplaints from './pages/tenant/TenantComplaints';
import AgentDashboard from './pages/agent/AgentDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />; // Or redirect to their dashboard
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-tenant" element={<TenantRegister />} />
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            {/* Add other admin routes here */}
            <Route path="/admin/tenants" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTenants />
              </ProtectedRoute>
            } />
            <Route path="/admin/rooms" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRooms />
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayments />
              </ProtectedRoute>
            } />

            {/* Tenant Routes */}
            <Route path="/tenant/dashboard" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantDashboard />
              </ProtectedRoute>
            } />
            {/* Add other tenant routes here */}
            <Route path="/tenant/room" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantRoom />
              </ProtectedRoute>
            } />
            <Route path="/tenant/payments" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantPayments />
              </ProtectedRoute>
            } />
            <Route path="/tenant/complaints" element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantComplaints />
              </ProtectedRoute>
            } />

            {/* Agent Routes */}
            <Route path="/agent/dashboard" element={
              <ProtectedRoute allowedRoles={['service_agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } />
            {/* Add other agent routes here */}

            {/* Fallback for /dashboard to redirect based on role */}
            <Route path="/dashboard" element={<RoleRedirect />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'tenant') return <Navigate to="/tenant/dashboard" />;
  if (user.role === 'service_agent') return <Navigate to="/agent/dashboard" />;

  return <div>Unknown Role</div>;
};

export default App;
