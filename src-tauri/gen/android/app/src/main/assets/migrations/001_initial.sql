-- =============================================================================
-- Initial Schema - Consolidated Migration
-- =============================================================================
-- Creates all tables for tasks, moods, habits, and habit tracking
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
  completed_at  TEXT,           -- ISO8601 format, NULL = incomplete
  archived_at   TEXT            -- ISO8601 format, NULL = not archived
);

CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived_at);

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

-- -----------------------------------------------------------------------------
-- HABITS - Definition of recurring habits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  rrule         TEXT NOT NULL,    -- iCalendar RRULE format (RFC 5545)
  created_at    TEXT NOT NULL,    -- ISO8601 format
  updated_at    TEXT NOT NULL,    -- ISO8601 format
  archived_at   TEXT,             -- ISO8601 format, NULL = active
  paused_at     TEXT,             -- ISO8601 format, NULL = not paused
  cancelled_at  TEXT              -- ISO8601 format, NULL = not cancelled
);

CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived_at);

-- -----------------------------------------------------------------------------
-- HABIT_ENTRIES - Tracks completion/cancellation of habit occurrences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_entries (
  id            TEXT PRIMARY KEY,
  habit_id      TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,    -- ISO8601 date (YYYY-MM-DD) for the occurrence
  status        TEXT NOT NULL CHECK(status IN ('completed', 'cancelled', 'skipped', 'not_scheduled')),
  note          TEXT DEFAULT '',
  created_at    TEXT NOT NULL     -- ISO8601 format
);

CREATE INDEX IF NOT EXISTS idx_habit_entries_habit ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_entries_unique ON habit_entries(habit_id, date);
