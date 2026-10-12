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
export default function PilotTopBar({ zone }: { zone: string }) {
  const path = usePathname() || '';
  const title = TITLE.find(([r]) => r.test(path))?.[1] ?? 'Resident Portal';
  const [now, setNow] = useState('');
  useEffect(() => {
    setNow(stamp(zone));
    const t = setInterval(() => setNow(stamp(zone)), 15_000);
    return () => clearInterval(t);
  }, [zone]);
  return (
    <div className="topbar">
      <span className="topbar-t">{title}</span>
      <span className="topbar-n" suppressHydrationWarning>{now}</span>
    </div>
  );
}
