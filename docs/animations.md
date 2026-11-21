# Animations

Three pieces, all client-side, that work together on the home page.

| Piece | File | What it does |
|---|---|---|
| Profile picture | `src/components/ProfilePicture.tsx` | Blinks, cycles normal <-> sunglasses, reacts to taps |
| Footer strip | `src/components/FooterGrass.tsx` (React) + `src/components/footerPlants.ts` (drawing) | Band of illustrated plants pinned to the bottom of the window |
| Daisy | `src/components/blowDaisy.ts` | A daisy from the strip floats up to the profile picture and gets blown apart |

## Profile picture

- All frames are mounted and stacked; the animation flips `opacity` on the DOM
  nodes directly. Never swap `src` - it refetches and flashes.
- The rendered `opacity` in JSX is only the initial state and must stay
  constant, or React will overwrite the animation on re-render.
- The whole thing is one sequential `async` script inside a single effect
  (`run` -> `dwell` -> `slideTo`). Cues run one at a time, so there are no
  overlapping timers. Don't add independent `setInterval`s.
- It pauses when the picture is off screen or the tab is hidden.
- A click/tap sets `skipRequested`, which makes every `sleep()` return
  immediately and jumps to the next look.
- Timings live in constants at the top of the file (`LOOKS`, `SLIDE_*`,
  `DAISY_*`).

## Footer strip

- `footerPlants.ts` is pure: `buildPlants(width)` returns layers of plants,
  each a list of filled SVG paths. Outlines are filled ribbons, not strokes
  (`ring`, `band`) - that is what gives the hand-inked line weight.
- It uses a seeded random generator, so the drawing is identical on every
  visit. Change the seed in `buildPlants` to get a different meadow.
- Colours are CSS variables set on the wrapper (`PALETTES` in
  `FooterGrass.tsx`). In dark mode the outline colour is the page background.
- The strip is loaded with `ssr: false` (see `Footer.tsx`): as markup it is
  several hundred KB, so it is drawn in the browser. It only draws as wide as
  the visitor's screen.
- The SVG is memoised. Scroll phase and theme changes only touch the wrapper.
- Scroll phases (`currentPhase`): `intro` (top of page, upper half peeking),
  `hidden` (scrolled away), `end` (past the last project, fully up).

## Daisy

The profile picture's script calls `findCollageDaisy()` and, if it gets one,
`createBlowDaisy()`. The link between the two components is the DOM:

- `FooterGrass` renders each daisy as `<g data-daisy="{...}">` with its head
  shapes marked `data-head`.
- `findCollageDaisy` picks one whose head is fully on screen. If there is
  none (strip not drawn yet, or scrolled away) the profile picture just opens
  its mouth and tries again on its next cycle.
- The flying daisy is a redrawn copy with separate petals, placed exactly over
  the original, which is then hidden. Each daisy is used once per page load.
- It lives in a fixed full-window layer on `document.body`, because the
  picture's frame clips its contents and the petals need to leave it.

## Debugging

- Nothing animates: check that every frame image loaded - the script waits for
  all of them (`handleFrameSettled`).
- Daisy never appears: confirm `.footer-grass g[data-daisy]` exists and that
  one is fully inside the window while the page is scrolled to the top.
- To watch the sequence repeatedly, lower `DAISY_STARTS_AT` and `DAISY_EVERY`
  in `ProfilePicture.tsx`.
