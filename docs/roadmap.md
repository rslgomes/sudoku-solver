# Roadmap

**Play** — logo redesign (retro / monospace pixel feel); ongoing QoL.

## Solve (current focus)

- [x] Grid state lifted to the router — survives route changes
- [x] Brute-force solver (constraint propagation + MRV, terminal fallback)
- [x] Technique-first orchestrator — try techniques in order, fall back to brute force
- [x] Scene model — technique emits explanation + animation + deltas together
- [x] Playback — seekable board fold, scene/step navigation, cued explanation
- [x] Technique animation — pulse affected cells (`highlightValues` / `highlightNotes`)
- [x] Brute-force guess playback — pulse-level waves, speculative branches applied and retracted on the grid
- [x] Per-step narration (`SceneStep.note`) + deferred deltas so eliminations animate before they land
- [x] Unsolvable puzzles reported with a reason instead of a missing scene
- [x] Naked single · hidden single · locked candidates (pointing + claiming)
- [ ] Walkthrough controls — autoplay with play / pause / speed
- [ ] Cross-route puzzle transport — carry a puzzle between Play and Solve
- [ ] Solve off the main thread — the pathological anti-brute-force puzzle freezes the UI for minutes

## Testing (next focus)

- [ ] Vitest + jsdom setup, WAAPI/SVG stubs for the animation layer
- [ ] axe-core smoke tests per route
- [ ] Behavioral a11y suite — the keyboard table as spec, roving tabIndex, `aria-selected`, live region
- [ ] Technique evaluation harness — deferred, see [testing.md](testing.md#technique-evaluation--design-note-not-planned)

## Technique backlog

Roughly by implementation cost. Everything through the cross-unit tier covers most published "hard" puzzles; the chain tiers are for the walkthrough's sake, not for coverage.

**Subsets** — naked pair / triple / quad · hidden pair / triple / quad. One generalized routine each over combinations.

**Cross-unit** — X-Wing · skyscraper · 2-string kite · swordfish · jellyfish (one generalized fish routine at sizes 2–4) · XY-wing · XYZ-wing · W-wing.

**Chains & colouring** — simple colouring · remote pairs · finned / sashimi X-Wing · X-chain · XY-chain. These need a strong/weak link graph, and the narration has to say which link is which.

**Advanced** — BUG+1 · unique rectangle types 1–4 · ALS-XZ · AIC / forcing chains · death blossom.

Worth building first: a shared `eliminationScene()` helper. Every technique below the chain tier is the same two-step shape — highlight the base cells, then strike the notes — so writing it once makes each new technique roughly thirty lines.
