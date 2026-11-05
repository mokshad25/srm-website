import { useEffect, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Item {
  id: number;
  text: string;
}

let items: Item[] = [];
let next = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(text: string) {
  items = [...items, { id: next++, text }];
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

function One({ item }: { item: Item }) {
  useEffect(() => {
    const t = setTimeout(() => {
      items = items.filter((x) => x.id !== item.id);
      emit();
    }, 3600);
    return () => clearTimeout(t);
  }, [item.id]);
  return (
    <motion.div
      layout
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="border-l-4 border-amber bg-ink px-4 py-3 text-14 font-semibold text-off-white"
    >
      {item.text}
    </motion.div>
  );
}

/** Sliding notices, announced to screen readers. */
export default function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items);
  return (
    <div role="status" aria-live="polite" className="fixed top-24 right-4 z-50 grid max-w-[320px] gap-2">
      <AnimatePresence>
        {list.map((t) => <One key={t.id} item={t} />)}
      </AnimatePresence>
    </div>
  );
}
