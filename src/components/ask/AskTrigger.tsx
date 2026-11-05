import { useAsk } from './AskProvider';

interface Props {
  tone: 'dark' | 'light';
  tabIndex?: number;
}

export const SearchIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.25">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

/** Header entry to the panel. The shortcuts themselves live in AskProvider. */
export default function AskTrigger({ tone, tabIndex }: Props) {
  const { open } = useAsk();
  const border = tone === 'dark' ? 'border-off-white hover:bg-off-white hover:text-ink' : 'border-ink hover:bg-ink hover:text-off-white';
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={open}
      aria-label="Ask SRM"
      aria-keyshortcuts="/ Control+K Meta+K"
      title="Ask SRM (press /)"
      className={`inline-flex items-center gap-2 border px-3 py-2 text-14 font-semibold ${border}`}
    >
      <SearchIcon />
      <span className="hidden sm:inline xl:hidden 2xl:inline">Ask SRM</span>
    </button>
  );
}
