'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Moving between pages of the Resident Portal. The page on screen stays until the next one is ready. Meanwhile a thin
 * bar in the department colors runs along the top of the screen and the page dims a little. The next page fades in.
 * A press that opens the calendar window, a link to another site, and a press with a modifier key are left alone.
 */
export default function PilotNav() {
  const path = usePathname();
  const query = useSearchParams();
  useEffect(() => { document.documentElement.classList.remove('uc-nav'); }, [path, query]);
  useEffect(() => {
    let stop: ReturnType<typeof setTimeout> | null = null;
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.closest('[data-pop]')) return;
      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      document.documentElement.classList.add('uc-nav');
      if (stop) clearTimeout(stop);
      stop = setTimeout(() => document.documentElement.classList.remove('uc-nav'), 15000);
    };
    document.addEventListener('click', click);
    return () => { document.removeEventListener('click', click); if (stop) clearTimeout(stop); };
  }, []);
  return null;
}
