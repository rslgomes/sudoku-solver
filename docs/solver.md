# Solver

Pure, React-free. A technique is `run(grid) => Scene | null` (`null` = didn't apply) and never mutates the grid.

`solve()` ([src/features/solve/solve.ts](../src/features/solve/solve.ts)) runs registered techniques in complexity order, folds each returned Scene's deltas into the board (`applySteps`), and repeats until solved or stuck. First technique to return a Scene wins, then the loop restarts from the top.

| Technique             | What it does                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **checkEmptySquares** | Reports a cell with no value and no notes left — the puzzle has no solution                    |
| **clearNotes**        | Removes peers' values from a cell's candidate notes                                            |
| **nakedSingle**       | A cell down to one note gets written                                                           |
| **hiddenSingle**      | A value with one remaining home in a unit gets written                                         |
| **lockedCandidates**  | Pointing + claiming, as one band/stack × box bitmask scan                                      |
| **bruteForce**        | Constraint propagation (naked + hidden singles) + MRV backtracking; terminal fallback (Norvig) |

A scene that changes nothing halts the loop (`sameBoard` guard), so a technique that reports without progressing — `checkEmptySquares`, or `bruteForce` refusing an unsolvable grid — terminates instead of spinning.

Solve reads only the **initial givens** (`serializeGrid(grid, 'initial')`), never mid-progress user input. On load the solve grid seeds every empty cell with all 9 candidate notes; `clearNotes` then prunes them.

## Locked candidates as bitmasks

[src/features/solve/techniques/lockedCandidates.ts](../src/features/solve/techniques/lockedCandidates.ts) condenses pointing and claiming into one operation. A row only ever meets 3 boxes — the ones in its band — so per digit the grid reduces to 6 3×3 matrices (3 bands of rows × boxes, 3 stacks of columns × boxes), each packed into the low 9 bits of one `Uint16Array` slot. Slot `line * 3 + box` is set when the digit appears anywhere in that 3-cell intersection.

Both rules are then the same scan on opposite axes: **a slice of the matrix with exactly one occupied slot clears the perpendicular slice through it**. A line confined to one box is claiming; a box confined to one line is pointing. Row and column geometry differ only in which matrix feeds the scan, so the detection code never branches on it.

## Brute-force walkthrough

[src/features/solve/techniques/bruteForce.ts](../src/features/solve/techniques/bruteForce.ts) doesn't just return placements — it exposes the search at **pulse granularity**. One pulse is one inference wave: a trigger cell collapses, fans its value to every peer, strikes the candidates that die, and settles. The eliminations are the interesting part, so each becomes a step with its own `removeNotes` delta.

Norvig's `eliminate`/`assign` recurse depth-first, so the first peer's entire downstream cascade runs before the second peer is touched — faithful animation of that looks like a random walk. `propagate` replaces the recursion with a **FIFO worklist**, so one trigger clears all its peers before the next trigger is processed. Both inference rules are monotone candidate deletions, so the fixpoint is identical and the search tree is unchanged; only which contradiction is hit first differs, and any contradiction is a valid refutation.

Speculative branches are visible on the grid, in notes only. A rejected guess applies its eliminations as it propagates, then a **retract step** puts back exactly what it removed. This is why guesses never write values: `removeNotes` has an inverse (`addNotes`), `setValue` does not. Only the committed spine writes values. Rejected lines that survive propagation and need deeper search to refute collapse into one summary step, keeping the walkthrough watchable.

Colors carry the state: yellow speculative, green committed, red contradiction, blue evidence and retraction. Every step also carries a plain-language `note` — which cell was placed, the rule that forced it, how many candidates fell, and the contradiction when a wave dies.

When no solution exists, the technique says so instead of returning `null`, with the reason it found: conflicting givens, propagation dying before any guess, or every value at the most-constrained cell exhausted.
