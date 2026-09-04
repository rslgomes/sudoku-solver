import importIcon from '@assets/import-icon.png'
import Button from '@shared/ui/Button'
import PromptDialog from '@shared/ui/PromptDialog'
import { useController } from '@features/play/contexts/playControllerContext'
import { useSolveGrid } from '../contexts/solveGridContext'
import { serializeGrid } from '@shared/sudoku/codec'

export default function ImportFromPlayButton() {
  const { grid } = useController()
  const { load } = useSolveGrid()

  return (
    <PromptDialog
      title="Import from Play"
      prompt="Bring the puzzle from Play into Solve. What should it contain?"
      options={[
        {
          name: 'Initial board',
          title: 'Import the original given puzzle',
          icon: <></>,
          onSelect: () => load(serializeGrid(grid, 'initial')),
        },
        {
          name: 'Current state',
          icon: <></>,
          disabled: true,
          disabledReason:
            'Coming soon — importing your progress as-is is not implemented yet.',
          onSelect: () => {},
        },
      ]}
      trigger={(open) => (
        <Button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-label="Import puzzle from Play"
          className="h-8 p-1"
        >
          <span className="flex items-center justify-between gap-2">
            <img src={importIcon} alt="Import" className="size-6" />
            <span className="hidden lg:block">Import</span>
          </span>
        </Button>
      )}
    />
  )
}
