import { useRef } from 'react'
import { useConfig } from '../contexts/playSettings'
import AccessKey from '@shared/ui/AccessKey'
import DisclosureMenu, {
  ActionMenuItem,
  MenuSeparator,
  ToggleMenuItem,
} from '@shared/ui/DisclosureMenu'
import ShortcutsDialog from './ShortcutsDialog'

export default function ConfigMenu() {
  const {
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
  const shortcutsRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <DisclosureMenu
        label="Options"
        altKey="o"
        trigger={<AccessKey char="o">Options</AccessKey>}
      >
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
        <MenuSeparator />
        <ActionMenuItem onClick={() => shortcutsRef.current?.showModal()}>
          Keyboard shortcuts…
        </ActionMenuItem>
      </DisclosureMenu>
      <ShortcutsDialog dialogRef={shortcutsRef} />
    </>
  )
}
