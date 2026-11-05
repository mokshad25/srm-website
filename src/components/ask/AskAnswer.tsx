import { useState } from 'react';
import type { ReactNode } from 'react';
import seal from '../../assets/srm-seal.png';
import site from '../../data/site.json';
import support from '../../data/support.json';
import { copy, distressCopy } from '../../lib/emergency';
import type { AskResponse, AskSource } from '../../lib/askSrm';
import { followUps } from '../../lib/followUps';
import { checkIn, OptionCard, OptionRow, TopicRows } from './ChatOptions';
import type { CheckIn, Turn } from './AskProvider';
import { useAsk } from './AskProvider';

const isHttps = (url: string) => url.startsWith('https://');

const clock = (time?: number) => (time ? new Date(time).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : null);

/** Bold and citation markers. A marker with no returned source is dropped, not shown broken. */
function inline(text: string, sources: AskSource[]): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s](?:[^*]*[^*\s])?\*|\s*\[S\d+\])/).map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const soft = part.match(/^\*([^*]+)\*$/);
    if (soft) return <strong key={i} className="font-semibold">{soft[1]}</strong>;
    const marker = part.match(/^\s*\[(S\d+)\]$/);
    if (!marker) return part;
    const index = sources.findIndex((source) => source.source_id === marker[1]);
    if (index < 0) return null;
    const source = sources[index];
    const label = `Source ${index + 1}: ${source.title}, opens in a new tab`;
    return (
      <sup key={i} className="ml-0.5 text-12 leading-none font-semibold">
        {isHttps(source.url) ? (
          <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={label} className="px-0.5 text-srm-blue underline">
            {index + 1}
          </a>
        ) : (
          index + 1
        )}
      </sup>
    );
  });
}

