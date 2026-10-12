'use client';

import { useLayoutEffect, useState } from 'react';

const KEY = 'uc:side';

/**
 * Folds the overview at the right of the frame into a narrow strip, and opens it again. The choice is kept in this
 * browser. While it is folded, the center of the frame takes the room.
 */
export function useSideOff() {
  const [off, setOff] = useState(false);
  useLayoutEffect(() => {
    let v = false;
    try { v = localStorage.getItem(KEY) === 'off'; } catch { /* open */ }
    setOff(v);
    document.documentElement.classList.toggle('uc-side-off', v);
  }, []);
  const set = (v: boolean) => {
    setOff(v);
    document.documentElement.classList.toggle('uc-side-off', v);
    try { localStorage.setItem(KEY, v ? 'off' : 'on'); } catch { /* kept until the page reloads */ }
  };
  return { off, set };
}

export default function PilotSideToggle({ waiting }: { waiting: number }) {
  const { set } = useSideOff();
  return (
    <>
      <button type="button" className="side-fold" onClick={() => set(true)} aria-label="Fold the overview">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" /></svg>
      </button>
      <button type="button" className="side-strip" onClick={() => set(false)} aria-label={waiting ? `Open the overview. ${waiting} pending` : 'Open the overview'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" /></svg>
        {waiting > 0 && <i>{waiting}</i>}
      </button>
    </>
  );
}
