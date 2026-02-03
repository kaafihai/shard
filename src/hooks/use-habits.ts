import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Habit, HabitInput, HabitEntry, HabitEntryInput } from '@/lib/types';
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitEntriesByDate,
  getAllHabitEntries,
  createHabitEntry,
  updateHabitEntry,
  deleteHabitEntry,
  initDatabase,
  backpopulateHabitEntries,
} from '@/lib/db';

const HABITS_QUERY_KEY = ['habits'];
const HABIT_ENTRIES_QUERY_KEY = ['habit-entries'];

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    await backpopulateHabitEntries();
    dbInitialized = true;
  }
}

export function useHabits(includeArchived: boolean = false) {
  return useQuery({
    queryKey: [...HABITS_QUERY_KEY, { includeArchived }],
    queryFn: async () => {
      await ensureDbInitialized();
      return getHabits(includeArchived);
    },
  });
}

export function useHabitById(id: string) {
  return useQuery({
    queryKey: [...HABITS_QUERY_KEY, id],
    queryFn: async () => {
      await ensureDbInitialized();
      return getHabitById(id);
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HabitInput) => {
      await ensureDbInitialized();
      const now = new Date().toISOString();
      const newHabit: Habit = {
        id: uuidv4(),
        title: input.title,
        description: input.description,
        rrule: input.rrule,
        archivedAt: input.archivedAt,
        pausedAt: input.pausedAt,
        cancelledAt: input.cancelledAt,
        createdAt: now,
        updatedAt: now,
      };
      return createHabit(newHabit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Habit) => {
      await ensureDbInitialized();
      return updateHabit(habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Habit) => {
      await ensureDbInitialized();
      return deleteHabit(habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}

export function useArchiveHabit() {
  const updateHabit = useUpdateHabit();

  return {
    ...updateHabit,
    mutate: (habit: Habit) => {
      updateHabit.mutate({
        ...habit,
        archivedAt: habit.archivedAt ? null : new Date().toISOString(),
      });
    },
  };
}

// =============================================================================
// HABIT ENTRY HOOKS
// =============================================================================

export function useHabitEntriesByDate(date: string) {
  return useQuery({
    queryKey: [...HABIT_ENTRIES_QUERY_KEY, 'date', date],
    queryFn: async () => {
      await ensureDbInitialized();
      return getHabitEntriesByDate(date);
    },
  });
}

export function useAllHabitEntries() {
  return useQuery({
    queryKey: [...HABIT_ENTRIES_QUERY_KEY, 'all'],
    queryFn: async () => {
      await ensureDbInitialized();
      return getAllHabitEntries();
    },
  });
}

export function useCreateHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HabitEntryInput) => {
      await ensureDbInitialized();
      const now = new Date().toISOString();
      const newEntry: HabitEntry = {
        id: uuidv4(),
        habitId: input.habitId,
        date: input.date,
        status: input.status,
        note: input.note,
        createdAt: now,
      };
      return createHabitEntry(newEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABIT_ENTRIES_QUERY_KEY });
    },
  });
}

export function useUpdateHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: HabitEntry) => {
      await ensureDbInitialized();
      return updateHabitEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABIT_ENTRIES_QUERY_KEY });
    },
  });
}

export function useDeleteHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: HabitEntry) => {
      await ensureDbInitialized();
      return deleteHabitEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABIT_ENTRIES_QUERY_KEY });
    },
  });
}

export function useToggleHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habit, date, currentEntry }: { habit: Habit; date: string; currentEntry: HabitEntry | null }) => {
      await ensureDbInitialized();

      if (currentEntry) {
        // Toggle between completed and not (delete entry to mark as pending)
        if (currentEntry.status === 'completed') {
          await deleteHabitEntry(currentEntry);
          return null;
        } else {
          // Update to completed
          return updateHabitEntry({ ...currentEntry, status: 'completed' });
        }
      } else {
        // Create new completed entry
        const now = new Date().toISOString();
        const newEntry: HabitEntry = {
          id: uuidv4(),
          habitId: habit.id,
          date,
          status: 'completed',
          note: '',
          createdAt: now,
        };
        return createHabitEntry(newEntry);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABIT_ENTRIES_QUERY_KEY });
    },
  });
}

// Helper to get today's date as YYYY-MM-DD
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
