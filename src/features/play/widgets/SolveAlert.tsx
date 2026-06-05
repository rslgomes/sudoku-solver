import { useController } from '../contexts/controllerContext'
import Dialog from '@shared/ui/Dialog'
import Button from '@shared/ui/Button'

export default function SolveAlert() {
  const { solveAlert, timer, onReset } = useController()
  const { minutes, seconds } = timer.value

  if (!solveAlert.open) return null

  const clearAndClose = () => {
    onReset()
    solveAlert.close()
  }

  return (
    <Dialog
      title="Solved!"
      onClose={solveAlert.close}
      ref={(el) => {
        if (el && !el.open) el.showModal()
      }}
      headerClassName="bg-green"
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <p className="text-center text-fg">You solved the puzzle!</p>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-style text-xs text-accent uppercase tracking-widest">
            Time
          </span>
          <span className="font-style text-2xl text-fg tabular-nums">
            {minutes}:{seconds}
          </span>
        </div>
        <Button type="button" onClick={clearAndClose} className="font-semibold">
          Clear grid
        </Button>
      </div>
    </Dialog>
  )
}
