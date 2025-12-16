import RoomList from '../../components/RoomList';

export default function AdminRooms() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Rooms</h1>
            <RoomList />
        </div>
    );
}
