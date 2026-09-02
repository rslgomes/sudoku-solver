# Testing

Vitest + jsdom, `npm test`. [vite.config.ts](../vite.config.ts) already defines the path aliases, so tests inherit module resolution with no extra config. Routes render through [`renderRoute`](../src/test/renderRoute.tsx), which drives the real router over a memory history.

## Accessibility

Two layers, because they catch disjoint classes of bug.

**Static (axe-core)** — render each route, assert zero violations. Catches missing labels, role misuse, contrast regressions. Cheap and fast, but structurally blind to anything stateful. — [`routes.a11y.test.tsx`](../src/routes.a11y.test.tsx)

**Behavioral (testing-library + user-event)** — the WAI-ARIA Grid pattern is *behavior*, and axe cannot see it. The keyboard tables in [accessibility.md](accessibility.md) are the spec.

| Suite | Covers |
| ----- | ------ |
| [`puzzleGrid.behavior.test.tsx`](../src/features/play/puzzleGrid.behavior.test.tsx) | Roving `tabIndex` (exactly one focusable cell at any time), arrow/Home/End navigation, `aria-selected`, digit entry and deletion, `aria-readonly` on givens, the `role="status"` mode region |
| [`playControls.behavior.test.tsx`](../src/features/play/playControls.behavior.test.tsx) | Tool shortcuts and their suppression inside text fields, Ctrl+Z / Alt+R, `Enter` tool parity, paint digits, selection keys, one tab stop per composite, the assist toggles, settings surviving a remount, Options-menu keyboard navigation, live-region announcements, the shortcuts dialog |
| [`walkthrough.behavior.test.tsx`](../src/features/explain/walkthrough.behavior.test.tsx) | Step/scene keyboard navigation (arrows, shift+arrows), the Solve route's `role="status"` region announcing scene and step entry |

## Known environment constraints

jsdom is missing pieces both the animation layer and the dialogs depend on:

| Missing in jsdom | Breaks | Handling |
| ---------------- | ------ | -------- |
| `HTMLDialogElement.showModal` / `close` | every `<dialog>` — content stays out of the accessibility tree, so no dialog is queryable | polyfilled in [`src/test/setup.ts`](../src/test/setup.ts) |
| `Element.prototype.animate` | every beat in `atoms.ts` | keep `useStage` in `snap` mode |
| `SVGGeometryElement.getTotalLength` | `drawPolyline`, `drawFan` | as above |
| real `getBoundingClientRect` | fan/polyline geometry (returns zeros) | as above |

The dialog shim opens and closes the element and fires `close`; it does **not**
simulate the top layer, focus trapping, or backdrop behavior. Tests can assert
what a dialog contains and where focus lands on open, not that focus is trapped.

Settings now persist, so `setup.ts` also clears `localStorage` before each test.
Without it a toggle flipped in one test leaks into the next and the suite becomes
order-dependent.

Testing the **deferred delta** — the behavior that lets a strike animate while its candidates are still on screen — needs `play` mode, so it needs a WAAPI stub with a controllable `finished` promise.

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
