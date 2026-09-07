import { useSyncExternalStore } from 'react'

const QUERY = '(pointer: coarse) and (hover: none)'

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export default function useHasKeyboard() {
  const touchOnly = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
  return !touchOnly
}
