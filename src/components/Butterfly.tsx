import React from "react";

// A butterfly at rest in the footer strip, in the same screen-print language
// as the plants: flat colour and ink lines.
//
// The wings are built the way real ones are, not as an outline with a pattern
// poured in, and drawn with a pen's irregularity (see buildWing): a band along the leading edge, a closed cell near the root,
// veins fanning from that cell to the outer margin, a panel between each pair
// of veins, cross-veins laddering each panel into a mesh, and a dark border
// with a row of pale spots.
//
// Everything is fixed geometry - no random numbers - so adding it can't
// change how the plants around it are drawn. Colours come from the strip's
// CSS variables (see PALETTES in FooterGrass.tsx).

type Point = [number, number];

const n = (value: number): string => value.toFixed(1);
const pts = (list: Point[]): string => list.map(([x, y]) => `${n(x)},${n(y)}`).join(" ");
const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Its own small seeded generator: the hand-drawn irregularity below is the
// same on every visit, and it shares nothing with the plants' generator.
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const path = (list: Point[]): string => "M" + list.map(([x, y]) => `${n(x)} ${n(y)}`).join("L") + "Z";

interface WingSpec {
  root: Point;
  /** Leading edge, from just past the root to just short of the first margin point */
  lead: Point[];
  /** Where the veins meet the outer margin, front to back */
  margin: Point[];
  /** Trailing edge, from just past the last margin point back toward the root */
  trail: Point[];
  /** Closed cell near the root; its last two points are the edge the veins leave from */
  cell: Point[];
  /** Fill of each panel between neighbouring veins, front to back */
  panels: string[];
  /** How far the margin bulges out between veins (a scalloped edge) */
  scallop: number;
}

interface Wing {
  outline: string;
  cell: string;
  panels: { d: string; colour: string }[];
  border: string[];
  spots: [number, number, number][];
  /** Every ink line in the wing - outline, veins, cross-veins - as one path */
  ink: string;
}

