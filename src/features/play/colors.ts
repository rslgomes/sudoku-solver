export type PaintColor = {
  name: string
  value: string | null
}

export const PAINT_COLORS: PaintColor[] = [
  { name: 'Orange', value: 'oklch(68% 0.12 60)' },
  { name: 'Lime', value: 'oklch(72% 0.12 110)' },
  { name: 'Green', value: 'oklch(64% 0.12 150)' },
  { name: 'Teal', value: 'oklch(65% 0.1 200)' },
  { name: 'Blue', value: 'oklch(60% 0.11 250)' },
  { name: 'Clear', value: null },
]
