import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import type { Mood, MoodInput } from "@/lib/types";
import {
  getTodaysMood,
  getMoods,
  getMoodByDate,
  createMood as createMoodDb,
  initDatabase,
} from "@/lib/db";

const MOODS_QUERY_KEY = ["moods"];
const TODAY_MOOD_QUERY_KEY = ["moods", "today"];
const MOOD_BY_DATE_QUERY_KEY = ["moods", "date"];

// Initialize database on first hook use
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export function useTodaysMood() {
  return useQuery({
    queryKey: TODAY_MOOD_QUERY_KEY,
    queryFn: async () => {
      await ensureDbInitialized();
      return getTodaysMood();
    },
  });
}

export function useMoods(limit = 30) {
  return useQuery({
    queryKey: [...MOODS_QUERY_KEY, limit],
    queryFn: async () => {
      await ensureDbInitialized();
      return getMoods(limit);
    },
  });
}

export function useMoodByDate(date: Date) {
  return useQuery({
    queryKey: [...MOOD_BY_DATE_QUERY_KEY, date.toISOString()],
    queryFn: async () => {
      await ensureDbInitialized();
      return getMoodByDate(date);
    },
  });
}

export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MoodInput) => {
      await ensureDbInitialized();
      const newMood: Mood = {
        ...input,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      return createMoodDb(newMood);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOODS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TODAY_MOOD_QUERY_KEY });
    },
  });
}
