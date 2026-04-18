import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserMinus, Shield, User } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../../services/authService';

const Admins = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const allUsers = response.users || [];
      setUsers(allUsers.filter(u => u.role === 'student'));
      setAdmins(allUsers.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await updateUserRole(userId, 'admin');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!confirm('Are you sure you want to remove admin privileges?')) return;
    try {
      await updateUserRole(userId, 'student');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Admins ({admins.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {admin.photoURL ? (
                    <img src={admin.photoURL} alt={admin.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                      <Shield size={20} className="text-purple-700 dark:text-purple-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin._id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Remove Admin"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No admins found
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Make User Admin
            </h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-3 max-h-80 overflow-auto">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMakeAdmin(user._id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus size={16} />
                  <span>Make Admin</span>
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No students found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admins;
