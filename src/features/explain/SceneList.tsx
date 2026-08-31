import { useEffect, useRef } from 'react'
import Dialog from '@shared/ui/Dialog'
import { cn } from '@shared/libs/cn'
import { useStageContext } from './contexts/stageContext'

export default function SceneList({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}) {
  const { outline, position, navigation } = useStageContext()
  const { scene, total } = position
  const activeRef = useRef<HTMLButtonElement>(null)
  const close = () => dialogRef.current?.close()

  useEffect(() => {
    if (dialogRef.current?.open)
      activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [scene, dialogRef])

  return (
    <Dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      onClose={close}
      title="Scenes"
      className="w-full max-w-sm"
      headerClassName="pl-3"
    >
      <div className="m-2 bg-bg-sunken shadow-press">
        <ol className="max-h-[60vh] overflow-y-auto p-1 text-sm">
          {outline.map(({ title, stepCount }, i) => (
            <li key={i}>
              <button
                type="button"
                ref={i === scene ? activeRef : undefined}
                aria-current={i === scene ? 'step' : undefined}
                onClick={() => {
                  navigation.goToScene(i)
                  close()
                }}
                className={cn(
                  'flex w-full items-baseline gap-2 px-2 py-1 text-left cursor-pointer',
                  'hover:bg-accent/10',
                  i === scene && 'bg-accent/15 font-bold'
                )}
              >
                <span className="w-6 shrink-0 text-right text-xs text-fg-muted">
                  {i + 1}
                </span>
                <span className="flex-1 text-fg">{title}</span>
                <span className="shrink-0 text-xs text-fg-muted">
                  {stepCount === 1 ? '1 step' : `${stepCount} steps`}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="px-2 pb-2 text-xs text-fg-muted">
        {outline.length} scenes · {total} steps
      </p>
    </Dialog>
  )
}
