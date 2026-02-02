import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskInput } from '@/lib/types';
import {
  getTasks,
  getTasksByDueDate,
  getTasksByCompletedAt,
  createTask,
  updateTask,
  deleteTask,
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

export function useTasksByDueDate(date: Date) {
  return useQuery({
    queryKey: [...TASKS_BY_DATE_QUERY_KEY, 'due', date.toISOString()],
    queryFn: async () => {
      await ensureDbInitialized();
      return getTasksByDueDate(date);
    },
  });
}

export function useTasksByCompletedAt(date: Date) {
  return useQuery({
    queryKey: [...TASKS_BY_DATE_QUERY_KEY, 'completed', date.toISOString()],
    queryFn: async () => {
      await ensureDbInitialized();
      return getTasksByCompletedAt(date);
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TaskInput) => {
      await ensureDbInitialized();
      const now = new Date().toISOString();
      const newTask: Task = {
        id: uuidv4(),
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        completedAt: input.completedAt,
        cancelledAt: input.cancelledAt,
        createdAt: now,
        updatedAt: now,
      };
      return createTask(newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      await ensureDbInitialized();
      return updateTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      await ensureDbInitialized();
      return deleteTask(task);
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
    mutate: (task: Task) => {
      if (task.completedAt) {
        task.completedAt = null;
      } else {
        task.completedAt = new Date().toISOString();
      }
      updateTask.mutate(task);
    },
  };
}
