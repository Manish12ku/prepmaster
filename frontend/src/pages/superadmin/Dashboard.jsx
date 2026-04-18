import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, Shield, Activity } from 'lucide-react';
import { getPlatformAnalytics } from '../../services/resultService';
import { getAllUsers } from '../../services/authService';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getPlatformAnalytics();
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={analytics?.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Total Tests"
          value={analytics?.totalTests || 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Tests Attempted"
          value={analytics?.totalResults || 0}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={`${(analytics?.averageScore || 0).toFixed(1)}%`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Role Distribution
          </h2>
          <div className="space-y-4">
            {analytics?.userRoleStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <span className="capitalize text-gray-700 dark:text-gray-300">
                  {stat._id.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600"
                      style={{
                        width: `${(stat.count / (analytics?.totalUsers || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {stat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subject Performance
          </h2>
          <div className="space-y-4">
            {analytics?.subjectStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{stat._id || 'General'}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.count} attempts
                  </span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {(stat.avgScore || 0).toFixed(1)} avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard
            icon={Shield}
            title="Manage Admins"
            link="/superadmin/admins"
            color="purple"
          />
          <QuickAccessCard
            icon={Users}
            title="All Users"
            link="/superadmin/users"
            color="blue"
          />
          <QuickAccessCard
            icon={Activity}
            title="Content Control"
            link="/superadmin/content"
            color="green"
          />
          <QuickAccessCard
            icon={TrendingUp}
            title="Analytics"
            link="/superadmin/analytics"
            color="orange"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const QuickAccessCard = ({ icon: Icon, title, link, color }) => {
  const colors = {
    blue: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
    purple: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    orange: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
  };

  return (
    <a
      href={link}
      className={`flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all ${colors[color]}`}
    >
      <Icon size={24} className="mb-2 text-gray-600 dark:text-gray-400" />
      <span className="font-medium text-gray-900 dark:text-white text-center">{title}</span>
    </a>
  );
};

export default Dashboard;
