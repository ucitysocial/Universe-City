'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * On a screen too narrow for the right part of the frame, a star in the top right corner opens the dashboard as a
 * sheet over the page. A dot on the star shows that an item waits. The sheet closes on Escape, on the close button,
 * and when the page changes. The way to log out sits at the bottom of the sheet.
 */
export default function PilotStar({ waiting, children, title = 'Overview' }: { waiting: number; children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '';
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);


  return (
    <>
      <button type="button" className="pt-star" onClick={() => setOpen(o => !o)} aria-expanded={open}
        aria-label={waiting ? `Open the ${title}. ${waiting} pending` : `Open the ${title}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" /></svg>
        {waiting > 0 && <i>{waiting}</i>}
      </button>
      {open && <div className="pt-sheet-back" onClick={() => setOpen(false)} />}
      <div className={open ? 'pt-sheet open' : 'pt-sheet'} role="dialog" aria-label={title} aria-hidden={!open}>
        <div className="pt-sheet-bar">
          <b>{title}</b>
          <button type="button" className="pop-x" onClick={() => setOpen(false)} aria-label={`Close the ${title}`}>×</button>
        </div>
        <div className="pt-sheet-body">{children}</div>
      </div>
    </>
  );
}
