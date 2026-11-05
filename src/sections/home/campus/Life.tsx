import { memo, useEffect, useMemo, useRef } from 'react';
import { screen, toPath, turn, type V2, type View } from '../../../lib/iso';
import { palette as C } from './buildings';
import { col, Pen } from './pen';
import { lane, loops, walks } from './scene';

const COLOURS = [C.royal, C.amber, C.white[0], C.brick[0], C.teal, col('#3C4660'), C.cream[1], C.red];
const SHIRTS = [C.royal, C.amber, C.teal, C.brick[0], C.white[0], C.red];
const SKIN = col('#8E5F43');
const BEAM = col('#FFE9AE', '#FFE9AE');

interface Spec {
  bus: boolean;
  colour: string;
  segs: ReturnType<typeof lane>;
  total: number;
  speed: number;
  at: number;
}

const build = (ids: string[], bus: boolean, colour: string, speed: number, at: number): Spec => {
  const segs = lane(ids);
  return { bus, colour, segs, total: segs.reduce((n, x) => n + x.len, 0), speed, at };
};

function fleet(): Spec[] {
  const cars = loops.cars.map((ids, i) => build(ids, false, COLOURS[i % COLOURS.length], 5 + (i % 3), i * 11));
  const buses = loops.buses.map((ids, i) => build(ids, true, i ? C.amber : C.royal, 4, i * 31));
  return [...cars, ...buses];
}

/** Vehicle parts for one heading, in view space around (0, 0). */
function sprite(v: View, dir: V2, bus: boolean) {
  const along = Math.abs(dir[0]) > Math.abs(dir[1]);
  const l = bus ? 5.4 : 2.6;
  const w = bus ? 1.5 : 1.3;
  const h = bus ? 1.7 : 0.7;
  const [bw, bd] = along ? [l, w] : [w, l];
  const x = -bw / 2;
  const y = -bd / 2;

  const body = new Pen(v);
  body.box(x, y, bw, bd, 0.18, h, 'a', 'a', 'a');
  const glass = new Pen(v);
  if (bus) {
    if (!v.plan) {
      glass.poly('a', [[x + 0.2, y + bd, 1], [x + bw - 0.2, y + bd, 1], [x + bw - 0.2, y + bd, 1.6], [x + 0.2, y + bd, 1.6]]);
      glass.poly('a', [[x + bw, y + bd - 0.2, 1], [x + bw, y + 0.2, 1], [x + bw, y + 0.2, 1.6], [x + bw, y + bd - 0.2, 1.6]]);
    }
  } else {
    glass.box(x + (along ? 0.5 : 0.1), y + (along ? 0.1 : 0.5), bw - (along ? 1 : 0.2), bd - (along ? 0.2 : 1), 0.88, 0.42, 'a', 'a', 'a');
  }
  const beam = new Pen(v);
  const fx = dir[0] * (bw / 2);
  const fy = dir[1] * (bd / 2);
  const px = -dir[1] * 0.6;
  const py = dir[0] * 0.6;
  beam.poly('a', [[fx + px * 0.6, fy + py * 0.6, 0.1], [fx - px * 0.6, fy - py * 0.6, 0.1], [fx + dir[0] * 4.2 - px * 1.6, fy + dir[1] * 4.2 - py * 1.6, 0.1], [fx + dir[0] * 4.2 + px * 1.6, fy + dir[1] * 4.2 + py * 1.6, 0.1]]);
  const join = (p: Pen) => p.ops.map((o) => o.d).join('');
  return [join(body), join(glass), join(beam)] as const;
}

