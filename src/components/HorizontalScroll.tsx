import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/**
 * Sticky horizontal track on wide screens. With reduced motion, or below
 * 900 px, the panels simply wrap into a grid so nothing is hidden.
 */
interface Props {
  id?: string;
  /** Panel widths on the sticky track. */
  panels?: string;
  children: ReactNode;
}

export default function HorizontalScroll({ id, panels = '[&>*]:w-[560px] [&>*:first-child]:w-[640px] [&_h3]:text-52', children }: Props) {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  const [height, setHeight] = useState<number>();
  const dist = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth >= 900;
      setWide(w);
      if (track.current && w && wide) {
        const d = Math.max(0, track.current.scrollWidth - window.innerWidth);
        dist.set(d);
        setHeight(d + window.innerHeight);
      }
    };
    measure();
    void document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [dist, wide]); // Re-measure once the wide layout has rendered the real track.

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const x = useTransform(smooth, (p) => -p * dist.get());

  if (reduce || !wide) {
    return (
      <section id={id} ref={outer} className="grid-lines bg-ink text-off-white">
        <div ref={track} className="grid md:grid-cols-2 xl:grid-cols-3">{children}</div>
      </section>
    );
  }

  return (
    <section id={id} ref={outer} style={{ height }} className="bg-ink text-off-white">
      <div className="grid-lines sticky top-0 h-screen overflow-hidden">
        <motion.div ref={track} style={{ x }} className={`flex h-full w-max [&>*]:shrink-0 ${panels}`}>
          {children}
        </motion.div>
        <motion.div style={{ scaleX: smooth }} className="absolute right-0 bottom-0 left-0 h-1 origin-left bg-amber" />
      </div>
    </section>
  );
}
