import Button from '@shared/ui/Button'
import { useStageContext } from './contexts/stageContext'

export default function WalkthroughControls() {
  const { navigation, position } = useStageContext()
  const { previousScene, nextScene, previousStep, nextStep } = navigation
  const { scene, step, sceneCount, stepCount } = position

  if (sceneCount === 0)
    return (
      <p className="text-center text-sm text-fg/60">
        Load a puzzle to watch it get solved.
      </p>
    )

  return (
    <div
      role="toolbar"
      aria-label="Walkthrough controls"
      className="flex flex-col items-center gap-2"
    >
      <div className="flex items-center gap-2">
        <Button onClick={previousScene} disabled={scene === 0}>
          ⏮ Scene
        </Button>
        <Button onClick={previousStep} disabled={scene === 0 && step === 0}>
          ◀ Step
        </Button>
        <Button onClick={nextStep}>Step ▶</Button>
        <Button onClick={nextScene} disabled={scene >= sceneCount - 1}>
          Scene ⏭
        </Button>
      </div>
      <span className="text-xs text-fg/60">
        Scene {scene + 1}/{sceneCount} · Step {step + 1}/{stepCount}
      </span>
    </div>
  )
}
