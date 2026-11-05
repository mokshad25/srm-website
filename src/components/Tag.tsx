import type { ReactNode } from 'react';

export default function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-block border border-current px-2 py-0.5 text-14 font-medium ${className}`}>{children}</span>;
}
