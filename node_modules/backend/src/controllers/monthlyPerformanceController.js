const MonthlyPerformance = require('../models/MonthlyPerformance');
const Result = require('../models/Result');
const User = require('../models/User');
const { isConnected } = require('../config/database');

// Calculate monthly score using the formula:
// Monthly Score = (Avg Percentage × 0.5) + (Avg Accuracy × 0.3) + (Log(Total Tests Attempted) × 0.2)
const calculateMonthlyScore = (avgPercentage, avgAccuracy, totalTests) => {
  const percentageComponent = avgPercentage * 0.5;
  const accuracyComponent = avgAccuracy * 0.3;
  const testsComponent = Math.log(Math.max(totalTests, 1)) * 0.2; // log of at least 1
  return percentageComponent + accuracyComponent + testsComponent;
};

// Update or create monthly performance for a user
const updateMonthlyPerformance = async (userId, year, month) => {
  try {
    // Get all results for this user in the specified month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    const results = await Result.find({
      userId,
      submittedAt: { $gte: startDate, $lte: endDate }
    });
    
    if (results.length === 0) {
      // No results, delete existing record if any
      await MonthlyPerformance.findOneAndDelete({ userId, year, month });
      return null;
    }
    
    // Calculate metrics
    const totalTestsAttempted = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalMaxMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correctCount, 0);
    const totalAttempted = results.reduce((sum, r) => sum + (r.correctCount + r.incorrectCount), 0);
    
    const avgPercentage = totalMaxMarks > 0 ? (totalScore / totalMaxMarks) * 100 : 0;
    const avgAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    
    const monthlyScore = calculateMonthlyScore(avgPercentage, avgAccuracy, totalTestsAttempted);
    
    // Update or create record
    const performance = await MonthlyPerformance.findOneAndUpdate(
      { userId, year, month },
      {
        totalTestsAttempted,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        monthlyScore: Math.round(monthlyScore * 100) / 100,
        totalScore,
        totalMaxMarks,
        totalCorrect,
        totalAttempted
      },
      { upsert: true, new: true }
    );
    
    return performance;
  } catch (error) {
    console.error('Update monthly performance error:', error);
    throw error;
  }
};

// Get monthly performance for a student
const getStudentMonthlyPerformance = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const { year = new Date().getFullYear() } = req.query;
    
    // Mock mode
    if (!isConnected()) {
      return res.status(200).json({
        success: true,
        performance: []
      });
    }
    
    // Update current month's performance first
    const currentDate = new Date();
    await updateMonthlyPerformance(user._id, currentDate.getFullYear(), currentDate.getMonth());
    
    // Get all monthly performances for the year
    const performances = await MonthlyPerformance.find({
      userId: user._id,
      year: parseInt(year)
    }).sort({ month: 1 });
    
    res.status(200).json({
      success: true,
      performance: performances
    });
  } catch (error) {
    console.error('Get student monthly performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top monthly performers (for admin)
const getTopMonthlyPerformers = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth(), limit = 15 } = req.query;
    
    // Mock mode
    if (!isConnected()) {
      return res.status(200).json({
        success: true,
        performers: []
      });
    }
    
    const performers = await MonthlyPerformance.find({
      year: parseInt(year),
      month: parseInt(month)
    })
    .populate('userId', 'name email')
    .sort({ monthlyScore: -1 })
    .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      performers: performers.map(p => ({
        ...p.toObject(),
        userName: p.userId?.name || 'Unknown',
        userEmail: p.userId?.email || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Get top monthly performers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students' monthly performance (for admin)
const getAllMonthlyPerformance = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Mock mode
    if (!isConnected()) {
      return res.status(200).json({
        success: true,
        performance: []
      });
    }
    
    const performances = await MonthlyPerformance.find({
      year: parseInt(year)
    })
    .populate('userId', 'name email')
    .sort({ monthlyScore: -1 });
    
    res.status(200).json({
      success: true,
      performance: performances.map(p => ({
        ...p.toObject(),
        userName: p.userId?.name || 'Unknown',
        userEmail: p.userId?.email || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Get all monthly performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Recalculate monthly performance (admin only)
const recalculateMonthlyPerformance = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || month === undefined) {
      return res.status(400).json({ message: 'Year and month are required' });
    }
    
    // Get all users
    const users = await User.find({ role: 'student' });
    
    const results = [];
    for (const user of users) {
      const performance = await updateMonthlyPerformance(user._id, year, month);
      if (performance) {
        results.push(performance);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Recalculated performance for ${results.length} students`,
      results
    });
  } catch (error) {
    console.error('Recalculate monthly performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentMonthlyPerformance,
  getTopMonthlyPerformers,
  getAllMonthlyPerformance,
  recalculateMonthlyPerformance,
  updateMonthlyPerformance
};
