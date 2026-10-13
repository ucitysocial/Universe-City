'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ACTIVE_KEY, type Active } from '@/components/PilotGuided';

/**
 * While a Guided Life session is open and the resident is on another page, this bar sits at the top of the center of
 * the frame. It names the entry and the step, and leads back to the session. Its place in the steps is kept.
 */
export default function PilotGuidedBar() {
  const path = usePathname() || '';
  const [a, setA] = useState<Active | null>(null);
  useEffect(() => {
    const load = () => { try { setA(JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null')); } catch { setA(null); } };
    load();
    window.addEventListener('uc:gl', load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener('uc:gl', load); window.removeEventListener('storage', load); };
  }, [path]);
  if (!a || path.startsWith('/portal/guided')) return null;
  const stop = () => { try { localStorage.removeItem(ACTIVE_KEY); } catch { /* the bar stays until the page reloads */ } setA(null); };
  return (
    <div className="gl-strip" role="status">
      <span className={a.paused ? 'gl-dot p' : 'gl-dot'} aria-hidden="true" />
      <span className="gl-strip-t"><b>{a.label}</b> {a.paused ? 'Paused at' : 'On'} step {Math.min(a.i + 1, a.n)} of {a.n}: {a.step}</span>
      <Link href={a.href} className="gl-strip-go">Go back to {a.label.toLowerCase()}</Link>
      <button type="button" className="gl-strip-x" onClick={stop} aria-label="Close Guided Life">×</button>
    </div>
  );
}
