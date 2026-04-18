const Test = require('../models/Test');
const Question = require('../models/Question');
const User = require('../models/User');
const { isConnected } = require('../config/database');

// Mock data for development
let mockTests = [
  { _id: '1', testName: 'Mathematics Basics', type: 'subject', subject: 'Mathematics', topic: 'Basic Math', duration: 30, totalMarks: 10, isActive: true, questions: ['1', '2'], createdBy: { name: 'Admin' } },
  { _id: '2', testName: 'Geography Quiz', type: 'subject', subject: 'Geography', topic: 'Capitals', duration: 20, totalMarks: 5, isActive: true, questions: ['2'], createdBy: { name: 'Admin' } }
];
let mockTestId = 3;

const createTest = async (req, res) => {
  try {
    const { testName, type, questions, markingScheme, duration, secretCode, expectedAvgMarks } = req.body;
    
    if (!secretCode || !secretCode.trim()) {
      return res.status(400).json({ message: 'Secret code is required' });
    }
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const totalMarks = questions.length * (markingScheme?.correct || 1);
      const newTest = {
        _id: String(mockTestId++),
        testName,
        type,
        questions,
        markingScheme: markingScheme || { correct: 1, negative: 0 },
        duration,
        totalMarks,
        secretCode,
        expectedAvgMarks: expectedAvgMarks || null,
        isActive: true,
        createdBy: { name: 'Mock Admin' }
      };
      mockTests.push(newTest);
      return res.status(201).json({
        success: true,
        test: newTest,
        message: 'Test created successfully'
      });
    }
    
    const user = await User.findOne({ uid: req.user.uid });
    
    const totalMarks = questions.length * (markingScheme?.correct || 1);
    
    const newTest = await Test.create({
      testName,
      type,
      questions,
      markingScheme: markingScheme || { correct: 1, negative: 0 },
      duration,
      totalMarks,
      secretCode,
      expectedAvgMarks: expectedAvgMarks || null,
      createdBy: user._id
    });
    
    const populatedTest = await Test.findById(newTest._id)
      .populate('questions')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      test: populatedTest
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTests = async (req, res) => {
  try {
    const { type, subject, topic, isActive } = req.query;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      let tests = [...mockTests];
      if (type) tests = tests.filter(t => t.type === type);
      if (subject) tests = tests.filter(t => t.subject === subject);
      if (topic) tests = tests.filter(t => t.topic === topic);
      if (isActive !== undefined) tests = tests.filter(t => t.isActive === (isActive === 'true'));
      return res.status(200).json({ success: true, tests });
    }
    
    let query = {};
    
    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const tests = await Test.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const test = mockTests.find(t => t._id === id);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      return res.status(200).json({ success: true, test });
    }
    
    const test = await Test.findById(id)
      .populate('createdBy', 'name email');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(200).json({ success: true, test });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.questions && updates.markingScheme) {
      updates.totalMarks = updates.questions.length * updates.markingScheme.correct;
    }
    
    const test = await Test.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('questions').populate('createdBy', 'name email');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(200).json({ success: true, test });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await Test.findByIdAndDelete(id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(200).json({ success: true, message: 'Test deleted' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAvailableTests = async (req, res) => {
  try {
    const { type, subject, topic } = req.query;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      let tests = mockTests.filter(t => t.isActive);
      if (type) tests = tests.filter(t => t.type === type);
      if (subject) tests = tests.filter(t => t.subject === subject);
      if (topic) tests = tests.filter(t => t.topic === topic);
      
      const testsWithCounts = tests.map(test => ({
        ...test,
        questionCount: test.questions.length
      }));
      
      return res.status(200).json({ success: true, tests: testsWithCounts });
    }
    
    let query = { isActive: true };
    
    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    
    const tests = await Test.find(query)
      .select('testName type subject topic duration totalMarks questions createdBy')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    const testsWithCounts = tests.map(test => ({
      ...test.toObject(),
      questionCount: test.questions.length
    }));
    
    res.status(200).json({ success: true, tests: testsWithCounts });
  } catch (error) {
    console.error('Get available tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTestForAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const secretCode = req.query.secretCode;

    if (!isConnected()) {
      const test = mockTests.find(t => t._id === id);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      // Everyone must provide the correct secret code
      if (!secretCode || secretCode !== test.secretCode) {
        return res.status(403).json({ message: 'Invalid secret code' });
      }

      // Get questions for this test from mockQuestions
      const testQuestions = test.questions.map(qid => {
        const q = mockQuestions.find(mq => mq._id === qid);
        return q ? {
          _id: q._id,
          question: q.question,
          options: q.options,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty
        } : null;
      }).filter(Boolean);

      return res.status(200).json({
        success: true,
        test: {
          ...test,
          questions: testQuestions
        }
      });
    }

    const test = await Test.findById(id)
      .select('testName type duration totalMarks markingScheme questions secretCode');

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    // Everyone must provide the correct secret code
    if (!secretCode || secretCode !== test.secretCode) {
      return res.status(403).json({ message: 'Invalid secret code' });
    }

    // Questions are now embedded, no need to populate
    // Just remove correctAnswer from each question for the attempt
    const testObj = test.toObject();
    delete testObj.secretCode;
    testObj.questions = testObj.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    res.status(200).json({ success: true, test: testObj });
  } catch (error) {
    console.error('Get test for attempt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getAvailableTests,
  getTestForAttempt,
  mockTests
};
