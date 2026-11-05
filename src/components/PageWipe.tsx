import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';
import { prefersReduced } from '../lib/motion';

/** A panel that wipes off the new page on each route change, in 500 ms. */
export default function PageWipe() {
  const { pathname } = useLocation();
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReduced() || !panel.current) return;
    const t = gsap.fromTo(panel.current, { scaleY: 1, autoAlpha: 1 }, { scaleY: 0, duration: 0.5, ease: 'power3.inOut', onComplete: () => void gsap.set(panel.current, { autoAlpha: 0 }) });
    return () => void t.kill();
  }, [pathname]);

  return <div ref={panel} aria-hidden className="invisible fixed inset-0 z-50 origin-top bg-royal" />;
}
