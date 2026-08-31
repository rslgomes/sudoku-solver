import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../../test/renderRoute'

function toolButton(name: RegExp) {
  return screen.getByRole('radio', { name })
}

function optionsTrigger() {
  return screen.getByLabelText('Options', { selector: 'summary' })
}

async function openOptions(user: ReturnType<typeof userEvent.setup>) {
  await user.click(optionsTrigger())
}

describe('play toolbox — mode shortcuts', () => {
  it('single letters switch the active mode', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('n')
    expect(toolButton(/Pencil — mark candidates/i)).toHaveAttribute(
      'aria-checked',
      'true'
    )

    await user.keyboard('e')
    expect(toolButton(/Erase/i)).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('c')
    expect(toolButton(/Color — paint background/i)).toHaveAttribute(
      'aria-checked',
      'true'
    )

    await user.keyboard('p')
    expect(toolButton(/Pen — fill a square/i)).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('ignores the lock shortcut while the lock tool is hidden', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('l')

    expect(
      screen.queryByRole('radio', { name: /Lock — fix given squares/i })
    ).not.toBeInTheDocument()
    expect(toolButton(/Pen — fill a square/i)).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('binds the lock shortcut once the lock tool is shown', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await openOptions(user)
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: /Show lock tool/i })
    )
    await user.keyboard('{Escape}')
    await user.keyboard('l')

    expect(toolButton(/Lock — fix given squares/i)).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('does not fire shortcuts while typing into a text field', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.click(screen.getByRole('button', { name: /Open puzzle input/i }))
    const field = screen.getAllByRole('textbox')[0]
    await user.click(field)
    await user.keyboard('n')

    expect(field).toHaveValue('n')
  })
})

describe('play toolbox — undo and reset shortcuts', () => {
  it('Ctrl+Z undoes the last entry', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    await user.keyboard('5')
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('entered 5')
    )

    await user.keyboard('{Control>}z{/Control}')
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
  })

  it('Alt+R opens the reset prompt and resetting clears the board', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    await user.keyboard('5')
    await user.keyboard('{Alt>}r{/Alt}')

    expect(screen.getByRole('dialog', { name: 'Reset puzzle' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
  })

  it('leaves the reset prompt closed while there is nothing to undo', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('{Alt>}r{/Alt}')

    expect(
      screen.queryByRole('dialog', { name: 'Reset puzzle' })
    ).not.toBeInTheDocument()
  })
})

describe('play assists — pad toggles', () => {
  it('the Remaining assist adds missing counts to the number pad', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Remaining' }))

    expect(screen.getByRole('button', { name: '1(9)' })).toBeInTheDocument()
  })

  it('keeps the assists reachable in every mode', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    for (const key of ['n', 'e', 'c', 'p']) {
      await user.keyboard(key)
      expect(screen.getByRole('group', { name: 'Board assists' })).toBeVisible()
    }
  })
})

describe('play settings — persistence', () => {
  it('restores toggles from a previous session', async () => {
    const user = userEvent.setup()
    const first = await renderRoute('/')

    await openOptions(user)
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: /Show timer/i })
    )
    first.unmount()

    await renderRoute('/')
    await openOptions(user)

    expect(
      screen.getByRole('menuitemcheckbox', { name: /Show timer/i })
    ).toHaveAttribute('aria-checked', 'true')
  })
})

describe('play options menu — keyboard', () => {
  it('Alt+O opens the menu and focuses its first item', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('{Alt>}o{/Alt}')

    expect(optionsTrigger()).toHaveAttribute('aria-expanded', 'true')
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemcheckbox', { name: /Show lock tool/i })
    )
  })

  it('arrow keys walk the items and wrap around', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('{Alt>}o{/Alt}')
    const items = [
      ...screen.getAllByRole('menuitemcheckbox'),
      ...screen.getAllByRole('menuitem'),
    ]

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(items[1])

    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(document.activeElement).toBe(items[items.length - 1])

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(items[0])

    await user.keyboard('{End}')
    expect(document.activeElement).toBe(items[items.length - 1])
  })

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('{Alt>}o{/Alt}')
    await user.keyboard('{Escape}')

    expect(optionsTrigger()).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(optionsTrigger())
  })
})

describe('puzzle input dialog', () => {
  it('opens with focus on the first square, not the close button', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.click(screen.getByRole('button', { name: /Open puzzle input/i }))

    expect(document.activeElement).toBe(
      screen.getByRole('textbox', { name: 'Row 1, column 1' })
    )
  })

  it('describes how to fill the grid', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.click(screen.getByRole('button', { name: /Open puzzle input/i }))

    expect(
      screen.getByRole('grid', { name: 'Sudoku puzzle input' })
    ).toHaveAccessibleDescription(/Type your puzzle/i)
  })
})

