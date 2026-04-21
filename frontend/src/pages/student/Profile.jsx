import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserProfile } from '../../services/authService';

const Profile = () => {
  const { dbUser, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    photoURL: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || '',
        phone: dbUser.phone || '',
        photoURL: dbUser.photoURL || ''
      });
    }
  }, [dbUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    if (dbUser?.role === 'super_admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (dbUser?.role === 'admin') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getRoleLabel = () => {
    if (dbUser?.role === 'super_admin') return 'Super Admin';
    if (dbUser?.role === 'admin') return 'Admin';
    return 'Student';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <Shield size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <Shield size={18} />
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full">
              {dbUser?.photoURL ? (
                <img src={dbUser.photoURL} alt={dbUser.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={48} className="text-primary-600" />
                </div>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{dbUser?.name || 'User'}</h2>
              <p className="text-primary-100 mt-1">{dbUser?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="Enter your name"
                  required
                />
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dbUser?.name || 'Not set'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-75">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dbUser?.email || 'Not set'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dbUser?.phone || user?.phoneNumber || 'Not set'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Shield size={16} />
                Role
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-75">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <User size={16} />
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="Enter image URL"
                />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
