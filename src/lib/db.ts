import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join, resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { Task, Mood, Habit, HabitEntry } from "./types";

let db: Database | null = null;

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const appDataDirPath = await appDataDir();
  const dbPath = await join(appDataDirPath, "tasks.db");
  db = await Database.load(`sqlite:${dbPath}`);

  // Load and run migrations
  const migrations = [
    "migrations/001_initial.sql",
  ];

  for (const migration of migrations) {
    const migrationPath = await resolveResource(migration);
    const migrationSql = await readTextFile(migrationPath);
    await db.execute(migrationSql);
  }

  return db;
}

async function getDb(): Promise<Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

// =============================================================================
// TASK OPERATIONS
// =============================================================================

export async function getTasks(limit: number = 1000): Promise<Task[]> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      archived_at: string | null;
    }>
  >(`SELECT * FROM tasks ORDER BY completed_at IS NOT NULL, created_at DESC LIMIT $1`, [limit]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  }));
}

export async function getTasksByDueDate(date: Date, limit: number = 1000): Promise<Task[]> {
  const database = await getDb();

  // Calculate local day boundaries to handle timezone correctly
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      archived_at: string | null;
    }>
  >(`SELECT * FROM tasks WHERE due_date >= $1 AND due_date < $2 LIMIT $3`, [startOfDay.toISOString(), endOfDay.toISOString(), limit]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  }));
}

export async function getTasksByCompletedAt(date: Date, limit: number = 1000): Promise<Task[]> {
  const database = await getDb();

  // Calculate local day boundaries in UTC to handle timezone correctly
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      archived_at: string | null;
    }>
  >(`SELECT * FROM tasks WHERE completed_at >= $1 AND completed_at < $2 LIMIT $3`, [startOfDay.toISOString(), endOfDay.toISOString(), limit]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  }));
}

export async function getTasksByArchivedAt(date: Date, limit: number = 1000): Promise<Task[]> {
  const database = await getDb();

  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      archived_at: string | null;
    }>
  >(`SELECT * FROM tasks WHERE archived_at >= $1 AND archived_at < $2 LIMIT $3`, [startOfDay.toISOString(), endOfDay.toISOString(), limit]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  }));
}

export async function getTaskById(id: string): Promise<Task | null> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      archived_at: string | null;
    }>
  >(`SELECT * FROM tasks WHERE id = $1`, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  };
}

export async function createTask(task: Task): Promise<Task> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO tasks (id, title, description, due_date, created_at, updated_at, completed_at, archived_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [task.id, task.title, task.description, task.dueDate, task.createdAt, task.updatedAt, task.completedAt, task.archivedAt]
  );

  return task;
}

export async function updateTask(task: Task): Promise<Task> {
  const database = await getDb();

  const now = new Date().toISOString();

  await database.execute(
    `UPDATE tasks SET title = $1, description = $2, due_date = $3, completed_at = $4, archived_at = $5, updated_at = $6 WHERE id = $7`,
    [task.title, task.description, task.dueDate, task.completedAt, task.archivedAt, now, task.id]
  );

  const updatedTask = await getTaskById(task.id);
  if (!updatedTask) {
    throw new Error(`Task with id ${task.id} not found`);
  }

  return updatedTask;
}

export async function deleteTask(task: Task): Promise<Task> {
  const database = await getDb();

  await database.execute(`DELETE FROM tasks WHERE id = $1`, [task.id]);

  return task;
}

// =============================================================================
// MOOD OPERATIONS
// =============================================================================

