import React, { useEffect, useMemo, useState } from "react";
import { buildPlants, n } from "@/components/footerPlants";
import { useTheme } from "@/contexts/ThemeContext";

const MAX_WIDTH = 2600;

// Screen-print look: flat fills, bold outlines in one colour, and a strict
// short palette - black, cream, a cornflower blue (plus a deeper shade of it
// for shapes in the background) and a warm tan.
// Several slots share a colour on purpose; the slots only decide which shapes
// contrast with which.
const PRINT = {
  "--deep": "#4672b8",
  "--mid": "#74a8e6",
  "--bright": "#74a8e6",
  "--pale": "#e6e2cf",
  "--olive": "#b3ab92",
  "--gold": "#b3ab92",
  "--coral": "#74a8e6",
  "--cream": "#e6e2cf",
} as const;

const PALETTES = {
  // The outline is the page background, so the page itself is the black of
  // the print
  dark: { ...PRINT, "--ink": "#111216", "--mark": "#e6e2cf" },
  // Ink on paper
  light: { ...PRINT, "--ink": "#14161c", "--mark": "#14161c" },
} as const;

/**
 * Where the strip is in its scroll story:
 *  - "intro": top of the page, peeking along the bottom of the window as far
 *    as the hero leaves room (see measureRoom)
 *  - "hidden": scrolled away from the top, slid out of view
 *  - "end": past the last project, fully up
 */
type Phase = "intro" | "hidden" | "end";

// The strip is drawn to fit the visitor's window. At the top of the page it
// rises to just under the hero's buttons, with only its lowest part - the
// pebble bed and the foot of the arches - below the window, so the tops of the
// arches show under a full stand of flowers.
// Its full height is therefore the room under the buttons plus that part.
const BELOW_WINDOW_AT_TOP = 62;
// In the page margins, beside the text column, there is nothing for the
// plants to cover, so there they grow this much taller
const SIDE_BOOST = 1.7;
// ...easing up to that over this many px out from the column's edge
const SIDE_RAMP = 120;
const MIN_HEIGHT = 150;
const MAX_HEIGHT = 300;
// Used when the hero leaves no room at all (most phones), where the strip
// only appears at the end of the page
const DEFAULT_HEIGHT = 200;
// Less room than this would show only a sliver of leaf tips, so show nothing
const MIN_ROOM = 28;

/**
 * Space, in px, between the bottom of the hero and the bottom of the window
 * when the page is at the top. The lowest thing in the hero is the row of
 * Twitter/GitHub buttons. On a phone the hero is usually taller than the
 * window and this is negative.
 */
function measureRoom(): number {
  const buttons = document.querySelector(".intro > p:last-child");
  if (!buttons) return DEFAULT_HEIGHT;
  // Position in the page, not the window, so the answer doesn't depend on scroll
  const bottom = buttons.getBoundingClientRect().bottom + window.scrollY;
  return Math.round(window.innerHeight - bottom - 10);
}

function currentPhase(): Phase {
  const { scrollY, innerHeight } = window;
  // Rises once the last project has cleared most of the strip's height, or
  // failing that (no project list on the page) near the very bottom
  const projects = document.getElementById("portfolio");
  const pastProjects = projects ? projects.getBoundingClientRect().bottom < innerHeight - 90 : false;
  if (pastProjects || scrollY + innerHeight > document.documentElement.scrollHeight - 240) return "end";
  // Stays for the first stretch of scroll (one mouse-wheel notch is ~100px)
  return scrollY < 140 ? "intro" : "hidden";
}

/**
 * Decorative strip of hand-drawn plants along the bottom edge of the page.
 * Client-only (loaded with ssr: false in Footer), so it can size itself to
 * the screen instead of drawing plants nobody will see.
 */
