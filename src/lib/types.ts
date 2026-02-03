// =============================================================================
// SHARD TYPES - Milestone Jan 17
// =============================================================================

// -----------------------------------------------------------------------------
// Task Types
// -----------------------------------------------------------------------------

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

// -----------------------------------------------------------------------------
// Mood Types
// -----------------------------------------------------------------------------

export type MoodLevel = "great" | "good" | "okay" | "bad" | "terrible";

export interface Mood {
  id: string;
  mood: MoodLevel;
  note: string;
  createdAt: string;
}

export type MoodInput = Omit<Mood, "id" | "createdAt">;

// -----------------------------------------------------------------------------
// Habit Types
// -----------------------------------------------------------------------------

export interface Habit {
  id: string;
  title: string;
  description: string;
  rrule: string; // iCalendar RRULE format (RFC 5545)
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  pausedAt: string | null;
  cancelledAt: string | null;
}

export type HabitInput = Omit<Habit, "id" | "createdAt" | "updatedAt">;

export type HabitEntryStatus = "completed" | "cancelled" | "skipped" | "not_scheduled";

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitEntryStatus;
  note: string;
  createdAt: string;
}

export type HabitEntryInput = Omit<HabitEntry, "id" | "createdAt">;
