import ConfigMenu from '@features/play/widgets/ConfigMenu'
import Timer from '@features/play/widgets/Timer'
import SolveAlert from '@features/play/widgets/SolveAlert'
import ShareButton from '@features/play/widgets/ShareButton'
import NewPuzzleButton from '@shared/components/NewPuzzleButton'
import MainLayout from '@shared/layouts/MainLayout'
import { useController } from '@features/play/contexts/playControllerContext'
import { parseGrid } from '@shared/sudoku/codec'
import Puzzle from '@features/play/Puzzle'
import Toolbox from '@features/play/Toolbox'
import Pad from '@features/play/Pad'

export default function HomePage() {
  const { fillGrid } = useController()
  return (
    <>
      <MainLayout
        header={<ConfigMenu />}
        footer={<Timer />}
        actions={
          <>
            <ShareButton />
            <NewPuzzleButton onSubmit={(raw) => fillGrid(parseGrid(raw))} />
          </>
        }
      >
        <div>
          <div className="mt-4 grid w-full max-w-lg mx-auto content-start gap-2 grid-cols-[1fr_auto] [grid-template-areas:'puzzle_toolbox']">
            <Puzzle className="[grid-area:puzzle]" />
            <Toolbox className="[grid-area:toolbox] ml-2" />
          </div>
          <Pad className="mt-3" />
        </div>
      </MainLayout>
      <SolveAlert />
    </>
  )
}
