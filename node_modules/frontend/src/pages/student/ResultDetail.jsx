import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle, Clock, Target, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { getResultById } from '../../services/resultService';

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [result, setResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const response = await getResultById(resultId);
      setResult(response.result);
      setAnalysis(response.analysis);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Result not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(from || -1, { state: location.state })}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {result.testId?.testName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Score"
          value={`${result.score}/${result.totalMarks}`}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Accuracy"
          value={`${result.accuracy}%`}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Time Taken"
          value={formatTime(result.timeTaken)}
          color="purple"
        />
        <StatCard
          icon={CheckCircle}
          label="Correct"
          value={`${result.correctCount}/${result.answers.length}`}
          color="orange"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {['summary', 'questions', 'analysis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correctCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="mx-auto text-red-600 dark:text-red-400 mb-2" size={24} />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.incorrectCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MinusCircle className="mx-auto text-gray-600 dark:text-gray-400 mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{result.unattemptedCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unattempted</p>
                </div>
              </div>

              {/* Selection Chances Section */}
              {result.testId?.expectedAvgMarks && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-3">
                    <Award size={20} />
                    <h3 className="font-semibold">Selection Chances</h3>
                  </div>
                  {(() => {
                    const percentage = (result.score / result.testId.expectedAvgMarks) * 100;
                    let status = 'Weak';
                    let colorClass = 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
                    if (percentage >= 120) {
                      status = 'Very Strong';
                      colorClass = 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
                    } else if (percentage >= 90) {
                      status = 'Strong';
                      colorClass = 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
                    } else if (percentage >= 70) {
                      status = 'Moderate';
                      colorClass = 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
                    }
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Your Score vs Expected Avg</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{result.score} / {result.testId.expectedAvgMarks}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percentage >= 120 ? 'bg-green-500' :
                              percentage >= 90 ? 'bg-blue-500' :
                              percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-4 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                            {status}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(1)}% of expected average
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Selection Chances - Based on Expected Score % */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 mb-4">
                  <Award size={24} />
                  <h3 className="font-bold text-lg">Selection Chances</h3>
                </div>
                {(() => {
                  const totalMarks = result.totalMarks || (result.answers.length * (result.testId?.markingScheme?.correct || 1));
                  const attemptedCount = result.correctCount + result.incorrectCount;
                  const expectedScorePercentage = totalMarks > 0 ? (result.score / totalMarks) * 100 : 0;
                  const accuracyPercentage = attemptedCount > 0 ? (result.correctCount / attemptedCount) * 100 : 0;
                  
                  let selectionLevel = 'Low';
                  let selectionRange = '0-50%';
                  let selectionColor = 'bg-red-500';
                  let selectionBg = 'bg-red-100 text-red-700';
                  
                  if (expectedScorePercentage >= 80) {
                    selectionLevel = 'High';
                    selectionRange = '80-100%';
                    selectionColor = 'bg-green-500';
                    selectionBg = 'bg-green-100 text-green-700';
                  } else if (expectedScorePercentage >= 50) {
                    selectionLevel = 'Medium';
                    selectionRange = '50-80%';
                    selectionColor = 'bg-yellow-500';
                    selectionBg = 'bg-yellow-100 text-yellow-700';
                  }
                  
                  return (
                    <div className="space-y-4">
                      {/* Expected Score */}
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Expected Score</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{result.score} / {totalMarks}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div className={`h-full ${selectionColor} rounded-full transition-all duration-500`} style={{ width: `${Math.min(expectedScorePercentage, 100)}%` }}></div>
                        </div>
                        <p className="text-right text-sm text-gray-500 mt-1">{expectedScorePercentage.toFixed(1)}%</p>
                      </div>
                      
                      {/* Accuracy */}
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{accuracyPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(accuracyPercentage, 100)}%` }}></div>
                        </div>
                        <p className="text-right text-sm text-gray-500 mt-1">{result.correctCount}/{attemptedCount} correct</p>
                      </div>
                      
                      {/* Selection Probability */}
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Selection Probability</span>
                          <span className={`px-4 py-1 rounded-full text-sm font-bold ${selectionBg}`}>
                            {selectionLevel}
                          </span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${selectionColor} transition-all duration-700`} 
                            style={{ width: `${Math.min(expectedScorePercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>80%</span>
                          <span>100%</span>
                        </div>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                          {selectionRange} chance of selection
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {result.answers.map((answer, index) => {
                const userAnswerText = answer.selectedOption !== null 
                  ? answer.options?.[answer.selectedOption] 
                  : null;
                const correctAnswerText = answer.options?.[answer.correctAnswer];
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      answer.isCorrect
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
                        : answer.selectedOption !== null
                        ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Question Text */}
                        <p className="font-medium text-gray-900 dark:text-white mb-3">
                          Q{index + 1}. {answer.question}
                        </p>
                        
                        {/* Options Display */}
                        <div className="space-y-1 mb-3">
                          {answer.options?.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`text-sm px-3 py-1 rounded ${
                                optIndex === answer.correctAnswer
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : optIndex === answer.selectedOption && !answer.isCorrect
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === answer.correctAnswer && ' ✓'}
                              {optIndex === answer.selectedOption && !answer.isCorrect && ' ✗'}
                            </div>
                          ))}
                        </div>
                        
                        {/* Answer Summary */}
                        <div className="space-y-1 text-sm border-t border-gray-200 dark:border-gray-600 pt-2">
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Your Answer:</span>{' '}
                            {userAnswerText ? (
                              <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {userAnswerText} {answer.isCorrect ? '✅' : '❌'}
                              </span>
                            ) : (
                              <span className="text-gray-500">⏳ Not Attempted</span>
                            )}
                          </p>
                          <p className="text-green-600 dark:text-green-400">
                            <span className="font-medium">Correct Answer:</span> {correctAnswerText}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">
                            Time: {formatTime(answer.timeSpent)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {answer.isCorrect ? (
                          <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                        ) : answer.selectedOption !== null ? (
                          <XCircle className="text-red-600 dark:text-red-400" size={24} />
                        ) : (
                          <MinusCircle className="text-gray-400" size={24} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Performance Overview Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Distribution Pie Chart */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Distribution</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                        {/* Correct segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="20"
                          strokeDasharray={`${(result.correctCount / result.answers.length) * 251.2} 251.2`}
                        />
                        {/* Incorrect segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="20"
                          strokeDasharray={`${(result.incorrectCount / result.answers.length) * 251.2} 251.2`}
                          strokeDashoffset={`-${(result.correctCount / result.answers.length) * 251.2}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Correct ({result.correctCount})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Incorrect ({result.incorrectCount})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unattempted ({result.unattemptedCount})</span>
                    </div>
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Total Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatTime(result.timeTaken)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Avg Time per Question</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatTime(Math.round(result.timeTaken / result.answers.length))}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Time Efficiency: <span className="font-medium text-gray-900 dark:text-white">
                          {result.timeTaken < result.answers.length * 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Trend (if historical data available) */}
              {result.historicalResults && result.historicalResults.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trend</h3>
                  <div className="h-40 flex items-end space-x-2">
                    {result.historicalResults.map((hist, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary-500 rounded-t"
                          style={{ height: `${(hist.score / hist.totalMarks) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">Test {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
