import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskInput, TaskWithCategoryAndTags } from '@/lib/types';
import {
  getTasks,
  getTasksByDate,
  createTask as createTaskDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  initDatabase,
} from '@/lib/db';

const TASKS_QUERY_KEY = ['tasks'];
const TASKS_BY_DATE_QUERY_KEY = ['tasks', 'date'];

// Initialize database on first hook use
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      await ensureDbInitialized();
      return getTasks();
    },
  });
}

export function useTasksByDate(date: Date) {
  return useQuery({
    queryKey: [...TASKS_BY_DATE_QUERY_KEY, date.toISOString()],
    queryFn: async () => {
      await ensureDbInitialized();
      return getTasksByDate(date);
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TaskInput) => {
      await ensureDbInitialized();
      const newTask: Task = {
        ...input,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return createTaskDb(newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      await ensureDbInitialized();
      return updateTaskDb(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ensureDbInitialized();
      return deleteTaskDb(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useToggleTask() {
  const updateTask = useUpdateTask();

  return {
    ...updateTask,
    mutate: (task: Task | TaskWithCategoryAndTags) => {
      updateTask.mutate({
        id: task.id,
        updates: { completed: !task.completed },
      });
    },
  };
}
