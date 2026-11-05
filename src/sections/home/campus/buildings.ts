import type { Rect } from '../../../lib/iso';
import { col, Pen } from './pen';

/** Warm daylight, built from the site's royal, amber, teal and off-white. */
const C = {
  cream: [col('#F4EBD8'), col('#E0D3B8'), col('#C4B596')],
  white: [col('#FBF8F1'), col('#E9E5DB'), col('#CDCABF')],
  brick: [col('#C96F4F'), col('#B95F42'), col('#9A4A33')],
  glass: [col('#BFE0EA'), col('#5F9DBB'), col('#3F7A9B')],
  roof: col('#D9CDB4'),
  roofDark: col('#B7AA90'),
  cornice: col('#FFFDF7'),
  dark: col('#27334F'),
  royal: col('#1B4DB1'),
  royalDark: col('#163E90'),
  amber: col('#FFB81C'),
  amberDark: col('#D99A10'),
  teal: col('#16A6A1'),
  tealDark: col('#0F8580'),
  red: col('#D8362F', '#FF6A5E'),
  steel: col('#A7B0BC'),
  steelDark: col('#7F8996'),
  win: col('#7FA9C4', '#1C2B4C'),
  lit: col('#8FB8D0', '#FFC861'),
  grass: col('#9CC070'),
  grassLight: col('#AECD82'),
  green: col('#5E8F4E'),
  sand: col('#E9DEC6'),
  water: col('#67B3CC'),
  waterDeep: col('#4E9DBB'),
  track: col('#C8614A'),
};

type Wall = 'L' | 'R';
const lit = (i: number, j: number) => ((i * 7 + j * 13 + i * j) % 5) % 3 === 0;

/** Windows on one wall, as one path per state, so a whole facade costs two DOM nodes. */
function windows(p: Pen, b: Rect, wall: Wall, z0: number, z1: number, rowH: number, colW: number, fill = 0.56, tall = 0.6) {
  if (p.v.plan) return;
  const len = wall === 'L' ? b.w : b.d;
  const cols = Math.max(1, Math.floor((len - 0.6) / colW));
  const rows = Math.max(1, Math.floor((z1 - z0) / rowH));
  const step = (len - 0.4) / cols;
  const put = (f: string, i: number, j: number) => {
    const a = 0.2 + j * step + step * ((1 - fill) / 2);
    const e = a + step * fill;
    const z = z0 + i * rowH + rowH * ((1 - tall) / 2);
    const t = z + rowH * tall;
    if (wall === 'L') p.poly(f, [[b.x + a, b.y + b.d, z], [b.x + e, b.y + b.d, z], [b.x + e, b.y + b.d, t], [b.x + a, b.y + b.d, t]]);
    else p.poly(f, [[b.x + b.w, b.y + b.d - a, z], [b.x + b.w, b.y + b.d - e, z], [b.x + b.w, b.y + b.d - e, t], [b.x + b.w, b.y + b.d - a, t]]);
  };
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (!lit(i, j)) put(C.win, i, j);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (lit(i, j)) put(C.lit, i, j);
}

function cornice(p: Pen, b: Rect, z: number, c = C.cornice) {
  p.box(b.x - 0.2, b.y - 0.2, b.w + 0.4, b.d + 0.4, z, 0.3, c, C.white[1], C.white[2]);
  p.flatRect(C.roof, b.x + 0.2, b.y + 0.2, b.w - 0.4, b.d - 0.4, z + 0.3);
}

/** Door and awning on the long visible wall. */
function entrance(p: Pen, b: Rect, awning: string, shade: string) {
  if (p.v.plan) return;
  const cx = b.x + b.w / 2;
  const y = b.y + b.d;
  p.poly(C.dark, [[cx - 1, y, 0], [cx + 1, y, 0], [cx + 1, y, 1.7], [cx - 1, y, 1.7]]);
  p.poly(C.lit, [[cx - 0.8, y, 0.1], [cx - 0.05, y, 0.1], [cx - 0.05, y, 1.5], [cx - 0.8, y, 1.5]]);
  p.poly(C.lit, [[cx + 0.05, y, 0.1], [cx + 0.8, y, 0.1], [cx + 0.8, y, 1.5], [cx + 0.05, y, 1.5]]);
  p.poly(awning, [[cx - 1.5, y, 2.1], [cx + 1.5, y, 2.1], [cx + 1.5, y + 1.4, 1.8], [cx - 1.5, y + 1.4, 1.8]]);
  p.poly(shade, [[cx + 1.5, y, 2.1], [cx + 1.5, y + 1.4, 1.8], [cx + 1.5, y + 1.4, 1.6], [cx + 1.5, y, 1.9]]);
  p.poly(shade, [[cx - 1.5, y + 1.4, 1.8], [cx + 1.5, y + 1.4, 1.8], [cx + 1.5, y + 1.4, 1.6], [cx - 1.5, y + 1.4, 1.6]]);
}

