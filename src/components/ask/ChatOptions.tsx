import type { ReactNode } from 'react';
import support from '../../data/support.json';
import { openEmergency } from '../../lib/emergency';
import { useAsk } from './AskProvider';

const { chips, checkIn } = support;

const row = 'flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-14 font-semibold transition-colors duration-150 disabled:opacity-50';

const Chevron = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.25" className="ml-auto shrink-0 opacity-60">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export function OptionRow({ onClick, disabled, danger, data, children }: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  data?: Record<string, boolean>;
  children: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        {...data}
        className={`${row} ${danger ? 'text-danger hover:bg-danger/10' : 'text-srm-blue hover:bg-off-white'}`}
      >
        <span className="min-w-0">{children}</span>
        <Chevron />
      </button>
    </li>
  );
}

export function OptionCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="chat-in overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <p className="px-4 pt-2.5 pb-1 text-12 font-semibold text-ink/70">{label}</p>
      <ul aria-label={label} className="divide-y divide-ink/10">{children}</ul>
    </div>
  );
}

/** The full list of topics. Emergency help always comes first. */
export function TopicRows() {
  const { submit, showContacts, busy } = useAsk();
  return (
    <>
      {chips.map((chip) =>
        chip.action === 'emergency' ? (
          <OptionRow key={chip.id} danger onClick={() => openEmergency()} data={{ 'data-chat-emergency-chip': true }}>
            {chip.label}
          </OptionRow>
        ) : (
          <OptionRow key={chip.id} disabled={busy} onClick={() => submit(chip.question!)} data={{ 'data-chat-chip': true }}>
            {chip.label}
          </OptionRow>
        ),
      )}
      <OptionRow onClick={showContacts} data={{ 'data-chat-talk': true }}>{support.contacts.title}</OptionRow>
    </>
  );
}

export { checkIn };
