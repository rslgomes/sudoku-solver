const getPeers = (sqIdx: number): Set<number> => {
  const row = Math.floor(sqIdx / 9)
  const col = sqIdx % 9
  const boxStart = Math.floor(row / 3) * 3 * 9 + Math.floor(col / 3) * 3

  const s = new Set<number>()
  for (let i = 0; i < 9; i++) {
    s.add(row * 9 + i)
    s.add(i * 9 + col)
    s.add(boxStart + (i % 3) + 9 * Math.floor(i / 3))
  }

  s.delete(sqIdx)
  return s
}

export const PEERS = Array.from({ length: 81 }, (_, i) => getPeers(i))
