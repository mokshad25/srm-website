import { useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent, RefObject, SyntheticEvent } from 'react';
import { useLocation } from 'react-router-dom';
import seal from '../../assets/srm-seal.png';
import support from '../../data/support.json';
import { health } from '../../lib/askSrm';
import { openEmergency } from '../../lib/emergency';
import { useIntroDone } from '../../lib/intro';
import { finePointer, prefersReduced } from '../../lib/motion';
import { checkSafety } from '../../lib/safety';
import AskAnswer from './AskAnswer';
import { useAsk } from './AskProvider';
import { checkIn, OptionCard, TopicRows } from './ChatOptions';
import TalkToPerson from './TalkToPerson';

const { assistant } = support;
const CLOSE_MS = 250;
const GREET_AFTER_MS = 6000;
const GREET_FOR_MS = 10_000;
const GREETED_KEY = 'srm-support-greeted';
const CARD_GAP = 12;
const CARD_IN_CORNER = '(min-width: 64rem)';
const NEAR_END = 48;

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

function greeted() {
  try {
    if (sessionStorage.getItem(GREETED_KEY)) return true;
    sessionStorage.setItem(GREETED_KEY, '1');
  } catch {
    /* Storage blocked: it may greet again on the next load. */
  }
  return false;
}

/**
 * Rides above the Home hero's map card, which shares the corner on wide screens, then settles back
 * as it scrolls away. On phones that card spans the width with its text on the left, and rising
 * from there would land on Apply Now, so the launcher stays put.
 */
function useClearCard(launcher: RefObject<HTMLDivElement | null>) {
  const { pathname } = useLocation();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const measure = () => {
      const element = launcher.current;
      const card = [...document.querySelectorAll<HTMLElement>('[data-hero-explored]')].find((c) => c.offsetParent);
      if (!element || !card || !window.matchMedia(CARD_IN_CORNER).matches) return setLift(0);
      const box = element.getBoundingClientRect();
      const rest = box.bottom + lift;
      const space = card.getBoundingClientRect();
      const inCorner = space.right > box.left && space.bottom > rest - box.height && space.top < rest;
      setLift(inCorner ? Math.max(0, rest - space.top + CARD_GAP) : 0);
    };
    measure();
    // The card arrives with a lazy page, after this first measure.
    const late = window.setTimeout(measure, 800);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(late);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [launcher, lift, pathname]);

  return lift;
}

