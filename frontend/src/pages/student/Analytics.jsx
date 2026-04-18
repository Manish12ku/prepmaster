import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Medal, Award, Clock, Target, BookOpen, Star } from 'lucide-react';
import { getTopMonthlyPerformers } from '../../services/monthlyPerformanceService';

const Analytics = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [sortBy, setSortBy] = useState('monthlyScore');

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const leaderboardResponse = await getTopMonthlyPerformers(selectedMonth, selectedYear);
      setLeaderboard(leaderboardResponse.performers || []);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };

  const formatMonthFull = (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard].sort((a, b) => {
      switch (sortBy) {
        case 'monthlyScore':
          return b.monthlyScore - a.monthlyScore;
        case 'avgPercentage':
          return b.avgPercentage - a.avgPercentage;
        case 'avgAccuracy':
          return b.avgAccuracy - a.avgAccuracy;
        case 'totalTestsAttempted':
          return b.totalTestsAttempted - a.totalTestsAttempted;
        case 'totalScore':
          return b.totalScore - a.totalScore;
        default:
          return b.monthlyScore - a.monthlyScore;
      }
    });
    return sorted;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <Award className="w-5 h-5 text-blue-500" />;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getPerformanceGrade = (score) => {
    if (score >= 90) return { label: 'Outstanding', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' };
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' };
    if (score >= 70) return { label: 'Very Good', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' };
    if (score >= 60) return { label: 'Good', color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400' };
    if (score >= 50) return { label: 'Average', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Monthly Performers
        </h1>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{formatMonthFull(i)}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg shadow p-5 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Top Performer</p>
                <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">
                  {sortedLeaderboard[0]?.userName || 'N/A'}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg shadow p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Highest Accuracy</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-1">
                  {leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.avgAccuracy)).toFixed(1) : 0}%
                </p>
              </div>
              <Target className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg shadow p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Most Attempts</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-300 mt-1">
                  {leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.totalTestsAttempted)) : 0}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Participants</p>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-300 mt-1">
                  {leaderboard.length}
                </p>
              </div>
              <Star className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-500" />
            Leaderboard - {formatMonthFull(selectedMonth)} {selectedYear}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="monthlyScore">Overall Score</option>
              <option value="avgPercentage">Marks %</option>
              <option value="avgAccuracy">Accuracy</option>
              <option value="totalTestsAttempted">Attempts</option>
              <option value="totalScore">Total Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {sortedLeaderboard.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No performance data available for {formatMonthFull(selectedMonth)} {selectedYear}.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Students need to complete tests to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">Rank</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Student</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Attempts
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-4 h-4" />
                      Marks %
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" />
                      Accuracy
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total Score</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4" />
                      Score
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Grade</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((performer, index) => {
                  const rank = index + 1;
                  const grade = getPerformanceGrade(performer.monthlyScore);
                  return (
                    <tr 
                      key={performer._id} 
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {rank <= 3 ? (
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankStyle(rank)}`}>
                              {getRankIcon(rank)}
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                              {rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            rank === 1 ? 'bg-yellow-500' :
                            rank === 2 ? 'bg-gray-400' :
                            rank === 3 ? 'bg-orange-500' :
                            'bg-primary-500'
                          }`}>
                            {performer.userName?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {performer.userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {performer.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {performer.totalTestsAttempted}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(performer.avgPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {performer.avgPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                              style={{ width: `${Math.min(performer.avgAccuracy, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {performer.avgAccuracy.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {performer.totalScore}/{performer.totalMaxMarks}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm">
                          {performer.monthlyScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${grade.color}`}>
                          {grade.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
