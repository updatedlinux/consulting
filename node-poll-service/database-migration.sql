-- Database migration script to support multiple questions per poll
-- This script updates the existing database schema to support the new structure

-- First, rename the existing tables to preserve data
RENAME TABLE condo360_polls TO condo360_polls_old;
RENAME TABLE condo360_votes TO condo360_votes_old;

-- Create new tables with the updated schema
CREATE TABLE IF NOT EXISTS condo360_polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('open', 'closed') DEFAULT 'open',
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS condo360_poll_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES condo360_polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS condo360_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    question_id INT NOT NULL,
    wp_user_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES condo360_polls(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES condo360_poll_questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_poll_question (wp_user_id, poll_id, question_id)
);

-- Migrate existing polls data
INSERT INTO condo360_polls (id, title, description, status, start_date, end_date, created_at)
SELECT 
    id, 
    question as title, 
    '' as description, 
    status, 
    start_date, 
    end_date, 
    created_at 
FROM condo360_polls_old;

-- Migrate existing questions data (each poll becomes one question)
INSERT INTO condo360_poll_questions (poll_id, question_text, options, created_at)
SELECT 
    id as poll_id,
    question as question_text,
    options,
    created_at
FROM condo360_polls_old;

-- Migrate existing votes data
INSERT INTO condo360_votes (poll_id, question_id, wp_user_id, answer, created_at)
SELECT 
    v.poll_id,
    q.id as question_id,
    v.wp_user_id,
    v.answer,
    v.created_at
FROM condo360_votes_old v
JOIN condo360_poll_questions q ON v.poll_id = q.poll_id;

-- Drop old tables (uncomment these lines only after verifying the migration was successful)
-- DROP TABLE condo360_votes_old;
-- DROP TABLE condo360_polls_old;