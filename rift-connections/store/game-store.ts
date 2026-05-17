import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { Puzzle, ConnectionCategory } from '../lib/puzzle-data';
import { checkGuess, shuffleArray } from '../lib/puzzle-engine';

export interface GameState {
  activeDate: string;
  puzzleNumber: number;
  selectedItems: string[];
  solvedCategories: ConnectionCategory[];
  guessHistory: string[][];
  mistakesRemaining: number;
  gameStatus: 'playing' | 'won' | 'lost';
  boardItems: string[]; // Remaining items on the board
  currentStreak: number;
  solvedHistory: Record<string, 'won' | 'lost'>; // Date -> Status
  savedSessions: Record<string, {
    selectedItems: string[];
    solvedCategories: ConnectionCategory[];
    guessHistory: string[][];
    mistakesRemaining: number;
    gameStatus: 'playing' | 'won' | 'lost';
    boardItems: string[];
  }>;
  _hasHydrated: boolean;
}

export interface GameActions {
  initPuzzle: (puzzle: Puzzle) => void;
  selectItem: (item: string) => void;
  deselectItem: (item: string) => void;
  clearSelection: () => void;
  shuffleBoard: () => void;
  submitGuess: (puzzle: Puzzle) => {
    isCorrect: boolean;
    oneAway: boolean;
    categoryTitle?: string;
    alreadyGuessed: boolean;
  };
  revealNextCategory: (puzzle: Puzzle) => void; // Auto-solve remaining in defeat
  setHasHydrated: (state: boolean) => void;
}

