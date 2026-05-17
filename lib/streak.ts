interface StreakData {
  lastPlayed: string;
  streak: number;
  completedToday: string[];
}

const STORAGE_KEY = "the-rift-streak";

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return { lastPlayed: "", streak: 0, completedToday: [] };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { lastPlayed: "", streak: 0, completedToday: [] };
  try {
    return JSON.parse(raw) as StreakData;
  } catch {
    return { lastPlayed: "", streak: 0, completedToday: [] };
  }
}

export function updateStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordGameCompletion(gameId: string): StreakData {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const current = getStreakData();

  if (current.lastPlayed === today) {
    // Already played today — just add game if not already done
    if (!current.completedToday.includes(gameId)) {
      const updated: StreakData = {
        ...current,
        completedToday: [...current.completedToday, gameId],
      };
      updateStreakData(updated);
      return updated;
    }
    return current;
  } else if (current.lastPlayed === yesterdayStr) {
    // Continuing streak
    const updated: StreakData = {
      lastPlayed: today,
      streak: current.streak + 1,
      completedToday: [gameId],
    };
    updateStreakData(updated);
    return updated;
  } else {
    // Streak broken — start fresh
    const updated: StreakData = {
      lastPlayed: today,
      streak: 1,
      completedToday: [gameId],
    };
    updateStreakData(updated);
    return updated;
  }
}
