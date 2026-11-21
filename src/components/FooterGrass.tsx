import React, { useEffect, useMemo, useState } from "react";
import { buildPlants, HEIGHT, n } from "@/components/footerPlants";
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
 *  - "intro": top of the page, upper half peeking along the bottom of the window
 *  - "hidden": scrolled away from the top, slid out of view
 *  - "end": past the last project, fully up
 */
type Phase = "intro" | "hidden" | "end";

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

  const { width, layers } = useMemo(() => {
    // Screen width, not window width, so widening the window never runs out
    const width = Math.min(MAX_WIDTH, Math.max(window.innerWidth, window.screen.width) + 80);
    return { width, layers: buildPlants(width) };
  }, []);

  // ~1,000 paths that never change. Memoised so a phase or theme change only
  // touches the wrapper (the colours are CSS variables set on it).
  const drawing = useMemo(
    () => (
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
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
                        transformOrigin: `${n(plant.x)}px ${HEIGHT}px`,
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
    [layers, width]
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // The outer div reserves the strip's place at the end of the page; the
    // strip itself is pinned to the bottom of the window so it can also show
    // at the top of the page. At the very bottom the two line up.
    <div aria-hidden="true" style={{ height: HEIGHT }}>
      <div
        className={`footer-grass fixed bottom-0 left-0 right-0 z-10 overflow-hidden pointer-events-none ${
          phase === "hidden" ? "is-hidden" : phase === "end" ? "" : "is-peeking"
        }`}
        style={{ height: HEIGHT, ...(PALETTES[theme] as React.CSSProperties) }}
      >
        {drawing}
      </div>
    </div>
  );
}
