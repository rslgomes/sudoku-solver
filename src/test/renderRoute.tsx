import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { PreferencesProvider } from '@shared/contexts/PreferencesContext'
import { router } from '../router'

export async function renderRoute(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] })
  router.update({ history })

  const result = render(
    <PreferencesProvider>
      <RouterProvider router={router} />
    </PreferencesProvider>
  )
  await screen.findByRole('main')
  return result
}
