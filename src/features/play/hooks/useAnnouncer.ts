import { useCallback, useState } from 'react'

export interface AnnouncerController {
  message: string
  announce: (message: string) => void
}

export default function useAnnouncer(initial = ''): AnnouncerController {
  const [message, setMessage] = useState(initial)

  const announce = useCallback((next: string) => {
    setMessage((prev) => (prev.trimEnd() === next ? `${next} ` : next))
  }, [])

  return { message, announce }
}
