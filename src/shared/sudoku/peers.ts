import { UNITS } from './units'

export const PEERS = UNITS.map((units, i) => {
  const peers = new Set(units.flat())
  peers.delete(i)
  return peers
})
