import { useAsk } from './AskProvider';

interface Props {
  questions: string[];
  tone: 'dark' | 'light';
  /** One line that scrolls sideways when it doesn't fit, rather than wrapping. */
  oneRow?: boolean;
}

export default function AskExamples({ questions, tone, oneRow }: Props) {
  const { submit, busy } = useAsk();
  const look = tone === 'dark' ? 'border-off-white/70 bg-night/40 hover:border-off-white' : 'border-ink/40 bg-off-white text-ink hover:border-ink';
  return (
    <ul aria-label="Example questions" className={`flex gap-2 ${oneRow ? 'no-scrollbar overflow-x-auto' : 'flex-wrap'}`}>
      {questions.map((question) => (
        <li key={question} className={oneRow ? 'shrink-0' : undefined}>
          <button
            type="button"
            disabled={busy}
            onClick={() => submit(question)}
            data-ask-example
            className={`border px-3 py-1.5 text-left text-14 font-medium ${look}`}
          >
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
}
