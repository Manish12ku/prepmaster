import React, { useState, useEffect } from 'react';
import { Search, Eye, TrendingUp, User } from 'lucide-react';
import { getAllUsers } from '../../services/authService';
import { getStudentPerformance } from '../../services/resultService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getAllUsers({ role: 'student' });
      setStudents(response.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPerformance = async (student) => {
    try {
      const response = await getStudentPerformance(student._id);
      setPerformance(response.performance);
      setSelectedStudent(student);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const filteredStudents = students.filter(s =>
    !searchTerm ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {student.photoURL ? (
                      <img src={student.photoURL} alt={student.name} className="h-8 w-8 rounded-full mr-3" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                        <User size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => viewPerformance(student)}
                    className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700"
                  >
                    <TrendingUp size={18} />
                    <span>View Performance</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedStudent && performance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedStudent.name}'s Performance
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{performance.totalTests}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tests Taken</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{performance.avgScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{performance.avgAccuracy.toFixed(1)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
              </div>
            </div>

            {performance.subjectStats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Subject-wise Performance</h3>
                <div className="space-y-3">
                  {performance.subjectStats.map((stat) => (
                    <div key={stat.subject} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">{stat.subject}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.testsTaken} tests
                        </span>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {stat.avgAccuracy.toFixed(1)}% avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {performance.recentResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Tests</h3>
                <div className="space-y-2">
                  {performance.recentResults.map((result) => (
                    <div key={result._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{result.testId?.testName}</p>
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
