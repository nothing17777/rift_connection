import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  streak: number;
  lastPlayedDate: string | null;
  completedToday: string[];
  guessHistory: Record<string, string[]>;
  completeGame: (gameId: string) => void;
  addGuess: (gameId: string, guess: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastPlayedDate: null,
      completedToday: [],
      guessHistory: {},
      completeGame: (gameId: string) => {
        const today = new Date().toDateString();
        const { lastPlayedDate, completedToday, streak } = get();

        if (lastPlayedDate !== today) {
          // New day
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = lastPlayedDate === yesterday.toDateString();

          set({
            lastPlayedDate: today,
            completedToday: [gameId],
            streak: isYesterday ? streak + 1 : 1,
            guessHistory: {}, // reset daily history? Or maybe just keep it but keyed by date/game
          });
        } else {
          if (!completedToday.includes(gameId)) {
            set({ completedToday: [...completedToday, gameId] });
          }
        }
      },
      addGuess: (gameId: string, guess: string) => {
        set((state) => ({
          guessHistory: {
            ...state.guessHistory,
            [gameId]: [...(state.guessHistory[gameId] || []), guess],
          },
        }));
      },
    }),
    {
      name: 'the-rift-storage',
    }
  )
);
