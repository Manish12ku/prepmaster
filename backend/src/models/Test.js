const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  subject: { type: String, default: 'General' },
  topic: { type: String, default: 'General' },
  difficulty: { type: String, default: 'medium' },
  modelAnswer: { type: String, default: null }
}, { _id: true });

const testSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full_mock', 'subject_wise', 'topic_wise'],
    required: true
  },
  questions: [questionSchema],
  markingScheme: {
    correct: {
      type: Number,
      default: 1
    },
    negative: {
      type: Number,
      default: 0
    }
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  subject: {
    type: String,
    default: null
  },
  topic: {
    type: String,
    default: null
  },
  totalMarks: {
    type: Number,
    required: true
  },
  secretCode: {
    type: String,
    required: true
  },
  secretCode: {
    type: String,
    required: true
  },
  expectedAvgMarks: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
