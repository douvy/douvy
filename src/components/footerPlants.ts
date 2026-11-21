// Draws the footer strip: a procedurally generated band of plants in a
// screen-print style. Pure data in, SVG path data out - the React side lives
// in FooterGrass.tsx. See docs/animations.md.

import type { DaisyShape } from "@/components/blowDaisy";

/** The height the plant sizes below were drawn for; other heights scale them. */
const DESIGN_HEIGHT = 230;

export type Colour = "deep" | "mid" | "bright" | "pale" | "olive" | "gold" | "coral" | "cream";

/** Everything is a filled polygon - including the lines, see ring() and band(). */
export interface Shape {
  d: string;
  /** "mark" is for loose dots that must show against the page */
  colour: Colour | "ink" | "mark";
}

export interface Plant {
  x: number;
  shapes: Shape[];
  /** Mushrooms and dots stay put */
  still?: boolean;
  /**
   * Set on daisies, so the profile picture's animation can pick one (see
   * blowDaisy.ts). `headFrom` is the index of the first shape of the head.
   */
  daisy?: DaisyShape & { headFrom: number };
  duration: number;
  delay: number;
}

type Point = [number, number];

// The posters this borrows from rarely leave a shape one flat colour: most
// are split into two tones. This picks the second tone for each first.
const LIGHTER: Record<Colour, Colour> = {
  deep: "mid",
  mid: "bright",
  bright: "pale",
  pale: "cream",
  olive: "bright",
  gold: "cream",
  coral: "gold",
  cream: "pale",
};

// Seeded PRNG (mulberry32) so the drawing is the same on every visit.
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Coordinates to one decimal: enough for the eye, and much shorter paths. */
export const n = (value: number): string => value.toFixed(1);

const polygon = (points: Point[]): string =>
  "M" + points.map(([x, y]) => `${n(x)} ${n(y)}`).join("L") + "Z";

// The linework imitates a confident brush pen rather than vector strokes:
//  - contours are a few straight runs with crisp corners, not smooth curves
//  - outlines are bold and steady, with only slight changes in weight
//  - colour sits a touch off-register from its outline, as in a screen print
/**
 * Layers of plants covering `width` px, back to front, on a canvas `HEIGHT`
 * px tall with the ground along its bottom edge.
 *
 * `plantHeightAt(x)` says how tall the planting should be at x, which lets
 * it stand taller in some places than others. The arches and the pebble bed
 * stay the same size whatever the height, so a shorter planting is the same
 * ground with shorter plants on it.
 */
