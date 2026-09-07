import { Hono } from 'hono'
import puzzles from './data/puzzles.json'
import type { Difficulty } from './sudoku'

type Bindings = {
  ASSETS: Fetcher
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const MS_PER_DAY = 86_400_000

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/daily', (c) => {
  const rawDifficulty = c.req.query('difficulty')
  const difficulty = DIFFICULTIES.includes(rawDifficulty as Difficulty)
    ? (rawDifficulty as Difficulty)
    : 'medium'

  const rawDay = c.req.query('day')
  const day = rawDay ? parseInt(rawDay, 10) : Math.floor(Date.now() / MS_PER_DAY)

  const pool = puzzles[difficulty]
  const entry = pool[((day % pool.length) + pool.length) % pool.length]

  return c.json({ day, difficulty, ...entry })
})

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw))

export default app