function rooftop(p: Pen, b: Rect, z: number) {
  if (p.v.plan) return;
  p.box(b.x + 1, b.y + 1, 2, 1.4, z, 0.8, C.white[0], C.white[1], C.white[2]);
  p.box(b.x + b.w - 3, b.y + 1.2, 1.2, 1.2, z, 0.6, C.steel, C.steelDark, C.steelDark);
  p.box(b.x + b.w - 3, b.y + b.d - 2.4, 1.2, 1.2, z, 0.6, C.steel, C.steelDark, C.steelDark);
}

function academic(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  windows(p, b, 'L', 1, h - 0.4, 1.8, 1.4);
  windows(p, b, 'R', 1, h - 0.4, 1.8, 1.4);
  if (!p.v.plan) for (let i = 1; i < 4; i++) {
    const x = b.x + (b.w * i) / 4;
    p.poly(C.white[1], [[x - 0.15, b.y + b.d, 0], [x + 0.15, b.y + b.d, 0], [x + 0.15, b.y + b.d, h], [x - 0.15, b.y + b.d, h]]);
  }
  cornice(p, b, h);
  rooftop(p, b, h + 0.3);
  entrance(p, b, C.royal, C.royalDark);
}

function glassTower(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.glass;
  p.box(b.x, b.y, b.w, b.d, 0, 2.4, C.cream[0], C.cream[1], C.cream[2]);
  const inner = { x: b.x + 0.6, y: b.y + 0.6, w: b.w - 1.2, d: b.d - 1.2 };
  p.box(inner.x, inner.y, inner.w, inner.d, 2.4, h - 2.4, t, l, r);
  if (!p.v.plan) {
    const y = inner.y + inner.d;
    p.poly(col('#8FC3D8', '#25406E'), [[inner.x + 1, y, 2.4], [inner.x + 4, y, 2.4], [inner.x + inner.w * 0.75, y, h], [inner.x + inner.w * 0.75 - 3, y, h]], 0.55);
    for (let z = 4; z < h; z += 2) {
      p.line(C.cornice, 0.8, [[inner.x, y, z], [inner.x + inner.w, y, z], [inner.x + inner.w, inner.y, z]]);
    }
    for (let i = 1; i < 6; i++) {
      const x = inner.x + (inner.w * i) / 6;
      p.line(C.cornice, 0.5, [[x, y, 2.4], [x, y, h]]);
    }
  }
  windows(p, inner, 'R', 2.8, h - 0.4, 2, 1.6, 0.7, 0.5);
  cornice(p, inner, h);
  rooftop(p, inner, h + 0.3);
  entrance(p, b, C.amber, C.amberDark);
}

function hostel(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.brick;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  windows(p, b, 'L', 1, h - 0.4, 1.7, 1.5, 0.5, 0.55);
  windows(p, b, 'R', 1, h - 0.4, 1.7, 1.5, 0.5, 0.55);
  if (!p.v.plan) for (let z = 2.6; z < h - 0.5; z += 1.7) {
    p.poly(C.cornice, [[b.x, b.y + b.d, z], [b.x + b.w, b.y + b.d, z], [b.x + b.w, b.y + b.d, z + 0.16], [b.x, b.y + b.d, z + 0.16]]);
    p.poly(C.white[1], [[b.x + b.w, b.y + b.d, z], [b.x + b.w, b.y, z], [b.x + b.w, b.y, z + 0.16], [b.x + b.w, b.y + b.d, z + 0.16]]);
  }
  cornice(p, b, h, C.brick[0]);
  if (!p.v.plan) {
    p.box(b.x + 1.2, b.y + 1.2, 1.6, 1.6, h + 0.3, 1.2, C.steel, C.steelDark, C.steelDark);
    p.box(b.x + 3.4, b.y + 1.2, 1.6, 1.6, h + 0.3, 1.2, C.steel, C.steelDark, C.steelDark);
  }
  entrance(p, b, C.cream[0], C.cream[2]);
}

