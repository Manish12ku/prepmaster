import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavItems } from '../utils/navigation';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { dbUser, isSuperAdmin, isAdmin } = useAuth();
  const navItems = getNavItems(dbUser?.role);

  const getRoleColor = () => {
    if (isSuperAdmin) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (isAdmin) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Admin';
    return 'Student';
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out transform
        md:relative md:translate-x-0 md:shadow-md min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
        </div>
        <button 
          onClick={closeSidebar}
          className="p-2 rounded-lg md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) closeSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
