/*
  # Seed Practice Questions

  1. Insert sample questions for different topics
    - React, JavaScript, Python, Java, etc.
    - Various difficulty levels
    - Comprehensive question bank
*/

-- Insert practice questions for different topics
INSERT INTO practice_questions (question_text, topic, difficulty) VALUES
-- React Questions
('What is React and what are its key features?', 'React', 'Beginner'),
('Explain the difference between functional and class components.', 'React', 'Intermediate'),
('What is JSX and how does it work?', 'React', 'Beginner'),
('What are React Hooks? Explain useState and useEffect.', 'React', 'Intermediate'),
('What is the Virtual DOM and how does it work?', 'React', 'Advanced'),

-- JavaScript Questions
('What are the different data types in JavaScript?', 'JavaScript', 'Beginner'),
('Explain hoisting in JavaScript.', 'JavaScript', 'Intermediate'),
('What is the difference between var, let, and const?', 'JavaScript', 'Beginner'),
('What are closures and how do they work?', 'JavaScript', 'Advanced'),
('Explain the concept of prototypes and inheritance.', 'JavaScript', 'Advanced'),

-- Python Questions
('What are the key features of Python?', 'Python', 'Beginner'),
('Explain the difference between lists, tuples, and dictionaries.', 'Python', 'Beginner'),
('What are decorators in Python?', 'Python', 'Intermediate'),
('Explain the concept of generators and iterators.', 'Python', 'Advanced'),
('What is the Global Interpreter Lock (GIL)?', 'Python', 'Advanced'),

-- Java Questions
('Explain the differences between JDK, JRE, and JVM.', 'Java', 'Beginner'),
('What are the main principles of OOPs in Java?', 'Java', 'Beginner'),
('What is the difference between == and .equals() method in Java?', 'Java', 'Intermediate'),
('Explain the concept of inheritance in Java.', 'Java', 'Intermediate'),
('What is multithreading in Java? How can you create a thread?', 'Java', 'Advanced'),

-- SQL Questions
('What is the difference between SQL and NoSQL databases?', 'SQL', 'Beginner'),
('Explain the different types of SQL joins.', 'SQL', 'Intermediate'),
('What is normalization and its different forms?', 'SQL', 'Advanced'),
('What are indexes and how do they improve performance?', 'SQL', 'Intermediate'),
('Explain ACID properties in databases.', 'SQL', 'Advanced'),

-- Machine Learning Questions
('Describe a machine learning project you have worked on.', 'Machine Learning', 'Intermediate'),
('How do you handle overfitting in your models?', 'Machine Learning', 'Advanced'),
('Explain the Bias-Variance Tradeoff.', 'Machine Learning', 'Advanced'),
('What is cross-validation, and why is it important?', 'Machine Learning', 'Intermediate'),
('What are evaluation metrics for ML models?', 'Machine Learning', 'Intermediate'),

-- Data Science Questions
('How do you approach cleaning a messy dataset?', 'Data Science', 'Intermediate'),
('What tools do you use for data visualization?', 'Data Science', 'Beginner'),
('What is A/B testing, and how is it used in data analysis?', 'Data Science', 'Intermediate'),
('Explain the concept of outliers. How would you detect and handle them?', 'Data Science', 'Advanced'),
('What are some common data visualization techniques?', 'Data Science', 'Beginner');