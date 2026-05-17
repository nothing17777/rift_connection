export function getDailyItem<T>(items: T[]): T {
  const seed = new Date().toDateString(); // "Sat May 17 2025"
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  return items[Math.abs(hash) % items.length];
}

// For cases where we have an object/record
export function getDailyKey(keys: string[]): string {
  return getDailyItem(keys);
}
