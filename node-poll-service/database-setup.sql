-- Create polls table with support for multiple questions
CREATE TABLE IF NOT EXISTS condo360_polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('open', 'closed') DEFAULT 'open',
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create poll_questions table to support multiple questions per poll
CREATE TABLE IF NOT EXISTS condo360_poll_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES condo360_polls(id) ON DELETE CASCADE
);

-- Create votes table
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