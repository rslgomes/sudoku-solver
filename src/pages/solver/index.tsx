import {
  ConfigContext,
  useConfigContext,
} from '@features/play/contexts/playSettings'
import ExplanationProse from '@features/solve/ExplanationProse'
import SolutionDisplay from '@features/solve/SolutionDisplay'
import WalthroughtControls from '@features/solve/WalthroughtControls'
import MainLayout from '@shared/layouts/MainLayout'

export default function SolvePage() {
  const config = useConfigContext()
  return (
    <ConfigContext.Provider value={config}>
      <MainProvider />
    </ConfigContext.Provider>
  )
}

function MainProvider() {
  return (
    <MainLayout actions={null}>
      <div className="flex flex-col gap-2 w-full max-w-lg mx-auto">
        <SolutionDisplay />
        <WalthroughtControls />
        <ExplanationProse />
      </div>
    </MainLayout>
  )
}
