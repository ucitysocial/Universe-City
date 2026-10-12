'use client';

import { useEffect, useState } from 'react';

const KEY = 'uc:daymode';

/**
 * Two ways to see one day: Blocks, each entry in its hours, and List, the entries in order of time. A phone opens on
 * List and a computer on Blocks. The choice is kept in this browser.
 */
export default function PilotDayMode() {
  const [mode, setMode] = useState<'blocks' | 'list'>('blocks');
  const apply = (m: 'blocks' | 'list') => {
    setMode(m);
    document.querySelector('.fb-pane')?.classList.toggle('day-list-mode', m === 'list');
    requestAnimationFrame(() => window.dispatchEvent(new Event('uc:refit')));
  };
  useEffect(() => {
    let m: string | null = null;
    try { m = localStorage.getItem(KEY); } catch { /* the usual view */ }
    apply(m === 'list' || m === 'blocks' ? m : window.innerWidth <= 860 ? 'list' : 'blocks');
    return () => { document.querySelector('.fb-pane')?.classList.remove('day-list-mode'); };
  }, []);
  const choose = (m: 'blocks' | 'list') => {
    apply(m);
    try { localStorage.setItem(KEY, m); } catch { /* kept for this page only */ }
  };
  return (
    <span className="cal-seg cal-mode" aria-label="How the day is shown">
      <button type="button" className={mode === 'blocks' ? 'on' : undefined} aria-pressed={mode === 'blocks'} onClick={() => choose('blocks')}>Blocks</button>
      <button type="button" className={mode === 'list' ? 'on' : undefined} aria-pressed={mode === 'list'} onClick={() => choose('list')}>List</button>
    </span>
  );
}
