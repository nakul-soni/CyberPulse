-- Fix attack_type column length to handle longer values
ALTER TABLE incidents ALTER COLUMN attack_type TYPE VARCHAR(100);
