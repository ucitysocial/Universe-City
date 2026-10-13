/**
 * The small drawings of the portal. The founder approved them on October 13, 2026: a black outline on white, the hard
 * shadow of the site's cards, and no color. At most one stands on a screen part, beside a heading or on a moment such
 * as every step done. Each is decoration, so a screen reader skips it.
 */
export type GlyphName = 'hand' | 'clipboard' | 'clock' | 'star' | 'check' | 'moon' | 'door' | 'speech';

const W = '#fffaf5';
const K = '#140a0c';
const line = { stroke: K, strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const DRAW: Record<GlyphName, JSX.Element> = {
  hand: <path d="M15 26V13a2.5 2.5 0 015 0v11M20 23V9a2.5 2.5 0 015 0v14M25 23V11a2.5 2.5 0 015 0v13M30 24v-8a2.5 2.5 0 015 0v13c0 8-5 13-12 13h-1c-5 0-8-3-10-7l-5-9a2.5 2.5 0 014-3l4 4" fill={W} {...line} />,
  clipboard: <>
    <rect x="11" y="9" width="26" height="33" rx="2" fill={W} {...line} />
    <rect x="18" y="5" width="12" height="8" rx="1.5" fill={K} />
    <path d="M16 21l2.5 2.5 4-4.5M26 21h6M16 30l2.5 2.5 4-4.5M26 30h6" fill="none" {...line} strokeWidth={2.2} />
  </>,
  clock: <>
    <circle cx="24" cy="25" r="16" fill={W} {...line} />
    <path d="M24 25V15M24 25l7 4" {...line} strokeWidth={3} />
    <path d="M19 5h10" {...line} />
  </>,
  star: <path d="M24 4l6 12.8 14 1.8-10.3 9.7 2.7 13.9L24 35.4l-12.4 6.8 2.7-13.9L4 18.6l14-1.8z" fill={W} {...line} />,
  check: <>
    <circle cx="24" cy="24" r="17" fill={K} />
    <path d="M16 24.5l5.5 5.5L33 18" fill="none" {...line} stroke={W} strokeWidth={3.5} />
  </>,
  moon: <>
    <path d="M30 7a17 17 0 1011 24A14 14 0 0130 7z" fill={W} {...line} />
    <path d="M37 11l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill={K} />
  </>,
  door: <>
    <path d="M12 42V8h20v34" fill={W} {...line} />
    <path d="M8 42h32" {...line} />
    <circle cx="27" cy="26" r="1.8" fill={K} />
    <path d="M36 20l4 4-4 4M32 24h8" fill="none" {...line} />
  </>,
  speech: <>
    <path d="M8 11h32v22H22l-8 7v-7H8z" fill={W} {...line} />
    <circle cx="17" cy="22" r="2" fill={K} /><circle cx="24" cy="22" r="2" fill={K} /><circle cx="31" cy="22" r="2" fill={K} />
  </>
};

export default function PilotGlyph({ name, size = 28, className }: { name: GlyphName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className ? `glyph ${className}` : 'glyph'} aria-hidden="true" focusable="false">
      {DRAW[name]}
    </svg>
  );
}
