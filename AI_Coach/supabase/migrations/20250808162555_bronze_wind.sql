/*
  # Initial Schema for AI Interview Simulator

  1. New Tables
    - `users` - User authentication and profile data
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
    
    - `practice_questions` - Interview questions database
      - `id` (uuid, primary key)
      - `question_text` (text)
      - `topic` (text)
      - `difficulty` (text)
      - `created_at` (timestamp)
    
    - `user_attempts` - User practice session records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `question_id` (uuid, foreign key)
      - `is_correct` (boolean)
      - `time_taken_seconds` (integer)
      - `attempted_at` (timestamp)

  2. Views
    - `user_performance` - Analytics view for dashboard

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Practice Questions table
CREATE TABLE IF NOT EXISTS practice_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Attempts table
CREATE TABLE IF NOT EXISTS user_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES practice_questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN,
    time_taken_seconds INT,
    attempted_at TIMESTAMP DEFAULT NOW()
);

-- Analytics View (for dashboard queries)
CREATE OR REPLACE VIEW user_performance AS
SELECT 
    u.id AS user_id,
    u.full_name,
    COUNT(ua.id) AS total_attempts,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) AS correct_attempts,
    ROUND(
        (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(ua.id), 0)) * 100, 2
    ) AS accuracy_percentage,
    ROUND(AVG(ua.time_taken_seconds), 2) AS avg_time_per_question
FROM users u
LEFT JOIN user_attempts ua ON u.id = ua.user_id
GROUP BY u.id, u.full_name;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- RLS Policies for practice_questions table
CREATE POLICY "Anyone can read practice questions"
    ON practice_questions
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for user_attempts table
CREATE POLICY "Users can read own attempts"
    ON user_attempts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
    ON user_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
    ON user_attempts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);