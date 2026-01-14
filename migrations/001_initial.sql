-- =============================================================================
-- Migration 001: Initial Schema
-- =============================================================================
-- Creates the initial tables for tasks and mood tracking
-- Idempotent: safe to run multiple times
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TASKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  due_date      TEXT,           -- ISO8601 format
  created_at    TEXT NOT NULL,  -- ISO8601 format
  updated_at    TEXT NOT NULL,  -- ISO8601 format
  completed_at  TEXT            -- ISO8601 format, NULL = incomplete
);

CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed_at);

-- -----------------------------------------------------------------------------
-- MOODS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moods (
  id          TEXT PRIMARY KEY,
  mood        TEXT NOT NULL CHECK(mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  note        TEXT DEFAULT '',
  created_at  TEXT NOT NULL  -- ISO8601 format
);

CREATE INDEX IF NOT EXISTS idx_moods_created ON moods(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_moods_date_unique ON moods(date(created_at));
