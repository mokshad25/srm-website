import campus from '../../../data/campus.json';
import { backToFront, hull, screen, toPath, turn, turnRect, type Quarter, type Rect, type V2, type V3, type View } from '../../../lib/iso';
import { drawBuilding, palette as C } from './buildings';
import { col, Pen, type Op } from './pen';

export const places = campus.places;

/** The directory's groups. Each lists existing `cat` values, so places stay in one list. */
export const directory = campus.directory;

export const inFilter = (cat: string | undefined, filter: string) =>
  filter === 'all' || cat === filter || !!directory.find((group) => group.id === filter)?.cats.includes(cat ?? '');
export type Place = (typeof places)[number];
const s = campus.scene;
export const WORLD = { W: s.world[0], D: s.world[1] };
const nodes = s.nodes as unknown as Record<string, V2>;
const ROAD = 4;

export interface Item {
  id?: string;
  cat?: string;
  kind: 'place' | 'tree' | 'decor';
  box: Rect;
  ops: Op[];
  outline?: string;
  top?: V2;
}

export interface Scene {
  view: View;
  ground: Op[];
  items: Item[];
  vb: { x: number; y: number; w: number; h: number };
}

/** Repeatable noise, so the planting never changes between renders. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const roadBand = (a: V2, b: V2, width: number): Rect => ({
  x: Math.min(a[0], b[0]) - (a[0] === b[0] ? width / 2 : 0),
  y: Math.min(a[1], b[1]) - (a[1] === b[1] ? width / 2 : 0),
  w: a[0] === b[0] ? width : Math.abs(b[0] - a[0]),
  d: a[1] === b[1] ? width : Math.abs(b[1] - a[1]),
});

const roads = s.edges.map(([a, b]) => roadBand(nodes[a], nodes[b], ROAD));
const inRect = (x: number, y: number, r: Rect, m: number) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.d + m;
const placeRect = (p: Place): Rect => ({ x: p.pos[0], y: p.pos[1], w: p.footprint[0], d: p.footprint[1] });

/** World positions and kinds of every tree. */
const trees = (() => {
  const r = rng(24);
  const taken = places.map(placeRect);
  const out: { x: number; y: number; kind: number; size: number }[] = [];
  for (const [cx, cy, rad, n] of s.clusters) {
    // Each cluster favours one species and mixes in the others, as real planting does.
    const main = Math.floor(r() * 3);
    for (let i = 0; i < n * 5 && out.length < 190; i++) {
      const a = r() * Math.PI * 2;
      const q = Math.sqrt(r()) * rad;
      const x = cx + Math.cos(a) * q;
      const y = cy + Math.sin(a) * q;
      if (x < 1.5 || y < 1.5 || x > WORLD.W - 1.5 || y > WORLD.D - 1.5) continue;
      if (taken.some((t) => inRect(x, y, t, 1.2)) || roads.some((t) => inRect(x, y, t, 1))) continue;
      if (out.some((t) => Math.hypot(t.x - x, t.y - y) < 1.9)) continue;
      out.push({ x, y, kind: r() < 0.65 ? main : Math.floor(r() * 3), size: 0.85 + r() * 0.4 });
    }
  }
  return out;
})();

