import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { dbUser, logout, isSuperAdmin, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isSuperAdmin) return '/superadmin/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                PrepMaster
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/student/profile')}
              className="flex items-center space-x-3 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View Profile"
            >
              {dbUser?.photoURL ? (
                <img
                  src={dbUser.photoURL}
                  alt={dbUser.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {dbUser?.name}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
