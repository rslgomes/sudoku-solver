import type { Scene } from '@features/explain/types'
import type { Square } from '@shared/sudoku'

export type Technique = {
  name: string
  run: (grid: Square[]) => Scene | null
}
