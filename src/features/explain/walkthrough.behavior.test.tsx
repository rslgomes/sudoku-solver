import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../../test/renderRoute'

const PUZZLE =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

type User = ReturnType<typeof userEvent.setup>

async function loadPuzzle(user: User) {
  await user.click(screen.getByRole('button', { name: /open puzzle input/i }))
  await user.click(screen.getAllByRole('textbox')[0])
  await user.paste(PUZZLE)
  await user.click(screen.getByRole('button', { name: /^load$/i }))
}

function position() {
  return screen.getByText(/\d+\/\d+ · \d+\/\d+ in scene/)
    .textContent as string
}

function liveRegion() {
  return screen.getByRole('status').textContent as string
}

async function renderWalkthrough() {
  const user = userEvent.setup()
  await renderRoute('/solver')
  await loadPuzzle(user)
  return user
}

describe('walkthrough keyboard', () => {
  it('arrow keys move by step and shift+arrows move by scene', async () => {
    const user = await renderWalkthrough()
    expect(position()).toMatch(/^1\/40/)

    await user.keyboard('{ArrowRight}')
    expect(position()).toMatch(/^2\/40/)

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    expect(position()).toMatch(/1\/2 in scene/)

    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(position()).toMatch(/^1\/40/)

    await user.keyboard('{ArrowLeft}')
    expect(position()).toMatch(/^1\/40/)
  })

  it('home and end jump to the ends of the timeline', async () => {
    const user = await renderWalkthrough()

    await user.keyboard('{End}')
    expect(position()).toMatch(/^40\/40/)

    await user.keyboard('{Home}')
    expect(position()).toMatch(/^1\/40/)
  })

  it('space toggles playback', async () => {
    const user = await renderWalkthrough()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })
})

describe('walkthrough live region', () => {
  it('announces the scene on arrival and the step while paused', async () => {
    const user = await renderWalkthrough()
    await waitFor(() =>
      expect(liveRegion()).toBe('Clearing Notes. Scene 1 of 20, 2 steps')
    )

    await user.keyboard('{ArrowRight}')
    expect(liveRegion()).toMatch(/^Step 2 of 2/)

    await user.keyboard('{ArrowRight}')
    expect(liveRegion()).toBe('Naked Single. Scene 2 of 20, 2 steps')
  })
})
