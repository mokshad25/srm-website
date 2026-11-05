import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReduced, useInView } from '../lib/motion';

interface Props {
  value: string;
  label: string;
  note?: string;
  size?: '52' | '32';
}

/** Counts the number inside a value such as "5,546+" or "52 LPA"; grades like "A++" just fade in. */
function Figure({ value }: { value: string }) {
  const [ref, seen] = useInView<HTMLParagraphElement>();
  const num = useRef<HTMLSpanElement>(null);
  const m = value.match(/^(\D*)([\d,]+)(.*)$/);
  const target = m ? Number(m[2].replace(/,/g, '')) : 0;

  useEffect(() => {
    if (!seen || prefersReduced()) return;
    const el = ref.current;
    if (!m) {
      if (el) gsap.from(el, { opacity: 0, duration: 0.8 });
      return;
    }
    const n = { v: 0 };
    const tween = gsap.to(n, {
      v: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => { if (num.current) num.current.textContent = Math.round(n.v).toLocaleString('en-IN'); },
      onComplete: () => { if (num.current) num.current.textContent = m[2]; },
    });
    return () => void tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  return (
    <p ref={ref} className="font-extrabold tracking-tight whitespace-nowrap tabular-nums">
      {m ? <><span className="sr-only">{value}</span><span aria-hidden>{m[1]}<span ref={num}>{m[2]}</span>{m[3]}</span></> : value}
    </p>
  );
}

export default function Stat({ value, label, note, size = '52' }: Props) {
  return (
    <div>
      <div className={size === '52' ? 'text-52' : 'text-32'}><Figure value={value} /></div>
      <p className="mt-2 text-17 font-semibold">{label}</p>
      {note && <p className="text-14 opacity-80">{note}</p>}
    </div>
  );
}