describe('play grid — keyboard tool parity', () => {
  it('Enter erases the focused cell in eraser mode', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    await user.keyboard('5')
    await user.keyboard('e')
    await user.click(cells[0])
    await user.keyboard('{Enter}')

    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
  })

  it('Enter locks the focused cell in lock mode', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(screen.getByLabelText('Options', { selector: 'summary' }))
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: /Show lock tool/i })
    )
    await user.keyboard('{Escape}')

    await user.click(cells[0])
    await user.keyboard('7')
    await user.keyboard('l')
    await user.keyboard('{Enter}')

    expect(cells[0]).toHaveAttribute('aria-readonly', 'true')
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('given 7')
    )
  })

  it('digits pick a paint color in paint mode instead of writing', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.keyboard('c')
    await user.click(cells[0])
    await user.keyboard('1')

    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
    expect(cells[0].querySelector('[style*="background-color"]')).not.toBeNull()
  })

  it('applies the active tool to the whole selection', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    await user.keyboard('5')
    await user.click(cells[1])
    await user.keyboard('5')

    await user.keyboard('e')
    await user.keyboard('{Shift>}')
    await user.click(cells[0])
    await user.click(cells[1])
    await user.keyboard('{/Shift}')
    await user.keyboard('{Enter}')

    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
    expect(cells[1]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('empty')
    )
  })
})

describe('play composites — one tab stop each', () => {
  it('exposes a single tab stop per toolbar', async () => {
    await renderRoute('/')

    for (const name of ['Tools', 'Numbers']) {
      const toolbar = screen.getByRole('toolbar', { name })
      const stops = [
        ...toolbar.querySelectorAll('button:not(dialog button)'),
      ].filter((b) => (b as HTMLButtonElement).tabIndex === 0)
      expect(stops).toHaveLength(1)
    }
  })

  it('walks the tool radios with the arrow keys', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    const pen = toolButton(/Pen — fill a square/i)
    pen.focus()
    await user.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(toolButton(/Pencil — mark candidates/i))

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(pen)
  })

  it('walks the number pad by row and column', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    screen.getByRole('button', { name: '1' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: '2' })
    )

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: '5' })
    )
  })
})

describe('play grid — selection keys', () => {
  function selectedCount() {
    return screen
      .getAllByRole('gridcell')
      .filter((c) => c.getAttribute('aria-selected') === 'true').length
  }

  it('Shift+arrow extends the selection', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[10])
    await user.keyboard('{Shift>}{ArrowRight}{ArrowRight}{/Shift}')

    expect(cells[10]).toHaveAttribute('aria-selected', 'true')
    expect(cells[11]).toHaveAttribute('aria-selected', 'true')
    expect(cells[12]).toHaveAttribute('aria-selected', 'true')
  })

  it('Shift+Space selects the row, Ctrl+Space the column', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[10])
    await user.keyboard('{Shift>} {/Shift}')
    expect(selectedCount()).toBe(9)

    await user.keyboard('{Escape}')
    await user.keyboard('{Control>} {/Control}')
    expect(selectedCount()).toBe(9)
    expect(cells[1]).toHaveAttribute('aria-selected', 'true')
    expect(cells[73]).toHaveAttribute('aria-selected', 'true')
  })

  it('Ctrl+A selects every square', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.click(screen.getAllByRole('gridcell')[40])
    await user.keyboard('{Control>}a{/Control}')

    expect(selectedCount()).toBe(81)
  })

  it('PageDown jumps a box down', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[4])
    await user.keyboard('{PageDown}')
    expect(document.activeElement).toBe(cells[31])

    await user.keyboard('{PageUp}')
    expect(document.activeElement).toBe(cells[4])
  })
})

describe('play announcements', () => {
  it('reports placements, erasures and undo in one live region', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')
    const status = screen.getByRole('status')

    await user.click(cells[0])
    await user.keyboard('5')
    expect(status).toHaveTextContent('5 placed in 1 square')

    await user.keyboard('{Backspace}')
    expect(status).toHaveTextContent('Erased 1 square')

    await user.keyboard('{Control>}z{/Control}')
    expect(status).toHaveTextContent('Move undone')
  })

  it('reports a move rejected by Block wrong input', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = screen.getAllByRole('gridcell')

    await openOptions(user)
    await user.click(
      screen.getByRole('menuitemcheckbox', { name: /Block wrong input/i })
    )
    await user.keyboard('{Escape}')

    await user.click(cells[0])
    await user.keyboard('5')
    await user.click(cells[1])
    await user.keyboard('5')

    expect(screen.getByRole('status')).toHaveTextContent(
      '5 conflicts with a peer — not placed'
    )
  })
})

describe('shortcuts dialog', () => {
  it('opens with ? and lists the grid keys', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('?')

    const dialog = screen.getByRole('dialog', { name: 'Keyboard shortcuts' })
    expect(dialog).toBeVisible()
    expect(dialog).toHaveTextContent('Shift + Space')
    expect(dialog).toHaveTextContent('Apply the active tool')
  })

  it('is also reachable from the Options menu', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await openOptions(user)
    await user.click(
      screen.getByRole('menuitem', { name: /Keyboard shortcuts/i })
    )

    expect(
      screen.getByRole('dialog', { name: 'Keyboard shortcuts' })
    ).toBeVisible()
  })
})
