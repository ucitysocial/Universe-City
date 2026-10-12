'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Keeps the frame the size of the part of the screen that is in view.
 * On a phone the keyboard covers part of the page. The browser reports the part that is left, and the frame is
 * set to it, so the composer sits on top of the keyboard and the messages scroll above it.
 */
export default function PilotViewport() {
  const path = usePathname();

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    let frame = 0;
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--pt-vh', `${Math.round(vv.height)}px`);
        root.style.setProperty('--pt-top', `${Math.round(vv.offsetTop)}px`);
        // A short screen is a phone with its keyboard open. The frame hides its headings to leave room.
        root.classList.toggle('pt-short', vv.height < 520 && vv.width < 861);
      });
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      root.style.removeProperty('--pt-vh');
      root.style.removeProperty('--pt-top');
      root.classList.remove('pt-short');
    };
  }, []);

  // On a narrow screen the path scrolls sideways. It is moved to its end, so the place on screen is the part in view.
  useEffect(() => {
    const el = document.getElementById('uc-path');
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
  }, [path]);

  return null;
}
