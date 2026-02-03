-- Add paused_at and cancelled_at columns to habits table
-- Check if columns exist before adding them
ALTER TABLE habits ADD COLUMN paused_at TEXT DEFAULT NULL;
ALTER TABLE habits ADD COLUMN cancelled_at TEXT DEFAULT NULL;
