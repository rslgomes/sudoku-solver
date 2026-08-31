import { useEffect } from 'react'

export default function useAltHints() {
  useEffect(() => {
    const root = document.documentElement

    function show() {
      root.dataset.altHints = 'true'
    }
    function hide() {
      delete root.dataset.altHints
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Alt') show()
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Alt') hide()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', hide)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', hide)
      hide()
    }
  }, [])
}
