export type Difficulty = 'easy' | 'medium' | 'hard'

const CLUES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 26,
}

export function generatePuzzle(difficulty: Difficulty) {
  const solution = fillGrid()
  const puzzle = digHoles(solution, CLUES_BY_DIFFICULTY[difficulty])

  return {
    puzzle: puzzle.join(''),
    solution: solution.join(''),
  }
}

function fillGrid(): number[] {
  const grid = new Array<number>(81).fill(0)
  fill(grid, 0)
  return grid
}

function fill(grid: number[], pos: number): boolean {
  if (pos === 81) return true

  const row = Math.floor(pos / 9)
  const col = pos % 9

  for (const value of shuffled(DIGITS)) {
    if (!isValid(grid, row, col, value)) continue

    grid[pos] = value
    if (fill(grid, pos + 1)) return true
    grid[pos] = 0
  }

  return false
}

function digHoles(solution: number[], clues: number): number[] {
  const puzzle = [...solution]
  const positions = shuffled(Array.from({ length: 81 }, (_, i) => i))
  let remaining = 81

  for (const pos of positions) {
    if (remaining <= clues) break

    const backup = puzzle[pos]
    puzzle[pos] = 0

    if (countSolutions(puzzle, 2) === 1) {
      remaining--
    } else {
      puzzle[pos] = backup
    }
  }

  return puzzle
}

function countSolutions(grid: number[], limit: number): number {
  const board = [...grid]
  let count = 0

  function search(pos: number): boolean {
    if (pos === 81) {
      count++
      return count >= limit
    }
    if (board[pos] !== 0) return search(pos + 1)

    const row = Math.floor(pos / 9)
    const col = pos % 9

    for (const value of DIGITS) {
      if (!isValid(board, row, col, value)) continue

      board[pos] = value
      if (search(pos + 1)) return true
      board[pos] = 0
    }

    return false
  }

  search(0)
  return count
}

function isValid(grid: number[], row: number, col: number, value: number) {
  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === value) return false
    if (grid[i * 9 + col] === value) return false
  }

  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[(boxRow + r) * 9 + (boxCol + c)] === value) return false
    }
  }

  return true
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
