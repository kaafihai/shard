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
