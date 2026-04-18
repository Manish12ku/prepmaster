import React, { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Clock, FileText, BookOpen } from 'lucide-react';
import { bulkUploadQuestions } from '../../services/questionService';
import { createTest, getAllTests, deleteTest } from '../../services/testService';

const Questions = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTestName, setUploadTestName] = useState('');
  const [uploadTestType, setUploadTestType] = useState('full_mock');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [expectedAvgMarks, setExpectedAvgMarks] = useState('');
  const [uploadSecretCode, setUploadSecretCode] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await getAllTests();
      setTests(response.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await deleteTest(id);
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Error deleting test: ' + error.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTestName) return;
    if (!uploadSecretCode.trim()) {
      alert('Secret code is required');
      return;
    }
    try {
      // Parse CSV and create test directly (don't save questions separately)
      const uploadResponse = await bulkUploadQuestions(uploadFile);
      const uploadedQuestions = uploadResponse.questions || [];
      const errors = uploadResponse.errors || [];
      
      // Show errors if any
      if (errors.length > 0) {
        const errorMsg = errors.slice(0, 5).map(e => `Row ${e.row}: ${e.error}`).join('\n');
        const moreErrors = errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : '';
        alert(`CSV parsing warnings:\n${errorMsg}${moreErrors}`);
      }
      
      if (uploadedQuestions.length === 0) {
        alert('No valid questions found in CSV. Please check the format.');
        return;
      }
      
      // Calculate total duration in minutes
      const totalDuration = (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0);
      
      // Create a test with the uploaded questions (embedded, not referenced)
      const testData = {
        testName: uploadTestName,
        type: uploadTestType,
        subject: uploadSubject || 'General',
        topic: uploadTestType === 'topic_wise' ? uploadTopic : 'General',
        duration: totalDuration || uploadedQuestions.length * 2, // Use custom duration or default
        questions: uploadedQuestions, // Pass full question objects
        markingScheme: {
          correct: parseFloat(marksPerQuestion) || 1,
          negative: parseFloat(negativeMarks) || 0
        },
        expectedAvgMarks: expectedAvgMarks ? parseFloat(expectedAvgMarks) : null,
        secretCode: uploadSecretCode.trim()
      };
      
      await createTest(testData);
      alert(`Successfully created test "${uploadTestName}" with ${uploadedQuestions.length} questions`);
      
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTestName('');
      setUploadTestType('full_mock');
      setUploadTopic('');
      setUploadSubject('');
      setMarksPerQuestion(1);
      setNegativeMarks(0);
      setDurationHours(0);
      setDurationMinutes(30);
      setExpectedAvgMarks('');
      setUploadSecretCode('');
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Error creating test: ' + error.message);
    }
  };

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

  const filteredTests = tests.filter(t => {
    if (searchTerm && !t.testName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tests</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          <Upload size={18} />
          <span>Add Test</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  {test.questions?.length || 0} questions
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {test.testName}
              </h3>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Clock size={16} className="mr-1" />
                <span>{test.duration} minutes</span>
                <span className="mx-2">•</span>
                <span>{test.totalMarks} marks</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {test.subject}
                </div>
                <button
                  onClick={() => handleDeleteTest(test._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tests created yet. Click "Add Test" to create one.</p>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Test from CSV</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload a CSV file with columns: question, option1, option2, option3, option4, correctAnswer, subject, topic, difficulty
            </p>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Name *</label>
                <input
                  type="text"
                  value={uploadTestName}
                  onChange={(e) => setUploadTestName(e.target.value)}
                  placeholder="Enter test name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Type *</label>
                <select
                  value={uploadTestType}
                  onChange={(e) => setUploadTestType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="full_mock">Full Mock Test</option>
                  <option value="subject_wise">Subject Wise Test</option>
                  <option value="topic_wise">Topic Wise Test</option>
                </select>
              </div>
              
              {uploadTestType === 'subject_wise' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}
              
              {uploadTestType === 'topic_wise' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      placeholder="e.g., Mathematics"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic *</label>
                    <input
                      type="text"
                      value={uploadTopic}
                      onChange={(e) => setUploadTopic(e.target.value)}
                      placeholder="e.g., Algebra"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks per correct answer *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Negative marks (optional)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Average Marks (for Selection Chances)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={expectedAvgMarks}
                  onChange={(e) => setExpectedAvgMarks(e.target.value)}
                  placeholder="e.g., 25"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Used to calculate selection chances. Leave empty to skip.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Hours"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Hours</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Minutes"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Minutes</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Code *</label>
                <input
                  type="password"
                  value={uploadSecretCode}
                  onChange={(e) => setUploadSecretCode(e.target.value)}
                  placeholder="Enter your secret code"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CSV File *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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
    </div>
  );
};

export default Questions;
