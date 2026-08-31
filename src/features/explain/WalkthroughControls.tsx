import Button from '@shared/ui/Button'
import ToggleButton from '@shared/ui/ToggleButton'
import { useStageContext } from './contexts/stageContext'
import { SPEEDS } from './hooks/useStage'

export default function WalkthroughControls() {
  const { navigation, position, playback, currentScene } = useStageContext()
  const { previousScene, nextScene, previousStep, nextStep, seek } = navigation
  const { scene, step, index, total, sceneCount, stepCount } = position
  const {
    playing,
    play,
    pause,
    speed,
    setSpeed,
    pauseAtSceneEnd,
    setPauseAtSceneEnd,
  } = playback

  if (sceneCount === 0)
    return (
      <p className="text-center text-sm text-fg-muted">
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
        <Button onClick={previousStep} disabled={index === 0}>
          ◀ Step
        </Button>
        <Button
          onClick={playing ? pause : play}
          aria-pressed={playing}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-20"
        >
          {playing ? '❚❚ Pause' : '▶ Play'}
        </Button>
        <Button onClick={nextStep} disabled={index >= total - 1}>
          Step ▶
        </Button>
        <Button onClick={nextScene} disabled={scene >= sceneCount - 1}>
          Scene ⏭
        </Button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(total - 1, 0)}
        value={index}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Seek walkthrough"
        aria-valuetext={`Step ${index + 1} of ${total}, ${currentScene.title}`}
        className="w-full max-w-sm accent-accent cursor-pointer"
      />

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-fg-muted">
          Speed
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-bg-raised text-fg font-main shadow-raise px-1 py-0.5 text-xs cursor-default"
          >
            {SPEEDS.map((rate) => (
              <option key={rate} value={rate}>
                {rate}×
              </option>
            ))}
          </select>
        </label>
        <ToggleButton
          size="sm"
          checked={pauseAtSceneEnd}
          onChange={(e) => setPauseAtSceneEnd(e.target.checked)}
          title="Stop playback at the end of each technique"
        >
          Pause between scenes
        </ToggleButton>
      </div>

      <span className="text-xs text-fg-muted">
        Step {index + 1}/{total} · Scene {scene + 1}/{sceneCount} · Step{' '}
        {step + 1}/{stepCount} in scene
      </span>
    </div>
  )
}
