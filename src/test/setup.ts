import '@testing-library/jest-dom/vitest'
import { beforeEach, expect, vi } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

if (typeof globalThis.Worker === 'undefined') {
  class WorkerStub {
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
  }
  // @ts-expect-error jsdom has no real Worker; solving is mocked below
  globalThis.Worker = WorkerStub
}

vi.mock('comlink', async () => {
  const { solve } = await import('@features/solve/solve')
  return {
    wrap: () => ({
      solve: (board: Parameters<typeof solve>[0]) =>
        Promise.resolve(solve(board)),
    }),
  }
})

beforeEach(() => {
  localStorage.clear()
})

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

if (!Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({
      finished: Promise.resolve(),
      playbackRate: 1,
      cancel: () => {},
      updatePlaybackRate: () => {},
    }) as unknown as Animation
}

const dialogPrototype = window.HTMLDialogElement?.prototype
if (dialogPrototype && !dialogPrototype.showModal) {
  dialogPrototype.showModal = function showModal() {
    this.open = true
  }
  dialogPrototype.show = function show() {
    this.open = true
  }
  dialogPrototype.close = function close() {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
