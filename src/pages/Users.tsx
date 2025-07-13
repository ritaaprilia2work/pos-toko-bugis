import React from 'react';
import { Users as UsersIcon, UserCheck, UserX } from 'lucide-react';

const Users: React.FC = () => {
  // Mock users data
  const users = [
    {
      id: '1',
      name: 'Admin Tobaku',
      username: 'admin',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      name: 'Karyawan Toko',
      username: 'staff',
      role: 'staff',
      status: 'active',
      lastLogin: '2024-01-15 09:15:00'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Daftar User</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Nama</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Username</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{user.username}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {user.status === 'active' ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${
                        user.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Informasi Akses</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Admin:</strong> Akses penuh ke semua fitur sistem</p>
          <p><strong>Staff:</strong> Akses terbatas ke kasir dan transaksi penjualan</p>
        </div>
      </div>
    </div>
  );
};

export default Users;