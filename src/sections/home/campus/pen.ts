import { screen, toPath, type V2, type V3, type View } from '../../../lib/iso';

/**
 * Every colour goes through this table, so day and night are two sets of CSS variables
 * and switching between them re-renders nothing.
 */
const table = new Map<string, { i: number; day: string; night: string }>();

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

function dusk(c: string) {
  const [r, g, b] = hex(c);
  const grey = 0.3 * r + 0.59 * g + 0.11 * b;
  const mix = (v: number, t: number) => Math.round((v * 0.72 + grey * 0.28) * 0.27 + t * 0.73);
  const out = [mix(r, 11), mix(g, 22), mix(b, 52)];
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** A themed colour. Give `night` for anything that should not simply darken. */
export function col(day: string, night?: string) {
  const key = `${day}|${night ?? ''}`;
  let e = table.get(key);
  if (!e) {
    e = { i: table.size, day, night: night ?? dusk(day) };
    table.set(key, e);
  }
  return `var(--m${e.i})`;
}

export function paletteCss(selector: string) {
  const list = [...table.values()];
  const day = list.map((e) => `--m${e.i}:${e.day}`).join(';');
  const night = list.map((e) => `--m${e.i}:${e.night}`).join(';');
  return `${selector}{${day}}${selector}[data-night]{${night}}`;
}

export interface Op {
  d: string;
  f?: string;
  s?: string;
  sw?: number;
  o?: number;
  cls?: string;
}

/** Collects shapes in draw order. Consecutive shapes of one colour share a single path. */
export class Pen {
  ops: Op[] = [];
  pts: V2[] = [];
  constructor(readonly v: View) {}

  add(op: Op) {
    const last = this.ops[this.ops.length - 1];
    if (last && !op.s && !last.s && last.f === op.f && last.o === op.o && last.cls === op.cls) last.d += op.d;
    else this.ops.push(op);
  }

  private flat(pts: V3[]) {
    const out = pts.map(([x, y, z]) => screen(x, y, z, this.v));
    this.pts.push(...out);
    return out;
  }

  poly(f: string, pts: V3[], o?: number, cls?: string) {
    this.add({ d: toPath(this.flat(pts)), f, o, cls });
  }

  line(s: string, sw: number, pts: V3[], cls?: string) {
    this.add({ d: toPath(this.flat(pts), false), s, sw, cls });
  }

  /** A rectangle lying flat at height z. */
  flatRect(f: string, x: number, y: number, w: number, d: number, z = 0, o?: number, cls?: string) {
    this.poly(f, [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], o, cls);
  }

  /** A box. `left` is the +y wall, `right` the +x wall. */
  box(x: number, y: number, w: number, d: number, z: number, h: number, top: string, left: string, right: string) {
    const t = z + h;
    if (!this.v.plan) {
      this.poly(left, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]]);
      this.poly(right, [[x + w, y + d, z], [x + w, y, z], [x + w, y, t], [x + w, y + d, t]]);
    }
    this.flatRect(top, x, y, w, d, t);
  }

  /** Flat disc or ellipse at height z. */
  disc(f: string, cx: number, cy: number, rx: number, ry: number, z = 0, o?: number, cls?: string, n = 22) {
    const pts: V3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z]);
    }
    this.poly(f, pts, o, cls);
  }
}
