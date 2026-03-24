// =============================================================================
// BAAJIT TYPES - Milestone Jan 17
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
  archivedAt: string | null;
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

export type HabitEntryStatus = "completed" | "cancelled" | "skipped";

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitEntryStatus;
  note: string;
  createdAt: string;
}

export type HabitEntryInput = Omit<HabitEntry, "id" | "createdAt">;

// -----------------------------------------------------------------------------
// Rabbit Types
// -----------------------------------------------------------------------------

export type RabbitLevel = 1 | 2 | 3 | 4 | 5;

export const RABBIT_LEVEL_NAMES: Record<RabbitLevel, string> = {
  1: "Baby Bunny",
  2: "Young Rabbit",
  3: "Teen Rabbit",
  4: "Adult Rabbit",
  5: "Wise Rabbit",
};

// XP thresholds to reach each level
export const RABBIT_XP_THRESHOLDS: Record<RabbitLevel, number> = {
  1: 0,
  2: 50,
  3: 150,
  4: 350,
  5: 700,
};

export interface RabbitState {
  id: string;
  level: RabbitLevel;
  xp: number;
  currentOutfit: string;
  createdAt: string;
  updatedAt: string;
}

export interface RabbitOutfit {
  id: string;
  unlockedAt: string;
  unlockReason: string;
}

export type RabbitMemoryType = "day_pattern" | "streak_record" | "mood_pattern" | "milestone" | "fun_fact";

export interface RabbitMemory {
  id: string;
  memoryType: RabbitMemoryType;
  memoryKey: string;
  memoryValue: string;
  createdAt: string;
  updatedAt: string;
}

// Outfit definitions (what's available to unlock)
export interface OutfitDefinition {
  id: string;
  name: string;
  description: string;
  unlockCondition: string; // Human-readable condition
  category: "hat" | "scarf" | "cape" | "glasses" | "bow" | "badge";
}

export const AVAILABLE_OUTFITS: OutfitDefinition[] = [
  { id: "scarf_cozy", name: "Cozy Scarf", description: "A warm lavender scarf", unlockCondition: "Complete your first task", category: "scarf" },
  { id: "hat_party", name: "Party Hat", description: "A colorful celebration hat", unlockCondition: "Reach a 3-day streak", category: "hat" },
  { id: "glasses_smart", name: "Smart Glasses", description: "Round scholarly glasses", unlockCondition: "Log 10 moods", category: "glasses" },
  { id: "bow_peach", name: "Peach Bow", description: "A cute peach-colored bow", unlockCondition: "Complete 5 habits", category: "bow" },
  { id: "cape_hero", name: "Hero Cape", description: "A tiny superhero cape", unlockCondition: "Reach a 7-day streak", category: "cape" },
  { id: "hat_crown", name: "Royal Crown", description: "A golden crown for royalty", unlockCondition: "Reach a 14-day streak", category: "hat" },
  { id: "badge_star", name: "Star Badge", description: "A shiny gold star badge", unlockCondition: "Complete 25 tasks", category: "badge" },
  { id: "cape_magic", name: "Magic Cape", description: "A sparkly cosmic cape", unlockCondition: "Reach a 30-day streak", category: "cape" },
  { id: "glasses_heart", name: "Heart Shades", description: "Heart-shaped sunglasses", unlockCondition: "Log 50 moods", category: "glasses" },
  { id: "hat_wizard", name: "Wizard Hat", description: "A mystical pointed hat", unlockCondition: "Reach level 5", category: "hat" },
];
