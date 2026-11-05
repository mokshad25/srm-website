import { useId, useRef, useState } from 'react';
import { copy, distressCopy, distressEntries, groups, primaryEntry } from '../../lib/emergency';
import type { EmergencyMode } from '../../lib/emergency';
import CallRow from './CallRow';

/** Editable, and only ever copied: no GPS, and nothing leaves the device. */
function LocationHelper() {
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(copy.locationTemplate);
  const [status, setStatus] = useState('');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied');
    } catch {
      field.current?.select();
      setStatus('Press Ctrl or Cmd + C to copy');
    }
  };

  return (
    <div className="grid gap-2 border-t border-ink/15 pt-4">
      <label htmlFor={id} className="text-14 font-semibold">{copy.locationLabel}</label>
      <p className="text-14 text-ink/70">{copy.locationHelp}</p>
      <div className="flex gap-2">
        <textarea
          id={id}
          ref={field}
          rows={1}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setStatus('');
          }}
          className="min-h-11 min-w-0 flex-1 resize-none border border-ink/40 bg-white px-3 py-2 text-14"
        />
        <button type="button" onClick={onCopy} data-copy-location className="min-h-11 shrink-0 border-2 border-ink px-4 text-14 font-bold hover:bg-ink hover:text-off-white">
          Copy
        </button>
      </div>
      {status && <p role="status" className="text-14 font-semibold">{status}</p>}
    </div>
  );
}

interface Props {
  mode: EmergencyMode;
  titleId: string;
  onAskAnyway?: () => void;
}

export default function EmergencyContent({ mode, titleId, onAskAnyway }: Props) {
  if (mode === 'distress') {
    return (
      <div className="grid gap-4" data-emergency-mode="distress">
        <h2 id={titleId} className="pr-12 font-display text-32 font-bold">{distressCopy.title}</h2>
        <p className="text-17">{distressCopy.message}</p>
        <ul className="grid gap-2">
          {distressEntries.map((entry) => (
            <li key={entry.id}><CallRow entry={entry} /></li>
          ))}
        </ul>
        <p className="text-14 text-ink/70">{distressCopy.notSent}</p>
        <p className="border-t border-ink/15 pt-4 text-14 text-ink/70">{copy.footer}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3" data-emergency-mode="emergency">
      <div className="grid gap-1">
        <h2 id={titleId} className="pr-12 font-display text-32 font-bold">{copy.title}</h2>
        <p className="text-17 font-medium">{copy.lead}</p>
      </div>
      {onAskAnyway && (
        <div className="grid justify-items-start gap-1 border-l-4 border-danger bg-off-white px-4 py-2 text-14">
          <p>{copy.notSent}</p>
          <button type="button" onClick={onAskAnyway} data-ask-anyway className="min-h-11 font-bold text-srm-blue underline underline-offset-2">
            {copy.askAnyway}
          </button>
        </div>
      )}
      <CallRow entry={primaryEntry} primary />
      {groups.map((group) => (
        <section key={group.id} aria-label={group.title} className="grid gap-2">
          <h3 className="eyebrow">{group.title}</h3>
          <ul className="grid gap-2">
            {group.entries.map((entry) => (
              <li key={entry.id}><CallRow entry={entry} /></li>
            ))}
          </ul>
        </section>
      ))}
      <LocationHelper />
      <p className="border-t border-ink/15 pt-4 text-14 text-ink/70">{copy.footer}</p>
    </div>
  );
}
