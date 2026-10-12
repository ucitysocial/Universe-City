'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const TITLE: [RegExp, string][] = [
  [/^\/portal\/home/, 'Conversation'],
  [/^\/portal\/file/, 'My File'],
  [/^\/portal\/search/, 'Search'],
  [/^\/portal\/settings/, 'Settings']
];

const stamp = (zone: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      .format(new Date()).replace(' at ', ', ');
  } catch {
    return new Date().toLocaleString('en-US');
  }
};

/**
 * The bar at the top of the center of the frame, the same on every page: where the resident is, and the date and
 * time in the resident's time zone. The time moves on each minute.
 */
export default function PilotTopBar({ zone, waiting }: { zone: string; waiting: number }) {
  const path = usePathname() || '';
  const title = TITLE.find(([r]) => r.test(path))?.[1] ?? 'Resident Portal';
  const [now, setNow] = useState('');
  // While the overview is folded, its star sits at the end of this bar, and the center reaches the right edge.
  const openSide = () => {
    document.documentElement.classList.remove('uc-side-off');
    try { localStorage.setItem('uc:side', 'on'); } catch { /* kept until the page reloads */ }
  };
  useEffect(() => {
    setNow(stamp(zone));
    const t = setInterval(() => setNow(stamp(zone)), 15_000);
    return () => clearInterval(t);
  }, [zone]);
  return (
    <div className="topbar">
      <span className="topbar-t">{title}</span>
      <span className="topbar-n" suppressHydrationWarning>{now}</span>
      <button type="button" className="topbar-star" onClick={openSide} aria-label={waiting ? `Open the overview. ${waiting} pending` : 'Open the overview'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" /></svg>
        {waiting > 0 && <i>{waiting}</i>}
      </button>
    </div>
  );
}
