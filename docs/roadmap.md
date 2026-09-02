# Roadmap

**Play** — logo redesigned (tilted grid + pencil mark, tokenized colors); ongoing QoL.

## Accessibility (next focus)

Detail and APG citations in [accessibility.md](accessibility.md#gaps-against-the-apg).

- [x] Tool shortcuts (`P` `N` `E` `C` `L`, Ctrl+Z, Alt+R) with `aria-keyshortcuts`
- [x] Alt-held access keys on menus, underline hidden at rest
- [x] Options menu as a real `role="menu"` — arrow/Home/End/Escape navigation
- [x] Puzzle dialog focuses the first square and describes its own rules
- [x] Visible grid cursor — the focused cell was styled with `focus-visible` only, so a clicked cell gave no sign of where the next digit would land. Now a persistent `ring-2` on the focused cell, distinct from the selection's background tint (WCAG 2.4.7 Focus Visible, 2.4.13 Focus Appearance)
- [x] Keyboard parity for eraser, lock, and paint — `Enter` applies the active tool, `1`–`6` pick a color
- [x] Named paint swatches with `aria-pressed`; the number pad reports its pressed state too
- [x] One tab stop per composite — Toolbox as a `toolbar` wrapping a mode `radiogroup`, Pad as a `toolbar`, both on roving `tabIndex`
- [x] Grid selection keys — Shift+arrows, Ctrl+A, Shift+Space, Ctrl+Space, PageUp/PageDown by box
- [x] Announcements — placements, rejected moves, erasures, undo, reset and mode changes share one `role="status"` region
- [x] `?` shortcut dialog, also in the Options menu, plus `aria-describedby` on the grid

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
- [x] Walkthrough controls — autoplay with play / pause / speed, seek slider, scene list, reduced-motion and announcer support
- [ ] Cross-route puzzle transport — carry a puzzle between Play and Solve
- [ ] Solve off the main thread — the pathological anti-brute-force puzzle freezes the UI for minutes

## Testing

- [x] Vitest + jsdom setup
- [x] axe-core smoke tests per route
- [x] Behavioral a11y suite — the keyboard tables as spec, roving tabIndex, `aria-selected`, live region
- [x] Play-controls suite — shortcuts, assists, settings persistence, menu navigation
- [ ] WAAPI/SVG stubs for the animation layer — needed to test the deferred delta in `play` mode
- [ ] Technique evaluation harness — deferred, see [testing.md](testing.md#technique-evaluation--design-note-not-planned)

## Technique backlog

Roughly by implementation cost. Everything through the cross-unit tier covers most published "hard" puzzles; the chain tiers are for the walkthrough's sake, not for coverage.

**Subsets** — naked pair / triple / quad · hidden pair / triple / quad. One generalized routine each over combinations.

**Cross-unit** — X-Wing · skyscraper · 2-string kite · swordfish · jellyfish (one generalized fish routine at sizes 2–4) · XY-wing · XYZ-wing · W-wing.

**Chains & colouring** — simple colouring · remote pairs · finned / sashimi X-Wing · X-chain · XY-chain. These need a strong/weak link graph, and the narration has to say which link is which.

**Advanced** — BUG+1 · unique rectangle types 1–4 · ALS-XZ · AIC / forcing chains · death blossom.

Worth building first: a shared `eliminationScene()` helper. Every technique below the chain tier is the same two-step shape — highlight the base cells, then strike the notes — so writing it once makes each new technique roughly thirty lines.