/** The model writes light markdown. It is rendered as elements, never as HTML. */
function Formatted({ text, sources }: { text: string; sources: AskSource[] }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const { ordered, items } = list;
    const Tag = ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag key={blocks.length} className={`grid gap-1 pl-6 ${ordered ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, i) => (
          <li key={i}>{inline(item, sources)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = !bullet;
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flush();
    const heading = line.match(/^#{1,6}\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?$/);
    blocks.push(
      heading ? (
        <h4 key={blocks.length} className="mt-1 text-14 font-bold">{inline(heading[1], sources)}</h4>
      ) : (
        <p key={blocks.length}>{inline(line, sources)}</p>
      ),
    );
  }
  flush();
  return <div className="grid gap-2 text-14">{blocks}</div>;
}

function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-l-4 border-amber pl-3">
      <p className="text-14 font-bold">{title}</p>
      {children && <div className="mt-1 text-14">{children}</div>}
    </div>
  );
}

const action = 'inline-flex min-h-11 items-center rounded-full border border-srm-blue px-4 text-14 font-bold text-srm-blue hover:bg-srm-blue hover:text-off-white disabled:opacity-50';

function Sources({ sources }: { sources: AskSource[] }) {
  return (
    <div className="mt-3 border-t border-ink/10 pt-2">
      <h4 className="text-12 font-semibold text-ink/70">Sources</h4>
      <ul className="mt-1 flex flex-wrap gap-1.5" data-ask-sources>
        {sources.map((source) => {
          const label = [source.title, source.academic_year].filter(Boolean).join(' · ');
          const chip = 'inline-flex min-h-9 max-w-full items-center rounded-full border border-ink/15 bg-off-white px-3 text-12 font-semibold';
          return (
            <li key={source.source_id} className="max-w-full">
              {isHttps(source.url) ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className={`${chip} text-srm-blue hover:border-ink`}>
                  <span className="truncate">{label}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className={chip}><span className="truncate">{label}</span></span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Anything claiming to be an answer without a source is treated as unconfirmed. */
function statusOf({ status, answer, sources }: AskResponse) {
  const claimsAnswer = status === 'answered' || status === 'conflicting';
  return claimsAnswer && (!answer.trim() || sources.length === 0) ? 'unverified' : status;
}

function Result({ response }: { response: AskResponse }) {
  const { answer, sources } = response;
  switch (statusOf(response)) {
    case 'answered':
      return (
        <>
          <Formatted text={answer} sources={sources} />
          <Sources sources={sources} />
        </>
      );
    case 'conflicting':
      return (
        <>
          <Notice title="These sources don't agree">
            Please confirm with the{' '}
            <a href={site.admissionsUrl} target="_blank" rel="noopener noreferrer" className="underline">admissions office</a>.
          </Notice>
          <div className="mt-3"><Formatted text={answer} sources={sources} /></div>
          <Sources sources={sources} />
        </>
      );
    case 'needs_clarification':
      return <Formatted text={answer} sources={[]} />;
    case 'out_of_scope':
      return <Notice title="I can only help with public information about SRM Kattankulathur." />;
    default:
      return (
        <>
          <Notice title="I couldn't confirm this from an official SRM page" />
          {answer.trim() && <div className="mt-3 text-ink/70"><Formatted text={answer} sources={[]} /></div>}
        </>
      );
  }
}

/** Shown in place of an answer. The message stayed on this device. */
function SafetyCard({ turn }: { turn: Turn }) {
  const { showSafety } = useAsk();
  const distress = turn.safety === 'distress';
  return (
    <>
      <p className="text-14">{distress ? distressCopy.message : copy.notSent}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => showSafety(turn.id)} className="inline-flex min-h-11 items-center rounded-full bg-danger px-4 text-14 font-bold text-white hover:bg-ink">
          {distress ? distressCopy.title : copy.title}
        </button>
      </div>
    </>
  );
}

function Typing() {
  return (
    <div role="status" className="flex h-5 items-center gap-1" data-ask-loading>
      <span className="sr-only">Searching SRM pages</span>
      {[0, 1, 2].map((dot) => (
        <span key={dot} aria-hidden className="typing-dot h-2 w-2 rounded-full bg-ink/50" style={{ animationDelay: `${dot * 160}ms` }} />
      ))}
    </div>
  );
}

const Time = ({ at, right }: { at?: number; right?: boolean }) => {
  const label = clock(at);
  return label ? <p className={`mt-1 text-12 text-ink/70 ${right ? 'text-right' : 'pl-1'}`}>{label}</p> : null;
};

const Mine = ({ at, children }: { at?: number; children: ReactNode }) => (
  <div className="chat-in ml-auto max-w-[85%] min-w-0">
    <p className="rounded-2xl rounded-br-md bg-srm-blue px-3.5 py-2 text-14 break-words text-off-white">{children}</p>
    <Time at={at} right />
  </div>
);

const bubble = 'min-w-0 rounded-2xl rounded-tl-md border border-ink/10 bg-white px-3.5 py-2.5 text-14';

/** The seal marks where the assistant's turn starts; replies under it line up with the bubble. */
const Bot = ({ first, children }: { first?: boolean; children: ReactNode }) => (
  <div className="chat-in grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 pr-3">
    {first ? <img src={seal} alt="" width={28} height={28} className="mt-0.5 h-7 w-7 rounded-full bg-white" /> : <span />}
    <div className="min-w-0">{children}</div>
  </div>
);

/** What comes after an answer: a check-in, then somewhere to go next. Only the latest turn offers either. */
function NextSteps({ turn, response, latest }: { turn: Turn; response: AskResponse; latest: boolean }) {
  const { turns, submit, replyCheckIn, showContacts, focusField, busy } = useAsk();
  const [allTopics, setAllTopics] = useState(false);
  const kind = statusOf(response);
  if (kind === 'needs_clarification') return null;

  const confirmed = kind === 'answered' || kind === 'conflicting';
  const reply = (value: CheckIn) => replyCheckIn(turn.id, value, response.message_id);
  const suggestions = followUps(turn.question, response.sources, turns.map((t) => t.question));
  const needsPerson = !confirmed || turn.checkIn === 'no';

  return (
    <>
      {turn.checkIn && (
        <>
          <Mine>{turn.checkIn === 'yes' ? checkIn.yes : checkIn.no}</Mine>
          <Bot>
            <p className={bubble}>{turn.checkIn === 'yes' ? checkIn.afterYes : checkIn.afterNo}</p>
            {turn.feedbackFailed && <p className="mt-1 pl-1 text-12 text-ink/70" role="status">{checkIn.feedbackFailed}</p>}
          </Bot>
        </>
      )}
      {latest && confirmed && !turn.checkIn && (
        <Bot>
          <div className={bubble} data-chat-checkin>
            <p id={`check-in-${turn.id}`}>{checkIn.question}</p>
            <div role="group" aria-labelledby={`check-in-${turn.id}`} className="mt-2 flex gap-2">
              <button type="button" onClick={() => reply('yes')} data-chat-yes className={action}>{checkIn.yes}</button>
              <button type="button" onClick={() => reply('no')} data-chat-no className={action}>{checkIn.no}</button>
            </div>
          </div>
        </Bot>
      )}
      {latest && !confirmed && (
        <Bot><p className={bubble}>{checkIn.notFound}</p></Bot>
      )}
      {latest && (
        <Bot>
          <div data-chat-followups>
            <OptionCard label={allTopics ? checkIn.topicsLabel : checkIn.suggestionsLabel}>
              {allTopics ? (
                <TopicRows />
              ) : (
                <>
                  {suggestions.map((question) => (
                    <OptionRow key={question} disabled={busy} onClick={() => submit(question)} data={{ 'data-chat-followup': true }}>
                      {question}
                    </OptionRow>
                  ))}
                  {!confirmed && <OptionRow onClick={focusField}>{checkIn.rephrase}</OptionRow>}
                  {needsPerson && <OptionRow onClick={showContacts} data={{ 'data-chat-talk': true }}>{support.contacts.title}</OptionRow>}
                  <OptionRow onClick={() => setAllTopics(true)} data={{ 'data-chat-all-topics': true }}>{checkIn.otherTopics}</OptionRow>
                </>
              )}
            </OptionCard>
          </div>
        </Bot>
      )}
    </>
  );
}

export default function AskAnswer({ turn, latest }: { turn: Turn; latest: boolean }) {
  const { retry, busy } = useAsk();
  return (
    <article data-ask-turn data-status={turn.response?.status ?? turn.state} className="grid gap-2.5">
      <Mine at={turn.askedAt}>{turn.question}</Mine>
      <Bot first>
        <div className={bubble}>
          {turn.state === 'loading' && <Typing />}
          {turn.state === 'safety' && <SafetyCard turn={turn} />}
          {turn.state === 'error' && turn.error && (
            <Notice title={turn.error.message}>
              <button type="button" disabled={busy} onClick={() => retry(turn.id)} data-ask-retry className={`mt-2 ${action}`}>
                Retry
              </button>
            </Notice>
          )}
          {turn.state === 'done' && turn.response && <Result response={turn.response} />}
        </div>
        {turn.state !== 'loading' && <Time at={turn.answeredAt ?? turn.askedAt} />}
      </Bot>
      {turn.state === 'done' && turn.response && <NextSteps turn={turn} response={turn.response} latest={latest} />}
    </article>
  );
}
