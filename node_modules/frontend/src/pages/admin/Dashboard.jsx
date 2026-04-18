import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import { getAllQuestions } from '../../services/questionService';
import { getAllTests } from '../../services/testService';
import { getAllUsers } from '../../services/authService';
import { getPlatformAnalytics } from '../../services/resultService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalTests: 0,
    totalStudents: 0,
    totalResults: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [questionsRes, testsRes, usersRes, analyticsRes] = await Promise.all([
        getAllQuestions(),
        getAllTests(),
        getAllUsers({ role: 'student' }),
        getPlatformAnalytics()
      ]);

      setStats({
        totalQuestions: questionsRes.questions?.length || 0,
        totalTests: testsRes.tests?.length || 0,
        totalStudents: usersRes.users?.length || 0,
        totalResults: analyticsRes.analytics?.totalResults || 0
      });

      setRecentActivity(analyticsRes.analytics?.recentTests?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={HelpCircle}
          label="Total Questions"
          value={stats.totalQuestions}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Total Tests"
          value={stats.totalTests}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Tests Attempted"
          value={stats.totalResults}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed {activity.testId?.testName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600 dark:text-primary-400">
                      {activity.score}/{activity.totalMarks}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard
              title="Add Question"
              description="Create a new question"
              link="/admin/questions"
              color="blue"
            />
            <QuickActionCard
              title="Create Test"
              description="Build a new test"
              link="/admin/tests"
              color="green"
            />
            <QuickActionCard
              title="View Students"
              description="See student performance"
              link="/admin/students"
              color="purple"
            />
            <QuickActionCard
              title="Bulk Upload"
              description="Upload questions via CSV"
              link="/admin/questions"
              color="orange"
            />
          </div>
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

const QuickActionCard = ({ title, description, link, color }) => {
  const colors = {
    blue: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
    purple: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    orange: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
  };

  return (
    <a
      href={link}
      className={`block p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all ${colors[color]}`}
    >
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </a>
  );
};

export default Dashboard;
