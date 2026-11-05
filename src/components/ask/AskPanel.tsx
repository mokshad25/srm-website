import { useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import examples from '../../data/askExamples.json';
import { health } from '../../lib/askSrm';
import AskAnswer from './AskAnswer';
import AskExamples from './AskExamples';
import { useAsk } from './AskProvider';

function examplesFor(pathname: string) {
  if (pathname.startsWith('/engineering')) return examples.engineering;
  if (pathname.startsWith('/medicine')) return examples.medicine;
  return examples.home;
}

function useConnection(isOpen: boolean) {
  const [online, setOnline] = useState(navigator.onLine);
  const [healthy, setHealthy] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !online) return;
    let stale = false;
    void health().then((ok) => {
      if (!stale) setHealthy(ok);
    });
    return () => {
      stale = true;
    };
  }, [isOpen, online]);

  return { online, healthy };
}

export default function AskPanel() {
  const { isOpen, focusTick, turns, busy, close, submit, reset } = useAsk();
  const { pathname } = useLocation();
  const { online, healthy } = useConnection(isOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLLIElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) input.current?.focus();
  }, [isOpen, focusTick]);

  useEffect(() => {
    if (scroller.current && last.current) scroller.current.scrollTop = last.current.offsetTop - 24;
  }, [turns.length]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim() || busy) return;
    submit(value);
    setValue('');
  };

  // A click whose target is the dialog itself landed on the backdrop.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) close();
  };

  const clarifying = turns.at(-1)?.response?.status === 'needs_clarification';
  const fieldLabel = clarifying ? 'Your reply' : turns.length ? 'Ask a follow-up question' : 'Ask SRM a question';

  return (
    <dialog
      ref={dialog}
      aria-labelledby="ask-title"
      onClose={close}
      onClick={onClick}
      data-ask-panel
      className="ask-drawer on-light fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none overflow-hidden w-full max-w-[40rem] bg-white text-ink backdrop:bg-night/60"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 px-6 py-4">
          <h2 id="ask-title" className="flex items-center gap-3 font-display text-22 font-bold">
            <span aria-hidden className="h-1 w-8 bg-amber" />
            Ask SRM
          </h2>
          <div className="flex items-center gap-2">
            {turns.length > 0 && (
              <button type="button" disabled={busy} onClick={reset} className="border border-ink/40 px-3 py-1.5 text-14 font-semibold hover:border-ink">
                Start over
              </button>
            )}
            <button type="button" onClick={close} className="border border-ink px-3 py-1.5 text-14 font-semibold hover:bg-ink hover:text-off-white">
              Close
            </button>
          </div>
        </div>

        <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {(!online || !healthy) && (
            <p className="mb-6 border-l-4 border-amber bg-off-white px-4 py-3 text-17 font-bold" role="status" data-ask-connection>
              {online ? "Ask SRM isn't available right now. Please try again shortly." : "You're offline. Reconnect to ask a question."}
            </p>
          )}
          {turns.length === 0 && (
            <div data-ask-empty>
              <p className="text-22 font-medium">Ask about admissions, programmes, hostels and campus life at SRM Kattankulathur.</p>
              <p className="eyebrow mt-6 mb-3">Try asking</p>
              <AskExamples questions={examplesFor(pathname)} tone="light" />
            </div>
          )}
          <ol aria-live="polite" aria-busy={busy} className="grid gap-8">
            {turns.map((turn, i) => (
              <li key={turn.id} ref={i === turns.length - 1 ? last : undefined} className={i > 0 ? 'border-t border-ink/15 pt-8' : undefined}>
                <AskAnswer turn={turn} />
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-ink/15 px-6 py-4">
          <form onSubmit={onSubmit} className="grid gap-2">
            <label htmlFor="ask-panel-input" className="text-14 font-semibold">{fieldLabel}</label>
            <div className="flex">
              <input
                id="ask-panel-input"
                ref={input}
                data-ask-input
                type="text"
                value={value}
                maxLength={2000}
                autoComplete="off"
                onChange={(event) => setValue(event.target.value)}
                className="min-w-0 flex-1 border-2 border-r-0 border-ink px-3 py-2 text-17"
              />
              <button type="submit" disabled={busy} className="shrink-0 border-2 border-ink bg-ink px-5 py-2 text-17 font-bold text-off-white hover:bg-srm-blue">
                Ask
              </button>
            </div>
          </form>
          <p className="mt-3 text-14 text-ink/70">
            Answers come from public SRM pages and may be out of date. Confirm with the official site.
          </p>
        </div>
      </div>
    </dialog>
  );
}
