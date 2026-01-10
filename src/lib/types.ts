export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High";
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

export type TaskFilter = "all" | "active" | "completed";

export interface CategoryInput {
  name: string;
  color: string;
}

export interface TaskWithCategoryAndTags extends Task {
  categoryName?: string;
  categoryColor?: string;
}

export interface Mood {
  id: string;
  mood: "great" | "good" | "okay" | "bad" | "terrible";
  note?: string;
  createdAt: string;
}

export type MoodInput = Omit<Mood, "id" | "createdAt">;