const DIRS: V2[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const dirIndex = (x: number, y: number) => DIRS.findIndex((d) => Math.abs(d[0] - x) + Math.abs(d[1] - y) < 0.01);

function person(v: View, i: number) {
  const s = v.plan ? 2.2 : 2.6;
  const body: V2[] = [[-s * 0.5, 0], [s * 0.5, 0], [s * 0.42, -s * 2], [-s * 0.42, -s * 2]];
  const [hx, hy] = [0, -s * 2.6];
  const head = Array.from({ length: 8 }, (_, a) => [hx + Math.cos((a / 8) * 6.28) * s * 0.6, hy + Math.sin((a / 8) * 6.28) * s * 0.6] as V2);
  return { body: toPath(body), head: toPath(head), shirt: SHIRTS[i % SHIRTS.length] };
}

interface Props {
  view: View;
  paused: boolean;
  reduce: boolean;
}

/** Cars, buses and walkers. One loop moves them all, and it stops when the map is off-screen. */
const Life = memo(function Life({ view, paused, reduce }: Props) {
  const specs = useMemo(fleet, []);
  const sprites = useMemo(() => DIRS.flatMap((d) => [sprite(view, d, false), sprite(view, d, true)]), [view]);
  const cars = useRef<(SVGGElement | null)[]>([]);
  const people = useRef<(SVGGElement | null)[]>([]);
  const crowd = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ walk: walks[i % walks.length], t: (i * 0.37) % 1, dir: i % 2 ? 1 : -1, speed: 0.012 + (i % 3) * 0.004 })), []);
  const state = useRef({ car: specs.map((x) => ({ at: x.at, heading: -1 })), crowd });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const place = (dt: number) => {
      state.current.car.forEach((c, i) => {
        const sp = specs[i];
        c.at = (c.at + sp.speed * dt) % sp.total;
        let d = c.at;
        const seg = sp.segs.find((x) => {
          if (d <= x.len) return true;
          d -= x.len;
          return false;
        }) ?? sp.segs[0];
        const t = d / seg.len;
        const wx = seg.a[0] + (seg.b[0] - seg.a[0]) * t;
        const wy = seg.a[1] + (seg.b[1] - seg.a[1]) * t;
        const [x, y] = turn(wx, wy, view);
        const [p0, q0] = turn(seg.a[0], seg.a[1], view);
        const [p1, q1] = turn(seg.b[0], seg.b[1], view);
        const heading = dirIndex(Math.sign(p1 - p0), Math.sign(q1 - q0));
        const el = cars.current[i];
        if (!el) return;
        if (heading !== c.heading) {
          c.heading = heading;
          const paths = sprites[Math.max(0, heading) * 2 + (sp.bus ? 1 : 0)];
          const nodes = el.children;
          nodes[0].setAttribute('d', paths[0]);
          nodes[1].setAttribute('d', paths[1]);
          nodes[2].setAttribute('d', paths[2]);
        }
        const [sx, sy] = screen(x, y, 0, view);
        el.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
      });
      state.current.crowd.forEach((c, i) => {
        c.t += c.speed * c.dir * dt;
        if (c.t > 1 || c.t < 0) {
          c.dir *= -1;
          c.t = Math.max(0, Math.min(1, c.t));
        }
        const [a, b] = c.walk;
        const wx = a[0] + (b[0] - a[0]) * c.t;
        const wy = a[1] + (b[1] - a[1]) * c.t;
        const [x, y] = turn(wx, wy, view);
        const [sx, sy] = screen(x, y, 0, view);
        const bob = Math.abs(Math.sin(c.t * 400)) * 1.2;
        people.current[i]?.setAttribute('transform', `translate(${sx.toFixed(1)} ${(sy - bob).toFixed(1)})`);
      });
    };
    // A new angle means new sprites.
    state.current.car.forEach((c) => (c.heading = -1));
    place(0);
    if (paused || reduce) return;
    const tick = (now: number) => {
      place(Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [view, paused, reduce, specs, sprites]);

  return (
    <g aria-hidden>
      {crowd.map((_, i) => {
        const shape = person(view, i);
        return (
          <g key={i} ref={(e) => { people.current[i] = e; }}>
            <path d={shape.body} fill={shape.shirt} />
            <path d={shape.head} fill={SKIN} />
          </g>
        );
      })}
      {specs.map((sp, i) => (
        <g key={i} ref={(e) => { cars.current[i] = e; }}>
          <path fill={sp.colour} />
          <path fill={sp.bus ? C.win : C.dark} />
          <path fill={BEAM} className="beam" />
        </g>
      ))}
    </g>
  );
});

export default Life;
