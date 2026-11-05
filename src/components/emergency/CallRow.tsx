import { useEffect, useRef, useState } from 'react';
import type { EmergencyEntry } from '../../lib/emergency';

// A phone's dialler is its own confirmation. Elsewhere a stray click could start a call app.
const needsConfirm = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const PhoneIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M6.6 3.5 9.2 8l-2 1.8a13 13 0 0 0 7 7l1.8-2 4.5 2.6-.9 3.7a1.5 1.5 0 0 1-1.6 1.1C9.7 21.5 2.5 14.3 1.8 6a1.5 1.5 0 0 1 1.1-1.6l3.7-.9Z" />
  </svg>
);

interface Props {
  entry: EmergencyEntry;
  primary?: boolean;
}

export default function CallRow({ entry, primary }: Props) {
  const [confirming, setConfirming] = useState(false);
  const call = useRef<HTMLAnchorElement>(null);
  const href = `tel:${entry.tel}`;
  const name = primary ? `Call ${entry.number}` : entry.label;
  const look = primary
    ? 'min-h-16 bg-danger text-22 font-bold text-white hover:bg-ink'
    : 'min-h-14 border border-ink/25 bg-white text-17 font-semibold hover:border-ink';
  const row = `flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors duration-200 ${look}`;
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3"><PhoneIcon /><span className="min-w-0">{name}</span></span>
      {!primary && <span className="shrink-0 font-bold text-danger">{entry.number}</span>}
    </>
  );

  useEffect(() => {
    if (confirming) call.current?.focus();
  }, [confirming]);

  if (confirming) {
    return (
      <div data-call-confirm className={`flex items-center justify-between gap-3 border border-ink bg-off-white px-4 py-2 ${primary ? 'min-h-16' : 'min-h-14'}`}>
        <span className="text-17 font-bold">Call {entry.number}?</span>
        <span className="flex shrink-0 gap-2">
          <a ref={call} href={href} onClick={() => setConfirming(false)} className="inline-flex min-h-11 items-center bg-danger px-4 text-14 font-bold text-white hover:bg-ink">
            Call
          </a>
          <button type="button" onClick={() => setConfirming(false)} className="min-h-11 border border-ink px-4 text-14 font-semibold hover:bg-ink hover:text-off-white">
            Cancel
          </button>
        </span>
      </div>
    );
  }

  return (
    <a
      href={href}
      data-call-row={entry.id}
      className={row}
      onClick={(event) => {
        if (!needsConfirm()) return;
        event.preventDefault();
        setConfirming(true);
      }}
    >
      {body}
    </a>
  );
}
