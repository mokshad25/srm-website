import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKey, type PointerEvent as ReactPointer } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import Photo from '../../../components/Photo';
import Section from '../../../components/Section';
import { toast } from '../../../components/Toast';
import campus from '../../../data/campus.json';
import home from '../../../data/home.json';
import { useExplored } from '../../../lib/explored';
import { project, toPath, type Quarter, type V2 } from '../../../lib/iso';
import { photoFor } from '../../../lib/photos';
import Life from './Life';
import { paletteCss, type Op } from './pen';
import { buildScene, places, routeTo, type Item, type Scene } from './scene';

const MIN_Z = 0.8;
const PLAN_MIN_Z = 0.6; // The flat plan is taller than the frame.
const MAX_Z = 2.4;
const MILESTONES: Record<number, string> = {
  1: 'First stop: your campus walk has started',
  6: 'Badge earned: Getting around',
  12: 'Badge earned: Halfway there',
  18: 'Badge earned: Campus regular',
  24: 'Badge earned: Every place explored',
};

const Shape = ({ op }: { op: Op }) => (
  <path d={op.d} fill={op.f ?? 'none'} fillOpacity={op.o} stroke={op.s} strokeWidth={op.sw} strokeLinecap={op.s ? 'round' : undefined} strokeLinejoin="round" className={op.cls} />
);

const ItemShape = memo(function ItemShape({ item }: { item: Item }) {
  if (item.kind !== 'place') {
    return <g className={item.kind}>{item.ops.map((op, i) => <Shape key={i} op={op} />)}</g>;
  }
  return (
    <g className="bld" data-b={item.id} data-cat={item.cat}>
      <path className="hit" d={item.outline} fill="transparent" />
      <g className="lift">
        <g className="rise">{item.ops.map((op, i) => <Shape key={i} op={op} />)}</g>
        <path className="edge" d={item.outline} />
      </g>
    </g>
  );
});

/** The static drawing. Memoised, so camera and panel changes never touch these nodes. */
const Static = memo(function Static({ scene, part }: { scene: Scene; part: 'ground' | 'items' }) {
  if (part === 'ground') return <g aria-hidden>{scene.ground.map((op, i) => <Shape key={i} op={op} />)}</g>;
  return <g>{scene.items.map((item, i) => <ItemShape key={item.id ?? i} item={item} />)}</g>;
});

/** A single building on its own, used on the side card when there's no real photo. */
function BuildingPortrait({ id, scene }: { id: string; scene: Scene }) {
  const item = scene.items.find((x) => x.id === id);
  const box = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const g = box.current?.querySelector('g');
    if (!g || !box.current) return;
    const b = g.getBBox();
    const pad = Math.max(b.width, b.height) * 0.1;
    box.current.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  }, [id, item]);
  if (!item) return null;
  return (
    <div className="aspect-video bg-off-white p-2">
      <svg ref={box} aria-hidden className="h-full w-full"><g>{item.ops.map((op, i) => <Shape key={i} op={op} />)}</g></svg>
    </div>
  );
}

function Count({ value, total }: { value: number; total: number }) {
  return (
    <span data-explored-count className="inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          {value}
        </motion.span>
      </AnimatePresence>
      <span>&nbsp;of {total}</span>
    </span>
  );
}

const Turn = ({ flip }: { flip?: boolean }) => (
  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M4 9a8.5 8.5 0 1 1-1 5" />
    <path d="M3.5 3.5V9.5H9.5" />
  </svg>
);

const ctl = 'inline-flex min-h-11 min-w-11 items-center justify-center bg-off-white px-3 text-14 font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-off-white active:scale-95';

