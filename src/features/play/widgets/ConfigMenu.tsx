import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import { useConfig } from '../contexts/playSettings'
import DisclosureMenu, {
  MenuSeparator,
  ToggleMenuItem,
} from '@shared/ui/DisclosureMenu'

export default function ConfigMenu() {
  const {
    highlightPeersOnHover,
    setHighlightPeersOnHover,
    highlightSameNumber,
    setHighlightSameNumber,
    showRemaining,
    setShowRemaining,
    showLockButton,
    setShowLockButton,
    showTimer,
    setShowTimer,
    autoError,
    setAutoError,
    blockWrong,
    setBlockWrong,
    autoClearPencil,
    setAutoClearPencil,
  } = useConfig()

  return (
    <DisclosureMenu
      label="Settings"
      trigger={
        <>
          <Cog6ToothIcon className="size-4" aria-hidden />
          Settings
        </>
      }
    >
      <ToggleMenuItem
        label="Highlight peers on hover"
        checked={highlightPeersOnHover}
        onChange={setHighlightPeersOnHover}
      />
      <ToggleMenuItem
        label="Highlight same number"
        checked={highlightSameNumber}
        onChange={setHighlightSameNumber}
      />
      <ToggleMenuItem
        label="Show remaining count"
        checked={showRemaining}
        onChange={setShowRemaining}
      />
      <ToggleMenuItem
        label="Show lock tool"
        checked={showLockButton}
        onChange={setShowLockButton}
      />
      <ToggleMenuItem
        label="Show timer"
        checked={showTimer}
        onChange={setShowTimer}
      />
      <MenuSeparator />
      <ToggleMenuItem
        label="Auto error highlight"
        checked={autoError}
        onChange={setAutoError}
      />
      <ToggleMenuItem
        label="Block wrong input"
        checked={blockWrong}
        onChange={setBlockWrong}
      />
      <ToggleMenuItem
        label="Auto clear pencil marks"
        checked={autoClearPencil}
        onChange={setAutoClearPencil}
      />
    </DisclosureMenu>
  )
}