function Launcher() {
  const { isOpen, open } = useAsk();
  const ready = useIntroDone();
  const [greeting, setGreeting] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const lift = useClearCard(root);

  useEffect(() => {
    if (!ready) return;
    let hide = 0;
    const show = window.setTimeout(() => {
      if (greeted()) return;
      setGreeting(true);
      hide = window.setTimeout(() => setGreeting(false), GREET_FOR_MS);
    }, GREET_AFTER_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [ready]);

  if (!ready || isOpen) return null;
  return (
    <div ref={root} style={{ transform: lift ? `translateY(${-lift}px)` : undefined }} className="fixed right-4 bottom-4 z-30 flex items-center gap-3 sm:right-6 sm:bottom-6">
      {greeting && (
        <button type="button" onClick={open} data-chat-greeting className="on-light rounded-full rounded-br-md bg-white px-4 py-2.5 text-14 font-semibold text-ink shadow-lg">
          {assistant.launcherGreeting}
        </button>
      )}
      <button
        type="button"
        onClick={open}
        data-chat-launcher
        aria-label={`Open ${assistant.title} chat`}
        className="inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-srm-blue text-off-white shadow-lg transition-colors duration-200 hover:bg-ink"
      >
        <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12Z" />
        </svg>
      </button>
    </div>
  );
}

function Welcome() {
  return (
    <div className="grid gap-2.5" data-ask-empty>
      <div className="chat-in grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 pr-3">
        <img src={seal} alt="" width={28} height={28} className="mt-0.5 h-7 w-7 rounded-full bg-white" />
        <p className="min-w-0 rounded-2xl rounded-tl-md border border-ink/10 bg-white px-3.5 py-2.5 text-14">{assistant.greeting}</p>
      </div>
      <div className="pl-9">
        <OptionCard label={checkIn.topicsLabel}><TopicRows /></OptionCard>
      </div>
    </div>
  );
}

const iconButton = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-off-white hover:bg-off-white/15 focus-visible:outline-amber';

export default function ChatWidget() {
  const { isOpen, focusTick, fieldTick, contactsOpen, turns, busy, close, submit, reset, showContacts, hideContacts } = useAsk();
  const { online, healthy } = useConnection(isOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLLIElement>(null);
  const [value, setValue] = useState('');
  const [closing, setClosing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);

  const checkMore = () => {
    const box = scroller.current;
    setMore(!!box && box.scrollHeight - box.scrollTop - box.clientHeight > NEAR_END);
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen) {
      setClosing(false);
      if (!element.open) element.showModal();
      return;
    }
    if (!element.open) return;
    setClosing(true);
    setMenu(false);
    const timer = setTimeout(() => {
      element.close();
      setClosing(false);
    }, prefersReduced() ? 0 : CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // On a touch screen, focusing here would raise the keyboard over the topic chips.
  useEffect(() => {
    if (isOpen && finePointer()) input.current?.focus();
  }, [isOpen, focusTick]);

  useEffect(() => {
    if (fieldTick) input.current?.focus();
  }, [fieldTick]);

  const latest = turns.at(-1);

  useEffect(() => {
    if (scroller.current && last.current) scroller.current.scrollTop = last.current.offsetTop - 16;
  }, [turns.length, latest?.state]);

  // The reply and what follows it land under the answer, so the view moves down to them.
  useEffect(() => {
    if (!latest?.checkIn) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }, [latest?.checkIn]);

  // The contacts open from the top, not wherever the chat was. Going back returns to the latest message.
  useEffect(() => {
    const box = scroller.current;
    if (box) box.scrollTop = contactsOpen ? 0 : box.scrollHeight;
  }, [contactsOpen]);

  // New content can arrive below the fold without a scroll, so the cue is checked after each change.
  useEffect(checkMore, [turns, contactsOpen, isOpen]);

  const toLatest = () => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: prefersReduced() ? 'auto' : 'smooth' });

  // A failed question returns to the field, so it can be edited or sent again.
  useEffect(() => {
    if (latest?.state === 'error') setValue((current) => current || latest.question);
    if (latest?.state === 'done') setValue((current) => (current === latest.question ? '' : current));
  }, [latest?.state, latest?.question]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // While an answer loads, ordinary text stays in the field. A safety match never waits.
    if (!value.trim() || (busy && !checkSafety(value))) return;
    submit(value);
    setValue('');
  };

  const onCancel = (event: SyntheticEvent) => {
    event.preventDefault();
    if (menu) setMenu(false);
    else close();
  };

  // A click whose target is the dialog itself landed on the backdrop.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) close();
    else if (menu) setMenu(false);
  };

  const onClosePanel = () => {
    setValue('');
    close();
  };

  const clarifying = latest?.response?.status === 'needs_clarification';
  const fieldLabel = clarifying ? 'Your reply' : 'Ask a question';
  const placeholder = clarifying ? 'Type your reply' : 'Type your question';
  const menuItem = 'flex min-h-11 w-full items-center px-4 text-left text-14 font-semibold hover:bg-off-white disabled:opacity-50';

  return (
    <>
      <Launcher />
      <dialog
        ref={dialog}
        role="dialog"
        aria-labelledby="chat-title"
        aria-describedby="chat-subtitle"
        data-ask-panel
        data-lock-scroll
        data-closing={closing || undefined}
        onCancel={onCancel}
        onClose={close}
        onClick={onClick}
        className="support-panel on-light fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-white p-0 text-ink backdrop:bg-transparent sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[640px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-3xl sm:border sm:border-ink/10 sm:shadow-2xl"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="relative z-10 flex items-center gap-1 bg-srm-blue px-3 py-2.5 text-off-white">
            <img src={seal} alt="" width={40} height={40} className="mr-1.5 h-10 w-10 shrink-0 rounded-full bg-white p-0.5" />
            <div className="min-w-0 flex-1">
              <h2 id="chat-title" className="text-17 leading-tight font-bold">{assistant.title}</h2>
              <p id="chat-subtitle" className="truncate text-12 text-off-white/80">{assistant.subtitle}</p>
            </div>
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menu}
              data-chat-menu
              onClick={(event) => {
                event.stopPropagation();
                setMenu(!menu);
              }}
              className={iconButton}
            >
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
            </button>
            <button type="button" aria-label="Minimise" data-chat-minimise onClick={close} className={iconButton}>
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
            </button>
            <button type="button" aria-label="Close" data-chat-close onClick={onClosePanel} className={iconButton}>
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            {menu && (
              <div role="menu" aria-label="Chat options" className="absolute top-full right-3 z-10 mt-1 w-52 overflow-hidden rounded-2xl border border-ink/10 bg-white py-1 text-ink shadow-lg">
                <button type="button" role="menuitem" data-chat-menu-emergency onClick={() => openEmergency()} className={`${menuItem} text-danger`}>
                  Emergency help
                </button>
                <button type="button" role="menuitem" onClick={showContacts} className={menuItem}>Talk to a person</button>
                <button type="button" role="menuitem" disabled={busy} onClick={reset} className={menuItem}>Start new chat</button>
              </div>
            )}
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col bg-off-white">
          <div ref={scroller} onScroll={checkMore} data-chat-scroller className="relative min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-3 py-3">
            {contactsOpen ? (
              <TalkToPerson onBack={hideContacts} />
            ) : (
              <>
                {(!online || !healthy) && (
                  <p className="mb-3 rounded-2xl border-l-4 border-amber bg-white px-3 py-2 text-14 font-bold" role="status" data-ask-connection>
                    {online ? "The assistant isn't available right now. Please try again shortly." : "You're offline. Reconnect to ask a question."}
                  </p>
                )}
                {turns.length === 0 && <Welcome />}
                <ol aria-live="polite" aria-busy={busy} className="grid gap-5">
                  {turns.map((turn, i) => (
                    <li key={turn.id} ref={i === turns.length - 1 ? last : undefined}>
                      <AskAnswer turn={turn} latest={i === turns.length - 1} />
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>

          {more && (
            <button
              type="button"
              onClick={toLatest}
              data-chat-more
              className="absolute bottom-3 left-1/2 inline-flex min-h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink px-3.5 text-12 font-bold text-off-white shadow-lg hover:bg-srm-blue"
            >
              More below
              <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-6-6 6 6 6-6" /></svg>
            </button>
          )}
          </div>

          <div className="border-t border-ink/10 bg-white px-3 pt-2.5 pb-2">
            <form onSubmit={onSubmit}>
              <label htmlFor="ask-panel-input" className="sr-only">{fieldLabel}</label>
              <div className="flex items-center gap-2">
                <input
                  id="ask-panel-input"
                  ref={input}
                  data-ask-input
                  type="text"
                  value={value}
                  maxLength={2000}
                  autoComplete="off"
                  placeholder={placeholder}
                  onChange={(event) => setValue(event.target.value)}
                  className="min-h-11 min-w-0 flex-1 rounded-full border border-ink/20 bg-off-white px-4 text-14 placeholder:text-ink/70 focus:border-srm-blue focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!value.trim()}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-srm-blue text-off-white transition-colors duration-150 hover:bg-ink disabled:bg-ink/15 disabled:text-ink/50"
                >
                  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
                </button>
              </div>
            </form>
            <p className="mt-1.5 text-center text-12 text-ink/70">{assistant.disclaimer}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
