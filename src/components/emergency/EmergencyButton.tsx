import { openEmergency } from '../../lib/emergency';
import { useIntroDone } from '../../lib/intro';

interface Props {
  tabIndex?: number;
}

export default function EmergencyButton({ tabIndex }: Props) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      data-emergency-button
      onClick={() => openEmergency()}
      className="inline-flex min-h-11 shrink-0 items-center bg-danger px-3 text-14 font-bold text-white transition-colors duration-200 hover:bg-ink"
    >
      Emergency
    </button>
  );
}

/** The header is hidden while the Home preloader plays, so this stands in above it. */
export function IntroEmergencyButton() {
  const ready = useIntroDone();
  if (ready) return null;
  return (
    <div data-intro-emergency className="fixed top-4 right-6 z-[70] md:right-14">
      <EmergencyButton />
    </div>
  );
}
