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
 * It brings the first entry into view. A day starts at 6:00 AM on the page, and an entry late in the day would sit
 * below the edge of the screen. On a narrow screen a week scrolls sideways, and today is brought into view.
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
    const blocks = Array.from(grid.querySelectorAll<HTMLElement>('.cal-block'));
    const marks = blocks.length ? blocks : Array.from(grid.querySelectorAll<HTMLElement>('.cal-now'));
    if (!marks.length) pane.scrollTop = 0;
    else {
      const top = Math.min(...marks.map(m => m.getBoundingClientRect().top)) - pane.getBoundingClientRect().top + pane.scrollTop;
      pane.scrollTop = top > pane.clientHeight - 90 ? Math.max(0, top - 150) : 0;
    }
    return () => watch?.disconnect();
  }, [on]);
  return null;
}