function screenCircle(p: Pen, f: string, x: number, y: number, z: number, rx: number, ry: number, cls?: string) {
  const [cx, cy] = screen(x, y, z, p.v);
  const pts: V2[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  p.pts.push(...pts);
  p.add({ d: toPath(pts), f, cls });
}

const leaf = [
  [col('#5F9150'), col('#7CAF5F'), col('#96C473')],
  [col('#4C8350'), col('#649E5F'), col('#80B571')],
  [col('#6E9A47'), col('#8BB455'), col('#A5C86B')],
];
const trunk = col('#7A5A3E');

function drawTree(p: Pen, x: number, y: number, kind: number, size: number, sway: boolean) {
  const cls = sway ? 'sway' : undefined;
  const k = size * U10;
  if (p.v.plan) {
    screenCircle(p, leaf[kind][0], x, y, 0, k * 1.2, k * 1.2);
    screenCircle(p, leaf[kind][1], x - 0.1, y - 0.1, 0, k * 0.8, k * 0.8);
    return;
  }
  if (kind === 0) {
    // Broad rain tree.
    p.line(trunk, 2.4 * size, [[x, y, 0], [x, y, 1.6 * size]]);
    screenCircle(p, leaf[0][0], x, y, 2.4 * size, 17 * size, 12 * size, cls);
    screenCircle(p, leaf[0][1], x - 0.3, y + 0.1, 2.9 * size, 12 * size, 9 * size, cls);
    screenCircle(p, leaf[0][2], x - 0.4, y, 3.3 * size, 6 * size, 5 * size, cls);
  } else if (kind === 1) {
    // Tall, narrow ashoka.
    p.line(trunk, 1.8 * size, [[x, y, 0], [x, y, 1.4 * size]]);
    screenCircle(p, leaf[1][0], x, y, 3.6 * size, 7 * size, 21 * size, cls);
    screenCircle(p, leaf[1][1], x - 0.1, y, 4.1 * size, 4.4 * size, 15 * size, cls);
  } else {
    // Coconut palm.
    const h = 5 * size;
    p.line(col('#8E7354'), 1.6 * size, [[x, y, 0], [x + 0.1, y, h]]);
    const [tx, ty] = screen(x + 0.1, y, h, p.v);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const len = 13 * size;
      const ex = tx + Math.cos(a) * len;
      const ey = ty + Math.sin(a) * len * 0.5 + 4 * size;
      const nx = -Math.sin(a) * 2.2 * size;
      const ny = Math.cos(a) * 1.1 * size;
      const pts: V2[] = [[tx + nx, ty + ny - 1], [tx + Math.cos(a) * len * 0.55, ty + Math.sin(a) * len * 0.3 - 3 * size], [ex, ey], [tx - nx, ty - ny + 1]];
      p.pts.push(...pts);
      p.add({ d: toPath(pts), f: leaf[2][i % 2], cls });
    }
  }
}
const U10 = 10;

const edgeLength = ([a, b]: string[]) => Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);