export function buildPlants(
  width: number,
  HEIGHT: number,
  plantHeightAt: (x: number) => number,
  {
    archBase = 34,
    archScale = 1,
    flowerScale = 1,
  }: {
    /** How far above the ground the arches spring from; lower makes them shorter. */
    archBase?: number;
    /** Multiplies how high the arches rise. */
    archScale?: number;
    /** Multiplies the size of the daisy heads. */
    flowerScale?: number;
  } = {}
): Plant[][] {
  const growAt = (x: number): number => plantHeightAt(x) / DESIGN_HEIGHT;
  const random = seededRandom(11);
  const between = (min: number, max: number): number => min + random() * (max - min);
  const jitter = (amount: number): number => between(-amount, amount);
  const pick = <T,>(options: readonly T[]): T => options[Math.floor(random() * options.length)];
  const sway = (): Pick<Plant, "duration" | "delay"> => ({ duration: between(5, 9), delay: between(0, 9) });

  // Points along a quadratic curve, roughly one every 11px, so a curve
  // becomes a handful of straight facets
  const curve = (from: Point, control: Point, to: Point, wobble = 0.45): Point[] => {
    const length =
      Math.hypot(control[0] - from[0], control[1] - from[1]) + Math.hypot(to[0] - control[0], to[1] - control[1]);
    const steps = Math.max(2, Math.round(length / 11));
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const edge = i === 0 || i === steps;
      points.push([
        u * u * from[0] + 2 * u * t * control[0] + t * t * to[0] + (edge ? 0 : jitter(wobble)),
        u * u * from[1] + 2 * u * t * control[1] + t * t * to[1] + (edge ? 0 : jitter(wobble)),
      ]);
    }
    return points;
  };

  // Offsets each point of a path sideways by `half(i)`, mitring the corners so
  // the line keeps its weight around sharp turns
  const offsets = (points: Point[], closed: boolean, half: (i: number) => number): [Point[], Point[]] => {
    const count = points.length;
    const left: Point[] = [];
    const right: Point[] = [];
    const unit = (from: Point, to: Point): Point => {
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
      return [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
    };
    for (let i = 0; i < count; i++) {
      const point = points[i];
      const prev = points[closed ? (i - 1 + count) % count : Math.max(0, i - 1)];
      const next = points[closed ? (i + 1) % count : Math.min(count - 1, i + 1)];
      const incoming = prev === point ? unit(point, next) : unit(prev, point);
      const outgoing = next === point ? incoming : unit(point, next);
      let tx = incoming[0] + outgoing[0];
      let ty = incoming[1] + outgoing[1];
      const length = Math.hypot(tx, ty) || 1;
      tx /= length;
      ty /= length;
      // Mitre: widen at corners, capped so spikes don't shoot out
      const cos = Math.max(0.5, tx * incoming[0] + ty * incoming[1]);
      const h = half(i) / cos;
      left.push([point[0] - ty * h, point[1] + tx * h]);
      right.push([point[0] + ty * h, point[1] - tx * h]);
    }
    return [left, right.reverse()];
  };

  // Outline of a closed shape, as two loops wound in opposite directions
  // (which leaves the middle empty under the default nonzero fill rule).
  // The weight drifts a little, like pressure on a pen.
  const ring = (points: Point[], weight: number): string => {
    let pressure = between(0.2, 0.8);
    const [outer, inner] = offsets(points, true, () => {
      pressure = Math.min(1, Math.max(0, pressure + jitter(0.14)));
      return (weight * (0.86 + 0.28 * pressure)) / 2;
    });
    return polygon(outer) + polygon(inner);
  };

  // A line with thickness, as a polygon. `tip` narrows it toward the far end.
  const band = (points: Point[], weight: number, tip = 1): Point[] => {
    const last = Math.max(1, points.length - 1);
    const [left, right] = offsets(points, false, (i) => (weight / 2) * (1 - (1 - tip) * (i / last)) * between(0.93, 1.07));
    return [...left, ...right];
  };

  // Collects one plant's shapes, painted in call order.
  // `shift` is that plant's print misregistration.
  const draw = () => {
    const shapes: Shape[] = [];
    const shift: Point = [jitter(1.1), jitter(0.9)];
    const plant = {
      shapes,
      /** Flat colour, no outline */
      fill(outlines: Point[][], colour: Shape["colour"]): void {
        shapes.push({
          d: outlines.map((points) => polygon(points.map(([x, y]): Point => [x + shift[0], y + shift[1]]))).join(""),
          colour,
        });
      },
      /** Bold outline around closed shapes */
      outline(outlines: Point[][], weight: number): void {
        shapes.push({ d: outlines.map((points) => ring(points, weight)).join(""), colour: "ink" });
      },
      inked(outlines: Point[][], colour: Shape["colour"], weight: number): void {
        plant.fill(outlines, colour);
        plant.outline(outlines, weight);
      },
      /** Pen lines with blunt ends */
      lines(paths: Point[][], weight: number, colour: Shape["colour"] = "ink"): void {
        shapes.push({ d: paths.map((points) => polygon(band(points, weight))).join(""), colour });
      },
    };
    return plant;
  };

  const bold = (): number => between(2.3, 2.9);

  // Hand-cut oval: `rx` by `ry`, turned by `turn`
  const oval = ([cx, cy]: Point, rx: number, ry: number, turn = 0): Point[] => {
    const sides = 8 + Math.floor(random() * 3);
    const points: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + jitter(0.12);
      const px = Math.cos(angle) * rx * between(0.92, 1.08);
      const py = Math.sin(angle) * ry * between(0.92, 1.08);
      points.push([cx + px * Math.cos(turn) - py * Math.sin(turn), cy + px * Math.sin(turn) + py * Math.cos(turn)]);
    }
    return points;
  };

  // A stem from below the ground line that bows; `at` locates points along it
  const stalk = (x: number, designHeight: number, lean: number): { points: Point[]; at: (t: number) => Point } => {
    const height = designHeight * growAt(x);
    const bow = between(-7, 7);
    const at = (t: number): Point => [
      x + lean * Math.pow(t, 1.6) + bow * Math.sin(Math.PI * t),
      HEIGHT + 4 - (height + 4) * t,
    ];
    const steps = Math.max(3, Math.round(height / 14));
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const [px, py] = at(i / steps);
      points.push([px + (i ? jitter(0.5) : 0), py]);
    }
    return { points, at };
  };

  // Blade tapering to a point; the base sits below the ground line.
  // `half` is the right-hand side of the blade, for a second tone; `split`
  // is the line between the two.
  const blade = (
    x: number,
    height: number,
    lean: number,
    bladeWidth: number
  ): { outline: Point[]; half: Point[]; split: Point[] } => {
    const tip: Point = [x + lean + jitter(1), HEIGHT - height];
    const bend = lean * between(0.1, 0.4);
    const up = curve([x - bladeWidth / 2, HEIGHT + 5], [x + bend - bladeWidth / 2, HEIGHT - height * between(0.5, 0.7)], tip);
    const down = curve(tip, [x + bend + bladeWidth / 2, HEIGHT - height * between(0.45, 0.65)], [x + bladeWidth / 2, HEIGHT + 5]);
    const split = curve([x + jitter(bladeWidth * 0.15), HEIGHT + 5], [x + bend, HEIGHT - height * 0.55], tip);
    const outline = [...up];
    // Some blades are creased over at the top
    if (height > 34 && random() < 0.09) {
      outline.push([tip[0] + (random() < 0.5 ? -1 : 1) * between(3.5, 7), tip[1] + between(6, 11)]);
    }
    outline.push(...down.slice(1));
    return { outline, half: [...split, ...down.slice(1)], split };
  };

  // Pointed almond leaf along `angle`. `along(t, off)` maps leaf-space to the
  // page: t runs base to tip, off is sideways.
  const leaf = (
    base: Point,
    angle: number,
    length: number,
    fat: number
  ): { outline: Point[]; side: Point[]; along: (t: number, off: number) => Point; halfWidth: number } => {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const along = (t: number, off: number): Point => [
      base[0] + dx * length * t - dy * off,
      base[1] + dy * length * t + dx * off,
    ];
    const halfWidth = length * fat;
    const tip = along(1, jitter(length * 0.05));
    const out = curve(base, along(between(0.32, 0.5), halfWidth * between(1.5, 1.9)), tip);
    const back = curve(tip, along(between(0.32, 0.5), -halfWidth * between(1.5, 1.9)), base);
    // `side` is one half of the leaf (closed along the midrib), for a second tone
    return { outline: [...out, ...back.slice(1, -1)], side: out, along, halfWidth };
  };

  // --- Plant kinds -------------------------------------------------------

  const grassTuft = (x: number, tall: boolean): Plant => {
    const plant = draw();
    const count = 2 + Math.floor(random() * 3);
    for (let i = 0; i < count; i++) {
      const bx = x + between(-10, 10);
      const height = tall ? between(44, 140) * growAt(x) : between(12, 42);
      const lean = between(-16, 16);
      // Solid ink blades among the tall ones read as shadow
      const colour = tall
        ? pick(["deep", "deep", "mid", "olive", "ink", "mid"] as const)
        : pick(["mid", "bright", "deep", "mid", "pale"] as const);
      const shape = blade(bx, height, lean, tall ? between(6, 11.5) : between(5, 9));
      if (colour !== "ink" && random() < 0.55) {
        // Two tones split down the middle
        plant.fill([shape.outline], colour);
        plant.fill([shape.half], LIGHTER[colour]);
        plant.lines([shape.split.slice(0, -1)], 1.4);
        plant.outline([shape.outline], bold());
      } else {
        plant.inked([shape.outline], colour, bold());
      }
    }
    return { x, shapes: plant.shapes, ...sway() };
  };

  // Daisy: many narrow blunt petals around an oval two-ring centre. The whole
  // head is squashed and turned, as if seen at an angle.
  const daisy = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(96, 200), between(-15, 15));
    plant.inked([band(stem.points, between(3.2, 4.4), 0.85)], pick(["mid", "pale", "olive", "mid"] as const), 1.8);

    const [cx, cy] = stem.at(1);
    const radius = between(17, 27) * flowerScale;
    const squash = between(0.48, 1);
    const turn = jitter(0.6);
    // Flower space (polar) to the page: squash, then turn
    const at = (r: number, angle: number): Point => {
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r * squash;
      return [cx + px * Math.cos(turn) - py * Math.sin(turn), cy + px * Math.sin(turn) + py * Math.cos(turn)];
    };

    const count = Math.round(between(17, 25));
    const core = radius * between(0.3, 0.38);
    const step = Math.PI / count; // half the angle each petal gets
    const petals: Point[][] = [];
    for (let i = 0; i < count; i++) {
      if (random() < 0.05) continue; // the odd missing petal
      const angle = (i / count) * Math.PI * 2 + jitter(0.06);
      const reach = radius * between(0.8, 1.12);
      const spread = step * between(0.7, 0.92);
      petals.push([
        at(core * 0.8, angle - step * 0.75),
        at(reach * between(0.93, 1), angle - spread),
        // Blunt end, cut slightly crooked or notched
        at(reach * between(0.88, 1.05), angle + jitter(spread * 0.35)),
        at(reach * between(0.93, 1), angle + spread),
        at(core * 0.8, angle + step * 0.75),
      ]);
    }
    plant.inked(petals, "cream", 1.5);

    const ringOf = (r: number, offset: number): Point[] => {
      const points: Point[] = [];
      const lift = jitter(0.5);
      for (let k = 0; k < 10; k++) {
        const [px, py] = at(r * between(0.94, 1.07), (k / 10) * Math.PI * 2);
        points.push([px + offset, py + lift]);
      }
      return points;
    };
    const colour = pick(["mid", "olive", "mid"] as const);
    plant.inked([ringOf(core, 0)], colour, 2);
    plant.inked([ringOf(core * between(0.42, 0.55), jitter(core * 0.18))], colour === "mid" ? "pale" : "cream", 1.2);
    return {
      x,
      shapes: plant.shapes,
      ...sway(),
      // Shapes 0-1 are the stem; everything after is the head
      daisy: { radius, squash, turn, petals: count, centre: colour, headFrom: 2 },
    };
  };

  // One large leaf on a line stem, with a centre line and chevron veins
  const bigLeaf = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(44, 128), between(-10, 10));
    const base = stem.at(1);
    const shape = leaf(base, -Math.PI / 2 + jitter(0.45), between(34, 54), between(0.19, 0.25));
    const colour = pick(["gold", "pale", "mid", "coral", "bright", "gold"] as const);
    plant.fill([shape.outline], colour);
    plant.fill([shape.side], LIGHTER[colour]);

    const veins: Point[][] = [[...stem.points, shape.along(between(0.8, 0.93), 0)]];
    const pairs = 3 + Math.floor(random() * 3);
    for (let i = 0; i < pairs; i++) {
      const t = 0.16 + (i / pairs) * 0.58;
      const reach = shape.halfWidth * Math.sin(Math.PI * (t + 0.17)) * between(0.72, 0.9);
      [-1, 1].forEach((side) => {
        veins.push([shape.along(t, 0), shape.along(t + between(0.13, 0.19), side * reach)]);
      });
    }
    plant.lines(veins, 1.7);
    plant.outline([shape.outline], bold());
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A line stem carrying two-tone leaves
  const sprig = (x: number): Plant => {
    const plant = draw();
    const height = between(72, 160);
    const stem = stalk(x, height, between(-22, 22));
    plant.lines([stem.points], 2.2);
    const colour = pick(["mid", "olive", "pale", "mid"] as const);
    const count = 3 + Math.floor(random() * Math.max(1, height / 30));
    const outlines: Point[][] = [];
    const sides: Point[][] = [];
    const veins: Point[][] = [];
    let side = random() < 0.5 ? -1 : 1;
    for (let i = 0; i <= count; i++) {
      const isTop = i === count;
      const t = isTop ? 1 : 0.2 + (i / count) * 0.72;
      const tilt = between(0.3, 0.95);
      const angle = isTop ? -Math.PI / 2 + jitter(0.5) : side > 0 ? -tilt : Math.PI + tilt;
      const shape = leaf(stem.at(t), angle, between(15, 24) * (1.1 - t * 0.25), between(0.2, 0.27));
      outlines.push(shape.outline);
      sides.push(shape.side);
      veins.push([shape.along(0, 0), shape.along(between(0.7, 0.9), 0)]);
      side = -side;
    }
    plant.fill(outlines, colour);
    plant.fill(sides, colour === "pale" ? "mid" : "pale");
    plant.lines(veins, 1.3);
    plant.outline(outlines, 2.1);
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A frond: one lance-shaped silhouette, hatched in a herringbone
  const fern = (x: number): Plant => {
    const plant = draw();
    const height = between(84, 182);
    const stem = stalk(x, height, between(-28, 28));
    const spread = between(11, 17);
    const start = 0.14;
    const envelope = (t: number): number => spread * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * ((t - start) / (1 - start)))), 0.75);
    // Unit vector across the stem at t
    const across = (t: number): Point => {
      const [ax, ay] = stem.at(Math.max(0, t - 0.03));
      const [bx, by] = stem.at(Math.min(1, t + 0.03));
      const length = Math.hypot(bx - ax, by - ay) || 1;
      return [-(by - ay) / length, (bx - ax) / length];
    };
    const edge = (t: number, side: number, scale = 1): Point => {
      const [px, py] = stem.at(t);
      const [nx, ny] = across(t);
      return [px + nx * envelope(t) * side * scale, py + ny * envelope(t) * side * scale];
    };

    const rows = Math.max(8, Math.round(height / 4.6));
    const leftEdge: Point[] = [];
    const rightEdge: Point[] = [];
    const hatch: Point[][] = [];
    for (let i = 0; i <= rows; i++) {
      const t = start + (i / rows) * (1 - start);
      // Slightly notched edge
      const notch = i % 2 ? 1 : 0.9;
      leftEdge.push(edge(t, -1, notch));
      rightEdge.push(edge(t, 1, notch));
      const ahead = Math.min(1, t + 7.5 / height);
      if (i < rows - 1) {
        hatch.push([stem.at(t), edge(ahead, -1, 0.9)]);
        hatch.push([stem.at(t), edge(ahead, 1, 0.9)]);
      }
    }
    plant.inked([[...leftEdge, ...rightEdge.reverse()]], pick(["olive", "olive", "mid", "bright"] as const), 2);
    plant.lines(hatch, 1.25);
    plant.lines([stem.points], 2.2);
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A stem that curls into a spiral at the top, with small leaflets below
  const fiddlehead = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(74, 162), between(-10, 10));
    const side = random() < 0.5 ? -1 : 1;
    const radius = between(9, 15.5);
    const [sx, sy] = stem.at(1);
    const path: Point[] = [...stem.points];
    const turns = between(1.3, 1.8);
    const steps = Math.round(turns * 13);
    for (let i = 1; i <= steps; i++) {
      // Spiral inward around a centre beside the top of the stem
      const angle = Math.PI + (i / steps) * turns * Math.PI * 2;
      const r = radius * (1 - 0.86 * (i / steps));
      path.push([sx + side * (radius + Math.cos(angle) * r), sy + Math.sin(angle) * r]);
    }
    const colour = pick(["olive", "mid", "bright", "pale"] as const);

    const leaflets: Point[][] = [];
    const pairs = 2 + Math.floor(random() * 4);
    for (let i = 0; i < pairs; i++) {
      const base = stem.at(0.22 + i * between(0.1, 0.14));
      [-1, 1].forEach((dir) => {
        const tilt = between(0.35, 0.9);
        leaflets.push(leaf(base, dir > 0 ? -tilt : Math.PI + tilt, between(7, 12), between(0.2, 0.26)).outline);
      });
    }
    plant.inked(leaflets, LIGHTER[colour], 1.6);
    plant.inked([band(path, between(5, 6.8), 0.42)], colour, 2);
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A tall line stem carrying a long seed head, ticked across
  const reed = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(104, 192), between(-15, 15));
    plant.lines([stem.points], 2.2);
    const from = between(0.48, 0.6);
    const [ax, ay] = stem.at(from);
    const [bx, by] = stem.at(from + 0.1);
    const shape = leaf([ax, ay], Math.atan2(by - ay, bx - ax), between(26, 42), between(0.1, 0.14));
    const colour = pick(["gold", "coral", "cream", "gold"] as const);
    plant.fill([shape.outline], colour);
    plant.fill([shape.side], LIGHTER[colour]);
    const ticks: Point[][] = [];
    const count = 4 + Math.floor(random() * 4);
    for (let i = 0; i < count; i++) {
      const t = 0.18 + (i / count) * 0.66;
      const reach = shape.halfWidth * 0.62 * Math.sin(Math.PI * t);
      ticks.push([shape.along(t, -reach), shape.along(t + 0.05, reach)]);
    }
    plant.lines(ticks, 1.2);
    plant.outline([shape.outline], bold());
    return { x, shapes: plant.shapes, ...sway() };
  };

  // Twigs ending in ringed oval buds
  const buds = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(66, 160), between(-17, 17));
    const twigs: Point[][] = [stem.points];
    const outer: Point[][] = [];
    const inner: Point[][] = [];
    const count = 2 + Math.floor(random() * 4);
    let side = random() < 0.5 ? -1 : 1;
    for (let i = 0; i < count; i++) {
      const isTop = i === count - 1;
      const base = stem.at(isTop ? 1 : 0.4 + (i / count) * 0.58);
      const end: Point = isTop ? base : [base[0] + side * between(9, 18), base[1] - between(4, 13)];
      if (!isTop) twigs.push([base, end]);
      const rx = between(4.6, 7.4);
      const turn = jitter(0.7);
      outer.push(oval(end, rx, rx * between(0.62, 0.85), turn));
      inner.push(oval([end[0] + jitter(0.8), end[1] + jitter(0.8)], rx * 0.45, rx * between(0.28, 0.38), turn));
      side = -side;
    }
    plant.lines(twigs, 1.9);
    const colour = pick(["mid", "olive", "pale"] as const);
    plant.inked(outer, colour, 1.9);
    plant.inked(inner, colour === "pale" ? "mid" : "cream", 1.1);
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A broad blade whose tip hooks over
  const curlBlade = (x: number): Plant => {
    const plant = draw();
    const stem = stalk(x, between(74, 166), between(-18, 18));
    const side = random() < 0.5 ? -1 : 1;
    const radius = between(7, 12.5);
    const [sx, sy] = stem.at(1);
    const path: Point[] = [...stem.points];
    const turns = between(0.45, 0.72);
    const steps = Math.round(turns * 14);
    for (let i = 1; i <= steps; i++) {
      const angle = Math.PI + (i / steps) * turns * Math.PI * 2;
      const r = radius * (1 - 0.35 * (i / steps));
      path.push([sx + side * (radius + Math.cos(angle) * r), sy + Math.sin(angle) * r]);
    }
    plant.inked([band(path, between(8.5, 13), 0.06)], pick(["mid", "olive", "pale", "mid"] as const), bold());
    plant.lines([path.slice(0, -2)], 1.3);
    return { x, shapes: plant.shapes, ...sway() };
  };

  // Large background leaf: one smooth edge, one toothed, with a vein running
  // out to each tooth
  const toothedLeaf = (x: number): Plant => {
    const plant = draw();
    const height = between(104, 218) * growAt(x);
    const lean = between(-34, 34);
    const half = between(11, 20);
    const flip = random() < 0.5 ? -1 : 1; // which side carries the teeth
    const tip: Point = [x + lean, HEIGHT - height];
    const bend = lean * between(0.15, 0.45);
    const belly = HEIGHT - height * between(0.45, 0.6);
    const smooth = curve([x - flip * half * 0.9, HEIGHT + 5], [x + bend - flip * half * 1.5, belly], tip);
    const rough = curve(tip, [x + bend + flip * half * 1.5, belly], [x + flip * half * 0.9, HEIGHT + 5], 0.2);
    const midrib = curve([x, HEIGHT + 5], [x + bend, HEIGHT - height * 0.5], tip);

    const toothed: Point[] = [];
    const ribs: Point[][] = [];
    for (let i = 0; i < rough.length - 1; i++) {
      const [ax, ay] = rough[i];
      const [bx, by] = rough[i + 1];
      // Each tooth juts out from the middle of a stretch, raked toward the tip;
      // the first ones, near the tip, are smaller
      const depth = between(3.5, 7) * Math.min(1, (i + 1) / 2);
      const tooth: Point = [(ax + bx) / 2 + flip * depth, (ay + by) / 2 - between(2, 5)];
      toothed.push(tooth, [bx, by]);
      const up = 1 - (i + 0.5) / (rough.length - 1); // how far up the leaf, 0-1
      const from = midrib[Math.max(0, Math.round((up - 0.12) * (midrib.length - 1)))];
      if (i > 0) ribs.push([from, tooth]);
    }

    const outline = [...smooth, ...toothed];
    const colour = pick(["deep", "deep", "mid", "olive"] as const);
    plant.fill([outline], colour);
    plant.fill([[...midrib, ...toothed]], colour === "deep" ? "mid" : colour === "mid" ? "deep" : "cream");
    plant.lines([midrib.slice(0, -1), ...ribs], 1.5);
    plant.outline([outline], bold());
    return { x, shapes: plant.shapes, ...sway() };
  };

  // A stem of overlapping pointed leaflets in two alternating colours
  const laurel = (x: number): Plant => {
    const plant = draw();
    const height = between(92, 186);
    const stem = stalk(x, height, between(-30, 30));
    plant.lines([stem.points], 2);
    const tones = pick([
      ["cream", "mid"],
      ["cream", "deep"],
      ["mid", "olive"],
      ["cream", "olive"],
    ] as const);
    const count = Math.round(height / between(8, 10.5));
    let side = random() < 0.5 ? -1 : 1;
    // Bottom to top, so each leaflet overlaps the one below
    for (let i = 0; i < count; i++) {
      const t = 0.16 + (i / count) * 0.84;
      const [px, py] = stem.at(t);
      const [qx, qy] = stem.at(Math.max(0, t - 0.05));
      const heading = Math.atan2(py - qy, px - qx);
      const shape = leaf([px, py], heading + side * between(0.35, 0.6), between(14, 21) * (1.1 - t * 0.35), between(0.24, 0.32));
      plant.inked([shape.outline], tones[i % 2], 1.8);
      side = -side;
    }
    return { x, shapes: plant.shapes, ...sway() };
  };

  // Long arcs sweeping across the scene, each a banded rim over a mound of
  // ink packed with pebbles. The arcs overlap, so there is little bare ground
  // between them.
  const mounds = (): Plant[] => {
    const result: Plant[] = [];
    // Where the arcs spring from. Raising this lifts every arch without
    // touching the plants, which are sized from the strip's height.
    const baseY = HEIGHT - archBase;
    for (let x = between(-200, -60); x < width; ) {
      const plant = draw();
      const span = between(260, 520);
      const rise = between(34, 70) * archScale;
      const peakY = baseY - rise * 2; // control point; the arc tops out at `rise`
      const arc = curve([x, baseY], [x + span / 2, peakY], [x + span, baseY], 0.25);
      plant.fill([[...arc, [x + span, HEIGHT + 6], [x, HEIGHT + 6]]], "ink");

      const rim = between(8, 13);
      const arcY = (px: number): number => {
        const t = (px - x) / span;
        return (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * peakY + t * t * baseY;
      };

      // Pebbles are laid in rows that follow the arc, starting right under
      // the rim and stepping down, so the mound is packed to the top instead
      // of leaving a black gap under the curve. They stop where the flat
      // pebble bed along the ground takes over.
      const byColour: Record<string, Point[][]> = {};
      const pitch = 7.7;
      for (let depth = rim / 2 + 5.2; depth < rise + 10; depth += pitch) {
        for (let px = x + between(4, 9); px < x + span - 4; ) {
          const rx = random() < 0.14 ? between(8.5, 12.5) : between(3, 8);
          px += rx;
          const py = arcY(px) + depth + jitter(0.7);
          if (py < HEIGHT - 28) {
            const colour = pick(["mid", "deep", "pale", "olive", "mid", "pale", "mid"] as const);
            // Tilted to lie along the curve at this point
            const slope = Math.atan2(arcY(px + 3) - arcY(px - 3), 6);
            (byColour[colour] ??= []).push(oval([px, py], rx, between(2.6, 3.5), slope + jitter(0.12)));
          }
          px += rx + between(1.8, 3.1);
        }
      }
      (Object.keys(byColour) as Colour[]).forEach((colour) => plant.fill(byColour[colour], colour));

      plant.inked([band(arc, rim)], pick(["pale", "mid", "pale", "olive"] as const), 2.2);
      plant.lines([arc.map(([ax, ay]): Point => [ax, ay + rim * 0.14])], 1.1);
      result.push({ x, shapes: plant.shapes, still: true, duration: 0, delay: 0 });
      x += span * between(0.42, 0.74);
    }
    return result;
  };

  // What fills the air between plants: clusters of small cut shapes -
  // slivers and shards rather than round dots - and the odd four-point star
  const stipple = (x: number): Plant => {
    const plant = draw();
    const cy = HEIGHT - between(70, 204) * growAt(x);
    const bits: Point[][] = [];
    const count = 5 + Math.floor(random() * 10);
    for (let i = 0; i < count; i++) {
      const center: Point = [x + jitter(24), cy + jitter(17)];
      if (random() < 0.3) {
        // Shard
        const size = between(1.6, 3.4);
        const turn = between(0, Math.PI * 2);
        bits.push(
          [0, 2.2, 4.1].map((a): Point => [
            center[0] + Math.cos(turn + a + jitter(0.4)) * size * between(0.6, 1.2),
            center[1] + Math.sin(turn + a + jitter(0.4)) * size * between(0.6, 1.2),
          ])
        );
      } else {
        // Sliver
        const rx = between(1, 3);
        bits.push(oval(center, rx, between(0.6, 1.1), between(0, Math.PI)));
      }
    }
    plant.fill(bits, "mark");

    if (random() < 0.3) {
      const [sx, sy]: Point = [x + jitter(30), cy + jitter(20)];
      const size = between(3, 6);
      const turn = jitter(0.3);
      const star: Point[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = turn + (i / 8) * Math.PI * 2;
        const r = i % 2 ? size * 0.26 : size * between(0.85, 1.15);
        star.push([sx + Math.cos(angle) * r, sy + Math.sin(angle) * r]);
      }
      plant.fill([star], pick(["mark", "mark", "mid"] as const));
    }
    return { x, shapes: plant.shapes, still: true, duration: 0, delay: 0 };
  };

  // The ground: a band of ink packed with pebble shapes of mixed sizes
  const pebbleBed = (): Plant => {
    const plant = draw();
    const top: Point[] = [];
    for (let x = -10; x <= width + 30; x += between(18, 34)) top.push([x, HEIGHT - between(27, 33)]);
    plant.fill([[...top, [width + 30, HEIGHT + 6], [-10, HEIGHT + 6]]], "ink");

    const byColour: Record<string, Point[][]> = {};
    [6, 14.5, 23].forEach((rise) => {
      for (let x = between(-6, 4); x < width; ) {
        const rx = between(3.2, 10.5);
        x += rx;
        const colour = pick(["mid", "mid", "pale", "olive", "mid", "pale"] as const);
        (byColour[colour] ??= []).push(oval([x, HEIGHT - rise + jitter(1)], rx, between(2.5, 3.9), jitter(0.22)));
        x += rx + between(2, 3.6);
      }
    });
    (Object.keys(byColour) as Colour[]).forEach((colour) => plant.fill(byColour[colour], colour));
    return { x: 0, shapes: plant.shapes, still: true, duration: 0, delay: 0 };
  };

  // --- Layers, back to front ---------------------------------------------

  const dots: Plant[] = [];
  for (let x = between(20, 90); x < width; x += between(64, 150)) dots.push(stipple(x));

  const backdrop: Plant[] = [];
  for (let x = between(0, 30); x < width; x += between(30, 62)) backdrop.push(toothedLeaf(x));

  const back: Plant[] = [];
  for (let x = 6; x < width; x += between(20, 38)) back.push(grassTuft(x, true));

  const middle: Plant[] = [];
  for (let x = between(20, 50); x < width; x += between(26, 54)) {
    const kind = random();
    if (kind < 0.5) middle.push(daisy(x));
    else if (kind < 0.6) middle.push(laurel(x));
    else if (kind < 0.69) middle.push(fern(x));
    else if (kind < 0.77) middle.push(bigLeaf(x));
    else if (kind < 0.84) middle.push(curlBlade(x));
    else if (kind < 0.9) middle.push(buds(x));
    else if (kind < 0.95) middle.push(fiddlehead(x));
    else if (kind < 0.97) middle.push(sprig(x));
    else middle.push(reed(x));
  }

  const front: Plant[] = [];
  for (let x = 12; x < width; x += between(30, 60)) front.push(grassTuft(x, false));

  return [backdrop, dots, back, mounds(), middle, [pebbleBed()], front];
}
