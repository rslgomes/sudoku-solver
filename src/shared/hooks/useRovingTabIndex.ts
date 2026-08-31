import { useRef, useState } from 'react'

interface Options {
  count: number
  columns?: number
}

export default function useRovingTabIndex({ count, columns = 1 }: Options) {
  const [active, setActive] = useState(0)
  const items = useRef<(HTMLElement | null)[]>([])
  const current = Math.min(active, Math.max(count - 1, 0))

  function focusItem(index: number) {
    if (count === 0) return
    const wrapped = (index + count) % count
    setActive(wrapped)
    items.current[wrapped]?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step: Partial<Record<string, number>> = {
      ArrowDown: columns,
      ArrowUp: -columns,
      ArrowRight: columns > 1 ? 1 : 0,
      ArrowLeft: columns > 1 ? -1 : 0,
    }

    if (e.key === 'Home') {
      e.preventDefault()
      focusItem(0)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      focusItem(count - 1)
      return
    }

    const delta = step[e.key]
    if (!delta) return
    e.preventDefault()
    focusItem(current + delta)
  }

  function itemProps(index: number) {
    return {
      ref: (el: HTMLElement | null) => {
        items.current[index] = el
      },
      tabIndex: current === index ? 0 : -1,
      onFocus: () => setActive(index),
    }
  }

  return { containerProps: { onKeyDown }, itemProps }
}
