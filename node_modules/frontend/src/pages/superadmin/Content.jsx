import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Filter, AlertCircle } from 'lucide-react';
import { getAllQuestions, approveQuestion, deleteQuestion } from '../../services/questionService';

const Content = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ status: 'pending' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await getAllQuestions();
      setQuestions(response.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveQuestion(id, true);
      fetchQuestions();
    } catch (error) {
      console.error('Error approving question:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await approveQuestion(id, false);
      fetchQuestions();
    } catch (error) {
      console.error('Error rejecting question:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this question?')) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter.status === 'pending' && q.isApproved) return false;
    if (filter.status === 'approved' && !q.isApproved) return false;
    if (searchTerm && !q.question.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = questions.filter(q => !q.isApproved).length;
  const approvedCount = questions.filter(q => q.isApproved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Control</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{pendingCount}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">Approved</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{approvedCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question._id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
              question.isApproved ? 'border-green-500' : 'border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {!question.isApproved && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Pending
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {question.subject}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {question.topic}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-4">{question.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        index === question.correctAnswer
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                      {index === question.correctAnswer && ' ✓'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created by: {question.createdBy?.name || 'Unknown'} on {new Date(question.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {!question.isApproved ? (
                  <>
                    <button
                      onClick={() => handleApprove(question._id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(question._id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleReject(question._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 rounded-lg transition-colors"
                  >
                    <AlertCircle size={16} />
                    <span>Unapprove</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(question._id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No questions found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
