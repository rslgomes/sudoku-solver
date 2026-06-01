import PlayableGrid from '../../shared/components/PlayableGrid'
import { PlayableGridCtx } from '../../shared/components/PlayableGrid/context'
import MainLayout from '../../shared/layouts/MainLayout'
import type {
  Square,
  SudokuNumber,
} from '../../shared/components/PlayableGrid/types'
import PuzzleInput from '../../shared/components/PuzzleInput'
import { usePadActions } from './usePadActions'

const getEmptyBoard = (): Square[] =>
  Array.from({ length: 81 }, () => ({
    value: null as null,
    notes: new Set<SudokuNumber>(),
    color: null,
    locked: false,
  }))

const aside = (
  <>
    <h2 className="font-bold text-lg text-fg hidden lg:block">Puzzle input</h2>
    <PuzzleInput />
  </>
)

export default function HomePage() {
  const padActions = usePadActions({ initialGrid: getEmptyBoard() })
  return (
    <PlayableGridCtx.Provider value={padActions}>
      <MainLayout aside={aside}>
        <PlayableGrid />
      </MainLayout>
    </PlayableGridCtx.Provider>
  )
}