export async function getMoods(limit: number = 1000): Promise<Mood[]> {
  const database = await getDb();
  const rows = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM moods LIMIT $1`, [limit]);

  return rows.map((row) => ({
    id: row.id,
    mood: row.mood as Mood["mood"],
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function getMoodById(id: string): Promise<Mood | null> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM moods WHERE id = $1`, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    mood: row.mood as Mood["mood"],
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function getMoodByDate(date: Date): Promise<Mood | null> {
  const database = await getDb();

  // Calculate local day boundaries in UTC to handle timezone correctly
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const rows = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM moods WHERE created_at >= $1 AND created_at < $2`, [startOfDay.toISOString(), endOfDay.toISOString()]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    mood: row.mood as Mood["mood"],
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function createMood(mood: Mood): Promise<Mood> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO moods (id, mood, note, created_at)
     VALUES ($1, $2, $3, $4)`,
    [mood.id, mood.mood, mood.note, mood.createdAt]
  );

  return mood;
}

export async function updateMood(mood: Mood): Promise<Mood> {
  const database = await getDb();

  await database.execute(
    `UPDATE moods SET mood = $1, note = $2 WHERE id = $3`,
    [mood.mood, mood.note, mood.id]
  );

  const updatedMood = await getMoodById(mood.id);
  if (!updatedMood) {
    throw new Error(`Mood with id ${mood.id} not found`);
  }

  return updatedMood;
}

export async function deleteMood(mood: Mood): Promise<Mood> {
  const database = await getDb();

  await database.execute(`DELETE FROM moods WHERE id = $1`, [mood.id]);

  return mood;
}

// =============================================================================
// HABIT OPERATIONS
// =============================================================================

export async function getHabits(includeArchived: boolean = false): Promise<Habit[]> {
  const database = await getDb();

  const query = includeArchived
    ? `SELECT * FROM habits ORDER BY created_at DESC`
    : `SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at DESC`;

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      rrule: string;
      created_at: string;
      updated_at: string;
      archived_at: string | null;
      paused_at: string | null;
      cancelled_at: string | null;
    }>
  >(query);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    rrule: row.rrule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    pausedAt: row.paused_at,
    cancelledAt: row.cancelled_at,
  }));
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      rrule: string;
      created_at: string;
      updated_at: string;
      archived_at: string | null;
      paused_at: string | null;
      cancelled_at: string | null;
    }>
  >(`SELECT * FROM habits WHERE id = $1`, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    rrule: row.rrule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    pausedAt: row.paused_at,
    cancelledAt: row.cancelled_at,
  };
}

export async function createHabit(habit: Habit): Promise<Habit> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO habits (id, title, description, rrule, created_at, updated_at, archived_at, paused_at, cancelled_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [habit.id, habit.title, habit.description, habit.rrule, habit.createdAt, habit.updatedAt, habit.archivedAt, habit.pausedAt, habit.cancelledAt]
  );

  return habit;
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const database = await getDb();

  const now = new Date().toISOString();

  await database.execute(
    `UPDATE habits SET title = $1, description = $2, rrule = $3, archived_at = $4, paused_at = $5, cancelled_at = $6, updated_at = $7 WHERE id = $8`,
    [habit.title, habit.description, habit.rrule, habit.archivedAt, habit.pausedAt, habit.cancelledAt, now, habit.id]
  );

  const updatedHabit = await getHabitById(habit.id);
  if (!updatedHabit) {
    throw new Error(`Habit with id ${habit.id} not found`);
  }

  return updatedHabit;
}

export async function deleteHabit(habit: Habit): Promise<Habit> {
  const database = await getDb();

  await database.execute(`DELETE FROM habits WHERE id = $1`, [habit.id]);

  return habit;
}

// =============================================================================
// HABIT ENTRY OPERATIONS
// =============================================================================

