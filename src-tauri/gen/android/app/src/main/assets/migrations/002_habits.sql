-- =============================================================================
-- Migration 002: Habits with RRULE Support
-- =============================================================================
-- Creates habits table for recurring habits and habit_entries for tracking
-- completion, cancellation, and skipping of habit occurrences.
-- RRULE follows iCalendar RFC 5545 format.
-- =============================================================================

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
  archived_at   TEXT              -- ISO8601 format, NULL = active
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
