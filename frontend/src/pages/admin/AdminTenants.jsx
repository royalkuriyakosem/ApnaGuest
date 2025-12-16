import TenantList from '../../components/TenantList';

export default function AdminTenants() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Tenants</h1>
            <TenantList />
        </div>
    );
}
