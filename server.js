const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const attemptRoutes = require('./routes/attempts');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Check if environment variables are set
console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');

const hasValidEnv = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.JWT_SECRET;
console.log('hasValidEnv:', hasValidEnv);

if (hasValidEnv) {
  // Use real routes if environment is configured
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/attempts', attemptRoutes);
  app.use('/api/ai', aiRoutes);
  console.log('✅ Using real backend with Supabase');
} else {
  // Use mock routes if environment is not configured
  console.log('⚠️  Environment variables not configured, using mock backend');
  console.log('📝 Please create a .env file with Supabase credentials to use the real backend');
  
  // Mock auth endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
      res.json({
        message: 'Login successful (mock)',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'mock-user-1',
          email: email,
          fullName: 'Mock User'
        }
      });
    } else {
      res.status(400).json({ error: 'Email and password required' });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, fullName } = req.body;
    if (email && password) {
      res.json({
        message: 'User created successfully (mock)',
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'mock-user-1',
          email: email,
          fullName: fullName || 'Mock User'
        }
      });
    } else {
      res.status(400).json({ error: 'Email and password required' });
    }
  });

  // Mock dashboard data
  app.get('/api/attempts/analytics', (req, res) => {
    res.json({
      totalSessions: 24,
      averageScore: 82,
      improvement: 15,
      practiceStreak: 7
    });
  });

  app.get('/api/attempts/recent', (req, res) => {
    res.json([
      {
        id: 1,
        question: "Tell me about yourself",
        score: 85,
        feedback: "Great confidence and clear communication",
        date: new Date().toISOString()
      },
      {
        id: 2,
        question: "What are your strengths?",
        score: 78,
        feedback: "Good examples, could be more specific",
        date: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  });

  // Mock AI feedback
  app.post('/api/ai/feedback', (req, res) => {
    res.json({
      transcript: "This is a mock transcript of your answer...",
      feedback: "Great response! You showed confidence and provided specific examples. Consider adding more quantifiable achievements to make your answer even stronger.",
      score: 85
    });
  });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    backend: hasValidEnv ? 'real' : 'mock'
  });
});

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Interview Simulator server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  if (!hasValidEnv) {
    console.log(`⚠️  Backend is running in MOCK mode - create .env file for real backend`);
  } else {
    console.log(`✅ Backend is running in REAL mode with Supabase`);
  }
});

// Error handling for the server
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop other services using this port.`);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;