export async function getHabitEntries(habitId: string): Promise<HabitEntry[]> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      habit_id: string;
      date: string;
      status: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM habit_entries WHERE habit_id = $1 ORDER BY date DESC`, [habitId]);

  return rows.map((row) => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitEntry["status"],
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function getHabitEntriesByDate(date: string): Promise<HabitEntry[]> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      habit_id: string;
      date: string;
      status: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM habit_entries WHERE date = $1`, [date]);

  return rows.map((row) => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitEntry["status"],
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function getAllHabitEntries(): Promise<HabitEntry[]> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      habit_id: string;
      date: string;
      status: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM habit_entries ORDER BY date DESC`);

  return rows.map((row) => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitEntry["status"],
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function getHabitEntryByHabitAndDate(habitId: string, date: string): Promise<HabitEntry | null> {
  const database = await getDb();

  const rows = await database.select<
    Array<{
      id: string;
      habit_id: string;
      date: string;
      status: string;
      note: string;
      created_at: string;
    }>
  >(`SELECT * FROM habit_entries WHERE habit_id = $1 AND date = $2`, [habitId, date]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    status: row.status as HabitEntry["status"],
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function createHabitEntry(entry: HabitEntry): Promise<HabitEntry> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO habit_entries (id, habit_id, date, status, note, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [entry.id, entry.habitId, entry.date, entry.status, entry.note, entry.createdAt]
  );

  return entry;
}

export async function updateHabitEntry(entry: HabitEntry): Promise<HabitEntry> {
  const database = await getDb();

  await database.execute(
    `UPDATE habit_entries SET status = $1, note = $2 WHERE id = $3`,
    [entry.status, entry.note, entry.id]
  );

  return entry;
}

export async function deleteHabitEntry(entry: HabitEntry): Promise<HabitEntry> {
  const database = await getDb();

  await database.execute(`DELETE FROM habit_entries WHERE id = $1`, [entry.id]);

  return entry;
}

// =============================================================================
// HABIT BACKPOPULATION
// =============================================================================

// Helper function to check if a habit is scheduled for a given date
function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  // Parse RRULE to determine if habit is scheduled
  const freqMatch = habit.rrule.match(/FREQ=(\w+)/);
  const frequency = freqMatch?.[1] || "DAILY";

  if (frequency === "DAILY") {
    return true;
  }

  if (frequency === "WEEKLY") {
    const daysMatch = habit.rrule.match(/BYDAY=([A-Z,]+)/);
    const days = daysMatch ? daysMatch[1].split(",") : [];
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
    return days.includes(dayOfWeek);
  }

  return true;
}

// Backpopulate entries for a single habit from its updated_at to today
export async function backpopulateHabitEntriesForHabit(habit: Habit): Promise<void> {
  // Skip if habit is paused or archived
  if (habit.pausedAt || habit.archivedAt) {
    return;
  }

  const database = await getDb();

  // Get all existing entries for this habit
  const existingEntries = await database.select<
    Array<{
      date: string;
    }>
  >(`SELECT date FROM habit_entries WHERE habit_id = $1`, [habit.id]);
  const existingDates = new Set(existingEntries.map((e) => e.date));

  // Helper to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Start from updated_at (or created_at if updated_at is not set)
  const startDate = new Date(habit.updatedAt || habit.createdAt);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Iterate through each day from start to today
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dateString = formatDateLocal(currentDate);

    // Skip if entry already exists for this date
    if (!existingDates.has(dateString)) {
      // Check if habit is scheduled for this date
      if (isHabitScheduledForDate(habit, currentDate)) {
        // Create entry with "skipped" status
        const now = new Date().toISOString();
        const entry: HabitEntry = {
          id: crypto.randomUUID(),
          habitId: habit.id,
          date: dateString,
          status: "skipped",
          note: "",
          createdAt: now,
        };
        await createHabitEntry(entry);
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Backpopulate entries for all active habits
export async function backpopulateHabitEntries(): Promise<void> {
  // Ensure database is initialized
  await getDb();

  // Get all active habits (not archived, not paused)
  const habits = await getHabits(true); // Include all to filter ourselves
  const activeHabits = habits.filter(
    (h) => !h.pausedAt && !h.archivedAt
  );

  // Backpopulate each active habit
  for (const habit of activeHabits) {
    await backpopulateHabitEntriesForHabit(habit);
  }
}