function lab(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.white;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  if (!p.v.plan) for (let z = 1.4; z < h - 0.8; z += 2.4) {
    p.poly(C.win, [[b.x + 0.4, b.y + b.d, z], [b.x + b.w - 0.4, b.y + b.d, z], [b.x + b.w - 0.4, b.y + b.d, z + 1], [b.x + 0.4, b.y + b.d, z + 1]]);
  }
  windows(p, b, 'R', 1, h - 0.4, 2.4, 1.2, 0.8, 0.45);
  cornice(p, b, h);
  if (!p.v.plan) {
    for (let i = 0; i < 3; i++) {
      p.flatRect(C.royalDark, b.x + 1 + i * 2.2, b.y + 1, 1.9, 2.8, h + 0.45);
    }
    p.box(b.x + b.w - 3.4, b.y + b.d - 3, 2.4, 1.2, h + 0.3, 1, C.steel, C.steelDark, C.steelDark);
  }
  entrance(p, b, C.teal, C.tealDark);
}

/** Stacked coloured floors over a podium. */
function techPark(p: Pen, b: Rect, h: number) {
  p.box(b.x, b.y, b.w, b.d, 0, 3, C.cream[0], C.cream[1], C.cream[2]);
  const n = { x: b.x + 0.8, y: b.y + 0.8, w: b.w - 1.6, d: b.d - 1.6 };
  const bands: [string, string, string][] = [
    [C.royal, C.royal, C.royalDark],
    [C.amber, C.amber, C.amberDark],
  ];
  const step = (h - 3) / 8;
  for (let i = 0; i < 8; i++) {
    const [t, l, r] = bands[i % 2];
    p.box(n.x, n.y, n.w, n.d, 3 + i * step, step, t, l, r);
    windows(p, n, 'L', 3 + i * step, 3 + (i + 1) * step, step, 1.1, 0.72, 0.5);
    windows(p, n, 'R', 3 + i * step, 3 + (i + 1) * step, step, 1.1, 0.72, 0.5);
  }
  cornice(p, n, h);
  rooftop(p, n, h + 0.3);
  entrance(p, b, C.amber, C.amberDark);
}

/** Barrel roof, built from strips shaded by how they face the sun. */
function auditorium(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.box(b.x, b.y, b.w, b.d, 0, h - 3, t, l, r);
  const rise = 3.6;
  const n = 10;
  const shade = [col('#E9A23B'), col('#F0B14C'), col('#F5BF62'), col('#F8CA79'), col('#FAD28A')];
  const zAt = (i: number) => h - 3 + Math.sin((i / n) * Math.PI) * rise;
  const xAt = (i: number) => b.x + (b.w * i) / n;
  if (!p.v.plan) {
    // Gable end on the visible wall, then the curved strips from far to near.
    const end: [number, number, number][] = [];
    for (let i = 0; i <= n; i++) end.push([xAt(i), b.y + b.d, zAt(i)]);
    p.poly(C.cream[1], [...end, [b.x + b.w, b.y + b.d, h - 3], [b.x, b.y + b.d, h - 3]]);
    for (let i = 0; i < n; i++) {
      const f = shade[Math.min(4, i < n / 2 ? 4 - Math.floor(i / 2) : Math.floor((i - n / 2) / 2))];
      p.poly(f, [[xAt(i), b.y, zAt(i)], [xAt(i + 1), b.y, zAt(i + 1)], [xAt(i + 1), b.y + b.d, zAt(i + 1)], [xAt(i), b.y + b.d, zAt(i)]]);
    }
    for (let i = 1; i < 6; i++) {
      const y = b.y + (b.d * i) / 6;
      p.line(col('#D58E2C'), 0.6, Array.from({ length: n + 1 }, (_, j) => [xAt(j), y, zAt(j)] as [number, number, number]));
    }
  } else {
    p.flatRect(shade[2], b.x, b.y, b.w, b.d);
  }
  windows(p, b, 'R', 1, h - 3.4, 2.2, 1.6, 0.4, 0.7);
  entrance(p, b, C.royal, C.royalDark);
}

function redCross(p: Pen, x: number, y: number, z: number, s: number) {
  p.poly(C.white[0], [[x - s, y, z - s], [x + s, y, z - s], [x + s, y, z + s], [x - s, y, z + s]]);
  p.poly(C.red, [[x - s * 0.7, y, z - s * 0.24], [x + s * 0.7, y, z - s * 0.24], [x + s * 0.7, y, z + s * 0.24], [x - s * 0.7, y, z + s * 0.24]]);
  p.poly(C.red, [[x - s * 0.24, y, z - s * 0.7], [x + s * 0.24, y, z - s * 0.7], [x + s * 0.24, y, z + s * 0.7], [x - s * 0.24, y, z + s * 0.7]]);
}