export default function CampusMap() {
  const reduce = !!useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const routeMask = useRef<SVGPathElement>(null);
  const miniView = useRef<SVGRectElement>(null);

  const [k, setK] = useState<Quarter>(0);
  const [plan, setPlan] = useState(false);
  const [night, setNight] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [turning, setTurning] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [hint, setHint] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const { explored, mark, reset } = useExplored();
  const scene = useMemo(() => buildScene(k, plan), [k, plan]);
  const { vb, view } = scene;
  const palette = useMemo(() => {
    void scene;
    return paletteCss('.campus-scene');
  }, [scene]);

  const place = places.find((p) => p.id === sel);
  const pos = useMemo(() => {
    const out: Record<string, V2> = {};
    for (const it of scene.items) {
      if (it.id && it.top) out[it.id] = [(it.top[0] - vb.x) / vb.w, (it.top[1] - vb.y) / vb.h];
    }
    // Nudge markers apart where tall buildings bring them together.
    const gap = 36 / Math.max(size.w, 900);
    const gapY = gap * (vb.w / vb.h);
    const ids = Object.keys(out);
    for (let pass = 0; pass < 6; pass++) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = out[ids[i]];
          const b = out[ids[j]];
          if (Math.abs(a[0] - b[0]) >= gap || Math.abs(a[1] - b[1]) >= gapY) continue;
          const push = (gapY - Math.abs(a[1] - b[1])) / 2 + 0.001;
          const up = a[1] <= b[1] ? -1 : 1;
          a[1] += up * push;
          b[1] -= up * push;
        }
      }
    }
    return out;
  }, [scene, vb, size.w]);

  /* Camera. Lives outside React state so a pan never re-renders the drawing. */
  const cam = useRef({ x: 0, y: 0, z: 1 });
  const idle = useRef(0);
  const stageH = size.w * (vb.h / vb.w);

  const apply = useCallback(() => {
    const el = stage.current;
    const f = frame.current;
    if (!el || !f) return;
    const c = cam.current;
    const fw = f.clientWidth;
    const fh = f.clientHeight;
    const w = fw * c.z;
    const h = (fw * (vb.h / vb.w)) * c.z;
    c.x = w <= fw ? (fw - w) / 2 : Math.min(fw * 0.1, Math.max(fw * 0.9 - w, c.x));
    c.y = h <= fh ? (fh - h) / 2 : Math.min(fh * 0.1, Math.max(fh * 0.9 - h, c.y));
    el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.z})`;
    el.style.setProperty('--z', String(c.z));
    // Composite while moving; drop the layer at rest so the zoomed drawing re-rasters sharp.
    el.style.willChange = 'transform';
    clearTimeout(idle.current);
    idle.current = window.setTimeout(() => { el.style.willChange = 'auto'; }, 180);
    const m = miniView.current;
    if (m) {
      m.setAttribute('x', String(vb.x + (-c.x / w) * vb.w));
      m.setAttribute('y', String(vb.y + (-c.y / h) * vb.h));
      m.setAttribute('width', String((fw / w) * vb.w));
      m.setAttribute('height', String((fh / h) * vb.h));
    }
  }, [vb]);

  const tween = useCallback((x: number, y: number, z: number, duration = 0.7) => {
    gsap.killTweensOf(cam.current);
    if (reduce || !duration) {
      Object.assign(cam.current, { x, y, z });
      apply();
      return;
    }
    gsap.to(cam.current, { x, y, z, duration, ease: 'power3.inOut', onUpdate: apply });
  }, [apply, reduce]);

  
  const home0 = useCallback((duration = 0) => {
    const f = frame.current;
    if (!f) return;
    const fit = f.clientHeight / (f.clientWidth * (vb.h / vb.w));
    const z = window.innerWidth < 768 ? 2 : plan ? Math.max(PLAN_MIN_Z, Math.min(1, fit)) : 1;
    tween((f.clientWidth - f.clientWidth * z) / 2, (f.clientHeight - f.clientWidth * (vb.h / vb.w) * z) / 2, z, duration);
  }, [tween, vb, plan]);

  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: f.clientWidth, h: f.clientHeight });
      home0(0);
    });
    ro.observe(f);
    return () => ro.disconnect();
  }, [home0]);

  /** Moves the camera so a stage point sits at the middle of the free part of the frame. */
  const focus = useCallback((nx: number, ny: number, z: number, duration?: number) => {
    const f = frame.current;
    if (!f) return;
    const fw = f.clientWidth;
    const fh = f.clientHeight;
    const wide = fw >= 900;
    const free = wide ? fw - 420 : fw;
    const midY = wide ? fh * 0.55 : fh * 0.32;
    tween(free / 2 - nx * fw * z, midY - ny * (fw * (vb.h / vb.w)) * z, z, duration);
  }, [tween, vb]);

  /* Selecting. */
  const route = useMemo(() => {
    if (!sel) return null;
    const r = routeTo(sel);
    const pts = r.points.map(([x, y]) => project(x, y, 0.1, view));
    const mid = pts[Math.floor(pts.length / 2)] ?? pts[0];
    return { d: toPath(pts, false), minutes: r.minutes, mid: [(mid[0] - vb.x) / vb.w, (mid[1] - vb.y) / vb.h] as V2, stops: pts.length };
  }, [sel, view, vb]);

  const drawRoute = useCallback(() => {
    const m = routeMask.current;
    if (!m || reduce) return;
    gsap.fromTo(m, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.25 });
  }, [reduce]);

  useEffect(drawRoute, [route, drawRoute]);

  const open = useCallback((id: string) => {
    setSel(id);
    if (!explored.includes(id)) {
      mark(id);
      const note = MILESTONES[explored.length + 1];
      if (note) toast(note);
    }
    const q = pos[id];
    if (q) focus(q[0], q[1], Math.max(cam.current.z, window.innerWidth < 768 ? 1.9 : 1.5));
  }, [explored, focus, mark, pos]);

  const close = useCallback(() => {
    setSel(null);
    home0(0.7);
  }, [home0]);

  const fitRoute = () => {
    drawRoute();
    if (!route || !sel) return;
    const pts = routeTo(sel).points.map(([x, y]) => project(x, y, 0, view));
    const xs = pts.map((p) => (p[0] - vb.x) / vb.w);
    const ys = pts.map((p) => (p[1] - vb.y) / vb.h);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const f = frame.current!;
    const spanX = (Math.max(...xs) - Math.min(...xs)) * f.clientWidth;
    const spanY = (Math.max(...ys) - Math.min(...ys)) * f.clientWidth * (vb.h / vb.w);
    const z = Math.max(MIN_Z, Math.min(MAX_Z, Math.min((f.clientWidth - 500) / (spanX + 1), (f.clientHeight - 200) / (spanY + 1))));
    focus(cx, cy, z);
  };

  /* Dimming: applied directly so 24 groups change without re-rendering 600 nodes. */
  useEffect(() => {
    const on = (id: string, cat: string) => (sel ? id === sel : filter === 'all' || cat === filter);
    svg.current?.querySelectorAll<SVGGElement>('[data-b]').forEach((g) => {
      g.toggleAttribute('data-dim', !on(g.dataset.b!, g.dataset.cat!));
    });
  }, [filter, sel, scene]);

  /* Pause everything off-screen. */
  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 });
    io.observe(f);
    return () => io.disconnect();
  }, []);

  /* Intro: buildings rise one by one, then trees, then markers. */
  const played = useRef(false);
  useEffect(() => {
    const root = svg.current;
    const st = stage.current;
    if (!onScreen || played.current || !root || !st || reduce) return;
    played.current = true;
    const buildings = gsap.utils.toArray<SVGGElement>(root.querySelectorAll('.rise'));
    const greens = gsap.utils.toArray<SVGGElement>(root.querySelectorAll('.tree'));
    const pins = gsap.utils.toArray<HTMLElement>(st.querySelectorAll('[data-marker] > span'));
    const tl = gsap.timeline();
    tl.from(buildings, { scaleY: 0, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.05, transformOrigin: '50% 100%' })
      .from(greens, { scale: 0, duration: 0.3, ease: 'back.out(2)', stagger: { amount: 0.5, from: 'random' }, transformOrigin: '50% 100%' }, '-=0.4')
      .from(pins, { scale: 0, opacity: 0, duration: 0.25, ease: 'back.out(2)', stagger: 0.015 }, '-=0.3');
    return () => void tl.progress(1);
  }, [onScreen, reduce]);

  /* Rotation and 2D/3D: fade, swap the cached drawing, fade back. */
  const swap = (fn: () => void) => {
    if (reduce) return fn();
    setTurning(true);
    setTimeout(() => {
      fn();
      setTurning(false);
    }, 200);
  };
  useEffect(() => {
    if (sel && pos[sel]) focus(pos[sel][0], pos[sel][1], cam.current.z, 0.4);
    else apply();
    // Re-aim at the selection after the projection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  /* Drag, inertia, pinch. */
  const drag = useRef({ active: false, moved: false, id: 0, lx: 0, ly: 0, vx: 0, vy: 0, lt: 0 });
  const pointers = useRef(new Map<number, V2>());
  const pinch = useRef(0);
  const inertia = useRef(0);

  const zoomAt = useCallback((z: number, px: number, py: number) => {
    const c = cam.current;
    const next = Math.max(plan ? PLAN_MIN_Z : MIN_Z, Math.min(MAX_Z, z));
    gsap.killTweensOf(c);
    c.x = px - ((px - c.x) / c.z) * next;
    c.y = py - ((py - c.y) / c.z) * next;
    c.z = next;
    apply();
  }, [apply, plan]);

  const onDown = (e: ReactPointer) => {
    setEngaged(true);
    if ((e.target as HTMLElement).closest('button, a, select')) return;
    pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    cancelAnimationFrame(inertia.current);
    gsap.killTweensOf(cam.current);
    drag.current = { active: true, moved: false, id: e.pointerId, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0, lt: performance.now() };
    pinch.current = 0;
  };

  const onMove = (e: ReactPointer) => {
    const d = drag.current;
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const gap = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const box = frame.current!.getBoundingClientRect();
      if (pinch.current) zoomAt(cam.current.z * (gap / pinch.current), (a[0] + b[0]) / 2 - box.left, (a[1] + b[1]) / 2 - box.top);
      pinch.current = gap;
      d.moved = true;
      return;
    }
    if (!d.active || e.pointerId !== d.id) return;
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) frame.current?.setPointerCapture(e.pointerId);
    d.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - d.lt);
    d.vx = dx / dt;
    d.vy = dy / dt;
    d.lt = now;
    d.lx = e.clientX;
    d.ly = e.clientY;
    cam.current.x += dx;
    cam.current.y += dy;
    apply();
  };

  const onUp = (e: ReactPointer) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    d.active = false;
    if (!d.moved) {
      const hit = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest('[data-b]') as SVGGElement | null;
      if (hit?.dataset.b) open(hit.dataset.b);
      return;
    }
    if (reduce) return;
    let { vx, vy } = d;
    let last = performance.now();
    const glide = (now: number) => {
      const dt = now - last;
      last = now;
      cam.current.x += vx * dt;
      cam.current.y += vy * dt;
      vx *= 0.94;
      vy *= 0.94;
      apply();
      if (Math.hypot(vx, vy) > 0.02) inertia.current = requestAnimationFrame(glide);
    };
    inertia.current = requestAnimationFrame(glide);
  };

  /* Wheel zooms only once the map is engaged, or it would swallow page scrolling. */
  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    const wheel = (e: WheelEvent) => {
      if (!engaged) {
        setHint(true);
        return;
      }
      e.preventDefault();
      const box = f.getBoundingClientRect();
      zoomAt(cam.current.z * Math.exp(-e.deltaY * 0.0016), e.clientX - box.left, e.clientY - box.top);
    };
    f.addEventListener('wheel', wheel, { passive: false });
    return () => f.removeEventListener('wheel', wheel);
  }, [engaged, zoomAt]);

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(false), 1800);
    return () => clearTimeout(t);
  }, [hint]);

  const zoomStep = (m: number) => {
    const f = frame.current!;
    const c = cam.current;
    const z = Math.max(plan ? PLAN_MIN_Z : MIN_Z, Math.min(MAX_Z, c.z * m));
    const cx = f.clientWidth / 2;
    const cy = f.clientHeight / 2;
    tween(cx - ((cx - c.x) / c.z) * z, cy - ((cy - c.y) / c.z) * z, z, 0.3);
  };

  const onKey = (e: ReactKey) => {
    if (e.key === 'Escape') {
      if (sel) close();
      setEngaged(false);
      return;
    }
    if ((e.target as HTMLElement) !== frame.current) return;
    const step: Record<string, V2> = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
    if (step[e.key]) {
      e.preventDefault();
      cam.current.x += step[e.key][0];
      cam.current.y += step[e.key][1];
      apply();
    } else if (e.key === '+' || e.key === '=') zoomStep(1.25);
    else if (e.key === '-') zoomStep(0.8);
  };

  const onHover = (e: ReactPointer) => {
    if (e.pointerType !== 'mouse') return;
    const id = (e.target as Element).closest?.('[data-b]')?.getAttribute('data-b') ?? null;
    setHover((h) => (h === id ? h : id));
  };

  const hovered = places.find((p) => p.id === hover && p.id !== sel);
  const counter = { transform: 'translate(-50%, -100%) scale(calc(1 / var(--z, 1)))', transformOrigin: '50% 100%' } as CSSProperties;
  const seg = (on: boolean) => (on ? 'bg-ink text-off-white' : 'bg-off-white text-ink hover:bg-ink hover:text-off-white');

  return (
    <>
      <Section
        tone="paper"
        className="!pb-10"
        label="Explore the campus"
        heading={<>Walk it before you <em className="font-serif font-normal">arrive.</em></>}
        intro="Click a marker or a building to open its card, drag to look around, and watch the route draw from Gate 4."
      />
      <div
        ref={frame}
        tabIndex={0}
        role="group"
        aria-label="Illustrative campus map. Use arrow keys to pan, plus and minus to zoom."
        data-lenis-prevent={engaged ? '' : undefined}
        data-night={night ? '' : undefined}
        onPointerDown={onDown}
        onPointerMove={(e) => { onMove(e); onHover(e); }}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => { setHover(null); setEngaged(false); }}
        onKeyDown={onKey}
        onFocus={(e) => e.target === frame.current && setEngaged(true)}
        className={`campus-scene on-light relative h-[calc(100svh-96px)] max-h-[820px] min-h-[560px] touch-pan-y overflow-hidden select-none ${onScreen ? '' : 'paused'} cursor-grab active:cursor-grabbing`}
      >
        <style>{palette}</style>
        <div ref={stage} style={{ width: size.w, height: stageH, transformOrigin: '0 0' }} className="absolute top-0 left-0">
          <svg
            ref={svg}
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            width="100%"
            height="100%"
            aria-hidden
            className={`block overflow-visible transition-opacity duration-200 ${turning ? 'opacity-0' : ''}`}
          >
            <defs>
              <mask id="route-reveal" maskUnits="userSpaceOnUse" x={vb.x} y={vb.y} width={vb.w} height={vb.h}>
                {route && <path ref={routeMask} d={route.d} fill="none" stroke="#fff" strokeWidth={14} pathLength={1} strokeDasharray={1} strokeLinecap="round" strokeLinejoin="round" />}
              </mask>
            </defs>
            <Static scene={scene} part="ground" />
            <Life view={view} paused={!onScreen} reduce={reduce} />
            <Static scene={scene} part="items" />
            {route && (
              <g mask="url(#route-reveal)" pointerEvents="none">
                <path data-route d={route.d} fill="none" stroke="var(--color-off-white)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                <path d={route.d} fill="none" stroke="var(--color-royal, #1B4DB1)" strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </svg>

          {!turning && places.map((p) => {
            const q = pos[p.id];
            if (!q) return null;
            const viewing = p.id === sel;
            const seen = explored.includes(p.id);
            const faded = sel ? !viewing : filter !== 'all' && p.cat !== filter;
            return (
              <button
                key={p.id}
                type="button"
                data-marker={p.id}
                aria-label={`${p.n}. ${p.name}${seen ? ', explored' : ''}`}
                aria-pressed={viewing}
                onClick={() => open(p.id)}
                onPointerEnter={() => setHover(p.id)}
                onPointerLeave={() => setHover(null)}
                style={{ left: `${q[0] * 100}%`, top: `${q[1] * 100}%`, ...counter, opacity: faded ? 0.3 : 1 }}
                className="absolute flex h-11 w-11 items-center justify-center transition-opacity duration-300"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-14 font-bold ${viewing ? 'border-off-white bg-royal text-off-white' : seen ? 'border-ink bg-amber text-ink' : 'border-ink bg-off-white text-ink'}`}>
                  {p.n}
                </span>
              </button>
            );
          })}

          {hovered && pos[hovered.id] && (
            <span
              data-label
              style={{ left: `${pos[hovered.id][0] * 100}%`, top: `${pos[hovered.id][1] * 100}%`, ...counter, marginTop: -40 }}
              className="pointer-events-none absolute whitespace-nowrap bg-ink px-3 py-1.5 text-14 font-semibold text-off-white"
            >
              {hovered.label}
            </span>
          )}

          {route && route.minutes > 0 && (
            <span
              data-walk
              style={{ left: `${route.mid[0] * 100}%`, top: `${route.mid[1] * 100}%`, ...counter }}
              className="pointer-events-none absolute whitespace-nowrap bg-royal px-3 py-1.5 text-14 font-semibold text-off-white"
            >
              About {route.minutes} min walk
            </span>
          )}
        </div>

        {/* Top bar. */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2 md:inset-x-14">
          <div className="pointer-events-auto bg-off-white px-3 py-2 text-ink">
            <p className="text-17 font-semibold" aria-live="polite"><Count value={explored.length} total={places.length} /> explored</p>
          </div>
          <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
            <div role="group" aria-label="Map view" className="flex gap-px bg-ink/20">
              <button type="button" aria-pressed={plan} onClick={() => !plan && swap(() => setPlan(true))} className={`min-h-11 min-w-11 px-3 text-14 font-semibold transition-colors duration-200 ${seg(plan)}`}>2D</button>
              <button type="button" aria-pressed={!plan} onClick={() => plan && swap(() => setPlan(false))} className={`min-h-11 min-w-11 px-3 text-14 font-semibold transition-colors duration-200 ${seg(!plan)}`}>3D</button>
              <a href={home.cta.tour} target="_blank" rel="noreferrer" className={`${ctl} hover:bg-ink`}>360°</a>
            </div>
            <button type="button" aria-pressed={night} data-night-toggle onClick={() => setNight(!night)} className={ctl}>{night ? 'Day' : 'Night'}</button>
          </div>
        </div>

        {/* Bottom bar. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 md:inset-x-14">
          <div className="pointer-events-auto hidden max-w-[320px] bg-off-white px-3 py-2 text-14 text-ink md:block">
            <p className="font-semibold">Illustrative map</p>
            <p>Building positions are not surveyed.</p>
          </div>
          <p className="pointer-events-auto bg-off-white px-3 py-2 text-14 font-semibold text-ink md:hidden">Illustrative map</p>
          <div className="pointer-events-auto flex items-end gap-2">
            {!plan && (
              <div role="group" aria-label="Rotate map" className="flex gap-px bg-ink/20">
                <button type="button" aria-label="Rotate left" data-rotate="left" onClick={() => swap(() => setK(((k + 3) % 4) as Quarter))} className={ctl}><Turn /></button>
                <button type="button" aria-label="Rotate right" data-rotate="right" onClick={() => swap(() => setK(((k + 1) % 4) as Quarter))} className={ctl}><Turn flip /></button>
              </div>
            )}
            <div role="group" aria-label="Zoom" className="flex gap-px bg-ink/20">
              <button type="button" aria-label="Zoom out" onClick={() => zoomStep(0.8)} className={ctl}>−</button>
              <button type="button" aria-label="Zoom in" onClick={() => zoomStep(1.25)} className={ctl}>+</button>
            </div>
            <button
              type="button"
              aria-label="Show the whole map"
              onClick={() => { setSel(null); home0(0.7); }}
              className="hidden border border-ink/20 bg-off-white p-1 lg:block"
            >
              <svg aria-hidden viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block h-auto w-40">
                {scene.items.filter((i) => i.kind === 'place').map((i) => (
                  <path key={i.id} d={i.outline} fill={i.id === sel ? 'var(--color-royal, #1B4DB1)' : 'var(--color-ink)'} fillOpacity={i.id === sel ? 1 : 0.35} />
                ))}
                <rect ref={miniView} fill="none" stroke="var(--color-royal, #1B4DB1)" strokeWidth={12} />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {hint && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 bg-ink px-4 py-2 text-14 font-semibold text-off-white"
            >
              Click the map, then scroll to zoom
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {place && (
            <motion.aside
              key={place.id}
              data-card
              aria-label={place.name}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 z-10 max-h-[64%] cursor-auto overflow-y-auto bg-ink text-off-white md:inset-x-auto md:top-20 md:right-14 md:bottom-20 md:max-h-none md:w-[380px]"
            >
              {photoFor(`campus.${place.id}`) ? <Photo slot={`campus.${place.id}`} className="aspect-video" /> : <div className="hidden md:block"><BuildingPortrait id={place.id} scene={scene} /></div>}
              <div className="p-6">
                <p className="eyebrow">{place.category}</p>
                <h3 className="mt-2 text-22 font-bold">{place.name}</h3>
                <p className="mt-2 text-17">{place.desc}</p>
                <ul className="mt-3 flex flex-wrap gap-x-4 text-14">
                  {place.facilities.map((f) => <li key={f}>+ {f}</li>)}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={home.cta.tour} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center bg-amber px-4 text-14 font-bold text-ink transition-colors duration-200 hover:bg-off-white">Enter 360° view</a>
                  <button type="button" onClick={fitRoute} className="min-h-11 border border-off-white px-4 text-14 font-semibold transition-colors duration-200 hover:bg-off-white hover:text-ink">Directions</button>
                </div>
                <button type="button" className="mt-4 min-h-11 text-14 font-semibold underline underline-offset-2" onClick={close}>Close card</button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Filters, the jump list and the legend sit under the map so it stays clear. */}
      <div className="on-light bg-off-white px-6 py-6 text-ink md:px-14">
        <div className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter places" className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {campus.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                data-filter={f.id}
                aria-pressed={filter === f.id}
                onClick={() => { setSel(null); setFilter(f.id); }}
                className={`min-h-11 shrink-0 border-2 border-ink px-3 text-14 font-semibold transition-colors duration-200 ${filter === f.id ? 'bg-ink text-off-white' : 'hover:bg-ink/10'}`}
              >
                {f.t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-14 font-semibold">
              Jump to a place
              <select
                aria-label="Jump to a place"
                value={sel ?? ''}
                onChange={(e) => {
                  if (e.target.value) open(e.target.value);
                  frame.current?.scrollIntoView({ block: 'center' });
                }}
                className="min-h-11 border border-ink bg-white px-2 text-14 font-normal"
              >
                <option value="">Choose a place</option>
                {places.map((p) => <option key={p.id} value={p.id}>{p.n}. {p.name}</option>)}
              </select>
            </label>
            {explored.length > 0 && (
              <button type="button" className="min-h-11 text-14 font-semibold underline underline-offset-2" onClick={() => { reset(); close(); }}>
                Reset progress
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
