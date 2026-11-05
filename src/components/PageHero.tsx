import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { photoFor } from '../lib/photos';
import Breadcrumb from './Breadcrumb';
import Photo from './Photo';

interface Props {
  eyebrow: string;
  lines: string[];
  accent: string;
  sub: ReactNode;
  actions: ReactNode;
  slot: string;
  /** Shown beside the copy when no photo is assigned. */
  aside?: ReactNode;
  rule?: 'amber' | 'teal';
  children?: ReactNode;
}

export default function PageHero({ eyebrow, lines, accent, sub, actions, slot, aside, rule = 'amber', children }: Props) {
  const hasPhoto = !!photoFor(slot);
  return (
    <section className="on-light relative grid bg-off-white text-ink lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="px-6 pt-32 pb-16 md:px-14 lg:pt-40 lg:pb-24"
      >
        <Breadcrumb />
        <p className="eyebrow mt-8 flex items-center gap-4">
          <span aria-hidden className={`h-1 w-12 ${rule === 'teal' ? 'bg-teal' : 'bg-royal'}`} />
          {eyebrow}
        </p>
        <h1 className="mt-10 text-32 font-extrabold tracking-tight sm:text-52 xl:text-84">
          {lines.map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
          <span className="font-serif font-normal tracking-normal normal-case italic">{accent}</span>
        </h1>
        {children}
        <p className="mt-8 max-w-[52ch] text-22">{sub}</p>
        <div className="mt-10 flex flex-wrap gap-4">{actions}</div>
      </motion.div>
      <div className="relative min-h-[320px] lg:min-h-0">
        {hasPhoto && <Photo slot={slot} eager className="absolute inset-0" />}
        {!hasPhoto && aside}
      </div>
      <div aria-hidden className="nav-scrim pointer-events-none absolute inset-x-0 top-0 h-32" />
    </section>
  );
}