function hospital(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.white;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  windows(p, b, 'L', 1, h - 0.4, 1.8, 1.4);
  windows(p, b, 'R', 1, h - 0.4, 1.8, 1.4);
  if (!p.v.plan) {
    p.poly(C.teal, [[b.x, b.y + b.d, 3.2], [b.x + b.w, b.y + b.d, 3.2], [b.x + b.w, b.y + b.d, 3.7], [b.x, b.y + b.d, 3.7]]);
    p.poly(C.tealDark, [[b.x + b.w, b.y + b.d, 3.2], [b.x + b.w, b.y, 3.2], [b.x + b.w, b.y, 3.7], [b.x + b.w, b.y + b.d, 3.7]]);
  }
  cornice(p, b, h);
  // Helipad.
  p.disc(C.teal, b.x + b.w * 0.7, b.y + b.d * 0.5, 2, 2, h + 0.4);
  p.disc(C.white[0], b.x + b.w * 0.7, b.y + b.d * 0.5, 1.5, 1.5, h + 0.4);
  p.flatRect(C.red, b.x + b.w * 0.7 - 0.8, b.y + b.d * 0.5 - 0.25, 1.6, 0.5, h + 0.4);
  p.flatRect(C.red, b.x + b.w * 0.7 - 0.25, b.y + b.d * 0.5 - 0.8, 0.5, 1.6, h + 0.4);
  if (!p.v.plan) redCross(p, b.x + b.w * 0.25, b.y + b.d + 0.02, h - 2, 1.3);
  entrance(p, b, C.red, col('#A82622'));
}

function library(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.box(b.x, b.y, b.w, b.d - 2, 0, h, t, l, r);
  windows(p, { ...b, d: b.d - 2 }, 'R', 1, h - 0.6, 2.4, 1.6, 0.5, 0.65);
  cornice(p, { ...b, d: b.d - 2 }, h);
  const y = b.y + b.d;
  p.flatRect(C.white[1], b.x + 2, b.y + b.d - 2.2, b.w - 4, 2.6, 0.2);
  p.box(b.x + 2, b.y + b.d - 2.2, b.w - 4, 2.4, 0, 0.4, C.white[0], C.white[1], C.white[2]);
  if (!p.v.plan) {
    // Back wall of the porch, then its columns, then the pediment over them.
    p.poly(C.dark, [[b.x + 2.4, b.y + b.d - 2, 0.4], [b.x + b.w - 2.4, b.y + b.d - 2, 0.4], [b.x + b.w - 2.4, b.y + b.d - 2, h - 1], [b.x + 2.4, b.y + b.d - 2, h - 1]]);
    const cols = 8;
    for (let i = 0; i < cols; i++) {
      const x = b.x + 2.6 + ((b.w - 5.2) * i) / (cols - 1);
      p.poly(C.white[0], [[x - 0.26, y, 0.4], [x, y, 0.4], [x, y, h - 1.2], [x - 0.26, y, h - 1.2]]);
      p.poly(C.white[2], [[x, y, 0.4], [x + 0.26, y, 0.4], [x + 0.26, y, h - 1.2], [x, y, h - 1.2]]);
    }
    p.box(b.x + 1.8, b.y + b.d - 2.4, b.w - 3.6, 2.7, h - 1.2, 0.7, C.white[0], C.white[1], C.white[2]);
    const mid = b.x + b.w / 2;
    p.poly(C.white[1], [[b.x + 1.8, y + 0.3, h - 0.5], [b.x + b.w - 1.8, y + 0.3, h - 0.5], [mid, y + 0.3, h + 1.5]]);
    p.poly(C.white[0], [[mid, y + 0.3, h + 1.5], [b.x + b.w - 1.8, y + 0.3, h - 0.5], [b.x + b.w - 1.8, b.y + b.d - 2.4, h - 0.5], [mid, b.y + b.d - 2.4, h + 1.5]]);
  }
}

