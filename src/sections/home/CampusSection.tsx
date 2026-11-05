import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const CampusMap = lazy(() => import('./campus/CampusMap'));

/** The map is the heaviest thing on Home, so it loads as it nears the screen. */
export default function CampusSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(window.location.hash === '#campus');

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '700px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="campus" ref={ref} aria-label="Campus map" className="min-h-[900px] bg-off-white">
      {near && (
        <Suspense fallback={<div className="skeleton min-h-[900px]" />}>
          <CampusMap />
        </Suspense>
      )}
    </section>
  );
}
