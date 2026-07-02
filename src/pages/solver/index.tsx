import ExplanationScript from '@features/explain/ExplanationScript'
import GridStage from '@features/explain/GridStage'
import WalkthroughControls from '@features/explain/WalkthroughControls'
import { StageContext } from '@features/explain/contexts/stageContext'
import useStage from '@features/explain/hooks/useStage'
import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import NewPuzzleButton from '@shared/components/NewPuzzleButton'
import MainLayout from '@shared/layouts/MainLayout'

export default function SolvePage() {
  const { load } = useSolveGrid()
  const stage = useStage()

  return (
    <StageContext.Provider value={stage}>
      <MainLayout actions={<NewPuzzleButton onSubmit={load} />}>
        <div className="mt-4 grid w-full max-w-lg mx-auto content-start gap-2 grid-rows-[1fr_auto] [grid-template-areas:'stage'_'direction']">
          <div className="[grid-area:stage]">
            <GridStage />
          </div>
          <div className="[grid-area:direction] flex flex-col items-stretch py-4">
            <WalkthroughControls />
            <ExplanationScript />
          </div>
        </div>
      </MainLayout>
    </StageContext.Provider>
  )
}