// Drawn twice, once per side, each with its own small errors: a hand never
// draws the second wing as a perfect mirror of the first.
function buildWing(spec: WingSpec, random: () => number): Wing {
  const wobble = (amount: number): number => (random() * 2 - 1) * amount;
  const nudge = ([x, y]: Point, amount: number): Point => [x + wobble(amount), y + wobble(amount)];

  // A pen line as a filled shape, `from` wide at its start and `to` at its
  // end, with slight changes in pressure along the way
  const stroke = (line: Point[], from: number, to: number): string => {
    const last = line.length - 1;
    const left: Point[] = [];
    const right: Point[] = [];
    line.forEach((point, i) => {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(last, i + 1)];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const half = ((from + (to - from) * (i / last)) / 2) * (0.82 + random() * 0.36);
      left.push([point[0] - ((b[1] - a[1]) / length) * half, point[1] + ((b[0] - a[0]) / length) * half]);
      right.push([point[0] + ((b[1] - a[1]) / length) * half, point[1] - ((b[0] - a[0]) / length) * half]);
    });
    return path([...left, ...right.reverse()]);
  };

  // A line between two points that bows slightly instead of running straight
  const bowed = (a: Point, b: Point, bend: number): Point[] => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const mid = lerp(a, b, 0.5);
    const offset = wobble(bend);
    return [a, [mid[0] - ((b[1] - a[1]) / length) * offset, mid[1] + ((b[0] - a[0]) / length) * offset], b];
  };

  const margin = spec.margin.map((point) => nudge(point, 1));
  const cell = spec.cell.map((point, i) => (i === 0 ? point : nudge(point, 0.8)));
  const hubFrom = cell[cell.length - 2];
  const hubTo = cell[cell.length - 1];
  const last = margin.length - 1;
  // Each vein leaves the cell's outer edge and runs to the margin
  const hub = (i: number): Point => lerp(hubFrom, hubTo, i / last);
  // The dark border starts a little short of the margin, unevenly
  const depths = margin.map(() => 0.15 + random() * 0.06);
  const inner = (i: number): Point => lerp(margin[i], hub(i), depths[i]);

  // Silhouette: the margin bulges out between each pair of veins
  const outer: Point[] = [];
  margin.forEach((point, i) => {
    outer.push(point);
    if (i < last) {
      const next = margin[i + 1];
      const mid = lerp(point, next, 0.5);
      const center = lerp(hub(i), hub(i + 1), 0.5);
      const away = Math.hypot(mid[0] - center[0], mid[1] - center[1]) || 1;
      const bulge = spec.scallop * (0.7 + random() * 0.6);
      outer.push([mid[0] + ((mid[0] - center[0]) / away) * bulge, mid[1] + ((mid[1] - center[1]) / away) * bulge]);
    }
  });
  const outline = [spec.root, ...spec.lead.map((point) => nudge(point, 0.9)), ...outer, ...spec.trail.map((point) => nudge(point, 0.9))];

  const panels: Wing["panels"] = [];
  const border: string[] = [];
  const spots: Wing["spots"] = [];
  let ink = "";

  // Veins: heavier at the root, fine at the margin
  for (let i = 0; i <= last; i++) ink += stroke(bowed(hub(i), margin[i], 1.6), 1.9, 0.7);

  for (let i = 0; i < last; i++) {
    panels.push({ d: pts([hub(i), hub(i + 1), inner(i + 1), inner(i)]), colour: spec.panels[i % spec.panels.length] });
    border.push(pts([inner(i), inner(i + 1), outer[i * 2 + 2], outer[i * 2 + 1], outer[i * 2]]));
    const spot = lerp(lerp(inner(i), margin[i], 0.55), lerp(inner(i + 1), margin[i + 1], 0.55), 0.5);
    spots.push([spot[0] + wobble(0.5), spot[1] + wobble(0.5), 0.9 + random() * 0.7]);
    // Cross-veins: rungs between the two veins bounding this panel. Unevenly
    // spaced, slightly bowed, and now and then one is missing.
    [0.33, 0.57, 0.78].forEach((t) => {
      if (random() < 0.12) return;
      const at = t + wobble(0.05);
      ink += stroke(bowed(lerp(hub(i), inner(i), at), lerp(hub(i + 1), inner(i + 1), at + wobble(0.04)), 0.7), 0.9, 0.7);
    });
  }

  // Outline as two loops with a drifting gap between them, so its weight
  // swells and thins like the plants' outlines
  const count = outline.length;
  const outerLoop: Point[] = [];
  const innerLoop: Point[] = [];
  let pressure = 0.5;
  outline.forEach((point, i) => {
    const a = outline[(i - 1 + count) % count];
    const b = outline[(i + 1) % count];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    pressure = Math.min(1, Math.max(0, pressure + wobble(0.3)));
    const half = (2.3 * (0.72 + 0.56 * pressure)) / 2;
    outerLoop.push([point[0] - ((b[1] - a[1]) / length) * half, point[1] + ((b[0] - a[0]) / length) * half]);
    innerLoop.push([point[0] + ((b[1] - a[1]) / length) * half, point[1] - ((b[0] - a[0]) / length) * half]);
  });
  ink += path(outerLoop) + path(innerLoop.reverse());
  // The cell's own edge
  ink += stroke([...cell, cell[0]], 1.2, 1.2);

  return { outline: pts(outline), cell: pts(cell), panels, border, spots, ink };
}

const FORE_SPEC: WingSpec = {
  root: [3, -4],
  lead: [[11, -15], [22, -27], [38, -39], [50, -44]],
  margin: [[59, -44], [64, -35], [63, -25], [60, -15], [54, -6], [45, 0], [28, 3]],
  trail: [[17, 3], [8, 2]],
  cell: [[3, -4], [14, -15], [27, -24], [33, -11]],
  panels: ["mid", "pale", "mid", "cream", "mid", "pale"],
  scallop: 0.9,
};
const HIND_SPEC: WingSpec = {
  root: [3, 2],
  lead: [[3, 13], [7, 26]],
  margin: [[14, 38], [24, 45], [35, 46], [45, 40], [51, 30], [51, 19], [45, 9]],
  trail: [[34, 4], [18, 3]],
  cell: [[3, 2], [8, 14], [22, 19], [20, 6]],
  panels: ["pale", "mid", "cream", "mid", "pale", "mid"],
  scallop: 2.6,
};

const random = seeded(23);
const RIGHT = { fore: buildWing(FORE_SPEC, random), hind: buildWing(HIND_SPEC, random) };
const LEFT = { fore: buildWing(FORE_SPEC, random), hind: buildWing(HIND_SPEC, random) };