function foodCourt(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  windows(p, b, 'L', 0.4, h - 1.1, 2, 1.8, 0.7, 0.8);
  windows(p, b, 'R', 0.4, h - 1.1, 2, 1.8, 0.7, 0.8);
  cornice(p, b, h);
  if (p.v.plan) return;
  // Striped awnings along both visible walls.
  const y = b.y + b.d;
  const n = Math.floor(b.w / 0.8);
  for (let i = 0; i < n; i++) {
    const x = b.x + (b.w * i) / n;
    const e = b.x + (b.w * (i + 1)) / n;
    p.poly(i % 2 ? C.cornice : C.amber, [[x, y, 3], [e, y, 3], [e, y + 1.2, 2.5], [x, y + 1.2, 2.5]]);
  }
  const m = Math.floor(b.d / 0.8);
  for (let i = 0; i < m; i++) {
    const a = b.y + (b.d * i) / m;
    const e = b.y + (b.d * (i + 1)) / m;
    p.poly(i % 2 ? C.white[1] : C.amberDark, [[b.x + b.w, a, 3], [b.x + b.w, e, 3], [b.x + b.w + 1.2, e, 2.5], [b.x + b.w + 1.2, a, 2.5]]);
  }
  // Tables with umbrellas.
  for (const [dx, dy] of [[2, 2.2], [5.5, 2.4], [9, 2.2]]) {
    p.poly(C.steelDark, [[b.x + dx, y + dy, 0], [b.x + dx + 0.14, y + dy, 0], [b.x + dx + 0.14, y + dy, 1.5], [b.x + dx, y + dy, 1.5]]);
    p.disc(dx === 5.5 ? C.royal : C.teal, b.x + dx, y + dy, 1, 1, 1.5, undefined, undefined, 8);
  }
}

/** Sawtooth factory roof. */
function hub(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.white;
  p.box(b.x, b.y, b.w, b.d, 0, h - 1.5, t, l, r);
  windows(p, b, 'L', 0.8, h - 2, 2, 1.5, 0.7, 0.7);
  windows(p, b, 'R', 0.8, h - 2, 2, 1.5, 0.7, 0.7);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const x0 = b.x + (b.w * i) / n;
    const x1 = b.x + (b.w * (i + 1)) / n;
    const z = h - 1.5;
    if (p.v.plan) { p.flatRect(i % 2 ? C.teal : C.tealDark, x0, b.y, x1 - x0, b.d); continue; }
    p.poly(C.teal, [[x0, b.y, z], [x1, b.y, z + 1.6], [x1, b.y + b.d, z + 1.6], [x0, b.y + b.d, z]]);
    p.poly(C.tealDark, [[x0, b.y + b.d, z], [x1, b.y + b.d, z + 1.6], [x1, b.y + b.d, z]]);
    p.poly(C.lit, [[x1, b.y, z + 1.5], [x1, b.y + b.d, z + 1.5], [x1, b.y + b.d, z], [x1, b.y, z]]);
  }
  entrance(p, b, C.teal, C.tealDark);
}

function sportsHall(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.box(b.x, b.y, b.w, b.d, 0, h, t, l, r);
  windows(p, b, 'L', 0.8, h - 0.4, 2.2, 1.5, 0.85, 0.3);
  p.flatRect(C.teal, b.x, b.y, b.w, b.d, h);
  for (let i = 1; i < 8; i++) {
    p.flatRect(C.tealDark, b.x + (b.w * i) / 8, b.y, 0.18, b.d, h);
  }
  entrance(p, b, C.amber, C.amberDark);
}

function clockTower(p: Pen, b: Rect, h: number) {
  const [t, l, r] = C.cream;
  p.flatRect(C.sand, b.x - 2.4, b.y - 2.4, b.w + 4.8, b.d + 4.8, 0);
  p.box(b.x - 0.8, b.y - 0.8, b.w + 1.6, b.d + 1.6, 0, 1, C.white[0], C.white[1], C.white[2]);
  p.box(b.x, b.y, b.w, b.d, 1, h - 4, t, l, r);
  const z = h - 3;
  p.box(b.x - 0.2, b.y - 0.2, b.w + 0.4, b.d + 0.4, z, 2, C.cornice, C.white[1], C.white[2]);
  if (p.v.plan) return;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.d / 2;
  const face = (wall: Wall) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const u = Math.cos(a) * 1.05;
      const w = Math.sin(a) * 0.86 + z + 1;
      pts.push(wall === 'L' ? [cx + u, b.y + b.d + 0.22, w] : [b.x + b.w + 0.22, cy - u, w]);
    }
    p.poly(C.dark, pts);
  };
  face('L');
  face('R');
  p.line(C.cornice, 1, [[cx, b.y + b.d + 0.22, z + 1], [cx, b.y + b.d + 0.22, z + 1.6]]);
  p.line(C.cornice, 1, [[cx, b.y + b.d + 0.22, z + 1], [cx + 0.5, b.y + b.d + 0.22, z + 1]]);
  p.poly(C.royalDark, [[b.x - 0.3, b.y + b.d + 0.3, z + 2], [b.x + b.w + 0.3, b.y + b.d + 0.3, z + 2], [cx, cy, h + 1.4]]);
  p.poly(C.royal, [[b.x + b.w + 0.3, b.y + b.d + 0.3, z + 2], [b.x + b.w + 0.3, b.y - 0.3, z + 2], [cx, cy, h + 1.4]]);
}

