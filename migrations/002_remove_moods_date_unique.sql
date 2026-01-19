-- =============================================================================
-- Migration 002: Remove unique date constraint on moods
-- =============================================================================
-- Allows multiple mood entries per day
-- Idempotent: safe to run multiple times
-- =============================================================================

DROP INDEX IF EXISTS idx_moods_date_unique;
