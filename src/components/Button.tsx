import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useMagnetic } from '../lib/motion';

interface Props {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'outline-dark' | 'royal';
  className?: string;
}

// The dark-section hover would vanish into a light background.
const onLight = '[.on-light_&:hover]:border-ink [.on-light_&:hover]:bg-ink [.on-light_&:hover]:text-off-white';

const styles = {
  royal: `bg-royal text-off-white border-royal hover:bg-off-white hover:text-ink hover:border-off-white ${onLight}`,
  primary: `bg-amber text-ink hover:bg-off-white border-amber hover:border-off-white ${onLight}`,
  outline: 'border-off-white text-off-white hover:bg-off-white hover:text-ink',
  'outline-dark': 'border-ink text-ink hover:bg-ink hover:text-off-white',
};

export default function Button({ href, children, variant = 'primary', className = '' }: Props) {
  const magnet = useMagnetic<HTMLAnchorElement>();
  const cls = `inline-flex items-center gap-2 border-2 px-6 py-3 text-17 font-bold transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.97] ${styles[variant]} ${className}`;
  const internal = href.startsWith('/') || href.startsWith('#');
  return internal ? (
    <Link ref={magnet} to={href} className={cls}>
      {children}
    </Link>
  ) : (
    <a ref={magnet} href={href} className={cls}>
      {children}
    </a>
  );
}