function drawGround(v: View) {
  const p = new Pen(v);
  const [W, D] = v.k % 2 ? [WORLD.D, WORLD.W] : [WORLD.W, WORLD.D];
  const rect = (f: string, x: number, y: number, w: number, d: number, z = 0, o?: number, cls?: string) => {
    const r = turnRect(x, y, w, d, v);
    p.flatRect(f, r.x, r.y, r.w, r.d, z, o, cls);
  };
  const side = col('#C7B48F');
  p.box(0, 0, W, D, -3, 3, col('#E8DEC6'), side, col('#AD9B78'));

  // Striped lawns.
  for (const [x, y, w, d] of s.lawns) {
    rect(C.grass, x, y, w, d);
    const long = w >= d;
    const n = Math.floor((long ? d : w) / 3);
    for (let i = 0; i < n; i += 2) {
      if (long) rect(C.grassLight, x, y + i * 3, w, 3);
      else rect(C.grassLight, x + i * 3, y, 3, d);
    }
  }

  // Footpaths, then paving around each building.
  for (const walk of s.walks) {
    const [a, b] = walk as unknown as V2[];
    const r = roadBand(a, b, 1.2);
    rect(C.sand, r.x, r.y, r.w, r.d);
  }
  for (const pl of places) {
    if (['court', 'lake', 'garden', 'field', 'stadium', 'pool'].includes(pl.type)) continue;
    rect(C.sand, pl.pos[0] - 1.4, pl.pos[1] - 1.4, pl.footprint[0] + 2.8, pl.footprint[1] + 2.8);
  }

  // Kerbs, then roads, then their markings.
  const kerb = col('#DDD3BD');
  const tarmac = col('#5D6476');
  for (const [a, b] of s.edges) {
    const r = roadBand(nodes[a], nodes[b], ROAD + 0.9);
    rect(kerb, r.x - (nodes[a][1] === nodes[b][1] ? 0.45 : 0), r.y - (nodes[a][0] === nodes[b][0] ? 0.45 : 0), r.w + (nodes[a][1] === nodes[b][1] ? 0.9 : 0), r.d + (nodes[a][0] === nodes[b][0] ? 0.9 : 0));
  }
  for (const [a, b] of s.edges) {
    const r = roadBand(nodes[a], nodes[b], ROAD);
    rect(tarmac, r.x - (nodes[a][1] === nodes[b][1] ? 2 : 0), r.y - (nodes[a][0] === nodes[b][0] ? 2 : 0), r.w + (nodes[a][1] === nodes[b][1] ? 4 : 0), r.d + (nodes[a][0] === nodes[b][0] ? 4 : 0));
  }
  const paint = col('#F4EFE2', '#8C9AB8');
  for (const [a, b] of s.edges) {
    const [ax, ay] = nodes[a];
    const [bx, by] = nodes[b];
    const len = edgeLength([a, b]);
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    for (let t = 5; t < len - 5; t += 3) {
      const r = roadBand([ax + ux * t, ay + uy * t], [ax + ux * (t + 1.5), ay + uy * (t + 1.5)], 0.22);
      rect(paint, r.x, r.y, r.w, r.d, 0.01);
    }
  }
  // Crosswalks on each arm of every junction.
  const degree: Record<string, string[]> = {};
  for (const [a, b] of s.edges) {
    (degree[a] ??= []).push(b);
    (degree[b] ??= []).push(a);
  }
  for (const [id, others] of Object.entries(degree)) {
    if (others.length < 3) continue;
    const [nx, ny] = nodes[id];
    for (const o of others) {
      const len = Math.hypot(nodes[o][0] - nx, nodes[o][1] - ny);
      const ux = (nodes[o][0] - nx) / len;
      const uy = (nodes[o][1] - ny) / len;
      for (let i = -3; i <= 3; i++) {
        const cx = nx + ux * 3.6 + uy * i * 0.52;
        const cy = ny + uy * 3.6 + ux * i * 0.52;
        const hw = 0.16;
        const hl = 0.8;
        rect(paint, cx - (ux ? hl : hw), cy - (ux ? hw : hl), ux ? hl * 2 : hw * 2, ux ? hw * 2 : hl * 2, 0.02);
      }
    }
  }

  // Parking bays with a few parked cars.
  const r2 = rng(7);
  const carColours = [C.royal, C.amber, C.white[0], C.brick[0], C.teal];
  for (const [x, y, w, d] of s.parking) {
    rect(col('#7B8192'), x, y, w, d);
    const across = w >= d;
    const n = Math.floor((across ? w : d) / 1.6);
    for (let i = 0; i <= n; i++) {
      if (across) rect(paint, x + i * 1.6, y, 0.12, d, 0.01);
      else rect(paint, x, y + i * 1.6, w, 0.12, 0.01);
    }
    for (let i = 0; i < n; i++) {
      if (r2() < 0.45) continue;
      const f = carColours[Math.floor(r2() * carColours.length)];
      if (across) rect(f, x + i * 1.6 + 0.3, y + 1, 1, 2.6, 0.3);
      else rect(f, x + 0.7, y + i * 1.6 + 0.3, 2.6, 1, 0.3);
    }
  }

  // Lamp light on the ground, only visible at night.
  for (const l of lamps) {
    const [x, y] = turn(l[0], l[1], v);
    p.disc(col('#FFC861', '#FFC861'), x, y, 3.4, 3.4, 0.03, undefined, 'lamp-pool', 12);
  }

  // Soft shadows, layered twice so the edge steps down.
  if (!v.plan) {
    const shade = col('#3A3320', '#000000');
    for (const pl of places) {
      if (pl.height < 2) continue;
      const b = turnRect(pl.pos[0], pl.pos[1], pl.footprint[0], pl.footprint[1], v);
      const h = Math.min(pl.height, 16);
      for (const [f, o] of [[0.46, 0.07], [0.3, 0.1]] as const) {
        const dx = h * f;
        const dy = -h * f * 0.5;
        const pts: V3[] = [[b.x + b.w, b.y, 0], [b.x + b.w + dx, b.y + dy, 0], [b.x + b.w + dx, b.y + b.d + dy, 0], [b.x + dx, b.y + b.d + dy, 0], [b.x, b.y + b.d, 0], [b.x + b.w, b.y + b.d, 0]];
        p.poly(shade, pts, o);
      }
    }
    for (const t of trees) {
      const [x, y] = turn(t.x, t.y, v);
      p.disc(shade, x + 0.7, y - 0.3, 1.5 * t.size, 1.1 * t.size, 0.03, 0.14, undefined, 8);
    }
  }
  return p.ops;
}

