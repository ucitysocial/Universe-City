'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

const KEY = 'uc:board';

/**
 * The views of the dashboard. One shows at a time. The view the resident picked stays picked on each page and after
 * a reload in this browser. The views themselves are read on the server.
 */
export default function PilotBoardTabs({ views }: { views: { key: string; label: string; color: string; node: ReactNode }[] }) {
  const [on, setOn] = useState(views[0]?.key);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && views.some(v => v.key === saved)) setOn(saved);
    } catch { /* the first view shows */ }
  }, [views]);
  const pick = (k: string) => {
    setOn(k);
    try { localStorage.setItem(KEY, k); } catch { /* the pick holds until the page changes */ }
  };
  return (
    <>
      <div className="dash-tabs" role="tablist" aria-label="What the dashboard shows">
        {views.map(v => (
          <button key={v.key} type="button" role="tab" aria-selected={on === v.key} className={on === v.key ? 'on' : ''}
            style={{ '--fc': v.color } as CSSProperties} onClick={() => pick(v.key)}>{v.label}</button>
        ))}
      </div>
      {views.map(v => <div key={v.key} role="tabpanel" hidden={on !== v.key}>{v.node}</div>)}
    </>
  );
}
