import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Photo from './Photo';

interface Props {
  slot: string;
  href: string;
  /** Scrim strength over the photo. */
  scrim?: string;
  children: ReactNode;
}

/** A linked panel on the sideways tracks: photo, dark scrim, text on top. */
export default function PhotoPanel({ slot, href, scrim = 'bg-ink/60', children }: Props) {
  const body = (
    <>
      <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <Photo slot={slot} reveal className="absolute inset-0" />
      </span>
      <span aria-hidden className={`absolute inset-0 ${scrim}`} />
      <div className="relative flex h-full flex-col justify-between gap-10 p-6 md:p-14">{children}</div>
    </>
  );
  const cls = 'group @container relative block min-h-[440px] overflow-hidden border-l border-off-white/20';
  return href.startsWith('/') ? <Link to={href} className={cls}>{body}</Link> : <a href={href} className={cls}>{body}</a>;
}
