-- Migration: Add buildings support to surveys system
-- Date: 2025-11-24

-- Create buildings table
CREATE TABLE IF NOT EXISTS wp_condo360_edificios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert buildings
INSERT INTO wp_condo360_edificios (nombre) VALUES
  ('VIRGEN MARÍA'),
  ('VIRGEN DE GUADALUPE'),
  ('VIRGEN DEL VALLE'),
  ('VIRGEN COROMOTO'),
  ('VIRGEN MILAGROSA'),
  ('CRISTO REY'),
  ('VIRGEN CHIQUINQUIRA'),
  ('VIRGEN DEL CARMEN'),
  ('VIRGEN DE LOURDES'),
  ('ROSA MISTICA'),
  ('VIRGEN DE FÁTIMA')
ON DUPLICATE KEY UPDATE nombre = nombre;

-- Add building_id column to condo360_surveys table
-- NULL means "TODOS LOS EDIFICIOS" (all buildings)
ALTER TABLE condo360_surveys 
ADD COLUMN building_id INT NULL AFTER end_date,
ADD FOREIGN KEY (building_id) REFERENCES wp_condo360_edificios(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_surveys_building ON condo360_surveys(building_id);

