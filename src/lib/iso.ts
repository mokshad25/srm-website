// 2:1 isometric geometry. Scenes are drawn in "view space": world coordinates already
// turned to one of four angles, so "+x" and "+y" walls are always the visible ones.

export type Quarter = 0 | 1 | 2 | 3;
export type V3 = [number, number, number];
export type V2 = [number, number];

export interface View {
  k: Quarter;
  /** Flat top-down plan (2D) instead of isometric (3D). */
  plan: boolean;
  W: number;
  D: number;
}

export const U = 10; // Screen units along one world unit.
const PLAN = 9;

/** World to view space. */
export function turn(x: number, y: number, v: View): V2 {
  if (v.k === 1) return [v.D - y, x];
  if (v.k === 2) return [v.W - x, v.D - y];
  if (v.k === 3) return [y, v.W - x];
  return [x, y];
}

/** View space to screen. */
export function screen(x: number, y: number, z: number, v: View): V2 {
  return v.plan ? [x * PLAN, y * PLAN] : [(x - y) * U, ((x + y) * U) / 2 - z * U];
}

/** World to screen. */
export function project(x: number, y: number, z: number, v: View): V2 {
  const [a, b] = turn(x, y, v);
  return screen(a, b, z, v);
}

/** A world rectangle in view space, whichever corner ends up first. */
export function turnRect(x: number, y: number, w: number, d: number, v: View) {
  const [a0, b0] = turn(x, y, v);
  const [a1, b1] = turn(x + w, y + d, v);
  return { x: Math.min(a0, a1), y: Math.min(b0, b1), w: Math.abs(a1 - a0), d: Math.abs(b1 - b0) };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  d: number;
}

/** A sits behind B when it lies wholly on the far side of B on either axis. */
const behind = (a: Rect, b: Rect) => a.x + a.w <= b.x + 0.001 || a.y + a.d <= b.y + 0.001;

/** Back-to-front order. A topological sort, because centre-point sorting fails on long buildings. */
export function backToFront<T extends { box: Rect }>(items: T[]): T[] {
  const n = items.length;
  const after: number[][] = items.map(() => []);
  const blockers = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const ab = behind(items[i].box, items[j].box);
      const ba = behind(items[j].box, items[i].box);
      if (ab && !ba) {
        after[i].push(j);
        blockers[j]++;
      }
    }
  }
  const key = (t: T) => t.box.x + t.box.y + t.box.w / 2 + t.box.d / 2;
  const ready = items.map((_, i) => i).filter((i) => blockers[i] === 0);
  const out: T[] = [];
  const seen = new Array<boolean>(n).fill(false);
  while (ready.length) {
    ready.sort((a, b) => key(items[a]) - key(items[b]));
    const i = ready.shift()!;
    seen[i] = true;
    out.push(items[i]);
    for (const j of after[i]) if (--blockers[j] === 0) ready.push(j);
  }
  // Only reachable on a cycle: keep whatever is left in depth order.
  items.forEach((_, i) => !seen[i] && out.push(items[i]));
  return out;
}

export function hull(points: V2[]): V2[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: V2[]) => {
    const h: V2[] = [];
    for (const q of list) {
      while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    h.pop();
    return h;
  };
  return [...half(p), ...half(p.reverse())];
}

export const toPath = (pts: V2[], close = true) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}${close ? 'Z' : ''}`;
