import Dialog from '@shared/ui/Dialog'
import useShortcuts from '@shared/hooks/useShortcuts'

const GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Grid',
    keys: [
      ['Arrow keys', 'Move the cursor'],
      ['Shift + arrows', 'Move and extend the selection'],
      ['Page Up / Page Down', 'Jump one box up or down'],
      ['Home / End', 'First / last square in the row'],
      ['Ctrl + Home / End', 'First / last square in the grid'],
      ['Space', 'Select or deselect the square'],
      ['Shift + Space', 'Select the row'],
      ['Ctrl + Space', 'Select the column'],
      ['Ctrl + A', 'Select every square'],
      ['Escape', 'Clear the selection'],
      ['1 – 9', 'Write a digit — or pick a color while painting'],
      ['Enter', 'Apply the active tool'],
      ['Delete / Backspace', 'Erase'],
    ],
  },
  {
    title: 'Tools',
    keys: [
      ['P', 'Pen'],
      ['N', 'Pencil'],
      ['E', 'Eraser'],
      ['C', 'Color'],
      ['L', 'Lock, when the tool is shown'],
      ['Ctrl + Z', 'Undo'],
      ['Alt + R', 'Reset the puzzle'],
    ],
  },
  {
    title: 'Menus',
    keys: [
      ['Alt', 'Underline the menu access keys'],
      ['Alt + O', 'Options'],
      ['?', 'This list'],
    ],
  },
]

export default function ShortcutsDialog({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}) {
  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()

  useShortcuts({ '?': open, 'shift+?': open })

  return (
    <Dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      onClose={close}
      title="Keyboard shortcuts"
      className="w-full max-w-md"
    >
      <div className="flex flex-col gap-4 p-4">
        {GROUPS.map(({ title, keys }) => (
          <section key={title}>
            <h3 className="font-style text-sm text-accent uppercase tracking-widest">
              {title}
            </h3>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">
              {keys.map(([combo, action]) => (
                <div key={combo} className="contents">
                  <dt className="font-style text-fg whitespace-nowrap">
                    {combo}
                  </dt>
                  <dd className="text-fg-muted">{action}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
