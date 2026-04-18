import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Target, Award, TrendingUp } from 'lucide-react';
import { getPlatformAnalytics } from '../../services/resultService';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>

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
          icon={Target}
          label="Avg Accuracy"
          value={`${(analytics?.averageAccuracy || 0).toFixed(1)}%`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Statistics
          </h2>
          <div className="space-y-4">
            {analytics?.userRoleStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stat._id === 'super_admin' ? 'bg-purple-100 text-purple-600' :
                    stat._id === 'admin' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Users size={20} />
                  </div>
                  <span className="capitalize font-medium text-gray-900 dark:text-white">
                    {stat._id.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Overview
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary-600">{analytics?.totalResults || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Attempts</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">
                  {(analytics?.averageAccuracy || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Test Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Test</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Score</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Accuracy</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recentResults?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent activity
                  </td>
                </tr>
              ) : (
                analytics?.recentResults?.map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {result.userId?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {result.testId?.testName || 'Unknown Test'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                      {result.score}/{result.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.accuracy >= 80 ? 'bg-green-100 text-green-700' :
                        result.accuracy >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {result.accuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
