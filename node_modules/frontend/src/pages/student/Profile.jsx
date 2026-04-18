import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { dbUser, user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    setName(dbUser?.name || '');
    setPhone(dbUser?.phone || user?.phoneNumber || '');
  }, [dbUser, user]);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setSaving(true);

    try {
      await updateProfile({ name, phone });
      setStatus('Profile updated successfully.');
    } catch (err) {
      setError(err?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordStatus('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(newPassword);
      setPasswordStatus('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err?.message || 'Unable to change password. Please sign in again and try.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile and password from one place.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full">
              {dbUser?.photoURL ? (
                <img src={dbUser.photoURL} alt={dbUser.name} className="h-24 w-24 rounded-full" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={48} className="text-primary-600" />
                </div>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{dbUser?.name || 'User'}</h2>
              <p className="text-primary-100 mt-1">{dbUser?.email || 'No email'}</p>
              <span className="inline-flex mt-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white/90">
                {getRoleLabel()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900 p-4 text-sm text-green-700 dark:text-green-200">
              {status}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+911234567890"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white">
                {dbUser?.email || 'Not available'}
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {dbUser?.email && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your password for email sign-in.</p>
                </div>
                <Lock className="text-primary-600" size={22} />
              </div>

              {passwordError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900 p-4 text-sm text-red-700 dark:text-red-200 mb-4">
                  {passwordError}
                </div>
              )}
              {passwordStatus && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900 p-4 text-sm text-green-700 dark:text-green-200 mb-4">
                  {passwordStatus}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                  {passwordSaving ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
