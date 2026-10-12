'use client';

import { useLayoutEffect } from 'react';

const KEY = 'uc:side-w';
const MIN = 320;
const max = () => Math.min(760, Math.round(window.innerWidth * 0.5));

/**
 * The left edge of the overview can be dragged to make it wider or narrower. The width is kept in this browser. A
 * double press on the edge puts the width back.
 */
export default function PilotSideResize() {
  useLayoutEffect(() => {
    try {
      const w = Number(localStorage.getItem(KEY));
      if (w >= MIN) document.documentElement.style.setProperty('--side-w', `${Math.min(w, max())}px`);
    } catch { /* the usual width */ }
  }, []);

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    document.documentElement.classList.add('uc-resizing');
    let w = 0;
    const move = (ev: PointerEvent) => {
      w = Math.max(MIN, Math.min(max(), window.innerWidth - ev.clientX));
      document.documentElement.style.setProperty('--side-w', `${w}px`);
    };
    const end = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', end);
      document.documentElement.classList.remove('uc-resizing');
      try { if (w) localStorage.setItem(KEY, String(w)); } catch { /* kept until the page reloads */ }
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  };
  const reset = () => {
    document.documentElement.style.removeProperty('--side-w');
    try { localStorage.removeItem(KEY); } catch { /* nothing kept */ }
  };
  const key = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const now = document.querySelector('.os-side')?.getBoundingClientRect().width || 400;
    const w = Math.max(MIN, Math.min(max(), now + (e.key === 'ArrowLeft' ? 24 : -24)));
    document.documentElement.style.setProperty('--side-w', `${w}px`);
    try { localStorage.setItem(KEY, String(w)); } catch { /* kept until the page reloads */ }
  };

  return (
    <div className="side-grip" role="separator" aria-orientation="vertical" aria-label="Width of the overview. Drag, or use the left and right arrow keys."
      tabIndex={0} onPointerDown={start} onDoubleClick={reset} onKeyDown={key} />
  );
}
