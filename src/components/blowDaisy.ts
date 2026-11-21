// A daisy is picked from the footer strip, floats up to the profile picture,
// stands in the frame for a moment, and has its petals blown off.
//
// Plain DOM + Web Animations rather than React: it exists for a few seconds,
// and the profile picture's animation script drives it step by step.

const SVG_NS = "http://www.w3.org/2000/svg";
const INK = "#111216";
const CREAM = "#e6e2cf";
const BLUE = "#74a8e6";
const TAN = "#b3ab92";

/** How FooterGrass describes each of its daisies (the g[data-daisy] attribute). */
export interface DaisyShape {
  radius: number;
  /** Vertical squash of the head, 0-1, as if seen at an angle */
  squash: number;
  /** Rotation of the head in radians */
  turn: number;
  petals: number;
  /** Palette slot of the centre */
  centre: string;
}

/** The daisy that will fly: normally one from the footer strip. */
export interface CollageDaisy extends DaisyShape {
  /** Centre of its head, in window coordinates */
  x: number;
  y: number;
  /** Removes it from the strip, stem and all (nothing to do for a stand-in). */
  pick(): void;
}

export interface BlowDaisy {
  /** Lifts off the strip and drifts up to her mouth. */
  rise(): Promise<void>;
  /** Hangs almost still beside her mouth. Runs until scatter(). */
  hover(): void;
  /** Petals come off, nearest the mouth first, and drift away to the right. */
  scatter(): Promise<void>;
  /** What's left sinks out of the frame. */
  leave(): Promise<void>;
  /** Stops everything and removes it from the page. Safe to call twice. */
  remove(): void;
}

type Point = [number, number];

const between = (min: number, max: number): number => min + Math.random() * (max - min);
const jitter = (amount: number): number => between(-amount, amount);

/**
 * Chooses the daisy that will fly up to the frame. In order of preference:
 *  1. one in the footer strip whose head is fully on screen
 *  2. one in the strip just below the bottom of the window - on phones the
 *     strip can't show at the top of the page (the hero fills the window), so
 *     the daisy comes up over the bottom edge instead
 *  3. if the strip has no daisy in reach, or isn't drawn yet, a stand-in that
 *     starts below the bottom edge
 * Within 1 and 2 it takes the one most nearly below the frame.
 */
export function findCollageDaisy(frame: HTMLElement): CollageDaisy {
  const frameRect = frame.getBoundingClientRect();
  const frameX = frameRect.left + frameRect.width / 2;
  let best: (CollageDaisy & { onScreen: boolean }) | undefined;

  document.querySelectorAll<SVGGElement>(".footer-grass g[data-daisy]").forEach((group) => {
    if (group.dataset.picked) return;
    // The first head path is the petals; its box is the head as actually
    // drawn, sway and strip position included
    const head = group.querySelector<SVGPathElement>("path[data-head]");
    if (!head || !group.dataset.daisy) return;
    const box = head.getBoundingClientRect();
    if (box.width === 0 || box.left < 0 || box.right > window.innerWidth) return;

    const onScreen = box.bottom < window.innerHeight - 2;
    const justBelow = box.top < window.innerHeight + 260;
    if (!onScreen && !justBelow) return;

    const x = box.left + box.width / 2;
    if (best) {
      if (best.onScreen && !onScreen) return;
      if (best.onScreen === onScreen && Math.abs(x - frameX) >= Math.abs(best.x - frameX)) return;
    }
    best = {
      ...(JSON.parse(group.dataset.daisy) as DaisyShape),
      x,
      y: box.top + box.height / 2,
      onScreen,
      pick() {
        group.dataset.picked = "true";
        group.style.visibility = "hidden";
      },
    };
  });

  if (best) return best;

  const margin = 40;
  const x = frameX + between(-0.3, 0.3) * window.innerWidth;
  return {
    radius: 21,
    squash: 0.9,
    turn: -0.2,
    petals: 19,
    centre: "mid",
    x: Math.min(window.innerWidth - margin, Math.max(margin, x)),
    y: window.innerHeight + 44,
    pick() {},
  };
}

