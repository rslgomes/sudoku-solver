import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generatePuzzle, type Difficulty } from '../worker/sudoku'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const PUZZLES_PER_DIFFICULTY = 366

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../worker/data')
const outFile = join(outDir, 'puzzles.json')

async function main() {
  const data: Record<Difficulty, { puzzle: string; solution: string }[]> = {
    easy: [],
    medium: [],
    hard: [],
  }

  for (const difficulty of DIFFICULTIES) {
    for (let i = 0; i < PUZZLES_PER_DIFFICULTY; i++) {
      data[difficulty].push(generatePuzzle(difficulty))
      process.stdout.write(
        `\r${difficulty}: ${i + 1}/${PUZZLES_PER_DIFFICULTY}`
      )
    }
    process.stdout.write('\n')
  }

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, JSON.stringify(data))
  console.log(`Wrote ${outFile}`)
}

main()
