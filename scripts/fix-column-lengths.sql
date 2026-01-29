-- Fix column length constraints to handle longer values
-- Run this migration to update your database schema

-- Fix attack_type column length (increase from VARCHAR(50) to VARCHAR(200))
ALTER TABLE incidents 
  ALTER COLUMN attack_type TYPE VARCHAR(200);

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'incidents' 
  AND column_name IN ('attack_type', 'severity', 'status');
