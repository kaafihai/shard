import Database from "@tauri-apps/plugin-sql";
import type { Task, Category, Tag, TaskWithCategoryAndTags, Mood } from "./types";

let db: Database | null = null;

// Initialize database and create tables
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  db = await Database.load("sqlite:tasks.db");

  // Create tasks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      due_date TEXT
    );
  `);

  // Create tags table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
  `);

  // Create task_tags junction table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // Create categories table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6b7280',
      created_at TEXT NOT NULL
    );
  `);

  // Create moods table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      mood TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}

// Helper to get database instance
async function getDb(): Promise<Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

// TASK OPERATIONS

export async function getTasks(): Promise<TaskWithCategoryAndTags[]> {
  const database = await getDb();

  // First get all tasks with categories
  const tasks = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      completed: number;
      priority: string;
      category: string | null;
      created_at: string;
      updated_at: string;
      due_date: string | null;
      category_name: string | null;
      category_color: string | null;
    }>
  >(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.completed,
      t.priority,
      t.category,
      t.created_at,
      t.updated_at,
      t.due_date,
      c.name as category_name,
      c.color as category_color
    FROM tasks t
    LEFT JOIN categories c ON t.category = c.id
    ORDER BY t.created_at DESC
  `);

  // Then get tags for each task
  const tasksWithTags: TaskWithCategoryAndTags[] = [];

  for (const task of tasks) {
    const tags = await database.select<Array<{ name: string }>>(
      `
      SELECT tg.name
      FROM task_tags tt
      JOIN tags tg ON tt.tag_id = tg.id
      WHERE tt.task_id = $1
    `,
      [task.id],
    );

    tasksWithTags.push({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed === 1,
      priority: task.priority as "Low" | "Medium" | "High",
      category: task.category || undefined,
      tags: tags.map((t) => t.name),
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      dueDate: task.due_date || undefined,
      categoryName: task.category_name || undefined,
      categoryColor: task.category_color || undefined,
    });
  }

  return tasksWithTags;
}

export async function createTask(task: Task): Promise<Task> {
  const database = await getDb();

  // Insert task
  await database.execute(
    `INSERT INTO tasks (id, title, description, completed, priority, category, created_at, updated_at, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      task.id,
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.priority,
      task.category || null,
      task.createdAt,
      task.updatedAt,
      task.dueDate || null,
    ],
  );

  // Insert task-tag associations
  for (const tagName of task.tags) {
    // Find or create tag
    const tagId = await findOrCreateTag(tagName);

    // Create task-tag association
    await database.execute(
      `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)`,
      [task.id, tagId],
    );
  }

  return task;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<Task> {
  const database = await getDb();

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    updateFields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.completed !== undefined) {
    updateFields.push(`completed = $${paramIndex++}`);
    values.push(updates.completed ? 1 : 0);
  }
  if (updates.priority !== undefined) {
    updateFields.push(`priority = $${paramIndex++}`);
    values.push(updates.priority);
  }
  if (updates.category !== undefined) {
    updateFields.push(`category = $${paramIndex++}`);
    values.push(updates.category || null);
  }
  if (updates.dueDate !== undefined) {
    updateFields.push(`due_date = $${paramIndex++}`);
    values.push(updates.dueDate || null);
  }

  // Always update updated_at
  updateFields.push(`updated_at = $${paramIndex++}`);
  values.push(new Date().toISOString());

  values.push(id);

  if (updateFields.length > 0) {
    await database.execute(
      `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );
  }

  // Handle tags update if provided
  if (updates.tags !== undefined) {
    // Delete existing tag associations
    await database.execute(`DELETE FROM task_tags WHERE task_id = $1`, [id]);

    // Insert new tag associations
    for (const tagName of updates.tags) {
      const tagId = await findOrCreateTag(tagName);
      await database.execute(
        `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)`,
        [id, tagId],
      );
    }
  }

  // Fetch and return updated task
  const tasks = await getTasks();
  const updatedTask = tasks.find((t) => t.id === id);
  if (!updatedTask) {
    throw new Error("Task not found after update");
  }
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  const database = await getDb();

  // Delete task-tag associations (CASCADE should handle this, but being explicit)
  await database.execute(`DELETE FROM task_tags WHERE task_id = $1`, [id]);

  // Delete task
  await database.execute(`DELETE FROM tasks WHERE id = $1`, [id]);
}

// CATEGORY OPERATIONS

export async function getCategories(): Promise<Category[]> {
  const database = await getDb();

  const categories = await database.select<
    Array<{
      id: string;
      name: string;
      color: string;
      created_at: string;
    }>
  >("SELECT * FROM categories ORDER BY name ASC");

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    createdAt: c.created_at,
  }));
}