function shape(points: Point[], fill: string, strokeWidth: number): SVGPolygonElement {
  const polygon = document.createElementNS(SVG_NS, "polygon");
  polygon.setAttribute("points", points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke", INK);
  polygon.setAttribute("stroke-width", String(strokeWidth));
  polygon.setAttribute("stroke-linejoin", "round");
  return polygon;
}

/**
 * @param frame The profile picture's frame; the daisy ends up beside her mouth.
 * @param from The footer daisy to pick. The flying copy is redrawn to the same
 *   proportions (with separate petals, so they can scatter) and starts exactly
 *   over the original's head.
 */
export function createBlowDaisy(frame: HTMLElement, from: CollageDaisy): BlowDaisy {
  const start = frame.getBoundingClientRect();
  const { width, height } = start;
  const animations: Animation[] = [];
  let removed = false;
  let hovering: Animation | undefined;

  // Full-window layer above the page; clipped to the window so flying petals
  // never add scrollbars
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:40";

  // Tracks the frame's position, so everything stays aligned if the page scrolls
  const stage = document.createElement("div");
  stage.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${height}px`;
  const place = (): void => {
    const rect = frame.getBoundingClientRect();
    stage.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
  };

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.overflow = "visible";

  // Where it comes to rest: just right of her mouth, which is at about
  // 64% / 73% of the frame. It grows a little on the way up.
  const cx = width * 0.83;
  const cy = height * 0.7;
  const radius = width * 0.16;
  // Flower space (polar) to the frame: squash, then turn
  const at = (r: number, angle: number): Point => {
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r * from.squash;
    return [
      cx + px * Math.cos(from.turn) - py * Math.sin(from.turn),
      cy + px * Math.sin(from.turn) + py * Math.cos(from.turn),
    ];
  };

  // Everything that flies together. Scales and turns around the head's centre.
  const flower = document.createElementNS(SVG_NS, "g");
  flower.style.transformOrigin = `${cx}px ${cy}px`;

  // The stem runs from the head to just past the frame's bottom edge, so at
  // rest it disappears under the border instead of ending in mid-air.
  // A coloured line over a wider ink line reads as an outlined band.
  const baseX = cx + radius * 0.3;
  const baseY = height + 5;
  const stemPath = `M${cx} ${cy}Q${cx + radius * 0.05} ${cy + (baseY - cy) * 0.6} ${baseX} ${baseY}`;
  [
    [INK, radius * 0.24],
    [BLUE, radius * 0.11],
  ].forEach(([colour, strokeWidth]) => {
    const stem = document.createElementNS(SVG_NS, "path");
    stem.setAttribute("d", stemPath);
    stem.setAttribute("fill", "none");
    stem.setAttribute("stroke", String(colour));
    stem.setAttribute("stroke-width", String(strokeWidth));
    stem.setAttribute("stroke-linecap", "round");
    flower.appendChild(stem);
  });

  // Petals: narrow, blunt-ended, each cut a little differently
  const petalGroup = document.createElementNS(SVG_NS, "g");
  const petals: { node: SVGPolygonElement; angle: number }[] = [];
  const core = radius * 0.34;
  const step = Math.PI / from.petals;
  for (let i = 0; i < from.petals; i++) {
    const angle = (i / from.petals) * Math.PI * 2 + jitter(0.05);
    const reach = radius * between(0.84, 1.1);
    const spread = step * between(0.72, 0.9);
    const node = shape(
      [
        at(core * 0.8, angle - step * 0.75),
        at(reach * between(0.94, 1), angle - spread),
        at(reach * between(0.9, 1.04), angle + jitter(spread * 0.35)),
        at(reach * between(0.94, 1), angle + spread),
        at(core * 0.8, angle + step * 0.75),
      ],
      CREAM,
      1.5
    );
    // Spin around the petal's own middle when it flies
    const [mx, my] = at((core + reach) / 2, angle);
    node.style.transformOrigin = `${mx}px ${my}px`;
    petalGroup.appendChild(node);
    petals.push({ node, angle });
  }
  flower.appendChild(petalGroup);

  const ring = (r: number): Point[] => {
    const points: Point[] = [];
    for (let k = 0; k < 10; k++) points.push(at(r * between(0.94, 1.07), (k / 10) * Math.PI * 2));
    return points;
  };
  flower.appendChild(shape(ring(core), from.centre === "olive" ? TAN : BLUE, 1.9));
  flower.appendChild(shape(ring(core * 0.48), CREAM, 1.1));

  // The flower goes behind the frame's bottom border, never over it. While
  // it flies, a hole is cut out of the drawing area exactly where that border
  // is: the band between the picture's bottom edge and the outer edge of the
  // striped frame around it. Rising into the picture, the flower is visible
  // below the frame, hidden as it passes the band, and visible again inside.
  const clip = document.createElement("div");
  const outer = (frame.closest(".group") ?? frame).getBoundingClientRect();
  const band = {
    left: outer.left - start.left - 1,
    // A few px extra to cover the frame's offset shadow
    right: outer.right - start.left + 7,
    top: height,
    bottom: outer.bottom - start.top + 7,
  };
  // One polygon: the whole area, then the band. With evenodd the band, being
  // inside the first shape, becomes the hole.
  const holeAtBorder =
    "polygon(evenodd, -4000px -3000px, 4000px -3000px, 4000px 4000px, -4000px 4000px, -4000px -3000px, " +
    `${band.left}px ${band.top}px, ${band.right}px ${band.top}px, ${band.right}px ${band.bottom}px, ` +
    `${band.left}px ${band.bottom}px, ${band.left}px ${band.top}px)`;
  clip.style.cssText = `position:absolute;inset:0;clip-path:${holeAtBorder}`;

  svg.appendChild(flower);
  clip.appendChild(svg);
  stage.appendChild(clip);
  overlay.appendChild(stage);

  const track = <T extends Animation>(animation: T): T => {
    animations.push(animation);
    return animation;
  };

  return {
    async rise() {
      place();
      window.addEventListener("scroll", place, { passive: true });
      window.addEventListener("resize", place);

      // Offset and size that put the copy exactly over the footer daisy's head
      const dx = from.x - (start.left + cx);
      const dy = from.y - (start.top + cy);
      const scale = from.radius / radius;

      // The flight is computed up front and sampled into many small steps.
      // Nothing in it repeats on a fixed beat, because that is what makes
      // motion look machine-made:
      //  - sideways drift is a wandering curve, not a regular swing
      //  - the climb speeds up and stalls, as if on gusts
      //  - it leans the way it is travelling, and turns slowly as it goes
      const wander = (): ((t: number) => number) => {
        // Three waves at unrelated rates; the sum never settles into a rhythm
        const waves = [1.3, 2.9, 5.3].map((rate, i) => ({
          rate: rate * between(0.78, 1.25),
          phase: between(0, Math.PI * 2),
          size: [1, 0.5, 0.22][i],
        }));
        return (t) => waves.reduce((sum, w) => sum + w.size * Math.sin(t * w.rate * Math.PI * 2 + w.phase), 0) / 1.72;
      };
      const drift = wander();
      const gusts = wander();
      const dips = wander();
      const twist = wander();

      const STEPS = 110;
      // Climb: add up an uneven speed, then normalise so it ends at the top.
      // The window makes it slow to lift off and slow to arrive.
      const climbed: number[] = [0];
      for (let i = 1; i <= STEPS; i++) {
        const t = (i - 0.5) / STEPS;
        const window = 0.06 + Math.pow(Math.sin(Math.PI * t), 0.7);
        climbed.push(climbed[i - 1] + Math.max(0.12, 1 + 0.8 * gusts(t)) * window);
      }
      const total = climbed[STEPS];

      const reach = Math.min(70, Math.max(30, Math.abs(dy) * 0.11));
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const left = 1 - climbed[i] / total;
        const fade = Math.pow(Math.sin(Math.PI * t), 0.8); // no wandering at either end
        xs.push(dx * left + reach * fade * drift(t));
        ys.push(dy * left + reach * 0.22 * fade * dips(t));
      }

      const path: Keyframe[] = [];
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const fade = Math.sin(Math.PI * t);
        // Lean follows sideways speed, measured a few steps back so it lags
        const from3 = Math.max(0, i - 4);
        const sideways = i > from3 ? (xs[i] - xs[from3]) / (i - from3) : 0;
        const lean = Math.max(-20, Math.min(20, sideways * 5)) * fade + 16 * fade * twist(t);
        const size = scale + (1 - scale) * (climbed[i] / total);
        path.push({
          transform: `translate(${xs[i].toFixed(1)}px, ${ys[i].toFixed(1)}px) rotate(${lean.toFixed(1)}deg) scale(${size.toFixed(3)})`,
        });
      }

      flower.style.transform = String(path[0].transform);
      document.body.appendChild(overlay);
      from.pick();

      await track(flower.animate(path, { duration: 6400, easing: "linear", fill: "forwards" })).finished;
    },

    hover() {
      // From here on it behaves as if planted in the frame: it pivots at the
      // foot of the stem, with the stem's end under the bottom border.
      // The flight left it exactly at rest, so changing the pivot moves nothing.
      flower.style.transformOrigin = `${baseX}px ${height}px`;
      // Now cut off everything below the picture's bottom edge, so when it
      // sinks later it doesn't reappear under the frame. The stem ends inside
      // the border band, so nothing visible changes at this moment.
      clip.style.clipPath = "inset(-2000px -4000px 0 -4000px)";
      // Barely moving, until she blows
      hovering = track(
        flower.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: "rotate(1.3deg)" },
            { transform: "rotate(-0.7deg)" },
            { transform: "rotate(0deg)" },
          ],
          { duration: 3600, easing: "ease-in-out", iterations: Infinity }
        )
      );
    },

    async scatter() {
      // Petals move out from under the flower so they keep flying while the
      // rest leans and later sinks. The hover moves it by under 2px, so
      // nothing visibly jumps.
      hovering?.cancel();
      svg.appendChild(petalGroup);

      // Bent over by the breath, then swings most of the way upright
      track(
        flower.animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(11deg)", offset: 0.35 }, { transform: "rotate(3deg)" }],
          { duration: 1100, easing: "ease-out", fill: "forwards" }
        )
      );

      const flights = petals.map(({ node, angle }) => {
        const dx = between(width * 0.7, width * 2.6);
        const dy = between(-height * 0.95, height * 0.25);
        const spin = between(180, 620) * (Math.random() < 0.5 ? -1 : 1);
        // Her mouth is to the left: the left-hand petals (cos = -1) go first
        const delay = ((Math.cos(angle) + 1) / 2) * 420 + between(0, 140);
        return track(
          node.animate(
            [
              { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
              {
                // Lifted mid-flight so the path arcs instead of running straight
                transform: `translate(${dx * 0.45}px, ${dy * 0.4 - between(8, 34)}px) rotate(${spin * 0.5}deg)`,
                opacity: 1,
                offset: 0.5,
              },
              { transform: `translate(${dx}px, ${dy}px) rotate(${spin}deg)`, opacity: 0 },
            ],
            { duration: between(1400, 2300), delay, easing: "cubic-bezier(0.2, 0.6, 0.35, 1)", fill: "forwards" }
          )
        ).finished;
      });
      await Promise.all(flights);
    },

    async leave() {
      // Sinks straight down behind the bottom edge
      await track(
        flower.animate(
          [{ transform: "translateY(0px) rotate(3deg)" }, { transform: `translateY(${height * 0.75}px) rotate(-2deg)` }],
          { duration: 1100, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)", fill: "forwards" }
        )
      ).finished;
    },

    remove() {
      if (removed) return;
      removed = true;
      // Cancelling rejects the pending `finished` promises; callers catch that
      animations.forEach((animation) => animation.cancel());
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      overlay.remove();
    },
  };
}
