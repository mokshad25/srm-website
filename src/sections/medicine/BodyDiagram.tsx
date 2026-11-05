const hot = 'var(--color-amber)';

interface Props {
  active: number;
  onPick: (i: number) => void;
  label: string;
}

/** Ported from the design. Layers are ordered as in data/medicine.json systems. */
const layers = [
  <g stroke={hot} strokeWidth="1.6" key="nervous">
    <ellipse cx="120" cy="48" rx="24" ry="20" strokeWidth="2" />
    <path d="M108 40c6 4 18 4 24 0M106 52c8 4 20 4 28 0" />
    <path d="M120 70v220M120 130l-50 50-12 60M120 130l50 50 12 60M120 290l-18 200M120 290l18 200M120 160l-30 10M120 160l30 10M120 200l-26 10M120 200l26 10" />
  </g>,
  <g stroke={hot} key="cardio">
    <path d="M128 146c8-10 24-4 20 10-3 12-20 22-24 26-6-6-20-14-22-26-2-12 12-18 20-10" fill={hot} fillOpacity=".35" strokeWidth="2" />
    <path d="M126 140V110M126 186l-6 110-14 190M126 186l6 110 14 190M118 150l-44 40-16 90M136 150l44 40 16 90" strokeWidth="1.6" strokeDasharray="4 4" />
  </g>,
  <g stroke={hot} strokeWidth="2" key="resp">
    <path d="M120 96v38M120 134l-10 10M120 134l10 10" />
    <path d="M108 142c-18 4-30 26-30 58 0 18 10 24 22 20 10-4 12-16 12-30z" fill={hot} fillOpacity=".25" />
    <path d="M132 142c18 4 30 26 30 58 0 18-10 24-22 20-10-4-12-16-12-30z" fill={hot} fillOpacity=".25" />
  </g>,
  <g stroke={hot} strokeWidth="2" key="skeletal">
    <ellipse cx="120" cy="50" rx="22" ry="24" />
    <path d="M120 92v190" />
    <path d="M100 144c10 6 30 6 40 0M96 160c12 7 36 7 48 0M96 176c12 7 36 7 48 0M98 192c12 6 32 6 44 0M88 118h64" />
    <path d="M96 270c8 16 40 16 48 0l4 20H92z" />
    <path d="M88 118l-14 70-14 90M152 118l14 70 14 90M104 290l-6 100-4 96M136 290l6 100 4 96" />
    <circle cx="98" cy="392" r="4" />
    <circle cx="142" cy="392" r="4" />
  </g>,
  <g stroke={hot} strokeWidth="1.6" fill={hot} fillOpacity=".18" key="muscular">
    <path d="M98 116c-4 14 0 30 20 34v-30zM142 116c4 14 0 30-20 34v-30z" />
    <ellipse cx="78" cy="168" rx="10" ry="26" />
    <ellipse cx="162" cy="168" rx="10" ry="26" />
    <path d="M108 160h24v70h-24z" />
    <ellipse cx="104" cy="340" rx="13" ry="44" />
    <ellipse cx="136" cy="340" rx="13" ry="44" />
    <ellipse cx="100" cy="436" rx="9" ry="30" />
    <ellipse cx="140" cy="436" rx="9" ry="30" />
  </g>,
  <g stroke={hot} strokeWidth="2" key="digestive">
    <path d="M120 92v100" />
    <path d="M120 192c18-6 30 4 26 18-4 12-20 14-30 8" fill={hot} fillOpacity=".3" />
    <path d="M96 232h52c6 0 6 10 0 10h-48c-6 0-6 10 0 10h48c6 0 6 10 0 10h-48c-6 0-6 10 0 10h44" strokeWidth="1.8" />
    <path d="M92 228v52h58v-52" strokeDasharray="3 4" />
  </g>,
];

export default function BodyDiagram({ active, onPick, label }: Props) {
  return (
    <svg viewBox="0 0 240 520" fill="none" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-[300px] overflow-visible">
      <path
        d="M120 18c20 0 34 15 34 36s-14 38-34 38-34-17-34-38 14-36 34-36z M106 92h28l2 14c26 4 44 12 52 26l22 92c3 12-2 20-10 22l-14-82-8 4 4 92-10 6 6 120c1 20-6 98-10 112h-26l-6-150h-6l-6 150H98c-4-14-11-92-10-112l6-120-10-6 4-92-8-4-14 82c-8-2-13-10-10-22l22-92c8-14 26-22 52-26z"
        stroke="var(--color-off-white)"
        strokeOpacity=".55"
        strokeWidth="1.5"
      />
      {layers.map((layer, i) => (
        <g
          key={layer.key}
          data-system={i}
          onClick={() => onPick(i)}
          className="cursor-pointer transition-opacity duration-300"
          style={{ opacity: i === active ? 1 : 0.12, pointerEvents: 'visiblePainted' }}
        >
          {layer}
        </g>
      ))}
    </svg>
  );
}
