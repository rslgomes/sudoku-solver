import '@testing-library/jest-dom/vitest'
import { beforeEach, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  localStorage.clear()
})

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
