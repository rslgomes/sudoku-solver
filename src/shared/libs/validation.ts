export function isNumberSet(value: unknown): value is Set<number> {
  if (!(value instanceof Set)) return false
  if (value.size === 0) return false
  return Array.from(value).every((v) => typeof v === 'number')
}
