const Question = require('../models/Question');
const User = require('../models/User');
const { isConnected } = require('../config/database');
const mongoose = require('mongoose');

// Mock data for development
let mockQuestions = [
  { _id: '1', question: 'What is 2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1, subject: 'Mathematics', topic: 'Basic Math', difficulty: 'easy', isApproved: true, createdBy: { name: 'Admin' } },
  { _id: '2', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2, subject: 'Geography', topic: 'Capitals', difficulty: 'easy', isApproved: true, createdBy: { name: 'Admin' } }
];
let mockQuestionId = 3;

const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, subject, topic, difficulty, modelAnswer } = req.body;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const newQuestion = {
        _id: String(mockQuestionId++),
        question,
        options,
        correctAnswer,
        subject,
        topic,
        difficulty,
        modelAnswer,
        isApproved: true,
        createdBy: { name: 'Mock Admin' }
      };
      mockQuestions.push(newQuestion);
      return res.status(201).json({
        success: true,
        question: newQuestion
      });
    }
    
    const user = await User.findOne({ uid: req.user.uid });
    
    const newQuestion = await Question.create({
      question,
      options,
      correctAnswer,
      subject,
      topic,
      difficulty,
      modelAnswer,
      createdBy: user._id,
      isApproved: user.role === 'super_admin'
    });
    
    res.status(201).json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, isApproved, search } = req.query;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      let questions = [...mockQuestions];
      if (subject) questions = questions.filter(q => q.subject === subject);
      if (topic) questions = questions.filter(q => q.topic === topic);
      if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
      if (search) questions = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()));
      return res.status(200).json({ success: true, questions });
    }
    
    let query = {};
    
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }
    
    const questions = await Question.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const question = mockQuestions.find(q => q._id === id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      return res.status(200).json({ success: true, question });
    }
    
    const question = await Question.findById(id).populate('createdBy', 'name email');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const index = mockQuestions.findIndex(q => q._id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Question not found' });
      }
      mockQuestions[index] = { ...mockQuestions[index], ...updates };
      return res.status(200).json({ success: true, question: mockQuestions[index] });
    }
    
    const question = await Question.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock mode without MongoDB
    if (!isConnected()) {
      const index = mockQuestions.findIndex(q => q._id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Question not found' });
      }
      mockQuestions.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Question deleted' });
    }
    
    const question = await Question.findByIdAndDelete(id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    const question = await Question.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error('Approve question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const csv = require('csv-parser');
    const fs = require('fs');
    
    const results = [];
    const errors = [];
    
    // Mock mode without MongoDB - just parse and return success
    if (!isConnected()) {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          fs.unlinkSync(req.file.path);
          
          // Add mock questions from CSV
          for (let i = 0; i < results.length && i < 5; i++) {
            const row = results[i];
            if (row.question && row.option1) {
              mockQuestions.push({
                _id: String(mockQuestionId++),
                question: row.question,
                options: [row.option1, row.option2, row.option3, row.option4],
                correctAnswer: parseInt(row.correctAnswer) || 0,
                subject: row.subject || 'General',
                topic: row.topic || 'General',
                difficulty: row.difficulty || 'medium',
                isApproved: true,
                createdBy: { name: 'CSV Upload' }
              });
            }
          }
          
          res.status(201).json({
            success: true,
            message: `Uploaded ${Math.min(results.length, 5)} questions (mock mode)`,
            questions: mockQuestions.slice(-5),
            errors
          });
        });
      return;
    }
    
    // Wrap CSV parsing in a promise - don't save to Question collection, just parse
    const parseCSV = () => new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
    
    try {
      await parseCSV();
      const questions = [];
      
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        try {
          if (!row.question || !row.option1 || !row.option2 || !row.option3 || !row.option4) {
            errors.push({ row: i + 1, error: 'Missing required fields (question, options)' });
            continue;
          }
          
          // Parse correctAnswer - accept 1-4 (user-friendly) and convert to 0-3 internally
          let correctAnswer = null;
          const rawCorrectAnswer = row.correctAnswer;
          
          console.log(`Row ${i + 1}: raw correctAnswer = "${rawCorrectAnswer}"`);
          
          if (rawCorrectAnswer !== undefined && rawCorrectAnswer !== null && rawCorrectAnswer !== '') {
            const parsed = parseInt(rawCorrectAnswer);
            console.log(`Row ${i + 1}: parsed = ${parsed}, isNaN = ${isNaN(parsed)}`);
            
            if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
              correctAnswer = parsed - 1; // Convert 1-4 to 0-3
              console.log(`Row ${i + 1}: Using 1-4 format, converted ${parsed} to ${correctAnswer}`);
            } else if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
              // Also accept 0-3 for backward compatibility
              correctAnswer = parsed;
              console.log(`Row ${i + 1}: Using 0-3 format, correctAnswer = ${correctAnswer}`);
            }
          }
          
          console.log(`Row ${i + 1}: final correctAnswer = ${correctAnswer}`);
          
          if (correctAnswer === null) {
            errors.push({ row: i + 1, error: `Invalid correctAnswer: "${rawCorrectAnswer}". Use 1, 2, 3, or 4 (option number).` });
            continue;
          }
          
          // Create question object but DON'T save to database
          // Just return it for test creation
          const questionObj = {
            _id: new mongoose.Types.ObjectId().toString(), // Generate temporary ID
            question: row.question,
            options: [row.option1, row.option2, row.option3, row.option4],
            correctAnswer: correctAnswer,
            subject: row.subject || 'General',
            topic: row.topic || 'General',
            difficulty: row.difficulty || 'medium',
            modelAnswer: row.modelAnswer || null
          };
          
          questions.push(questionObj);
        } catch (err) {
          errors.push({ row: i + 1, error: err.message });
        }
      }
      
      fs.unlinkSync(req.file.path);
      
      res.status(201).json({
        success: true,
        message: `Parsed ${questions.length} questions for test creation`,
        questions,
        errors
      });
    } catch (parseError) {
      console.error('CSV parse error:', parseError);
      res.status(500).json({ message: 'Error parsing CSV file', error: parseError.message });
    }
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    // Mock mode without MongoDB
    if (!isConnected()) {
      const subjects = [...new Set(mockQuestions.map(q => q.subject))];
      return res.status(200).json({ success: true, subjects });
    }
    
    const subjects = await Question.distinct('subject');
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTopicsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const topics = await Question.distinct('topic', { subject });
    res.status(200).json({ success: true, topics });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  bulkUploadQuestions,
  getSubjects,
  getTopicsBySubject
};
