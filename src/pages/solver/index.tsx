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
      <MainLayout lockViewport actions={<NewPuzzleButton onSubmit={load} />}>
        <div className="grid h-full w-full max-w-lg mx-auto gap-2 pt-4 grid-rows-[auto_minmax(0,1fr)] [grid-template-areas:'stage'_'direction']">
          <div className="[grid-area:stage] mx-auto w-[min(100%,calc(100dvh-18rem))]">
            <GridStage />
          </div>
          <div className="[grid-area:direction] flex min-h-0 flex-col items-stretch pb-4">
            <WalkthroughControls />
            <ExplanationScript />
          </div>
        </div>
      </MainLayout>
    </StageContext.Provider>
  )
}