export async function createCategory(category: Category): Promise<Category> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO categories (id, name, color, created_at) VALUES ($1, $2, $3, $4)`,
    [category.id, category.name, category.color, category.createdAt],
  );

  return category;
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>,
): Promise<Category> {
  const database = await getDb();

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    updateFields.push(`color = $${paramIndex++}`);
    values.push(updates.color);
  }

  values.push(id);

  if (updateFields.length > 0) {
    await database.execute(
      `UPDATE categories SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`,
      values,
    );
  }

  const categories = await getCategories();
  const updatedCategory = categories.find((c) => c.id === id);
  if (!updatedCategory) {
    throw new Error("Category not found after update");
  }
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  const database = await getDb();

  // Set category to NULL for all tasks using this category
  await database.execute(
    `UPDATE tasks SET category = NULL WHERE category = $1`,
    [id],
  );

  // Delete category
  await database.execute(`DELETE FROM categories WHERE id = $1`, [id]);
}

// TAG OPERATIONS

export async function getTags(): Promise<Tag[]> {
  const database = await getDb();

  const tags = await database.select<
    Array<{
      id: string;
      name: string;
      created_at: string;
    }>
  >("SELECT * FROM tags ORDER BY name ASC");

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    createdAt: t.created_at,
  }));
}

export async function createTag(tag: Tag): Promise<Tag> {
  const database = await getDb();

  try {
    await database.execute(
      `INSERT INTO tags (id, name, created_at) VALUES ($1, $2, $3)`,
      [tag.id, tag.name, tag.createdAt],
    );
  } catch (error) {
    // Tag might already exist due to UNIQUE constraint, that's okay
    console.log("Tag already exists:", tag.name);
  }

  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  const database = await getDb();

  // Delete tag-task associations
  await database.execute(`DELETE FROM task_tags WHERE tag_id = $1`, [id]);

  // Delete tag
  await database.execute(`DELETE FROM tags WHERE id = $1`, [id]);
}

// HELPER FUNCTIONS

async function findOrCreateTag(tagName: string): Promise<string> {
  const database = await getDb();

  // Try to find existing tag
  const existing = await database.select<Array<{ id: string }>>(
    `
    SELECT id FROM tags WHERE name = $1
  `,
    [tagName],
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new tag
  const tagId = crypto.randomUUID();
  const tag: Tag = {
    id: tagId,
    name: tagName,
    createdAt: new Date().toISOString(),
  };
  await createTag(tag);

  return tagId;
}

// MOOD OPERATIONS

export async function getTodaysMood(): Promise<Mood | null> {
  const database = await getDb();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString();

  const moods = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string | null;
      created_at: string;
    }>
  >(
    `SELECT * FROM moods WHERE created_at >= $1 AND created_at < $2 ORDER BY created_at DESC LIMIT 1`,
    [todayIso, tomorrowIso]
  );

  if (moods.length === 0) {
    return null;
  }

  const mood = moods[0];
  return {
    id: mood.id,
    mood: mood.mood as "great" | "good" | "okay" | "bad" | "terrible",
    note: mood.note || undefined,
    createdAt: mood.created_at,
  };
}

export async function getMoods(limit = 30): Promise<Mood[]> {
  const database = await getDb();

  const moods = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string | null;
      created_at: string;
    }>
  >(`SELECT * FROM moods ORDER BY created_at DESC LIMIT $1`, [limit]);

  return moods.map((m) => ({
    id: m.id,
    mood: m.mood as "great" | "good" | "okay" | "bad" | "terrible",
    note: m.note || undefined,
    createdAt: m.created_at,
  }));
}

export async function createMood(mood: Mood): Promise<Mood> {
  const database = await getDb();

  await database.execute(
    `INSERT INTO moods (id, mood, note, created_at) VALUES ($1, $2, $3, $4)`,
    [mood.id, mood.mood, mood.note || null, mood.createdAt]
  );

  return mood;
}

export async function getMoodByDate(date: Date): Promise<Mood | null> {
  const database = await getDb();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartIso = dayStart.toISOString();

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const dayEndIso = dayEnd.toISOString();

  const moods = await database.select<
    Array<{
      id: string;
      mood: string;
      note: string | null;
      created_at: string;
    }>
  >(
    `SELECT * FROM moods WHERE created_at >= $1 AND created_at <= $2 ORDER BY created_at DESC LIMIT 1`,
    [dayStartIso, dayEndIso]
  );

  if (moods.length === 0) {
    return null;
  }

  const mood = moods[0];
  return {
    id: mood.id,
    mood: mood.mood as "great" | "good" | "okay" | "bad" | "terrible",
    note: mood.note || undefined,
    createdAt: mood.created_at,
  };
}

export async function getTasksByDate(date: Date): Promise<TaskWithCategoryAndTags[]> {
  const database = await getDb();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartIso = dayStart.toISOString();

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const dayEndIso = dayEnd.toISOString();

  // Get tasks created or due on this date
  const tasks = await database.select<
    Array<{
      id: string;
      title: string;
      description: string;
      completed: number;
      priority: string;
      category: string | null;
      created_at: string;
      updated_at: string;
      due_date: string | null;
      category_name: string | null;
      category_color: string | null;
    }>
  >(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.completed,
      t.priority,
      t.category,
      t.created_at,
      t.updated_at,
      t.due_date,
      c.name as category_name,
      c.color as category_color
    FROM tasks t
    LEFT JOIN categories c ON t.category = c.id
    WHERE (t.created_at >= $1 AND t.created_at <= $2)
       OR (t.due_date >= $1 AND t.due_date <= $2)
    ORDER BY t.created_at DESC
  `, [dayStartIso, dayEndIso]);

  const tasksWithTags: TaskWithCategoryAndTags[] = [];

  for (const task of tasks) {
    const tags = await database.select<Array<{ name: string }>>(
      `
      SELECT tg.name
      FROM task_tags tt
      JOIN tags tg ON tt.tag_id = tg.id
      WHERE tt.task_id = $1
    `,
      [task.id],
    );

    tasksWithTags.push({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed === 1,
      priority: task.priority as "Low" | "Medium" | "High",
      category: task.category || undefined,
      tags: tags.map((t) => t.name),
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      dueDate: task.due_date || undefined,
      categoryName: task.category_name || undefined,
      categoryColor: task.category_color || undefined,
    });
  }

  return tasksWithTags;
}
