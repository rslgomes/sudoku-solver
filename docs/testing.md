# Testing

> Planned, not built. No test dependencies are installed yet. Vitest is the natural runner — [vite.config.ts](../vite.config.ts) already defines the path aliases, so tests inherit module resolution with no extra config.

## Accessibility

Two layers, because they catch disjoint classes of bug.

**Static (axe-core)** — render each route, assert zero violations. Catches missing labels, role misuse, contrast regressions. Cheap and fast, but structurally blind to anything stateful.

**Behavioral (testing-library + user-event)** — the WAI-ARIA Grid pattern is *behavior*, and axe cannot see it. The keyboard table in [accessibility.md](accessibility.md) is the spec. Alongside those: roving `tabIndex` (exactly one focusable cell at any time), `aria-selected` tracking the selection, `aria-readonly` on givens, and the `role="status"` region announcing mode changes.

## Known environment constraints

The animation layer does not survive jsdom untouched:

| Missing in jsdom | Breaks |
| ---------------- | ------ |
| `Element.prototype.animate` | every beat in `atoms.ts` |
| `SVGGeometryElement.getTotalLength` | `drawPolyline`, `drawFan` |
| real `getBoundingClientRect` | fan/polyline geometry (returns zeros) |

Most component tests can avoid all three by keeping `useStage` in `snap` mode, which skips beats entirely. Testing the **deferred delta** — the behavior that lets a strike animate while its candidates are still on screen — needs `play` mode, so it needs a WAAPI stub with a controllable `finished` promise.

## Technique evaluation — design note, not planned

Sketched here so the reasoning isn't lost; no work scheduled.

Each technique is a binary classifier, and the oracle is a **second implementation of the same rule** — written naively, sets instead of bitmasks, clarity over speed. Comparing the two across a corpus of grid states is what caught three real bugs during development (a matrix index built from the wrong coordinate, a transposed `slotSquares`, and a `nakedSingle` guard that ignored note-level eliminations).

| | reference finds ≥1 | reference finds none |
| --- | --- | --- |
| **technique fires** | TP | FP |
| **technique silent** | FN | TN |

Sensitivity = TP/(TP+FN) · Specificity = TN/(TN+FP).

Three things that would shape the implementation:

- **Soundness is a hard failure, not a rate.** Every elimination claimed must appear in the reference set. An unsound elimination corrupts the board; a missed one merely falls through to the next technique. Different severity, different assertion.
- **Sensitivity means "fires when something exists", not "finds every instance".** Most techniques deliberately return the first application and let the pipeline restart. Scoring recall per instance would mark correct code as broken.
- **Specificity is nearly free.** Non-applicable states dominate any realistic corpus; it's sensitivity that needs targeted sampling.

Corpus options, cheapest first: snapshot every intermediate state the pipeline passes through on dug-out grids (no uniqueness guarantee, tests the real state distribution); or add a **solution counter** to `bruteForce` — `search` currently stops at the first solution — and dig holes only while the puzzle stays uniquely solvable, which is also the prerequisite for a puzzle generator or difficulty grading.

Worth adding once a corpus exists: **mutation testing**. Flip `BANDS` to 2, swap `lineOf`/`boxOf`, weaken `isSingle`, and assert the harness catches it — that measures the tests rather than the code.
