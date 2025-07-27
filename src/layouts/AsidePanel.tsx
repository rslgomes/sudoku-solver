import { useState } from 'react'
import IconButton from '../components/ui/IconButton'
import {
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
} from '@heroicons/react/16/solid'

interface AsidePanelProps {
  children: React.ReactNode
  toggleLabel?: string
}

export default function AsidePanel({ children }: AsidePanelProps) {
  const [open, setOpen] = useState(false)

  const ARIA_PANEL_ID = 'aside-panel'
  const ARIA_LABEL_ID = 'aside-panel-label'

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-1/4 h-full flex-col items-center justify-center pl-mainp pt-4">
        {children}
      </aside>

      {/* Mobile */}
      <div className={`lg:hidden absolute ${open ? 'w-full' : 'w-fit'} z-30`}>
        {/* Toggle Button */}
        {!open && (
          <div className="p-1 pl-4 bg-bg2/50 rounded-r-full animate-[fadeIn_300ms_ease-out_forwards] z-10">
            <IconButton
              id="aside-toggle"
              aria-expanded={open}
              aria-controls={ARIA_PANEL_ID}
              aria-label={open ? 'Close tools panel' : 'Open tools panel'}
              className="hover:bg-secondary-bg2/50"
              onClick={() => setOpen(true)}
            >
              <AdjustmentsHorizontalIcon className="size-6 text-secondary-fg2" />
            </IconButton>
          </div>
        )}

        {/* Slide-in Panel */}
        {open && (
          <div
            id={ARIA_PANEL_ID}
            role="region"
            aria-labelledby={ARIA_LABEL_ID}
            className="
              w-full h-full min-h-[calc(100vh-4.5rem)]
              absolute bg-bg2 p-mainp
              z-50
              flex flex-col items-start justify-start
              animate-[slideIn_300ms_ease-out_forwards]
            "
          >
            <span id={ARIA_LABEL_ID} className="sr-only">
              Tools Panel
            </span>
            <IconButton
              onClick={() => setOpen(false)}
              className="hover:bg-secondary-bg2/50"
              aria-label="Close tools panel"
            >
              <ArrowLeftIcon className="size-6 text-secondary-fg2 absolute top-2 left-mainp" />
            </IconButton>
            {children}
          </div>
        )}
      </div>
    </>
  )
}
