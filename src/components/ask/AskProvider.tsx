import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ask, AskError, clearSession } from '../../lib/askSrm';
import type { AskErrorKind, AskResponse } from '../../lib/askSrm';

export interface Turn {
  id: string;
  question: string;
  state: 'loading' | 'done' | 'error';
  response?: AskResponse;
  error?: { kind: AskErrorKind; message: string };
  feedbackSent?: boolean;
}

interface AskContextValue {
  isOpen: boolean;
  /** Changes on every open() so the panel can refocus its field when already open. */
  focusTick: number;
  turns: Turn[];
  busy: boolean;
  open: () => void;
  close: () => void;
  submit: (question: string) => void;
  retry: (id: string) => void;
  reset: () => void;
  markFeedbackSent: (id: string) => void;
}

const AskContext = createContext<AskContextValue | null>(null);

const TURNS_KEY = 'ask-srm-turns';
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Kept with the session id, so a reload never leaves a hidden conversation behind it.
function loadTurns(): Turn[] {
  try {
    return JSON.parse(sessionStorage.getItem(TURNS_KEY) ?? '[]') as Turn[];
  } catch {
    return [];
  }
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function AskProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [turns, setTurns] = useState<Turn[]>(loadTurns);

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusTick((tick) => tick + 1);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const update = (id: string, patch: Partial<Turn>) =>
    setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, ...patch } : turn)));

  const run = useCallback(async (id: string, question: string) => {
    try {
      const response = await ask(question);
      update(id, { state: 'done', response, error: undefined });
    } catch (error) {
      const failure = error instanceof AskError ? error : new AskError('unavailable');
      update(id, { state: 'error', error: { kind: failure.kind, message: failure.message } });
    }
  }, []);

  const busy = turns.some((turn) => turn.state === 'loading');

  const submit = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || busy) return;
      const id = newId();
      setTurns((all) => [...all, { id, question, state: 'loading' }]);
      open();
      void run(id, question);
    },
    [busy, open, run],
  );

  const retry = useCallback(
    (id: string) => {
      const turn = turns.find((t) => t.id === id);
      if (!turn || busy) return;
      update(id, { state: 'loading', error: undefined });
      void run(id, turn.question);
    },
    [busy, run, turns],
  );

  const reset = useCallback(() => {
    clearSession();
    setTurns([]);
    setFocusTick((tick) => tick + 1);
  }, []);

  const markFeedbackSent = useCallback((id: string) => update(id, { feedbackSent: true }), []);

  useEffect(() => {
    sessionStorage.setItem(TURNS_KEY, JSON.stringify(turns.filter((turn) => turn.state === 'done')));
  }, [turns]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target);
      if (!shortcut && !slash) return;
      event.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo(
    () => ({ isOpen, focusTick, turns, busy, open, close, submit, retry, reset, markFeedbackSent }),
    [isOpen, focusTick, turns, busy, open, close, submit, retry, reset, markFeedbackSent],
  );
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

export function useAsk() {
  const value = useContext(AskContext);
  if (!value) throw new Error('useAsk must be used inside AskProvider');
  return value;
}
