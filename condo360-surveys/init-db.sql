-- Database initialization script for condo360 surveys system

-- Table for surveys (encuestas)
CREATE TABLE IF NOT EXISTS condo360_surveys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for survey questions
CREATE TABLE IF NOT EXISTS condo360_questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  survey_id BIGINT NOT NULL,
  question_text TEXT NOT NULL,
  question_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES condo360_surveys(id) ON DELETE CASCADE
);

-- Table for question options
CREATE TABLE IF NOT EXISTS condo360_question_options (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  option_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES condo360_questions(id) ON DELETE CASCADE
);

-- Table for survey participants (control unique participation)
CREATE TABLE IF NOT EXISTS condo360_survey_participants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  survey_id BIGINT NOT NULL,
  wp_user_id BIGINT NOT NULL,
  participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_participation (survey_id, wp_user_id),
  FOREIGN KEY (survey_id) REFERENCES condo360_surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (wp_user_id) REFERENCES wp_users(ID) ON DELETE CASCADE
);

-- Table for survey responses
CREATE TABLE IF NOT EXISTS condo360_survey_responses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  survey_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  wp_user_id BIGINT NOT NULL,
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES condo360_surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES condo360_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES condo360_question_options(id) ON DELETE CASCADE,
  FOREIGN KEY (wp_user_id) REFERENCES wp_users(ID) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_surveys_status ON condo360_surveys(status);
CREATE INDEX idx_surveys_dates ON condo360_surveys(start_date, end_date);
CREATE INDEX idx_questions_survey ON condo360_questions(survey_id);
CREATE INDEX idx_options_question ON condo360_question_options(question_id);
CREATE INDEX idx_participants_survey ON condo360_survey_participants(survey_id);
CREATE INDEX idx_participants_user ON condo360_survey_participants(wp_user_id);
CREATE INDEX idx_responses_survey ON condo360_survey_responses(survey_id);
CREATE INDEX idx_responses_user ON condo360_survey_responses(wp_user_id);