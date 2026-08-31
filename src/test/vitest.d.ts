import 'vitest'
import type { IToHaveNoViolations } from 'jest-axe'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> {
    toHaveNoViolations: IToHaveNoViolations
  }
}
