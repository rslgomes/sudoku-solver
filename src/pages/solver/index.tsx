import ExplanationScript from '@features/explain/ExplanationScript'
import StageAnnouncer from '@features/explain/StageAnnouncer'
import GridStage from '@features/explain/GridStage'
import WalkthroughControls from '@features/explain/WalkthroughControls'
import { StageContext } from '@features/explain/contexts/stageContext'
import useStage from '@features/explain/hooks/useStage'
import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import ImportFromPlayButton from '@features/solve/widgets/ImportFromPlayButton'
import NewPuzzleButton from '@shared/components/NewPuzzleButton'
import MainLayout from '@shared/layouts/MainLayout'

export default function SolvePage() {
  const { load, solving } = useSolveGrid()
  const stage = useStage()

  return (
    <StageContext.Provider value={stage}>
      <MainLayout
        lockViewport
        actions={
          <>
            <ImportFromPlayButton />
            <NewPuzzleButton onSubmit={load} />
          </>
        }
      >
        <StageAnnouncer />
        <div className="flex h-full flex-col">
          <div className="relative mx-auto w-[min(100%,calc(100dvh-20rem))] max-w-lg pt-4">
            <GridStage />
            {solving && (
              <div
                role="status"
                className="bg-bg-base/80 text-fg-muted absolute inset-0 flex items-center justify-center text-sm"
              >
                Solving…
              </div>
            )}
          </div>
          <div className="bg-bg-base mt-3 flex min-h-0 flex-1 flex-col p-3 px-4">
            <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col gap-2">
              <WalkthroughControls />
              <ExplanationScript />
            </div>
          </div>
        </div>
      </MainLayout>
    </StageContext.Provider>
  )
}
