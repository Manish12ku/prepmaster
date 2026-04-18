import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Clock, TrendingUp, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableTests } from '../../services/testService';
import { getUserResults } from '../../services/resultService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({
    availableTests: 0,
    testsTaken: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dbUser]);

  const fetchDashboardData = async () => {
    try {
      const [testsRes, resultsRes] = await Promise.all([
        getAvailableTests(),
        getUserResults(dbUser?.id)
      ]);

      const tests = testsRes.tests || [];
      const results = resultsRes.results || [];

      const totalScore = results.reduce((sum, r) => sum + (r.accuracy || 0), 0);
      const totalTime = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0);

      setStats({
        availableTests: tests.length,
        testsTaken: results.length,
        averageScore: results.length > 0 ? Math.round(totalScore / results.length) : 0,
        totalTimeSpent: Math.round(totalTime / 60)
      });

      setRecentResults(results.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {dbUser?.name?.split(' ')[0]}!
        </h1>
        <Link
          to="/student/tests"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          Start New Test
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          label="Available Tests"
          value={stats.availableTests}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Tests Taken"
          value={stats.testsTaken}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.averageScore}%`}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Time Spent"
          value={formatTime(stats.totalTimeSpent)}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Results
          </h2>
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {result.testId?.testName || 'Unknown Test'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600 dark:text-primary-400">
                      {result.score}/{result.totalMarks}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.accuracy}% accuracy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tests taken yet. Start your first test!
            </p>
          )}
          {recentResults.length > 0 && (
            <Link
              to="/student/results"
              className="block mt-4 text-center text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All Results
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Tips
          </h2>
          <div className="space-y-4">
            <TipCard
              icon={Award}
              title="Practice Regularly"
              description="Consistent practice is key to improving your scores."
            />
            <TipCard
              icon={Clock}
              title="Time Management"
              description="Keep track of time spent on each question."
            />
            <TipCard
              icon={Calendar}
              title="Review Mistakes"
              description="Always review incorrect answers to learn from them."
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

const TipCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
      <Icon size={18} className="text-primary-600 dark:text-primary-400" />
    </div>
    <div>
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default Dashboard;
