const line = 'var(--color-off-white)';
const hot = 'var(--color-amber)';
const label = { fill: line, fontSize: 14, fontFamily: 'DM Sans' } as const;

export function Gears({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 110" fill="none" aria-hidden className={className}>
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'spin-gear 14s linear infinite' }}>
        <circle cx="50" cy="62" r="38" stroke={hot} strokeWidth="10" strokeDasharray="9.95 9.95" />
        <circle cx="50" cy="62" r="26" stroke={hot} strokeWidth="2" />
      </g>
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'spin-gear 9.6s linear infinite reverse' }}>
        <circle cx="113" cy="38" r="26" stroke={line} strokeWidth="8" strokeDasharray="10.2 10.2" />
        <circle cx="113" cy="38" r="16" stroke={line} strokeWidth="2" />
      </g>
    </svg>
  );
}

const figures = {
  drivetrain: (
    <>
      <rect x="30" y="70" width="150" height="80" stroke={line} strokeWidth="2" />
      <path d="M180 95h10v30h-10" stroke={line} strokeWidth="2" />
      <path d="M55 70v80M80 70v80M105 70v80M130 70v80M155 70v80" stroke={line} strokeOpacity=".5" />
      <rect x="34" y="74" width="85" height="72" fill={hot} fillOpacity=".25" />
      <circle cx="300" cy="110" r="52" stroke={line} strokeWidth="2" />
      <circle cx="300" cy="110" r="18" stroke={hot} strokeWidth="2" />
      <path d="M300 62v96M252 110h96M266 76l68 68M334 76l-68 68" stroke={line} strokeOpacity=".6" />
      <path d="M190 110h58" stroke={hot} strokeWidth="3" strokeDasharray="6 10" />
      <text x="30" y="180" {...label}>Cell pack</text>
      <text x="274" y="186" {...label}>Motor</text>
    </>
  ),
  headset: (
    <>
      <path d="M40 200L200 120L360 200M80 200L200 120M120 200L200 120M160 200L200 120M240 200L200 120M280 200L200 120M320 200L200 120" stroke={line} strokeOpacity=".35" />
      <rect x="110" y="40" width="180" height="76" rx="22" stroke={line} strokeWidth="2" />
      <circle cx="165" cy="78" r="22" stroke={hot} strokeWidth="2" />
      <circle cx="235" cy="78" r="22" stroke={hot} strokeWidth="2" />
      <path d="M187 78h26" stroke={line} strokeWidth="2" />
      <path d="M110 70H80M290 70h30" stroke={line} strokeWidth="2" />
    </>
  ),
  layers: (
    <>
      <path d="M200 20l-18 30h36z" stroke={hot} strokeWidth="2" />
      <path d="M200 50v34" stroke={hot} strokeWidth="2" strokeDasharray="4 6" />
      <path d="M120 190h160M124 176h152M128 162h144M132 148h136M136 134h128M140 120h120M144 106h112" stroke={line} strokeWidth="2" />
      <path d="M148 92h104" stroke={hot} strokeWidth="3" />
      <path d="M80 204h240" stroke={line} />
    </>
  ),
  arm: (
    <>
      <rect x="90" y="180" width="80" height="20" stroke={line} strokeWidth="2" />
      <path d="M130 180L150 110L250 70L300 110" stroke={line} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="110" r="9" stroke={hot} strokeWidth="2" fill="var(--color-ink)" />
      <circle cx="250" cy="70" r="9" stroke={hot} strokeWidth="2" fill="var(--color-ink)" />
      <circle cx="130" cy="180" r="9" stroke={hot} strokeWidth="2" fill="var(--color-ink)" />
      <path d="M300 110l14 18M300 110l-6 22" stroke={hot} strokeWidth="3" />
      <path d="M210 200h150" stroke={line} strokeDasharray="10 8" />
      <rect x="320" y="172" width="22" height="22" stroke={line} />
    </>
  ),
  lattice: (
    <>
      <path d="M140 60l26-15 26 15v30l-26 15-26-15zM192 60l26-15 26 15v30l-26 15-26-15zM244 60l26-15 26 15v30l-26 15-26-15zM166 105l26-15 26 15v30l-26 15-26-15zM218 105l26-15 26 15v30l-26 15-26-15zM114 105l26-15 26 15v30l-26 15-26-15zM140 150l26-15 26 15v30l-26 15-26-15zM192 150l26-15 26 15v30l-26 15-26-15zM244 150l26-15 26 15v30l-26 15-26-15z" stroke={line} strokeWidth="1.6" />
      <path d="M218 105l26-15 26 15v30l-26 15-26-15z" fill={hot} fillOpacity=".3" stroke={hot} strokeWidth="2" />
    </>
  ),
  layup: (
    <>
      <path d="M60 50C120 30 180 70 240 50S340 30 360 50M60 90C120 70 180 110 240 90S340 70 360 90M60 130C120 110 180 150 240 130S340 110 360 130M60 170C120 150 180 190 240 170S340 150 360 170" stroke={line} strokeWidth="2" />
      <path d="M100 30v160M160 30v160M220 30v160M280 30v160M340 30v160" stroke={hot} strokeWidth="2" strokeOpacity=".7" />
    </>
  ),
};

export function CentreDiagram({ name, title }: { name: string; title: string }) {
  return (
    <svg viewBox="0 0 400 220" fill="none" role="img" aria-label={title} className="h-auto w-full max-w-[440px]">
      {figures[name as keyof typeof figures]}
    </svg>
  );
}
