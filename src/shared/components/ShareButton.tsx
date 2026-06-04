import { LockClosedIcon, PencilIcon } from '@heroicons/react/24/solid'
import shareIcon from '@assets/share-icon.png'
import Button from '../ui/Button'
import PromptDialog from '../ui/PromptDialog'
import { useGrid } from './PlayableGrid/contexts/gridContext'
import { serializeGrid } from '../libs/gridCodec'

export default function ShareButton() {
  const { grid } = useGrid()

  const copyShareLink = (mode: 'initial' | 'current') => {
    const digits = serializeGrid(grid, mode)
    const url = `${window.location.origin}/share?grid=${digits}`
    void navigator.clipboard?.writeText(url)
  }

  return (
    <PromptDialog
      title="Share puzzle"
      prompt="Copy a shareable link to the clipboard. What should it contain?"
      options={[
        {
          name: 'Initial board',
          title: 'Share the original given puzzle',
          icon: <LockClosedIcon aria-hidden className="size-5 text-blue" />,
          onSelect: () => copyShareLink('initial'),
        },
        {
          name: 'Current state',
          title: 'Share the board as it is now (no pencil marks)',
          icon: <PencilIcon aria-hidden className="size-5 text-blue" />,
          onSelect: () => copyShareLink('current'),
        },
      ]}
      trigger={(open) => (
        <Button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-label="Share puzzle"
          className="h-8 p-1"
        >
          <span className="flex items-center justify-between gap-2">
            <img src={shareIcon} alt="Share" className="size-6" />
            <span className="hidden lg:block">Share</span>
          </span>
        </Button>
      )}
    />
  )
}