/** Lamp posts along the roads, on the kerb. */
const lamps: V2[] = (() => {
  const out: V2[] = [];
  for (const [a, b] of s.edges) {
    const [ax, ay] = nodes[a];
    const [bx, by] = nodes[b];
    const len = edgeLength([a, b]);
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    for (let t = 9; t < len - 6; t += 16) out.push([ax + ux * t + uy * 2.9, ay + uy * t + ux * 2.9]);
  }
  return out;
})();

function drawDecor(v: View): Item[] {
  const out: Item[] = [];
  const add = (x: number, y: number, w: number, d: number, draw: (p: Pen, b: Rect) => void) => {
    const b = turnRect(x, y, w, d, v);
    const p = new Pen(v);
    draw(p, b);
    out.push({ kind: 'decor', box: b, ops: p.ops });
  };
  for (const [x, y, w, d] of s.hedges) {
    add(x, y, w, d, (p, b) => p.box(b.x, b.y, b.w, b.d, 0, 0.9, col('#7FAA5C'), col('#5F9150'), col('#4C7A44')));
  }
  if (v.plan) return out;
  for (const [x, y] of lamps) {
    add(x, y, 0.1, 0.1, (p, b) => {
      p.line(C.steelDark, 1, [[b.x, b.y, 0], [b.x, b.y, 3.2]]);
      p.disc(col('#FFFDF7', '#FFD27A'), b.x, b.y, 0.34, 0.34, 3.3, undefined, undefined, 8);
    });
  }
  for (const [x, y] of s.benches) {
    add(x, y, 1.6, 0.5, (p, b) => {
      p.box(b.x, b.y, b.w, b.d, 0.25, 0.14, C.amberDark, col('#A8742A'), col('#8E6222'));
      p.line(C.steelDark, 0.7, [[b.x + 0.1, b.y + b.d, 0], [b.x + 0.1, b.y + b.d, 0.3]]);
    });
  }
  for (const [x, y] of s.shelters) {
    add(x, y, 1.4, 3.4, (p, b) => {
      for (const [dx, dy] of [[0, 0], [b.w, 0], [0, b.d], [b.w, b.d]]) p.line(C.steelDark, 0.8, [[b.x + dx, b.y + dy, 0], [b.x + dx, b.y + dy, 2.2]]);
      p.box(b.x - 0.2, b.y - 0.2, b.w + 0.4, b.d + 0.4, 2.2, 0.16, C.royal, C.royalDark, C.royalDark);
    });
  }
  return out;
}

function drawTrees(v: View): Item[] {
  return trees.map((t, i) => {
    const [x, y] = turn(t.x, t.y, v);
    const p = new Pen(v);
    drawTree(p, x, y, t.kind, t.size, i % 4 === 0);
    return { kind: 'tree' as const, box: { x: x - 0.4, y: y - 0.4, w: 0.8, d: 0.8 }, ops: p.ops };
  });
}

function drawPlaces(v: View): Item[] {
  return places.map((pl) => {
    const b = turnRect(pl.pos[0], pl.pos[1], pl.footprint[0], pl.footprint[1], v);
    const p = new Pen(v);
    drawBuilding(p, pl.type, b, pl.height);
    const top = v.plan
      ? screen(b.x + b.w / 2, b.y + b.d / 2, 0, v)
      : screen(b.x + b.w / 2, b.y + b.d / 2, pl.height + (pl.type === 'clock' ? 1.4 : 0.5), v);
    return { id: pl.id, cat: pl.cat, kind: 'place' as const, box: b, ops: p.ops, outline: toPath(hull(p.pts)), top };
  });
}

const cache = new Map<string, Scene>();

