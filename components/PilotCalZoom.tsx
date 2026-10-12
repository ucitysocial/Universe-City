'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'uc:calfit';

/**
 * Two ways to see the hours of a day or a week. Fit the whole day sets the height of an hour so every hour on
 * the calendar is on screen at once. Show larger hours puts back the usual height, where the calendar scrolls.
 * The choice is kept in this browser only.
 */
export default function PilotCalZoom() {
  const [fit, setFit] = useState(false);

  const apply = useCallback((on: boolean) => {
    const grid = document.querySelector<HTMLElement>('.cal');
    const pane = document.querySelector<HTMLElement>('.fb-pane');
    const bar = document.querySelector<HTMLElement>('.cal-bar');
    const gutter = grid?.querySelector<HTMLElement>('.cal-gutter');
    if (!grid || !pane || !bar || !gutter) return;
    grid.classList.toggle('fit', on);
    if (!on) { grid.style.removeProperty('--h'); window.dispatchEvent(new Event('uc:calzoom')); return; }
    const scroller = grid.closest<HTMLElement>('.cal-scroll');
    if (scroller) scroller.style.maxHeight = '';
    const hours = Number(getComputedStyle(grid).getPropertyValue('--hours')) || 16;
    const above = gutter.getBoundingClientRect().top - bar.getBoundingClientRect().top;
    const h = Math.max(16, Math.floor((pane.clientHeight - above - 48) / hours));
    grid.style.setProperty('--h', `${h}px`);
    window.dispatchEvent(new Event('uc:calzoom'));
    pane.scrollTop = bar.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop - 12;
  }, []);

  useEffect(() => {
    let on = false;
    try { on = localStorage.getItem(KEY) === '1'; } catch { /* the usual height */ }
    setFit(on);
    apply(on);
    const again = () => { try { apply(localStorage.getItem(KEY) === '1'); } catch { /* nothing to do */ } };
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, [apply]);

  const choose = (on: boolean) => {
    setFit(on);
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* kept for this page only */ }
    apply(on);
  };

  return (
    <span className="cal-seg" aria-label="Height of an hour">
      <button type="button" className={fit ? 'on' : undefined} aria-pressed={fit} onClick={() => choose(true)}>Fit the whole day</button>
      <button type="button" className={fit ? undefined : 'on'} aria-pressed={!fit} onClick={() => choose(false)}>Show larger hours</button>
    </span>
  );
}
