import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../../test/renderRoute'

function gridCells() {
  return screen.getAllByRole('gridcell')
}

function focusable(cells: HTMLElement[]) {
  return cells.filter((c) => c.tabIndex === 0)
}

describe('play grid — roving tabIndex', () => {
  it('starts with exactly one focusable cell, at index 0', async () => {
    await renderRoute('/')
    const cells = gridCells()
    expect(focusable(cells)).toEqual([cells[0]])
  })

  it('moves the roving tabIndex to the clicked cell', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[10])

    expect(focusable(cells)).toEqual([cells[10]])
    expect(document.activeElement).toBe(cells[10])
  })
})

describe('play grid — keyboard navigation', () => {
  it('arrow keys move focus one cell at a time', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[10]) // row 1, col 1
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cells[11])

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(cells[20])

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(cells[19])

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(cells[10])
  })

  it('does not move focus past a grid edge', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[0])
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(cells[0])
  })

  it('Home/End move within the row, Ctrl+Home/End to the grid ends', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[11]) // row 1, col 2
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(cells[17]) // row 1, col 8

    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(cells[9]) // row 1, col 0

    await user.keyboard('{Control>}{End}{/Control}')
    expect(document.activeElement).toBe(cells[80])

    await user.keyboard('{Control>}{Home}{/Control}')
    expect(document.activeElement).toBe(cells[0])
  })
})

describe('play grid — selection state', () => {
  it('Space toggles aria-selected on the focused cell', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[5])
    expect(cells[5]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard(' ')
    expect(cells[5]).toHaveAttribute('aria-selected', 'false')
  })

  it('Escape clears the selection', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.keyboard('{Shift>}')
    await user.click(cells[3])
    await user.click(cells[4])
    await user.keyboard('{/Shift}')
    expect(cells[3]).toHaveAttribute('aria-selected', 'true')
    expect(cells[4]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Escape}')
    expect(cells[3]).toHaveAttribute('aria-selected', 'false')
    expect(cells[4]).toHaveAttribute('aria-selected', 'false')
  })
})

describe('play grid — entry and deletion', () => {
  it('digit keys write a value, Backspace clears it', async () => {
    const user = userEvent.setup()
    await renderRoute('/')
    const cells = gridCells()

    await user.click(cells[0])
    await user.keyboard('5')
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('entered 5')
    )

    await user.keyboard('{Backspace}')
    expect(cells[0]).toHaveAttribute('aria-label', expect.stringContaining('empty'))
  })
})

describe('play grid — givens are read-only', () => {
  it('locking a filled cell marks it aria-readonly and relabels it "given"', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    const cells = gridCells()
    await user.click(cells[0])
    await user.keyboard('7')

    await user.click(screen.getByLabelText('Options', { selector: 'summary' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /Show lock tool/i }))
    await user.click(
      screen.getByRole('button', { name: /Lock — fix given squares/i })
    )
    await user.click(cells[0])

    expect(cells[0]).toHaveAttribute('aria-readonly', 'true')
    expect(cells[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('given 7')
    )
  })
})

describe('mode changes — live region', () => {
  it('announces the active mode and its hint', async () => {
    const user = userEvent.setup()
    await renderRoute('/')

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Pen mode active')

    await user.click(
      screen.getByRole('button', { name: /Pencil — mark candidates/i })
    )
    expect(status).toHaveTextContent(
      'Pencil mode active — Mark candidate numbers in a square'
    )
  })
})
