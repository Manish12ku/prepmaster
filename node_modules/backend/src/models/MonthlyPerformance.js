const mongoose = require('mongoose');

const monthlyPerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: Number, // 0-11 (January = 0)
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  // Raw metrics
  totalTestsAttempted: {
    type: Number,
    default: 0
  },
  avgPercentage: {
    type: Number,
    default: 0
  },
  avgAccuracy: {
    type: Number,
    default: 0
  },
  // Calculated score
  monthlyScore: {
    type: Number,
    default: 0
  },
  // Detailed breakdown
  totalScore: {
    type: Number,
    default: 0
  },
  totalMaxMarks: {
    type: Number,
    default: 0
  },
  totalCorrect: {
    type: Number,
    default: 0
  },
  totalAttempted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique monthly record per user
monthlyPerformanceSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyPerformance', monthlyPerformanceSchema);
