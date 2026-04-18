import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, BookOpen, FileText, Play } from 'lucide-react';
import { getAvailableTests } from '../../services/testService';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [pendingTestId, setPendingTestId] = useState(null);
  const [attemptCode, setAttemptCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const testsRes = await getAvailableTests();
      setTests(testsRes.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (searchQuery && !test.testName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTestTypeIcon = (type) => {
    switch (type) {
      case 'full_mock':
        return <FileText size={18} />;
      case 'subject_wise':
        return <BookOpen size={18} />;
      default:
        return <BookOpen size={18} />;
    }
  };

  const getTestTypeLabel = (type) => {
    switch (type) {
      case 'full_mock':
        return 'Full Mock Test';
      case 'subject_wise':
        return 'Subject Wise';
      case 'topic_wise':
        return 'Topic Wise';
      default:
        return type;
    }
  };

  const handleStartTest = (testId) => {
    setPendingTestId(testId);
    setAttemptCode('');
    setCodeError('');
    setShowCodePrompt(true);
  };

  const handleConfirmSecretCode = () => {
    if (!attemptCode.trim()) {
      setCodeError('Secret code is required');
      return;
    }
    navigate(`/student/test/${pendingTestId}`, { state: { secretCode: attemptCode.trim() } });
    setShowCodePrompt(false);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Tests</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  test.type === 'full_mock'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : test.type === 'subject_wise'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {getTestTypeLabel(test.type)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {test.questionCount} questions
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {test.testName}
              </h3>

              <div className="space-y-2 mb-4">
                {test.subject && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subject: {test.subject}
                  </p>
                )}
                {test.topic && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Topic: {test.topic}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="mr-1" />
                  {test.duration} minutes
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Marks: {test.totalMarks}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                Created by: {test.createdBy?.name || 'Unknown'}
              </div>

              <button
                onClick={() => handleStartTest(test._id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Play size={18} />
                <span>Start Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No tests found matching your criteria.
          </p>
        </div>
      )}

      {showCodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Enter Test Secret Code</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the secret code provided by the test creator to start this test.
            </p>
            <input
              type="password"
              value={attemptCode}
              onChange={(e) => {
                setAttemptCode(e.target.value);
                setCodeError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              placeholder="Secret code"
            />
            {codeError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{codeError}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCodePrompt(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSecretCode}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
