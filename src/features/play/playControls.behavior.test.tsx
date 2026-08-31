import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../../test/renderRoute'

function toolButton(name: RegExp) {
  return screen.getByRole('button', { name })
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
      'aria-pressed',
      'true'
    )

    await user.keyboard('e')
    expect(toolButton(/Erase/i)).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard('c')
    expect(toolButton(/Color — paint background/i)).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.keyboard('p')
    expect(toolButton(/Pen — fill a square/i)).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('ignores the lock shortcut while the lock tool is hidden', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    await user.keyboard('l')

    expect(
      screen.queryByRole('button', { name: /Lock — fix given squares/i })
    ).not.toBeInTheDocument()
    expect(toolButton(/Pen — fill a square/i)).toHaveAttribute(
      'aria-pressed',
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
      'aria-pressed',
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
    const items = screen.getAllByRole('menuitemcheckbox')

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
    ).toHaveAccessibleDescription(/Paste an 81-character puzzle/i)
  })
})
