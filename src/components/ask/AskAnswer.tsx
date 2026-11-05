import type { ReactNode } from 'react';
import site from '../../data/site.json';
import type { AskResponse, AskSource } from '../../lib/askSrm';
import AskFeedback from './AskFeedback';
import type { Turn } from './AskProvider';
import { useAsk } from './AskProvider';

const isHttps = (url: string) => url.startsWith('https://');

function verifiedDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Bold and citation markers. A marker with no returned source is dropped, not shown broken. */
function inline(text: string, sources: AskSource[]): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\s*\[S\d+\])/).map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const marker = part.match(/^\s*\[(S\d+)\]$/);
    if (!marker) return part;
    const index = sources.findIndex((source) => source.source_id === marker[1]);
    if (index < 0) return null;
    const source = sources[index];
    const label = `Source ${index + 1}: ${source.title}, opens in a new tab`;
    return (
      <sup key={i} className="ml-0.5 text-14 leading-none font-semibold">
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
        <h4 key={blocks.length} className="mt-2 text-17 font-bold">{inline(heading[1], sources)}</h4>
      ) : (
        <p key={blocks.length}>{inline(line, sources)}</p>
      ),
    );
  }
  flush();
  return <div className="grid gap-3 text-17">{blocks}</div>;
}

function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-l-4 border-amber bg-off-white px-4 py-3">
      <p className="text-17 font-bold">{title}</p>
      {children && <div className="mt-1 text-17">{children}</div>}
    </div>
  );
}

function Sources({ sources }: { sources: AskSource[] }) {
  return (
    <div className="mt-5 border-t border-ink/15 pt-4">
      <h4 className="eyebrow">Sources</h4>
      <ol className="mt-2 grid gap-2">
        {sources.map((source, i) => {
          const verified = verifiedDate(source.last_verified_at);
          const meta = [source.academic_year, verified && `verified ${verified}`].filter(Boolean).join(' · ');
          return (
            <li key={source.source_id} className="grid grid-cols-[1.5rem_1fr] text-14">
              <span aria-hidden className="font-semibold">{i + 1}</span>
              <span className="min-w-0">
                {isHttps(source.url) ? (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold break-words text-srm-blue underline underline-offset-2">
                    {source.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="font-semibold">{source.title}</span>
                )}
                {meta && <span className="block text-ink/70">{meta}</span>}
              </span>
            </li>
          );
        })}
      </ol>
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
          <div className="mt-4"><Formatted text={answer} sources={sources} /></div>
          <Sources sources={sources} />
        </>
      );
    case 'needs_clarification':
      return (
        <>
          <p className="eyebrow mb-2">One thing to check</p>
          <Formatted text={answer} sources={[]} />
        </>
      );
    case 'out_of_scope':
      return <Notice title="Ask SRM only covers public information about SRM Kattankulathur." />;
    default:
      return (
        <>
          <Notice title="I couldn't confirm this from an official SRM page" />
          {answer.trim() && <div className="mt-4 text-ink/70"><Formatted text={answer} sources={[]} /></div>}
        </>
      );
  }
}

function Skeleton() {
  return (
    <div role="status" className="grid gap-3" data-ask-loading>
      <span className="sr-only">Searching SRM pages</span>
      {['w-full', 'w-11/12', 'w-3/4'].map((width) => (
        <div key={width} aria-hidden className={`h-4 animate-pulse bg-ink/10 ${width}`} />
      ))}
    </div>
  );
}

export default function AskAnswer({ turn }: { turn: Turn }) {
  const { retry, busy } = useAsk();
  return (
    <article data-ask-turn data-status={turn.response?.status ?? turn.state}>
      <h3 className="font-display text-22 font-bold break-words">{turn.question}</h3>
      <div className="mt-4">
        {turn.state === 'loading' && <Skeleton />}
        {turn.state === 'error' && turn.error && (
          <Notice title={turn.error.message}>
            {turn.error.kind !== 'invalid' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => retry(turn.id)}
                className="mt-2 border-2 border-ink px-4 py-1.5 text-14 font-bold hover:bg-ink hover:text-off-white"
              >
                Try again
              </button>
            )}
          </Notice>
        )}
        {turn.state === 'done' && turn.response && (
          <>
            <Result response={turn.response} />
            {turn.response.message_id && <AskFeedback turn={turn} messageId={turn.response.message_id} />}
          </>
        )}
      </div>
    </article>
  );
}
