import { useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLineReveal } from '../lib/motion';

interface Props {
  id?: string;
  label?: string;
  heading?: ReactNode;
  intro?: ReactNode;
  tone?: 'white' | 'paper' | 'ink' | 'mist' | 'night' | 'royal';
  grid?: boolean;
  children?: ReactNode;
  className?: string;
}

const tones = {
  white: 'bg-white text-ink on-light',
  paper: 'bg-off-white text-ink on-light',
  mist: 'bg-ink/5 text-ink on-light',
  ink: 'bg-ink text-off-white',
  night: 'bg-night text-off-white',
  royal: 'bg-royal text-off-white',
};

export const Reveal = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function Heading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLineReveal(ref);
  return <h2 ref={ref} className="text-32 font-bold tracking-tight md:text-52">{children}</h2>;
}

export default function Section({ id, label, heading, intro, tone = 'white', grid, children, className = '' }: Props) {
  return (
    <section id={id} className={`${tones[tone]} ${grid ? 'grid-lines' : ''} px-6 py-[72px] md:px-14 lg:py-[120px] ${className}`}>
      <div className="mx-auto max-w-[1328px]">
        {(label || heading) && (
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              {label && <p className="eyebrow mb-4">{label}</p>}
              {heading && <Heading>{heading}</Heading>}
            </div>
            {intro && <p className="max-w-[60ch] text-17 lg:justify-self-end">{intro}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
