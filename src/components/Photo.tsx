import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { photoFor } from '../lib/photos';
import { prefersReduced, useInView } from '../lib/motion';

interface Props {
  slot: string;
  className?: string;
  /** Set on above-the-fold images. */
  eager?: boolean;
  /** Wipes in when it reaches the screen. */
  reveal?: boolean;
  /** Drifts slightly against the scroll, inside its own clipped frame. */
  parallax?: boolean;
}

export default function Photo({ slot, className = '', eager = false, reveal = false, parallax = false }: Props) {
  const photo = photoFor(slot);
  const [ref, seen] = useInView<HTMLImageElement>('0px');
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!parallax || prefersReduced() || !ref.current) return;
    const t = gsap.fromTo(ref.current, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: box.current, scrub: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, [parallax, ref]);

  if (!photo) return null;
  const img = (
    <img
      ref={ref}
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      data-cursor="View"
      data-shown={reveal ? seen : undefined}
      className={`h-full w-full object-cover ${reveal ? 'photo-reveal' : ''} ${parallax ? 'scale-110' : className}`}
    />
  );
  return parallax ? <span ref={box} className={`block overflow-hidden ${className}`}>{img}</span> : img;
}
