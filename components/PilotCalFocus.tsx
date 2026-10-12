'use client';

import { useEffect } from 'react';

/**
 * Two small jobs for the calendar on screen.
 *
 * It fits each name to its block. A block is exactly as tall as the time on file, so a short entry has little
 * room. When the name and the time do not fit, the time line is left out first, because the place of the block
 * already shows the time. Then the name is shortened to its first whole words, with three dots after them.
 * The whole name, the time, and the folder are in the entry, which opens when the block is pressed.
 *
 * It opens the day at the morning. The calendar runs from midnight, so the page starts one hour before the first
 * entry, and no later than 6:00 AM. On a narrow screen a week scrolls sideways, and today is brought into view.
 */
export default function PilotCalFocus({ on }: { on: string }) {
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>('.fb-pane');
    const grid = pane?.querySelector<HTMLElement>('.cal');
    if (!pane || !grid) return;

    const fit = () => {
      for (const block of Array.from(grid.querySelectorAll<HTMLElement>('.cal-block'))) {
        const text = block.querySelector<HTMLElement>('.cal-text');
        const name = text?.querySelector<HTMLElement>('b');
        const time = text?.querySelector<HTMLElement>('.cal-time');
        if (!text || !name) continue;
        const whole = block.dataset.name || name.textContent || '';
        const over = () => text.scrollHeight > text.clientHeight || name.scrollWidth > name.clientWidth + 1;
        name.textContent = whole;
        name.hidden = false;
        if (time) time.hidden = false;
        if (!over()) continue;
        if (time) time.hidden = true;
        const words = whole.split(/\s+/);
        for (let n = words.length - 1; n >= 1 && over(); n--) name.textContent = `${words.slice(0, n).join(' ')} ...`;
        // A strip too short for one word shows its color alone. Pressing it opens the entry.
        if (over()) name.textContent = '';
      }
    };
    fit();
    // The page font can arrive after the first fit, and the frame can change width.
    void document.fonts?.ready.then(fit);
    const watch = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    watch?.observe(grid);

    const side = grid.closest<HTMLElement>('.cal-scroll');
    const today = grid.querySelector<HTMLElement>('.cal-head.today');
    if (side && today && side.scrollWidth > side.clientWidth) {
      // The first column holds the hours, so today is placed just after it.
      const gutter = grid.querySelector<HTMLElement>('.cal-gutter')?.offsetWidth ?? 50;
      side.scrollLeft = Math.max(0, today.getBoundingClientRect().left - side.getBoundingClientRect().left + side.scrollLeft - gutter);
    }
    // The day starts at midnight. With larger hours the calendar scrolls inside its own frame, under day headings
    // that stay in place, and opens one hour before the first entry and no later than 6:00 AM. With the whole day
    // fitted, every hour is already on screen.
    const place = () => {
      if (!side) return;
      if (grid.classList.contains('fit')) { side.style.maxHeight = ''; return; }
      const room = pane.getBoundingClientRect().bottom - side.getBoundingClientRect().top - 44;
      side.style.maxHeight = `${Math.max(320, Math.floor(room))}px`;
      const gutter = grid.querySelector<HTMLElement>('.cal-gutter');
      const head = grid.querySelector<HTMLElement>('.cal-head, .cal-side');
      const h = parseFloat(getComputedStyle(grid).getPropertyValue('--h')) || 60;
      if (!gutter) return;
      const g = gutter.getBoundingClientRect().top;
      const firstMin = Math.min(7 * 60, ...Array.from(grid.querySelectorAll<HTMLElement>('.cal-block')).map(b => ((b.getBoundingClientRect().top - g) / h) * 60));
      const startMin = Math.max(0, Math.min(6 * 60, firstMin - 60));
      const headH = grid.querySelector<HTMLElement>('.cal-head')?.offsetHeight ?? 0;
      grid.style.setProperty('--head-h', `${headH}px`);
      const sticky = headH + (grid.querySelector<HTMLElement>('.cal-side')?.offsetHeight ?? 0);
      side.scrollTop = g - side.getBoundingClientRect().top + side.scrollTop + (startMin / 60) * h - sticky - (head && head.classList.contains('cal-side') ? 0 : 0);
    };
    place();
    window.addEventListener('uc:calzoom', place);
    return () => { watch?.disconnect(); window.removeEventListener('uc:calzoom', place); };
  }, [on]);
  return null;
}