function stadium(p: Pen, b: Rect, h: number) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.d / 2;
  p.flatRect(C.sand, b.x, b.y, b.w, b.d);
  const rx = b.w * 0.42;
  const ry = b.d * 0.34;
  p.disc(C.track, cx, cy, rx, ry, 0.05, undefined, undefined, 40);
  for (const s of [0.94, 0.88, 0.82]) p.disc(col('#D57A62'), cx, cy, rx * s, ry * s, 0.05, 0.4, undefined, 40);
  p.disc(C.track, cx, cy, rx * 0.8, ry * 0.8, 0.05, undefined, undefined, 40);
  p.disc(C.grassLight, cx, cy, rx * 0.74, ry * 0.72, 0.05, undefined, undefined, 40);
  for (let i = 0; i < 6; i += 2) p.flatRect(C.grass, cx - rx * 0.56 + (rx * 1.12 * i) / 6, cy - ry * 0.62, (rx * 1.12) / 6, ry * 1.24, 0.06);
  // Tiered stands behind the track, so they never hide it.
  const horizontal = b.w >= b.d;
  const tiers = 4;
  const seat = [C.royal, C.amber, C.royalDark, C.amberDark];
  for (let i = 0; i < tiers; i++) {
    const dz = (h / tiers) * (i + 1);
    if (horizontal) p.box(b.x + 2, b.y + (tiers - 1 - i) * 0.9, b.w - 4, 0.9, 0, dz, seat[i], C.royalDark, C.royalDark);
    else p.box(b.x + (tiers - 1 - i) * 0.9, b.y + 2, 0.9, b.d - 4, 0, dz, seat[i], C.royalDark, C.royalDark);
  }
  for (let i = 0; i < tiers; i++) {
    const dz = (h / tiers) * (tiers - i);
    if (horizontal) p.box(b.x + 2, b.y + b.d - (tiers - i) * 0.5, b.w - 4, 0.5, 0, dz * 0.4, seat[i], C.amberDark, C.amberDark);
    else p.box(b.x + b.w - (tiers - i) * 0.5, b.y + 2, 0.5, b.d - 4, 0, dz * 0.4, seat[i], C.amberDark, C.amberDark);
  }
  if (p.v.plan) return;
  for (const [x, y] of [[b.x + 0.6, b.y + 0.6], [b.x + b.w - 0.6, b.y + 0.6]]) {
    p.line(C.steelDark, 1.4, [[x, y, 0], [x, y, 10]]);
    p.box(x - 0.8, y - 0.2, 1.6, 0.4, 10, 0.9, C.lit, C.lit, C.steel);
  }
}

function pool(p: Pen, b: Rect) {
  p.flatRect(C.white[1], b.x, b.y, b.w, b.d);
  p.flatRect(C.teal, b.x + 0.9, b.y + 0.9, b.w - 1.8, b.d - 1.8, 0.02);
  p.flatRect(C.water, b.x + 1.1, b.y + 1.1, b.w - 2.2, b.d - 2.2, 0.03);
  const long = b.w >= b.d;
  for (let i = 1; i < 6; i++) {
    if (long) p.flatRect(C.cornice, b.x + 1.1, b.y + 1.1 + ((b.d - 2.2) * i) / 6 - 0.05, b.w - 2.2, 0.1, 0.04);
    else p.flatRect(C.cornice, b.x + 1.1 + ((b.w - 2.2) * i) / 6 - 0.05, b.y + 1.1, 0.1, b.d - 2.2, 0.04);
  }
  for (let i = 0; i < 3; i++) {
    const y = b.y + 2 + i * 2.2;
    p.line(col('#D8F0F5', '#3F6F96'), 0.9, [[b.x + 2, y, 0.05], [b.x + b.w * 0.4, y + 0.3, 0.05], [b.x + b.w - 2, y, 0.05]], 'ripple');
  }
}

