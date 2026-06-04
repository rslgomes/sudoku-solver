import { CheckIcon, Cog6ToothIcon } from '@heroicons/react/24/solid'
import { useConfig } from './PlayableGrid/contexts/configContext'
import DisclosureMenu, {
  MenuSeparator,
  ToggleMenuItem,
} from '@shared/ui/DisclosureMenu'

const checkIcon = <CheckIcon className="size-3.5" />

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
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Highlight same number"
        checked={highlightSameNumber}
        onChange={setHighlightSameNumber}
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Show remaining count"
        checked={showRemaining}
        onChange={setShowRemaining}
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Show lock tool"
        checked={showLockButton}
        onChange={setShowLockButton}
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Show timer"
        checked={showTimer}
        onChange={setShowTimer}
        icon={checkIcon}
      />
      <MenuSeparator />
      <ToggleMenuItem
        label="Auto error highlight"
        checked={autoError}
        onChange={setAutoError}
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Block wrong input"
        checked={blockWrong}
        onChange={setBlockWrong}
        icon={checkIcon}
      />
      <ToggleMenuItem
        label="Auto clear pencil marks"
        checked={autoClearPencil}
        onChange={setAutoClearPencil}
        icon={checkIcon}
      />
    </DisclosureMenu>
  )
}
