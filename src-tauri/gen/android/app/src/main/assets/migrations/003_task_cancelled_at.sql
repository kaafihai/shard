-- =============================================================================
-- Migration 003: Add cancelled_at to tasks
-- =============================================================================
-- Adds a cancelled_at column to the tasks table to track task cancellation
-- separately from completion. NULL = not cancelled.
-- =============================================================================

ALTER TABLE tasks ADD COLUMN cancelled_at TEXT; -- ISO8601 format, NULL = not cancelled

CREATE INDEX IF NOT EXISTS idx_tasks_cancelled ON tasks(cancelled_at);
