import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ask, AskError, clearSession, sendFeedback } from '../../lib/askSrm';
import type { AskErrorKind, AskResponse } from '../../lib/askSrm';
import { closeEmergency, isEmergencyOpen, openEmergency } from '../../lib/emergency';
import type { EmergencyMode } from '../../lib/emergency';
import { checkSafety } from '../../lib/safety';

export type CheckIn = 'yes' | 'no';

export interface Turn {
  id: string;
  question: string;
  /** 'safety' means the safety check held the message back, so it never reached the API. */
  state: 'loading' | 'done' | 'error' | 'safety';
  safety?: EmergencyMode;
  askedAt?: number;
  answeredAt?: number;
  response?: AskResponse;
  error?: { kind: AskErrorKind; message: string };
  /** The visitor's reply to "Did this answer your question?". */
  checkIn?: CheckIn;
  feedbackFailed?: boolean;
}

interface AskContextValue {
  isOpen: boolean;
  /** Changes on every open() so the panel can refocus its field when already open. */
  focusTick: number;
  /** Changes when something asks for the field directly, which also applies on touch screens. */
  fieldTick: number;
  contactsOpen: boolean;
  turns: Turn[];
  busy: boolean;
  open: () => void;
  close: () => void;
  submit: (question: string) => void;
  retry: (id: string) => void;
  reset: () => void;
  replyCheckIn: (id: string, reply: CheckIn, messageId: string | null) => void;
  showContacts: () => void;
  hideContacts: () => void;
  focusField: () => void;
  /** Reopens the sheet for a held-back message. */
  showSafety: (id: string) => void;
}

const AskContext = createContext<AskContextValue | null>(null);

const TURNS_KEY = 'ask-srm-turns';
const RATING_YES = 5;
const RATING_NO = 1;
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
  const [fieldTick, setFieldTick] = useState(0);
  const [contactsOpen, setContactsOpen] = useState(false);
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
      update(id, { state: 'done', response, error: undefined, answeredAt: Date.now() });
    } catch (error) {
      const failure = error instanceof AskError ? error : new AskError('unavailable');
      update(id, { state: 'error', error: { kind: failure.kind, message: failure.message }, answeredAt: Date.now() });
    }
  }, []);

  const busy = turns.some((turn) => turn.state === 'loading');

  const askAnyway = useCallback(
    (id: string, question: string) => {
      closeEmergency();
      update(id, { state: 'loading', safety: undefined });
      open();
      void run(id, question);
    },
    [open, run],
  );

  const holdBack = useCallback(
    (id: string, question: string, mode: EmergencyMode) =>
      openEmergency({ mode, onAskAnyway: mode === 'emergency' ? () => askAnyway(id, question) : undefined }),
    [askAnyway],
  );

  // Every way of asking comes through here. The safety check runs before anything else,
  // busy included, so an emergency typed during another answer is never dropped.
  const submit = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question) return;
      const id = newId();
      const askedAt = Date.now();
      const mode = checkSafety(question);
      if (mode) {
        setTurns((all) => [...all, { id, question, askedAt, state: 'safety', safety: mode }]);
        // The chat stays closed: opened now, it would land on top of the sheet.
        holdBack(id, question, mode);
        return;
      }
      if (busy) return;
      setTurns((all) => [...all, { id, question, askedAt, state: 'loading' }]);
      open();
      void run(id, question);
    },
    [busy, holdBack, open, run],
  );

  const showSafety = useCallback(
    (id: string) => {
      const turn = turns.find((t) => t.id === id);
      if (turn?.safety) holdBack(id, turn.question, turn.safety);
    },
    [holdBack, turns],
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
    setContactsOpen(false);
    setFocusTick((tick) => tick + 1);
  }, []);

  // The reply moves the chat on at once. A failed rating is noted, never a reason to stop.
  const replyCheckIn = useCallback((id: string, reply: CheckIn, messageId: string | null) => {
    update(id, { checkIn: reply });
    if (!messageId) return;
    sendFeedback(messageId, reply === 'yes' ? RATING_YES : RATING_NO).catch(() => update(id, { feedbackFailed: true }));
  }, []);
  const showContacts = useCallback(() => setContactsOpen(true), []);
  const hideContacts = useCallback(() => setContactsOpen(false), []);
  const focusField = useCallback(() => setFieldTick((tick) => tick + 1), []);

  useEffect(() => {
    sessionStorage.setItem(TURNS_KEY, JSON.stringify(turns.filter((turn) => turn.state === 'done' || turn.state === 'safety')));
  }, [turns]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target);
      if (!shortcut && !slash) return;
      event.preventDefault();
      if (isEmergencyOpen()) return;
      open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo(
    () => ({
      isOpen, focusTick, fieldTick, contactsOpen, turns, busy, open, close, submit, retry, reset,
      replyCheckIn, showContacts, hideContacts, focusField, showSafety,
    }),
    [
      isOpen, focusTick, fieldTick, contactsOpen, turns, busy, open, close, submit, retry, reset,
      replyCheckIn, showContacts, hideContacts, focusField, showSafety,
    ],
  );
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

export function useAsk() {
  const value = useContext(AskContext);
  if (!value) throw new Error('useAsk must be used inside AskProvider');
  return value;
}
