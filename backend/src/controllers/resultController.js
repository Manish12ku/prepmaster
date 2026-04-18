const Result = require('../models/Result');
const Test = require('../models/Test');
const User = require('../models/User');
const { updateMonthlyPerformance } = require('./monthlyPerformanceController');
const { isConnected } = require('../config/database');

// Mock results store
let mockResults = [];
let mockResultId = 1;

const submitResult = async (req, res) => {
  try {
    const { testId, answers, timeTaken } = req.body;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const test = mockTests.find(t => t._id === testId);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      let score = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      
      // Create a map of question details from the test
      const questionDetailsMap = new Map();
      test.questions.forEach(q => {
        questionDetailsMap.set(q._id.toString(), {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      });
      
      const processedAnswers = answers.map(answer => {
        const qDetails = questionDetailsMap.get(answer.questionId.toString());
        const isCorrect = answer.selectedOption === qDetails?.correctAnswer;
        const isAttempted = answer.selectedOption !== null && answer.selectedOption !== undefined;
        
        if (isCorrect) {
          score += 1;
          correctCount++;
        } else if (isAttempted) {
          incorrectCount++;
        } else {
          unattemptedCount++;
        }
        
        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          timeSpent: answer.timeSpent || 0,
          isMarkedForReview: answer.isMarkedForReview || false,
          // Store question details for display
          question: qDetails?.question || 'Question not found',
          options: qDetails?.options || [],
          correctAnswer: qDetails?.correctAnswer ?? 0
        };
      });
      
      const attemptedCount = correctCount + incorrectCount;
      const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
      
      const result = {
        _id: String(mockResultId++),
        userId: req.dbUser?._id || 'mock-user',
        testId: { testName: test.testName },
        answers: processedAnswers,
        score,
        totalMarks: test.totalMarks,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy: Math.round(accuracy * 100) / 100,
        timeTaken,
        createdAt: new Date()
      };
      
      mockResults.push(result);
      
      return res.status(201).json({
        success: true,
        result
      });
    }
    
    const user = await User.findOne({ uid: req.user.uid });
    const test = await Test.findById(testId);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    // Create a map of questionId to correctAnswer from the test
    const correctAnswerMap = new Map();
    test.questions.forEach(q => {
      correctAnswerMap.set(q._id.toString(), q.correctAnswer);
    });
    
    // Create a map of question details from the test
    const questionDetailsMap = new Map();
    test.questions.forEach(q => {
      questionDetailsMap.set(q._id.toString(), {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        topic: q.topic
      });
    });
    
    const processedAnswers = answers.map(answer => {
      // Look up correct answer from the test (not from frontend)
      const correctAnswer = correctAnswerMap.get(answer.questionId.toString());
      const isCorrect = answer.selectedOption === correctAnswer;
      const isAttempted = answer.selectedOption !== null && answer.selectedOption !== undefined;
      
      if (isCorrect) {
        score += test.markingScheme.correct;
        correctCount++;
      } else if (isAttempted) {
        score -= test.markingScheme.negative;
        incorrectCount++;
      } else {
        unattemptedCount++;
      }
      
      // Get question details
      const qDetails = questionDetailsMap.get(answer.questionId.toString());
      
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        isMarkedForReview: answer.isMarkedForReview || false,
        // Store question details directly for display
        question: qDetails?.question || 'Question not found',
        options: qDetails?.options || [],
        correctAnswer: qDetails?.correctAnswer ?? 0
      };
    });
    
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    
    const result = await Result.create({
      userId: user._id,
      testId,
      answers: processedAnswers,
      score,
      totalMarks: test.totalMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy: Math.round(accuracy * 100) / 100,
      timeTaken,
      perQuestionTime: answers.map(a => a.timeSpent || 0)
    });
    
    // Update monthly performance for the current month
    const currentDate = new Date();
    await updateMonthlyPerformance(user._id, currentDate.getFullYear(), currentDate.getMonth());
    
    const populatedResult = await Result.findById(result._id)
      .populate('testId', 'testName')
      .populate('answers.questionId', 'question options correctAnswer subject topic');
    
    res.status(201).json({
      success: true,
      result: populatedResult
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    if (user._id.toString() !== userId && !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const results = await Result.find({ userId })
      .populate('testId', 'testName type subject topic duration totalMarks')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResultsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });

    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mock mode without MongoDB
    if (!isConnected()) {
      const results = mockResults
        .filter(result => result.testId === testId || result.testId?._id === testId)
        .map(result => ({
          ...result,
          userId: result.userId || { name: 'Mock Student', email: 'student@example.com' },
          testId: result.testId || { testName: 'Unknown Test' }
        }))
        .reverse();
      return res.status(200).json({ success: true, results });
    }

    const results = await Result.find({ testId })
      .populate('userId', 'name email')
      .populate('testId', 'testName type subject topic duration totalMarks')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Get results by test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    
    const result = await Result.findById(id)
      .populate('testId', 'testName type subject topic duration totalMarks markingScheme');
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    if (result.userId.toString() !== user._id.toString() && !['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Fetch test to get question details if missing in result
    const test = await Test.findById(result.testId);
    const questionMap = new Map();
    if (test && test.questions) {
      test.questions.forEach(q => {
        questionMap.set(q._id.toString(), {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topic: q.topic || 'General'
        });
      });
    }
    
    // Enrich answers with question details from test if missing
    const enrichedAnswers = result.answers.map(answer => {
      const qDetails = questionMap.get(answer.questionId);
      if (qDetails && (!answer.question || answer.question === 'Question not found')) {
        return {
          ...answer.toObject(),
          question: qDetails.question,
          options: qDetails.options,
          correctAnswer: qDetails.correctAnswer
        };
      }
      return answer.toObject();
    });
    
    // Create result object with enriched answers
    const resultObj = result.toObject();
    resultObj.answers = enrichedAnswers;
    
    const topicAnalysis = {};
    enrichedAnswers.forEach(answer => {
      const qDetails = questionMap.get(answer.questionId);
      const topic = qDetails?.topic || 'Unknown';
      if (!topicAnalysis[topic]) {
        topicAnalysis[topic] = { correct: 0, incorrect: 0, total: 0 };
      }
      topicAnalysis[topic].total++;
      if (answer.isCorrect) {
        topicAnalysis[topic].correct++;
      } else if (answer.selectedOption !== null) {
        topicAnalysis[topic].incorrect++;
      }
    });
    
    const weakTopics = [];
    const strongTopics = [];
    
    Object.entries(topicAnalysis).forEach(([topic, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 50) {
        weakTopics.push({ topic, accuracy: Math.round(accuracy), ...stats });
      } else if (accuracy >= 70) {
        strongTopics.push({ topic, accuracy: Math.round(accuracy), ...stats });
      }
    });
    
    res.status(200).json({
      success: true,
      result: resultObj,
      analysis: {
        topicAnalysis,
        weakTopics,
        strongTopics
      }
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlatformAnalytics = async (req, res) => {
  try {
    // Mock mode without MongoDB
    if (!isConnected()) {
      const { mockUsers } = require('./userController');
      const { mockTests } = require('./testController');
      
      const users = Array.from(mockUsers.values());
      const userRoleStats = [
        { _id: 'student', count: users.filter(u => u.role === 'student').length },
        { _id: 'admin', count: users.filter(u => u.role === 'admin').length },
        { _id: 'super_admin', count: users.filter(u => u.role === 'super_admin').length }
      ].filter(s => s.count > 0);
      
      const avgScore = mockResults.length > 0 
        ? mockResults.reduce((sum, r) => sum + r.score, 0) / mockResults.length 
        : 0;
      const avgAccuracy = mockResults.length > 0 
        ? mockResults.reduce((sum, r) => sum + r.accuracy, 0) / mockResults.length 
        : 0;
      
      return res.status(200).json({
        success: true,
        analytics: {
          totalUsers: users.length || 1,
          totalTests: mockTests.length,
          totalResults: mockResults.length,
          userRoleStats,
          averageScore: avgScore,
          averageAccuracy: avgAccuracy,
          recentResults: mockResults.slice(-10).reverse(),
          subjectStats: []
        }
      });
    }
    
    const totalUsers = await User.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalResults = await Result.countDocuments();
    
    const userRoleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const avgScore = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    
    const avgAccuracy = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$accuracy' } } }
    ]);
    
    const recentTests = await Result.find()
      .populate('testId', 'testName')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const subjectStats = await Result.aggregate([
      { $lookup: { from: 'tests', localField: 'testId', foreignField: '_id', as: 'test' } },
      { $unwind: '$test' },
      { $group: { _id: '$test.subject', avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalTests,
        totalResults,
        userRoleStats,
        averageScore: avgScore[0]?.avg || 0,
        averageAccuracy: avgAccuracy[0]?.avg || 0,
        recentResults: recentTests,
        subjectStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const results = await Result.find({ userId })
      .populate('testId', 'testName subject')
      .sort({ createdAt: -1 });
    
    const totalTests = results.length;
    const avgScore = totalTests > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalTests : 0;
    const avgAccuracy = totalTests > 0 ? results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests : 0;
    
    const subjectPerformance = {};
    results.forEach(result => {
      const subject = result.testId?.subject || 'Unknown';
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { scores: [], accuracies: [] };
      }
      subjectPerformance[subject].scores.push(result.score);
      subjectPerformance[subject].accuracies.push(result.accuracy);
    });
    
    const subjectStats = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      avgAccuracy: data.accuracies.reduce((a, b) => a + b, 0) / data.accuracies.length,
      testsTaken: data.scores.length
    }));
    
    res.status(200).json({
      success: true,
      performance: {
        totalTests,
        avgScore: Math.round(avgScore * 100) / 100,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        subjectStats,
        recentResults: results.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPausedResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const user = req.dbUser || await User.findOne({ uid: req.user.uid });
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const result = mockResults.find(r => r.userId === user._id && r.testId === testId && r.paused);
      if (result) {
        return res.status(200).json({ success: true, result });
      }
      return res.status(404).json({ message: 'No paused result found' });
    }
    
    const result = await Result.findOne({ 
      userId: user._id, 
      testId, 
      paused: true 
    }).populate('testId');
    
    if (!result) {
      return res.status(404).json({ message: 'No paused result found' });
    }
    
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Get paused result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const savePausedResult = async (req, res) => {
  try {
    const { testId, answers, timeRemaining, questionTimes, markedForReview } = req.body;
    const user = req.dbUser || await User.findOne({ uid: req.user.uid });
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      let result = mockResults.find(r => r.userId === user._id && r.testId === testId);
      if (!result) {
        result = {
          _id: String(mockResultId++),
          userId: user._id,
          testId,
          answers: [],
          paused: true,
          pausedAt: new Date()
        };
        mockResults.push(result);
      }
      result.pauseData = {
        answers,
        timeRemaining,
        questionTimes,
        markedForReview
      };
      result.timeRemaining = timeRemaining;
      result.questionTimes = questionTimes;
      result.markedForReview = markedForReview;
      result.paused = true;
      result.pausedAt = new Date();
      return res.status(200).json({ success: true, result });
    }
    
    let result = await Result.findOne({ userId: user._id, testId });
    if (!result) {
      result = new Result({
        userId: user._id,
        testId,
        answers: [],
        score: 0,
        totalMarks: 0,
        correctCount: 0,
        incorrectCount: 0,
        unattemptedCount: 0,
        accuracy: 0,
        timeTaken: 0,
        paused: true,
        pausedAt: new Date(),
        pauseData: {
          answers,
          timeRemaining,
          questionTimes,
          markedForReview
        }
      });
    } else {
      result.pauseData = {
        answers,
        timeRemaining,
        questionTimes,
        markedForReview
      };
    }
    
    result.timeRemaining = timeRemaining;
    result.questionTimes = questionTimes;
    result.markedForReview = markedForReview;
    result.paused = true;
    result.pausedAt = new Date();
    
    await result.save();
    
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Save paused result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitResult,
  getUserResults,
  getResultsByTest,
  getResultById,
  getPlatformAnalytics,
  getStudentPerformance,
  getPausedResult,
  savePausedResult
};
