const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new attempt
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { questionId, isCorrect, timeTakenSeconds } = req.body;
    const userId = req.user.id;

    if (!questionId || isCorrect === undefined) {
      return res.status(400).json({ error: 'Question ID and result are required' });
    }

    // Verify question exists
    const { data: question, error: questionError } = await supabaseAdmin
      .from('practice_questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create attempt record
    const { data: attempt, error } = await supabaseAdmin
      .from('user_attempts')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          is_correct: isCorrect,
          time_taken_seconds: timeTakenSeconds || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Attempt creation error:', error);
      return res.status(500).json({ error: 'Failed to save attempt' });
    }

    res.status(201).json({
      message: 'Attempt saved successfully',
      attempt
    });
  } catch (error) {
    console.error('Attempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's attempts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data: attempts, error } = await supabaseAdmin
      .from('user_attempts')
      .select(`
        *,
        practice_questions (
          question_text,
          topic,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Attempts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch attempts' });
    }

    res.json({ attempts });
  } catch (error) {
    console.error('Attempts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user performance analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: performance, error } = await supabaseAdmin
      .from('user_performance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Analytics fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // If no performance data, return default values
    const analytics = performance || {
      user_id: userId,
      full_name: req.user.full_name,
      total_attempts: 0,
      correct_attempts: 0,
      accuracy_percentage: 0,
      avg_time_per_question: 0
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;