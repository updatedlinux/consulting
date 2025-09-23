-- Add start_date and end_date columns to condo360_polls table
ALTER TABLE `condo360_polls` 
ADD COLUMN `start_date` DATETIME NULL DEFAULT NULL AFTER `status`,
ADD COLUMN `end_date` DATETIME NULL DEFAULT NULL AFTER `start_date`;

-- Update existing polls to have NULL start_date and end_date (optional, as this is the default)
-- UPDATE `condo360_polls` SET `start_date` = NULL, `end_date` = NULL;