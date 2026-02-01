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
    "migrations/002_habits.sql",
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
  };
}

export async function createTask(task: Task): Promise<Task> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO tasks (id, title, description, due_date, created_at, updated_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [task.id, task.title, task.description, task.dueDate, task.createdAt, task.updatedAt, task.completedAt]
  );

  return task;
}

export async function updateTask(task: Task): Promise<Task> {
  const database = await getDb();

  const now = new Date().toISOString();

  await database.execute(
    `UPDATE tasks SET title = $1, description = $2, due_date = $3, completed_at = $4, updated_at = $5 WHERE id = $6`,
    [task.title, task.description, task.dueDate, task.completedAt, now, task.id]
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
  };
}

export async function createHabit(habit: Habit): Promise<Habit> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO habits (id, title, description, rrule, created_at, updated_at, archived_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [habit.id, habit.title, habit.description, habit.rrule, habit.createdAt, habit.updatedAt, habit.archivedAt]
  );

  return habit;
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const database = await getDb();

  const now = new Date().toISOString();

  await database.execute(
    `UPDATE habits SET title = $1, description = $2, rrule = $3, archived_at = $4, updated_at = $5 WHERE id = $6`,
    [habit.title, habit.description, habit.rrule, habit.archivedAt, now, habit.id]
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
