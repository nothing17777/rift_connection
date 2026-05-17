export function buildShareString(gameTitle: string, gameNumber: number, guesses: { state: 'correct' | 'close' | 'wrong' }[], maxGuesses: number): string {
  const emojiMap = {
    correct: '🟩',
    close: '🟨',
    wrong: '🟥',
  };

  const grid = guesses.map(g => emojiMap[g.state]).join('');
  const score = guesses.some(g => g.state === 'correct') ? guesses.length : 'X';
  
  return `The Rift — ${gameTitle} #${gameNumber}\n${grid} ${score}/${maxGuesses}\ntherift.gg`;
}
