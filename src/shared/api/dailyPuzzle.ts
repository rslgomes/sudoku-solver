export type Difficulty = 'easy' | 'medium' | 'hard'

export async function getDailyPuzzle(difficulty: Difficulty) {
  const res = await fetch(`/api/daily?difficulty=${difficulty}`)
  if (!res.ok) throw new Error('Failed to fetch daily puzzle')

  const data = (await res.json()) as { puzzle: string; solution: string }
  return data.puzzle
}