function WingShape({ wing, edge }: { wing: Wing; edge?: Point[] }): React.ReactElement {
  return (
    <>
      {/* Base colour shows wherever no panel covers: the strips beside the
          cell, which read as the wing's darker root */}
      <polygon points={wing.outline} fill="var(--deep)" />
      {/* The one spot of colour outside the strip's palette */}
      <polygon points={wing.cell} fill="var(--accent)" />
      {wing.panels.map((panel, i) => (
        <polygon key={i} points={panel.d} fill={`var(--${panel.colour})`} />
      ))}
      {wing.border.map((d, i) => (
        <polygon key={i} points={d} fill="var(--deep)" />
      ))}
      {wing.spots.map(([x, y, r], i) => (
        <circle key={i} cx={n(x)} cy={n(y)} r={n(r)} fill="var(--cream)" />
      ))}
      {/* Leading-edge band, with a pale streak along it */}
      {edge && (
        <>
          <polyline points={pts(edge)} fill="none" stroke="var(--deep)" strokeWidth="3.4" strokeLinejoin="round" />
          <polyline points={pts(edge)} fill="none" stroke="var(--pale)" strokeWidth="0.9" strokeLinejoin="round" />
        </>
      )}
      <path d={wing.ink} fill="var(--ink)" />
    </>
  );
}

function Wings({ side }: { side: typeof RIGHT }): React.ReactElement {
  return (
    // Twitches by squashing toward the body (see butterfly-twitch in globals.css)
    <g className="butterfly-wing">
      <WingShape wing={side.hind} />
      <WingShape wing={side.fore} edge={[[5, -7], [20, -21], [38, -35], [55, -41]]} />
    </g>
  );
}

function Butterfly(): React.ReactElement {
  return (
    <div className="butterfly" aria-hidden="true">
      <svg width="92" height="70" viewBox="-66 -48 132 100" style={{ overflow: "visible", display: "block" }}>
        <Wings side={RIGHT} />
        {/* The far side: mirrored, drawn with its own errors, and a touch
            narrower, as if the butterfly is turned slightly away */}
        <g transform="scale(-0.9 1)">
          <Wings side={LEFT} />
        </g>

        {/* Antennae with clubbed tips */}
        <g fill="none" stroke="var(--mark)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M-1.2 -12Q-5 -24 -12 -28" />
          <path d="M1.2 -12Q5 -24 12 -28" />
        </g>
        <ellipse cx="-12.6" cy="-28.4" rx="1.9" ry="1.2" transform="rotate(-40 -12.6 -28.4)" fill="var(--mark)" />
        <ellipse cx="12.6" cy="-28.4" rx="1.9" ry="1.2" transform="rotate(40 12.6 -28.4)" fill="var(--mark)" />

        {/* Abdomen in segments, thorax, head with two eyes */}
        <polygon
          points={pts([[-2.6, 5], [2.6, 5], [2.2, 14], [1.2, 24], [0, 28], [-1.2, 24], [-2.2, 14]])}
          fill="var(--cream)"
          stroke="var(--ink)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <g stroke="var(--ink)" strokeWidth="1">
          <line x1="-2.5" y1="9.5" x2="2.5" y2="9.5" />
          <line x1="-2.3" y1="14" x2="2.3" y2="14" />
          <line x1="-1.9" y1="18.5" x2="1.9" y2="18.5" />
          <line x1="-1.4" y1="22.5" x2="1.4" y2="22.5" />
        </g>
        <polygon
          points={pts([[0, -9], [3.4, -5], [3.6, 2], [2.6, 6], [-2.6, 6], [-3.6, 2], [-3.4, -5]])}
          fill="var(--olive)"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line x1="0" y1="-7" x2="0" y2="5" stroke="var(--ink)" strokeWidth="0.9" />
        <circle cx="0" cy="-11.4" r="3" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.4" />
        <circle cx="-1.9" cy="-12" r="1" fill="var(--ink)" />
        <circle cx="1.9" cy="-12" r="1" fill="var(--ink)" />
      </svg>
    </div>
  );
}

// Static, so skip re-rendering when the strip's scroll state changes
export default React.memo(Butterfly);
