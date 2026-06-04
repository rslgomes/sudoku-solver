import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Raw square selection: set membership + outside-click clearing.
 * Mode-aware behaviour (tap-to-place vs select) lives in the composer.
 */
export function useSelection() {
  const [selected, setSelected] = useState(new Set<number>())

  const interactiveEls = useRef(new Set<HTMLElement>())
  const registerInteractive = useCallback((el: HTMLElement | null) => {
    if (!el) return
    interactiveEls.current.add(el)
    return () => {
      interactiveEls.current.delete(el)
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  const select = useCallback((i: number, toggle: boolean) => {
    setSelected((prev) => {
      if (!toggle) return new Set([i])
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      for (const el of interactiveEls.current) {
        if (el.contains(target)) return
      }
      clearSelection()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [clearSelection])

  return { selected, setSelected, select, clearSelection, registerInteractive }
}
