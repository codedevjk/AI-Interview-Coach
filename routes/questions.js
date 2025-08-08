const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all practice questions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    
    let query = supabaseAdmin
      .from('practice_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (topic) {
      query = query.eq('topic', topic);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Questions fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions by topic
router.get('/topics', authenticateToken, async (req, res) => {
  try {
    const { data: topics, error } = await supabaseAdmin
      .from('practice_questions')
      .select('topic')
      .not('topic', 'is', null);

    if (error) {
      console.error('Topics fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }

    // Get unique topics
    const uniqueTopics = [...new Set(topics.map(item => item.topic))];
    
    res.json({ topics: uniqueTopics });
  } catch (error) {
    console.error('Topics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single question by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: question, error } = await supabaseAdmin
      .from('practice_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ question });
  } catch (error) {
    console.error('Question fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;