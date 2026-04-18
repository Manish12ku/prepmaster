const evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer, modelAnswer, maxMarks } = req.body;
    
    if (!question || !userAnswer) {
      return res.status(400).json({ message: 'Question and user answer are required' });
    }
    
    const evaluation = {
      score: 0,
      feedback: '',
      suggestions: []
    };
    
    if (modelAnswer) {
      const userWords = userAnswer.toLowerCase().split(/\s+/);
      const modelWords = modelAnswer.toLowerCase().split(/\s+/);
      
      const commonWords = userWords.filter(word => modelWords.includes(word));
      const similarity = commonWords.length / Math.max(userWords.length, modelWords.length);
      
      evaluation.score = Math.round(similarity * maxMarks);
      
      if (similarity > 0.8) {
        evaluation.feedback = 'Excellent answer! You covered most key points.';
      } else if (similarity > 0.5) {
        evaluation.feedback = 'Good attempt, but some key points are missing.';
        evaluation.suggestions.push('Try to include more specific details');
      } else {
        evaluation.feedback = 'Your answer needs improvement. Review the topic and try again.';
        evaluation.suggestions.push('Focus on the main concepts', 'Include relevant examples');
      }
    } else {
      evaluation.score = Math.round(maxMarks * 0.5);
      evaluation.feedback = 'Answer recorded for manual review.';
    }
    
    res.status(200).json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Evaluate answer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  evaluateAnswer
};