function gate(p: Pen, b: Rect, h: number) {
  const horizontal = b.w >= b.d;
  const len = horizontal ? b.w : b.d;
  const at = (t: number, off = 0): [number, number] => (horizontal ? [b.x + t, b.y + b.d / 2 + off] : [b.x + b.d / 2 + off, b.y + t]);
  const pillar = (t: number) => {
    const [x, y] = at(t);
    p.box(x - 0.7, y - 0.7, 1.4, 1.4, 0, h, C.cream[0], C.cream[1], C.cream[2]);
    p.box(x - 0.9, y - 0.9, 1.8, 1.8, h, 0.3, C.cornice, C.white[1], C.white[2]);
  };
  pillar(1.6);
  pillar(len - 1.6);
  const [ax, ay] = at(1.6);
  const [ex, ey] = at(len - 1.6);
  if (!p.v.plan) {
    p.box(Math.min(ax, ex) - 0.3, Math.min(ay, ey) - 0.3, Math.abs(ex - ax) + 0.6, Math.abs(ey - ay) + 0.6, h - 1.2, 1.2, C.royal, C.royal, C.royalDark);
    // Barrier arm, red and white.
    const n = 8;
    for (let i = 0; i < n; i++) {
      const s = 2.2 + ((len / 2 - 2.6) * i) / n;
      const e = 2.2 + ((len / 2 - 2.6) * (i + 1)) / n;
      const [x0, y0] = at(s, 1.5);
      const [x1, y1] = at(e, 1.5);
      p.line(i % 2 ? C.cornice : C.red, 2, [[x0, y0, 1.1], [x1, y1, 1.1]]);
    }
    const [bx, by] = at(len * 0.82, 2.2);
    p.box(bx - 0.9, by - 0.9, 1.8, 1.8, 0, 2.2, C.white[0], C.white[1], C.white[2]);
    p.poly(C.lit, [[bx - 0.6, by + 0.9, 1], [bx + 0.6, by + 0.9, 1], [bx + 0.6, by + 0.9, 1.8], [bx - 0.6, by + 0.9, 1.8]]);
    p.box(bx - 1.2, by - 1.2, 2.4, 2.4, 2.2, 0.2, C.royal, C.royal, C.royalDark);
    // Flagpole beside the gate; the cloth is animated.
    const [fx, fy] = at(len - 0.4, -1);
    p.line(C.steelDark, 0.9, [[fx, fy, 0], [fx, fy, 9]]);
    p.poly(C.amber, [[fx, fy, 9], [fx + 1.6, fy - 0.2, 8.7], [fx + 1.6, fy - 0.2, 7.9], [fx, fy, 8.1]], undefined, 'flag');
  }
}

function lake(p: Pen, b: Rect) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.d / 2;
  const blob = (s: number) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const w = 1 + 0.08 * Math.sin(a * 3 + 1) + 0.05 * Math.cos(a * 5);
      pts.push([cx + Math.cos(a) * (b.w / 2) * w * s, cy + Math.sin(a) * (b.d / 2) * w * s, 0.02]);
    }
    return pts;
  };
  p.poly(C.sand, blob(0.94));
  p.poly(C.waterDeep, blob(0.86));
  p.poly(C.water, blob(0.72));
  for (let i = 0; i < 5; i++) {
    const y = cy - b.d * 0.26 + i * (b.d * 0.13);
    const w = b.w * (0.24 - 0.02 * Math.abs(i - 2));
    p.line(col('#CDEBF2', '#4D7BA3'), 0.9, [[cx - w, y, 0.03], [cx, y + 0.5, 0.03], [cx + w, y, 0.03]], 'ripple');
  }
}

function garden(p: Pen, b: Rect) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.d / 2;
  p.flatRect(C.grassLight, b.x, b.y, b.w, b.d);
  p.flatRect(C.sand, cx - 0.8, b.y, 1.6, b.d, 0.01);
  p.flatRect(C.sand, b.x, cy - 0.8, b.w, 1.6, 0.01);
  p.disc(C.sand, cx, cy, 4, 4, 0.02);
  p.disc(C.cream[1], cx, cy, 2.6, 2.6, 0.03);
  p.disc(C.water, cx, cy, 2.2, 2.2, 0.04);
  p.disc(C.white[0], cx, cy, 0.5, 0.5, 0.5);
  const beds = [C.amber, C.red, C.royal, C.amberDark];
  [[b.x + 2, b.y + 2], [cx + 2, b.y + 2], [b.x + 2, cy + 2], [cx + 2, cy + 2]].forEach(([x, y], i) => {
    p.flatRect(C.green, x, y, b.w / 2 - 4, b.d / 2 - 4, 0.05);
    p.flatRect(beds[i], x + 0.7, y + 0.7, b.w / 2 - 5.4, b.d / 2 - 5.4, 0.08);
  });
}