const initialState = {
  activeDate: '',
  puzzleNumber: 0,
  selectedItems: [],
  solvedCategories: [],
  guessHistory: [],
  mistakesRemaining: 4,
  gameStatus: 'playing' as const,
  boardItems: [],
  currentStreak: 0,
  solvedHistory: {},
  savedSessions: {},
  _hasHydrated: false,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      initPuzzle: (puzzle: Puzzle) => {
        const state = get();
        
        // 1. If it's already the active date and the game is active or finished, preserve progress
        if (state.activeDate === puzzle.date) {
          if (state.gameStatus !== 'playing' || state.boardItems.length > 0) {
            return;
          }
        }

        // 2. Save current session before overwriting (only if it was an active incomplete game)
        let nextSavedSessions = state.savedSessions;
        if (state.activeDate && state.gameStatus === 'playing' && state.boardItems.length > 0) {
          nextSavedSessions = {
            ...state.savedSessions,
            [state.activeDate]: {
              selectedItems: state.selectedItems,
              solvedCategories: state.solvedCategories,
              guessHistory: state.guessHistory,
              mistakesRemaining: state.mistakesRemaining,
              gameStatus: state.gameStatus,
              boardItems: state.boardItems,
            }
          };
        }

        // 3. Restore if we have a saved session for this puzzle
        const restored = nextSavedSessions[puzzle.date];
        if (restored) {
          set({
            savedSessions: nextSavedSessions,
            activeDate: puzzle.date,
            puzzleNumber: puzzle.puzzleNumber,
            selectedItems: restored.selectedItems,
            solvedCategories: restored.solvedCategories,
            guessHistory: restored.guessHistory,
            mistakesRemaining: restored.mistakesRemaining,
            gameStatus: restored.gameStatus,
            boardItems: restored.boardItems,
          });
          return;
        }

        // 4. Check if this puzzle was already completed in the history
        const historicalOutcome = state.solvedHistory[puzzle.date];

        if (historicalOutcome === 'won') {
          set({
            activeDate: puzzle.date,
            puzzleNumber: puzzle.puzzleNumber,
            selectedItems: [],
            solvedCategories: puzzle.categories,
            guessHistory: state.guessHistory.length > 0 && state.activeDate === puzzle.date ? state.guessHistory : [],
            mistakesRemaining: state.activeDate === puzzle.date ? state.mistakesRemaining : 4,
            gameStatus: 'won',
            boardItems: [],
          });
          return;
        }

        if (historicalOutcome === 'lost') {
          set({
            activeDate: puzzle.date,
            puzzleNumber: puzzle.puzzleNumber,
            selectedItems: [],
            solvedCategories: puzzle.categories,
            guessHistory: state.guessHistory.length > 0 && state.activeDate === puzzle.date ? state.guessHistory : [],
            mistakesRemaining: 0,
            gameStatus: 'lost',
            boardItems: [],
          });
          return;
        }

        // 5. Start a fresh game
        const allItems = puzzle.categories.flatMap(cat => cat.items);
        const shuffled = shuffleArray(allItems);
        set({
          savedSessions: nextSavedSessions,
          activeDate: puzzle.date,
          puzzleNumber: puzzle.puzzleNumber,
          selectedItems: [],
          solvedCategories: [],
          guessHistory: [],
          mistakesRemaining: 4,
          gameStatus: 'playing',
          boardItems: shuffled,
        });
      },

      selectItem: (item: string) => {
        set(
          produce((state: GameState) => {
            if (state.gameStatus !== 'playing') return;
            if (state.selectedItems.includes(item)) {
              state.selectedItems = state.selectedItems.filter(i => i !== item);
            } else if (state.selectedItems.length < 4) {
              state.selectedItems.push(item);
            }
          })
        );
      },

      deselectItem: (item: string) => {
        set(
          produce((state: GameState) => {
            state.selectedItems = state.selectedItems.filter(i => i !== item);
          })
        );
      },

      clearSelection: () => {
        set({ selectedItems: [] });
      },

      shuffleBoard: () => {
        set(
          produce((state: GameState) => {
            state.boardItems = shuffleArray(state.boardItems);
          })
        );
      },

      submitGuess: (puzzle: Puzzle) => {
        const state = get();
        if (state.gameStatus !== 'playing') {
          return { isCorrect: false, oneAway: false, alreadyGuessed: false };
        }

        const guess = [...state.selectedItems];
        if (guess.length !== 4) {
          return { isCorrect: false, oneAway: false, alreadyGuessed: false };
        }

        // Check if already guessed
        const isAlreadyGuessed = state.guessHistory.some(h => {
          const sortedH = [...h].sort().join(',');
          const sortedG = [...guess].sort().join(',');
          return sortedH === sortedG;
        });

        if (isAlreadyGuessed) {
          return { isCorrect: false, oneAway: false, alreadyGuessed: true };
        }

        // Run check guess engine
        const result = checkGuess(guess, puzzle);

        let nextStatus = state.gameStatus;
        let nextMistakes = state.mistakesRemaining;
        let nextStreak = state.currentStreak;
        const nextSolvedCategories = [...state.solvedCategories];
        const nextGuessHistory = [...state.guessHistory, guess];
        let nextBoardItems = [...state.boardItems];

        const nextSolvedHistory = { ...state.solvedHistory };
        if (result.isCorrect && result.category) {
          nextSolvedCategories.push(result.category);
          
          // Remove guessed items from active board items
          nextBoardItems = nextBoardItems.filter(item => !guess.includes(item));
          
          if (nextSolvedCategories.length === 4) {
            nextStatus = 'won';
            nextStreak += 1;
            nextSolvedHistory[puzzle.date] = 'won';
          }
        } else {
          nextMistakes -= 1;
          if (nextMistakes === 0) {
            nextStatus = 'lost';
            nextStreak = 0; // Reset streak
            nextSolvedHistory[puzzle.date] = 'lost';
          }
        }

        set({
          solvedCategories: nextSolvedCategories,
          guessHistory: nextGuessHistory,
          mistakesRemaining: nextMistakes,
          gameStatus: nextStatus,
          boardItems: nextBoardItems,
          selectedItems: result.isCorrect ? [] : state.selectedItems, // Clear only if correct
          currentStreak: nextStreak,
          solvedHistory: nextSolvedHistory,
        });

        return {
          isCorrect: result.isCorrect,
          oneAway: result.oneAway,
          categoryTitle: result.category?.title,
          alreadyGuessed: false,
        };
      },

      revealNextCategory: (puzzle: Puzzle) => {
        set(
          produce((state: GameState) => {
            // Find unsolved categories
            const unsolved = puzzle.categories.filter(
              cat => !state.solvedCategories.some(s => s.id === cat.id)
            );

            if (unsolved.length > 0) {
              const nextReveal = unsolved[0];
              state.solvedCategories.push(nextReveal);
              state.boardItems = state.boardItems.filter(
                item => !nextReveal.items.includes(item)
              );
            }
          })
        );
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'rift-connections-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
