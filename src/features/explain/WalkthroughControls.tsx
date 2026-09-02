import { useRef } from 'react'
import {
  BackwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid'
import Button from '@shared/ui/Button'
import ToggleButton from '@shared/ui/ToggleButton'
import useShortcuts from '@shared/hooks/useShortcuts'
import { useStageContext } from './contexts/stageContext'
import { SPEEDS } from './hooks/useStage'
import SceneList from './SceneList'

export default function WalkthroughControls() {
  const { navigation, position, playback, currentScene } = useStageContext()
  const sceneListRef = useRef<HTMLDialogElement>(null)
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

  useShortcuts({
    arrowright: nextStep,
    arrowleft: previousStep,
    'shift+arrowright': nextScene,
    'shift+arrowleft': previousScene,
    ' ': playing ? pause : play,
    home: () => seek(0),
    end: () => seek(total - 1),
  })

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
      className="flex flex-col items-stretch gap-2"
    >
      <div className="flex items-center justify-center gap-1.5">
        <Button
          onClick={previousScene}
          disabled={scene === 0}
          aria-label="Previous scene"
          aria-keyshortcuts="Shift+ArrowLeft"
          className="size-8 p-0"
        >
          <BackwardIcon aria-hidden className="size-4" />
        </Button>
        <Button
          onClick={previousStep}
          disabled={index === 0}
          aria-label="Previous step"
          aria-keyshortcuts="ArrowLeft"
          className="size-8 p-0"
        >
          <ChevronLeftIcon aria-hidden className="size-4" />
        </Button>
        <Button
          onClick={playing ? pause : play}
          aria-pressed={playing}
          aria-label={playing ? 'Pause' : 'Play'}
          aria-keyshortcuts="Space"
          className="size-10 p-0 text-accent"
        >
          {playing ? (
            <PauseIcon aria-hidden className="size-5" />
          ) : (
            <PlayIcon aria-hidden className="size-5" />
          )}
        </Button>
        <Button
          onClick={nextStep}
          disabled={index >= total - 1}
          aria-label="Next step"
          aria-keyshortcuts="ArrowRight"
          className="size-8 p-0"
        >
          <ChevronRightIcon aria-hidden className="size-4" />
        </Button>
        <Button
          onClick={nextScene}
          disabled={scene >= sceneCount - 1}
          aria-label="Next scene"
          aria-keyshortcuts="Shift+ArrowRight"
          className="size-8 p-0"
        >
          <ForwardIcon aria-hidden className="size-4" />
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
        className="scrubber w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="flex items-center gap-1 text-xs text-fg-muted">
            Speed
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-bg-raised text-fg font-main shadow-raise cursor-default px-1 py-0.5 text-xs"
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

        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <span className="font-style tracking-wider">
            {index + 1}/{total} · {step + 1}/{stepCount} in scene
          </span>
          <Button
            size="sm"
            onClick={() => sceneListRef.current?.showModal()}
            aria-haspopup="dialog"
          >
            Scene {scene + 1}/{sceneCount}
          </Button>
        </div>
      </div>

      <SceneList dialogRef={sceneListRef} />
    </div>
  )
}
