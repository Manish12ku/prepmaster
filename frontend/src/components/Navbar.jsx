import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
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
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <Link to={getDashboardLink()} className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                PrepMaster
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 md:mx-2 hidden sm:block" />

            <div className="flex items-center space-x-2 md:space-x-3 group cursor-pointer" onClick={() => navigate('/student/profile')}>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {dbUser?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-tighter font-bold">
                  {dbUser?.role}
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                {dbUser?.photoURL ? (
                  <img src={dbUser.photoURL} alt={dbUser.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
            </div>

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
