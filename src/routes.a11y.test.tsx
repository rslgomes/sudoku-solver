import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderRoute } from './test/renderRoute'

describe('route accessibility', () => {
  it('home route has no axe violations', async () => {
    await renderRoute('/')
    const main = await screen.findByRole('main')
    expect(await axe(main)).toHaveNoViolations()
  })

  it('solver route has no axe violations', async () => {
    await renderRoute('/solver')
    const main = await screen.findByRole('main')
    expect(await axe(main)).toHaveNoViolations()
  })
})