function court(p: Pen, b: Rect) {
  p.flatRect(C.sand, b.x, b.y, b.w, b.d);
  const n = 6;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if ((i + j) % 2) p.flatRect(C.cream[1], b.x + (b.w * i) / n, b.y + (b.d * j) / n, b.w / n, b.d / n, 0.01);
  }
  p.disc(C.green, b.x + b.w / 2, b.y + b.d / 2, 1.6, 1.6, 0.02);
  if (p.v.plan) return;
  // Stage canopy and benches.
  p.box(b.x + 1, b.y + 1, 4.6, 2.6, 0, 0.4, C.white[0], C.white[1], C.white[2]);
  p.box(b.x + 1, b.y + 1, 4.6, 2.6, 2.4, 0.2, C.amber, C.amberDark, C.amberDark);
  for (const [x, y] of [[b.x + 1, b.y + 3.6], [b.x + 5.6, b.y + 3.6], [b.x + 1, b.y + 1], [b.x + 5.6, b.y + 1]]) {
    p.line(C.steelDark, 0.8, [[x, y, 0.4], [x, y, 2.4]]);
  }
  for (let i = 0; i < 3; i++) p.box(b.x + 8 + i * 2, b.y + b.d - 1.6, 1.4, 0.5, 0, 0.4, C.amberDark, C.brick[1], C.brick[2]);
}

function field(p: Pen, b: Rect) {
  const n = 8;
  p.flatRect(C.grass, b.x, b.y, b.w, b.d);
  for (let i = 0; i < n; i += 2) p.flatRect(C.grassLight, b.x + (b.w * i) / n, b.y, b.w / n, b.d, 0.01);
  const line = col('#FAF7EE', '#7D8FB1');
  const pts: [number, number, number][] = [[b.x + 1, b.y + 1, 0.02], [b.x + b.w - 1, b.y + 1, 0.02], [b.x + b.w - 1, b.y + b.d - 1, 0.02], [b.x + 1, b.y + b.d - 1, 0.02], [b.x + 1, b.y + 1, 0.02]];
  p.line(line, 1.2, pts);
  p.line(line, 1.2, [[b.x + b.w / 2, b.y + 1, 0.02], [b.x + b.w / 2, b.y + b.d - 1, 0.02]]);
  p.line(line, 1.2, Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return [b.x + b.w / 2 + Math.cos(a) * 2.4, b.y + b.d / 2 + Math.sin(a) * 2.4, 0.02] as [number, number, number];
  }));
}

function busTerminus(p: Pen, b: Rect) {
  p.flatRect(col('#6B7183'), b.x, b.y, b.w, b.d);
  const mark = col('#F7EFD9', '#6F7E9E');
  for (let i = 1; i < 4; i++) p.flatRect(mark, b.x + (b.w * i) / 4 - 0.08, b.y + 3, 0.16, b.d - 3, 0.01);
  const roofZ = 2.6;
  p.box(b.x + 0.6, b.y + 0.4, b.w - 1.2, 2, 0, 0.2, C.white[0], C.white[1], C.white[2]);
  if (!p.v.plan) for (let i = 0; i < 5; i++) {
    const x = b.x + 1 + ((b.w - 2) * i) / 4;
    p.line(C.steelDark, 0.8, [[x, b.y + 2.2, 0.2], [x, b.y + 2.2, roofZ]]);
  }
  p.box(b.x + 0.2, b.y, b.w - 0.4, 2.8, roofZ, 0.25, C.royal, C.royalDark, C.royalDark);
}

const drawers: Record<string, (p: Pen, b: Rect, h: number) => void> = {
  academic, tower: glassTower, hostel, lab, techpark: techPark, auditorium, hospital, library, food: foodCourt, hub,
  sports: sportsHall, clock: clockTower, stadium, pool, gate, lake, garden, court, field, bus: busTerminus,
};

/** Footprint colour in the flat 2D plan. */
export function drawBuilding(p: Pen, type: string, b: Rect, h: number) {
  drawers[type](p, b, h);
}

export const palette = C;