/** The whole drawing for one angle, built on first use and kept. */
export function buildScene(k: Quarter, plan: boolean): Scene {
  const key = `${k}${plan}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const v: View = { k, plan, ...WORLD };
  const items = backToFront([...drawPlaces(v), ...drawDecor(v), ...drawTrees(v)]);
  const [W, D] = k % 2 ? [WORLD.D, WORLD.W] : [WORLD.W, WORLD.D];
  const corners = [screen(0, 0, 0, v), screen(W, 0, 0, v), screen(W, D, -3, v), screen(0, D, 0, v)];
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const pad = 30;
  const head = plan ? pad : 230; // Room for the tallest towers at the back corner.
  const vb = { x: Math.min(...xs) - pad, y: Math.min(...ys) - head, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + head + pad };
  const scene = { view: v, ground: drawGround(v), items, vb };
  cache.set(key, scene);
  return scene;
}

/* Roads as a graph, for routes and traffic. */

const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function nearestOnRoads(pt: V2) {
  let best = { point: nodes.A, a: 'A', b: 'B', d: Infinity };
  for (const [a, b] of s.edges) {
    const [ax, ay] = nodes[a];
    const [bx, by] = nodes[b];
    const q: V2 = [ax === bx ? ax : Math.max(Math.min(ax, bx), Math.min(Math.max(ax, bx), pt[0])), ay === by ? ay : Math.max(Math.min(ay, by), Math.min(Math.max(ay, by), pt[1]))];
    const d = dist(q, pt);
    if (d < best.d) best = { point: q, a, b, d };
  }
  return best;
}

function shortest(from: string, targets: Record<string, number>) {
  const left = new Set(Object.keys(nodes));
  const cost: Record<string, number> = { [from]: 0 };
  const prev: Record<string, string> = {};
  while (left.size) {
    const u = [...left].filter((n) => n in cost).sort((a, b) => cost[a] - cost[b])[0];
    if (!u) break;
    left.delete(u);
    for (const [a, b] of s.edges) {
      const o = a === u ? b : b === u ? a : null;
      if (!o || !left.has(o)) continue;
      const c = cost[u] + edgeLength([a, b]);
      if (c < (cost[o] ?? Infinity)) {
        cost[o] = c;
        prev[o] = u;
      }
    }
  }
  const end = Object.keys(targets).sort((a, b) => (cost[a] ?? Infinity) + targets[a] - ((cost[b] ?? Infinity) + targets[b]))[0];
  const path = [end];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return path;
}

const METRES_PER_UNIT = 9; // Illustrative: the map isn't surveyed.
const METRES_PER_MIN = 75;

/** Route from the main gate along the roads to a place, in world coordinates. */
export function routeTo(id: string) {
  const pl = places.find((p) => p.id === id)!;
  const centre: V2 = [pl.pos[0] + pl.footprint[0] / 2, pl.pos[1] + pl.footprint[1] / 2];
  const start = places.find((p) => p.id === s.start)!;
  const gate: V2 = [start.pos[0] + start.footprint[0] / 2, start.pos[1] + start.footprint[1] / 2];
  if (id === s.start) return { points: [gate], minutes: 0 };
  const near = nearestOnRoads(centre);
  // Stop at the wall nearest the road, not in the middle of the building.
  const door: V2 = [
    Math.max(pl.pos[0], Math.min(pl.pos[0] + pl.footprint[0], near.point[0])),
    Math.max(pl.pos[1], Math.min(pl.pos[1] + pl.footprint[1], near.point[1])),
  ];
  const nodePath = shortest('H', { [near.a]: dist(nodes[near.a], near.point), [near.b]: dist(nodes[near.b], near.point) });
  const points: V2[] = [gate, ...nodePath.map((n) => nodes[n]), near.point, door];
  const total = points.reduce((sum, q, i) => (i ? sum + dist(points[i - 1], q) : 0), 0);
  return { points, minutes: Math.max(1, Math.round((total * METRES_PER_UNIT) / METRES_PER_MIN)) };
}

/** Lanes: India drives on the left, so each direction sits left of the centre line. */
export function lane(ids: string[], offset = 1) {
  const pts: V2[] = ids.map((n) => nodes[n]);
  const out: { a: V2; b: V2; len: number }[] = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const len = dist(a, b);
    if (!len) return;
    const ux = (b[0] - a[0]) / len;
    const uy = (b[1] - a[1]) / len;
    const n: V2 = [uy * offset, -ux * offset];
    out.push({ a: [a[0] + n[0], a[1] + n[1]], b: [b[0] + n[0], b[1] + n[1]], len });
  });
  return out;
}

export const loops = s.loops;
export const walks = s.walks as unknown as V2[][];
