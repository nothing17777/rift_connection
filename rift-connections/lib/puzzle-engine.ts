import { Puzzle, ConnectionCategory } from './puzzle-data';

// Shuffle items using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check a guess of 4 items against all categories of a puzzle
export function checkGuess(
  guess: string[],
  puzzle: Puzzle
): {
  isCorrect: boolean;
  category?: ConnectionCategory;
  oneAway: boolean;
  correctCategoryCount: number;
} {
  const sortedGuess = [...guess].sort();

  let maxMatches = 0;
  let matchingCategory: ConnectionCategory | undefined;

  for (const category of puzzle.categories) {
    const sortedCategoryItems = [...category.items].sort();
    
    // Find how many items in the guess match this category
    const matches = sortedGuess.filter(item => sortedCategoryItems.includes(item)).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      matchingCategory = category;
    }
  }

  const isCorrect = maxMatches === 4;
  const oneAway = maxMatches === 3;

  return {
    isCorrect,
    category: isCorrect ? matchingCategory : undefined,
    oneAway,
    correctCategoryCount: maxMatches,
  };
}

// Map difficulty strings to share grid emoji blocks
export const DIFFICULTY_EMOJIS: Record<'yellow' | 'green' | 'blue' | 'purple', string> = {
  yellow: '🟨',
  green: '🟩',
  blue: '🟦',
  purple: '🟪',
};

// Find the difficulty color of a champion in a specific puzzle
export function getItemDifficulty(item: string, puzzle: Puzzle): 'yellow' | 'green' | 'blue' | 'purple' {
  for (const category of puzzle.categories) {
    if (category.items.includes(item)) {
      return category.difficulty;
    }
  }
  return 'yellow'; // default fallback
}

// Generate the classic NYT Connections-style social share text with the grid of colored blocks
export function generateShareText(
  guessHistory: string[][],
  puzzle: Puzzle,
  isWon: boolean
): string {
  const header = `Rift Connections #${puzzle.puzzleNumber}\n${isWon ? 'GG WP! 🏆' : 'Defeat ☠️'}\n`;
  
  const grid = guessHistory
    .map(guess => {
      return guess
        .map(item => {
          const diff = getItemDifficulty(item, puzzle);
          return DIFFICULTY_EMOJIS[diff];
        })
        .join('');
    })
    .join('\n');
    
  return `${header}\n${grid}\n\nPlay here: ${typeof window !== 'undefined' ? window.location.origin : 'https://riftconnections.lol'}`;
}
