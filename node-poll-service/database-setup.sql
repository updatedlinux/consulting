-- Create polls table
CREATE TABLE IF NOT EXISTS `condo360_polls` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `options` TEXT NOT NULL,
  `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  `start_date` DATETIME NULL DEFAULT NULL,
  `end_date` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create votes table
CREATE TABLE IF NOT EXISTS `condo360_votes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `poll_id` BIGINT UNSIGNED NOT NULL,
  `wp_user_id` BIGINT UNSIGNED NOT NULL,
  `answer` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poll_id` (`poll_id`),
  KEY `wp_user_id` (`wp_user_id`),
  CONSTRAINT `fk_votes_poll_id` FOREIGN KEY (`poll_id`) REFERENCES `condo360_polls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_votes_wp_user_id` FOREIGN KEY (`wp_user_id`) REFERENCES `wp_users` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;