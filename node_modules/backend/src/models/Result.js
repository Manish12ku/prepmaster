const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  selectedOption: {
    type: Number,
    default: null
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  isMarkedForReview: {
    type: Boolean,
    default: false
  },
  // Embedded question details for display
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: Number,
    required: true
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  },
  unattemptedCount: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    required: true
  },
  perQuestionTime: [{
    type: Number
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  paused: {
    type: Boolean,
    default: false
  },
  pausedAt: {
    type: Date
  },
  timeRemaining: {
    type: Number
  },
  questionTimes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  markedForReview: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  pauseData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
