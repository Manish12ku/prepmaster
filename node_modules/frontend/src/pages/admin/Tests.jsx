import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Clock, HelpCircle, Trash2, Download, Eye, X, Play } from 'lucide-react';
import { getAllTests, createTest, deleteTest } from '../../services/testService';
import { getAllQuestions } from '../../services/questionService';
import { getResultsByTest } from '../../services/resultService';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [selectedTestAttempts, setSelectedTestAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [activeTestName, setActiveTestName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [creationMethod, setCreationMethod] = useState('manual');
  const [csvData, setCsvData] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [formData, setFormData] = useState({
    testName: '',
    type: 'subject_wise',
    duration: 30,
    markingScheme: { correct: 1, negative: 0 },
    expectedAvgMarks: '',
    secretCode: '',
    csvFile: null
  });
  const [questionFilter, setQuestionFilter] = useState({ subject: '', search: '' });
  const [pendingTestId, setPendingTestId] = useState(null);
  const [showSecretCodePrompt, setShowSecretCodePrompt] = useState(false);
  const [attemptCode, setAttemptCode] = useState('');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openAttemptsModal && location.state?.testId) {
      const test = tests.find(t => t._id === location.state.testId);
      if (test) {
        handleViewAttempts(test);
      }
    }
  }, [tests, location.state]);

  const fetchData = async () => {
    try {
      const [testsRes, questionsRes] = await Promise.all([
        getAllTests(),
        getAllQuestions({ isApproved: true })
      ]);
      setTests(testsRes.tests || []);
      setQuestions(questionsRes.questions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempts = async (test) => {
    setActiveTestName(test.testName);
    setShowAttemptsModal(true);
    setAttemptsLoading(true);
    try {
      const response = await getResultsByTest(test._id);
      setSelectedTestAttempts(response.results || []);
    } catch (error) {
      console.error('Error fetching test attempts:', error);
      setSelectedTestAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleStartTest = (testId) => {
    setPendingTestId(testId);
    setAttemptCode('');
    setCodeError('');
    setShowSecretCodePrompt(true);
  };

  const handleConfirmSecretCode = () => {
    if (!attemptCode.trim()) {
      setCodeError('Secret code is required');
      return;
    }
    navigate(`/student/test/${pendingTestId}`, { state: { secretCode: attemptCode.trim() } });
    setShowSecretCodePrompt(false);
  };

  const downloadTestResults = () => {
    if (!selectedTestAttempts.length) {
      alert('No results available to download.');
      return;
    }

    const headers = [
      'Student Name',
      'Student Email',
      'Test Name',
      'Score',
      'Total Marks',
      'Accuracy',
      'Correct',
      'Incorrect',
      'Unattempted',
      'Time Taken (sec)',
      'Submitted At'
    ];

    const rows = selectedTestAttempts.map(result => [
      result.userId?.name || 'Unknown',
      result.userId?.email || 'Unknown',
      result.testId?.testName || 'Unknown Test',
      result.score,
      result.totalMarks,
      result.accuracy,
      result.correctCount,
      result.incorrectCount,
      result.unattemptedCount,
      result.timeTaken,
      new Date(result.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTestName || 'test-results'}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.secretCode.trim()) {
      alert('Secret code is required');
      return;
    }

    if (creationMethod === 'manual' && selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    if (creationMethod === 'csv' && (!formData.csvFile || csvData.length === 0)) {
      alert('Please upload a valid CSV file with questions');
      return;
    }

    try {
      const testData = {
        ...formData,
        questions: creationMethod === 'manual' ? selectedQuestions : csvData,
        expectedAvgMarks: formData.expectedAvgMarks ? parseFloat(formData.expectedAvgMarks) : undefined
      };

      await createTest(testData);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating test:', error);
      if (error.response?.status === 403) {
        alert('Invalid secret code');
      } else {
        alert('Error creating test');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      testName: '',
      type: 'subject_wise',
      duration: 30,
      markingScheme: { correct: 1, negative: 0 },
      expectedAvgMarks: '',
      secretCode: '',
      csvFile: null
    });
    setSelectedQuestions([]);
    setCreationMethod('manual');
    setCsvData([]);
    setCsvError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await deleteTest(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please select a CSV file');
      return;
    }

    setFormData({ ...formData, csvFile: file });
    parseCSV(file);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Check required headers
        const requiredHeaders = ['question', 'option1', 'option2', 'option3', 'option4', 'correctAnswer'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        const questions = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length >= 6) {
            const question = {
              question: values[0],
              options: [values[1], values[2], values[3], values[4]],
              correctAnswer: parseInt(values[5]) - 1, // Convert to 0-based index
              subject: values[6] || '',
              topic: values[7] || '',
              difficulty: values[8] || 'medium'
            };
            questions.push(question);
          }
        }

        if (questions.length === 0) {
          setCsvError('No valid questions found in CSV');
          return;
        }

        setCsvData(questions);
        setCsvError('');
      } catch (error) {
        setCsvError('Error parsing CSV file');
        console.error('CSV parsing error:', error);
      }
    };
    reader.readAsText(file);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = questions.filter(q => {
    if (questionFilter.subject && q.subject !== questionFilter.subject) return false;
    if (questionFilter.search && !q.question.toLowerCase().includes(questionFilter.search.toLowerCase())) return false;
    return true;
  });

  const filteredTests = tests.filter(t =>
    !searchTerm || t.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subjects = [...new Set(questions.map(q => q.subject))];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" onDoubleClick={() => setShowModal(true)}>Test Management</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            role="button"
            tabIndex={0}
            onClick={() => handleViewAttempts(test)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleViewAttempts(test); }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                test.type === 'full_mock'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : test.type === 'subject_wise'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {test.type.replace('_', ' ')}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(test._id); }}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{test.testName}</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <HelpCircle size={16} className="mr-2" />
                {test.questions.length} questions
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {test.duration} minutes
              </div>
              {test.subject && <p>Subject: {test.subject}</p>}
              {test.topic && <p>Topic: {test.topic}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              Created by: {test.createdBy?.name || 'Unknown'}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleViewAttempts(test); }}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                type="button"
              >
                <Eye size={16} />
                <span>View Attempts</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleStartTest(test._id); }}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                type="button"
              >
                <Play size={16} />
                <span>Start Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAttemptsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-5xl w-full mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attempts for {activeTestName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">View all students who appeared for this test and their performance.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttemptsModal(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">{selectedTestAttempts.length} attempts found</div>
              <button
                onClick={downloadTestResults}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <Download size={16} />
                <span>Download CSV</span>
              </button>
            </div>

            {attemptsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : selectedTestAttempts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No student attempts found for this test.</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Accuracy</th>
                      <th className="px-4 py-3">Correct</th>
                      <th className="px-4 py-3">Incorrect</th>
                      <th className="px-4 py-3">Time Taken</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTestAttempts.map((result) => (
                      <tr key={result._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{result.userId?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{result.userId?.email || 'No email'}</div>
                        </td>
                        <td className="px-4 py-3">{result.score}/{result.totalMarks}</td>
                        <td className="px-4 py-3">{result.accuracy}%</td>
                        <td className="px-4 py-3">{result.correctCount}</td>
                        <td className="px-4 py-3">{result.incorrectCount}</td>
                        <td className="px-4 py-3">{result.timeTaken}s</td>
                        <td className="px-4 py-3">{new Date(result.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/student/results/${result._id}`, { state: { from: '/admin/tests', openAttemptsModal: true, testId: result.testId._id } })}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
                            type="button"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Test</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Name</label>
                  <input
                    type="text"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="full_mock">Full Mock</option>
                    <option value="subject_wise">Subject Wise</option>
                    <option value="topic_wise">Topic Wise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks per Question</label>
                  <input
                    type="number"
                    value={formData.markingScheme.correct}
                    onChange={(e) => setFormData({ ...formData, markingScheme: { ...formData.markingScheme, correct: parseInt(e.target.value) } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Negative Marking</label>
                  <input
                    type="number"
                    value={formData.markingScheme.negative}
                    onChange={(e) => setFormData({ ...formData, markingScheme: { ...formData.markingScheme, negative: parseFloat(e.target.value) } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    step="0.25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Creation Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manual"
                      checked={creationMethod === 'manual'}
                      onChange={(e) => setCreationMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Manual Selection</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={creationMethod === 'csv'}
                      onChange={(e) => setCreationMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Upload CSV</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Average Marks (Optional)</label>
                  <input
                    type="number"
                    value={formData.expectedAvgMarks}
                    onChange={(e) => setFormData({ ...formData, expectedAvgMarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Code *</label>
                  <input
                    type="password"
                    value={formData.secretCode}
                    onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="Enter your secret code"
                  />
                </div>
              </div>

              {creationMethod === 'csv' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload CSV File *</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    CSV columns: question, option1, option2, option3, option4, correctAnswer (1-4), subject, topic, difficulty
                  </p>
                  {csvError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{csvError}</p>}
                  {csvData.length > 0 && <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ {csvData.length} questions loaded</p>}
                </div>
              )}

              {creationMethod === 'manual' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Questions ({selectedQuestions.length} selected)
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={questionFilter.subject}
                        onChange={(e) => setQuestionFilter({ ...questionFilter, subject: e.target.value })}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={questionFilter.search}
                        onChange={(e) => setQuestionFilter({ ...questionFilter, search: e.target.value })}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-auto">
                    {filteredQuestions.map((q) => (
                      <div
                        key={q._id}
                        onClick={() => toggleQuestionSelection(q._id)}
                        className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedQuestions.includes(q._id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(q._id)}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{q.question}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {q.subject} | {q.topic} | {q.difficulty}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  Create Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSecretCodePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enter Secret Code</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please enter the secret code to access this test.</p>
            <input
              type="password"
              value={attemptCode}
              onChange={(e) => {
                setAttemptCode(e.target.value);
                setCodeError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmSecretCode();
                }
              }}
              placeholder="Enter secret code..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 mb-4"
              autoFocus
            />
            {codeError && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{codeError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSecretCodePrompt(false);
                  setAttemptCode('');
                  setCodeError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSecretCode}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
