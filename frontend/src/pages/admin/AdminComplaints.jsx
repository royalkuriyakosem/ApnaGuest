import ComplaintList from '../../components/ComplaintList';
import { useAuth } from '../../context/AuthContext';

export default function AdminComplaints() {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Complaints</h1>
            <ComplaintList role="admin" userId={user?.id} />
        </div>
    );
}
