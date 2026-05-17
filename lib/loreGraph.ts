export type LoreGraph = Record<string, string[]>;

export function findPath(start: string, end: string, graph: LoreGraph): string[] | null {
  if (!graph[start] || !graph[end]) return null;
  if (start === end) return [start];

  const visited = new Set<string>();
  const queue: string[][] = [[start]];
  visited.add(start);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    const neighbors = graph[current] || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        if (neighbor === end) return newPath;
        visited.add(neighbor);
        queue.push(newPath);
      }
    }
  }

  return null; // No path found
}

export function getParSteps(start: string, end: string, graph: LoreGraph): number {
  const path = findPath(start, end, graph);
  return path ? path.length - 1 : -1;
}