export default function FooterGrass(): React.ReactElement {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<Phase>(currentPhase);
  const [room, setRoom] = useState<number>(measureRoom);

  // Drawn once, for the window as it was on load
  const { width, height, canvas, layers } = useMemo(() => {
    // Screen width, not window width, so widening the window never runs out
    const width = Math.min(MAX_WIDTH, Math.max(window.innerWidth, window.screen.width) + 80);
    const initialRoom = measureRoom();
    const height =
      initialRoom < MIN_ROOM
        ? DEFAULT_HEIGHT
        : Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, initialRoom + BELOW_WINDOW_AT_TOP));

    // The canvas is taller than the planting in the middle, to hold the tall
    // plants at the sides
    const canvas = Math.round(height * SIDE_BOOST);
    const column = document.querySelector(".hero > div > div")?.getBoundingClientRect();
    const columnLeft = column ? column.left : 0;
    const columnRight = column ? column.right : window.innerWidth;
    // The drawing is wider than the window and centered on it
    const overhang = (width - window.innerWidth) / 2;
    const plantHeightAt = (x: number): number => {
      const windowX = x - overhang;
      const outside = Math.max(columnLeft - windowX, windowX - columnRight, 0);
      const t = Math.min(1, outside / SIDE_RAMP);
      return height * (1 + (SIDE_BOOST - 1) * t * t * (3 - 2 * t));
    };
    return { width, height, canvas, layers: buildPlants(width, canvas, plantHeightAt) };
  }, []);

  // How much of the planting shows at the top of the page. The lowest part
  // always stays below the window there, even when there's room to spare.
  const peek = room < MIN_ROOM ? 0 : Math.min(height - BELOW_WINDOW_AT_TOP, room);

  // ~1,000 paths that never change. Memoised so a phase or theme change only
  // touches the wrapper (the colours are CSS variables set on it).
  const drawing = useMemo(
    () => (
      <svg
        width={width}
        height={canvas}
        viewBox={`0 0 ${width} ${canvas}`}
        className="absolute bottom-0 left-1/2 max-w-none"
        style={{ marginLeft: -width / 2 }}
      >
        {layers.map((plants, layer) => (
          <g key={layer}>
            {plants.map((plant) => (
              <g
                key={plant.x}
                className={plant.still ? undefined : "sway"}
                data-daisy={plant.daisy ? JSON.stringify(plant.daisy) : undefined}
                style={
                  plant.still
                    ? undefined
                    : {
                        // Each plant sways from its own root, out of phase with its neighbours
                        transformOrigin: `${n(plant.x)}px ${canvas}px`,
                        animationDuration: `${n(plant.duration)}s`,
                        animationDelay: `-${n(plant.delay)}s`,
                      }
                }
              >
                {plant.shapes.map((shape, index) => (
                  <path
                    key={index}
                    d={shape.d}
                    fill={`var(--${shape.colour})`}
                    data-head={plant.daisy && index >= plant.daisy.headFrom ? "" : undefined}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
      </svg>
    ),
    [layers, width, canvas]
  );

  useEffect(() => {
    let frame = 0;
    // At most one check per frame; React skips the render if the phase is unchanged
    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setPhase(currentPhase());
      });
    };
    // The room under the hero changes with the window, and once more when the
    // web fonts load and the text reflows
    const onResize = (): void => {
      setRoom(measureRoom());
      onScroll();
    };
    document.fonts.ready.then(() => setRoom(measureRoom()));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // React's style type doesn't know about CSS variables, hence the wider type
  const style: React.CSSProperties & Record<`--${string}`, string> = {
    height: canvas,
    // How far down the strip sits while peeking (see globals.css). The extra
    // canvas above the planting doesn't change this: it is bottom-anchored.
    "--peek-offset": `${height - peek}px`,
    ...PALETTES[theme],
  };

  return (
    // The outer div reserves the strip's place at the end of the page; the
    // strip itself is pinned to the bottom of the window so it can also show
    // at the top of the page. At the very bottom the two line up.
    <div aria-hidden="true" style={{ height }}>
      <div
        className={`footer-grass fixed bottom-0 left-0 right-0 z-10 overflow-hidden pointer-events-none ${
          phase === "hidden" ? "is-hidden" : phase === "end" ? "" : "is-peeking"
        }`}
        style={style}
      >
        {drawing}
      </div>
    </div>
  );
}
