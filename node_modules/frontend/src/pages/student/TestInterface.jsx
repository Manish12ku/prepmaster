import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';
import { getTestForAttempt } from '../../services/testService';
import { submitResult, getPausedResult, savePausedResult } from '../../services/resultService';

const TestInterface = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secretCode, setSecretCode] = useState(location.state?.secretCode || '');
  const [showSecretCodePrompt, setShowSecretCodePrompt] = useState(!location.state?.secretCode);
  const [secretCodeError, setSecretCodeError] = useState('');
  const [markedForReview, setMarkedForReview] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (secretCode) {
      fetchTest(secretCode);
    }
  }, [testId, secretCode]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadLocalPausedState = () => {
    try {
      const saved = localStorage.getItem(`pausedTest_${testId}`);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || parsed.timeRemaining == null) return null;
      return parsed;
    } catch (error) {
      console.error('Error reading paused test state from localStorage:', error);
      return null;
    }
  };

  const clearLocalPausedState = () => {
    localStorage.removeItem(`pausedTest_${testId}`);
  };

  const fetchTest = async (code) => {
    try {
      setLoading(true);
      setSecretCodeError('');
      
      const localState = loadLocalPausedState();
      if (localState) {
        const response = await getTestForAttempt(testId, code);
        setTest(response.test);
        setAnswers(localState.answers || {});
        setMarkedForReview(localState.markedForReview || {});
        setTimeRemaining(localState.timeRemaining);
        setQuestionTimes(localState.questionTimes || {});
        setQuestionStartTime(Date.now());
        setLoading(false);
        setShowSecretCodePrompt(false);
        return;
      }

      // First check for paused result
      try {
        const pausedResponse = await getPausedResult(testId);
        if (pausedResponse.success) {
          const pausedResult = pausedResponse.result;
          setTest(pausedResult.testId);
          setAnswers(pausedResult.pauseData?.answers || {});
          setMarkedForReview(pausedResult.pauseData?.markedForReview || {});
          setTimeRemaining(pausedResult.pauseData?.timeRemaining ?? pausedResult.testId.duration * 60);
          setQuestionTimes(pausedResult.pauseData?.questionTimes || {});
          setQuestionStartTime(Date.now());
          setLoading(false);
          return;
        }
      } catch (error) {
        // No paused result, continue to fetch test
      }
      
      const response = await getTestForAttempt(testId, code);
      setTest(response.test);
      setTimeRemaining(response.test.duration * 60);
      setQuestionStartTime(Date.now());
      setLoading(false);
      setShowSecretCodePrompt(false);
    } catch (error) {
      console.error('Error fetching test:', error);
      setLoading(false);
      
      if (error.response?.status === 403) {
        setSecretCodeError('Invalid secret code. Please try again.');
        setShowSecretCodePrompt(true);
        setSecretCode('');
        return;
      }
      
      setSecretCodeError('Error loading test. Please try again.');
      setShowSecretCodePrompt(true);
    }
  };

  const handleConfirmSecretCode = () => {
    if (!secretCode?.trim()) {
      setSecretCodeError('Secret code is required');
      return;
    }
    setSecretCodeError('');
    // Don't hide the prompt yet - let fetchTest handle it
    // The prompt will be hidden only after successful validation
    setSecretCode(secretCode.trim());
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleQuestionChange = (newIndex) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes({ ...questionTimes, [currentQuestion]: timeSpent });
    setCurrentQuestion(newIndex);
    setQuestionStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      handleQuestionChange(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      handleQuestionChange(currentQuestion - 1);
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview({
      ...markedForReview,
      [currentQuestion]: !markedForReview[currentQuestion]
    });
    setIsMenuOpen(false);
  };

  const clearAnswer = () => {
    setAnswers((prevAnswers) => {
      const nextAnswers = { ...prevAnswers };
      delete nextAnswers[currentQuestion];
      return nextAnswers;
    });
    setIsMenuOpen(false);
  };

  const togglePalette = () => {
    setIsPaletteOpen((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (!test) return;
    localStorage.setItem(`pausedTest_${testId}`, JSON.stringify({
      answers,
      markedForReview,
      questionTimes,
      timeRemaining,
      updatedAt: Date.now()
    }));
  }, [answers, markedForReview, questionTimes, timeRemaining, test, testId]);

  const handleSkip = () => {
    // Move to next question without answering
    if (currentQuestion < test.questions.length - 1) {
      handleQuestionChange(currentQuestion + 1);
    }
  };

  const handlePause = async () => {
    try {
      setShowSubmitConfirm(false);
      localStorage.setItem(`pausedTest_${testId}`, JSON.stringify({
        answers,
        markedForReview,
        questionTimes,
        timeRemaining,
        updatedAt: Date.now()
      }));
      await savePausedResult({
        testId,
        answers,
        timeRemaining,
        questionTimes,
        markedForReview
      });
      setIsPaused(true);
      alert('Test paused. You can resume later.');
      navigate('/student/tests', { replace: true });
    } catch (error) {
      console.error('Error pausing test:', error);
      alert('Error pausing test');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    const finalTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const finalQuestionTimes = { ...questionTimes, [currentQuestion]: finalTimeSpent };
    
    try {
      const totalTime = test.duration * 60 - timeRemaining;
      
      const formattedAnswers = test.questions.map((q, index) => ({
        questionId: q._id,
        selectedOption: answers[index] !== undefined ? answers[index] : null,
        correctAnswer: q.correctAnswer,
        timeSpent: finalQuestionTimes[index] || 0,
        isMarkedForReview: markedForReview[index] || false
      }));

      const result = await submitResult({
        testId,
        answers: formattedAnswers,
        timeTaken: totalTime
      });

      clearLocalPausedState();
      setShowSubmitConfirm(false);
      navigate(`/student/results/${result.result._id}`, { replace: true, state: { from: '/student/tests' } });
    } catch (error) {
      console.error('Error submitting test:', error);
      setSubmitting(false);
    }
  };

  // If secret code prompt should be shown, prioritize it
  if (showSecretCodePrompt && !test) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Enter the test secret code</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please provide the creator secret code to begin or resume this test.
          </p>
          <input
            type="password"
            value={secretCode}
            onChange={(e) => {
              setSecretCode(e.target.value);
              setSecretCodeError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirmSecretCode();
              }
            }}
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
            placeholder="Secret code"
          />
          {secretCodeError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{secretCodeError}</p>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate('/student/tests')}
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
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const isLastQuestion = currentQuestion === test.questions.length - 1;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{test.testName}</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Clock size={20} />
              <span className="font-mono text-lg font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Submit / Pause
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-gray-700 text-white text-sm font-medium rounded">
                  {currentQuestion + 1}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded ${
                  question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  question.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {question.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2 relative">
                <button
                  type="button"
                  onClick={toggleMarkForReview}
                  className={`p-2 rounded-lg transition-colors ${
                    markedForReview[currentQuestion]
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={markedForReview[currentQuestion] ? 'Unmark for review' : 'Mark for review'}
                >
                  <Flag size={20} />
                </button>
                <button
                  type="button"
                  onClick={togglePalette}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title={isPaletteOpen ? 'Hide question palette' : 'Show question palette'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="More question actions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-xl z-20">
                    <button
                      type="button"
                      onClick={toggleMarkForReview}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {markedForReview[currentQuestion] ? 'Unmark for review' : 'Mark for review'}
                    </button>
                    <button
                      type="button"
                      onClick={clearAnswer}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Clear answer
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Skip question
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                      answers[currentQuestion] === index
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      ({String.fromCharCode(65 + index)})
                    </div>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                    {answers[currentQuestion] === index && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium"
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={currentQuestion === test.questions.length - 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                  currentQuestion === test.questions.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <span>Skip</span>
              </button>

              <button
                onClick={isLastQuestion ? () => setShowSubmitConfirm(true) : handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
              >
                <span>{isLastQuestion ? 'Submit' : 'Next'}</span>
                {!isLastQuestion && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        </div>

        {isPaletteOpen && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-auto">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-medium">
                  {Object.keys(answers).length}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {test.questions.length - Object.keys(answers).length}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Not Answered</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((_, index) => {
                const isAnswered = answers[index] !== undefined;
                const isCurrent = currentQuestion === index;
                const isMarked = markedForReview[index];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionChange(index)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all border-2 ${
                      isCurrent
                        ? 'border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : isAnswered
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isMarked
                        ? 'border-yellow-400 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-500 bg-purple-100 dark:bg-purple-900 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-yellow-600 dark:text-yellow-400 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold">Submit Test?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have answered {Object.keys(answers).length} out of {test.questions.length} questions.
              {Object.keys(answers).length < test.questions.length && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                  Warning: You have {test.questions.length - Object.keys(answers).length} unanswered questions.
                </span>
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Continue Test
              </button>
              <button
                onClick={handlePause}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Pause and Exit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
