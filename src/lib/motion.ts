import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis: Lenis | null = null;

/** Smooth wheel scrolling, driving ScrollTrigger from one clock. Off with reduced motion. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ duration: 1.1 });
    lenis = l;
    l.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => {
      // The chat, the emergency sheet and the phone menu lock the page; follow them.
      const locked = document.documentElement.style.overflow === 'hidden' || !!document.querySelector('[data-lock-scroll][open]');
      if (locked) l.stop();
      else l.start();
      l.raf(t * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToTarget(target: HTMLElement | number) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -96, immediate: target === 0, force: true });
  else if (typeof target === 'number') window.scrollTo(0, target);
  else target.scrollIntoView();
}

/** Reveals a headline one line at a time as it enters the screen. */
export function useLineReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    let tween: gsap.core.Tween | undefined;
    let split: SplitText | undefined;
    let dead = false;
    void document.fonts.ready.then(() => {
      if (dead) return;
      split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      tween = gsap.from(split.lines, { yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    return () => {
      dead = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [ref]);
}

/** Pulls an element gently toward the pointer. */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !finePointer()) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x((e.clientX - b.left - b.width / 2) * 0.2);
      y((e.clientY - b.top - b.height / 2) * 0.3);
    };
    const leave = () => { x(0); y(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return ref;
}

export function useInView<T extends Element>(margin = '-10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen] as const;
}
