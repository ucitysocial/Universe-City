'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { BoardFolder } from '@/lib/pilot/board';

const VIEW = 'uc:board';
const SHOWN = 'uc:board:folders';

type Dept = { key: string; name: string; slug: string; color: string; folders: { name: string; href: string }[] };

const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* kept until the page changes */ } };

/**
 * The views of the dashboard: the calendar, and the four departments. A department shows a card for each folder the
 * resident checked. A folder with entries is checked at first. The choices are kept in this browser.
 */
export default function PilotBoardTabs({ calendar, depts, filled }: { calendar: ReactNode; depts: Dept[]; filled: BoardFolder[] }) {
  const [on, setOn] = useState('calendar');
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [choosing, setChoosing] = useState(false);
  const path = usePathname();
  useEffect(() => { setShown(read<Record<string, boolean>>(SHOWN, {})); }, []);
  // Inside My File the overview follows the place on screen: a department or one of its folders opens that
  // department, and Time opens the calendar. Elsewhere it shows the view the resident picked last.
  useEffect(() => {
    const m = /^\/portal\/file\/([^/]+)(?:\/([^/]+))?/.exec(path || '');
    const here = m ? depts.find(d => d.slug === m[1]) : null;
    if (here) { setOn(m![2] === 'time' ? 'calendar' : here.key); setChoosing(false); return; }
    const v = read<string>(VIEW, 'calendar');
    setOn(v === 'calendar' || depts.some(d => d.key === v) ? v : 'calendar');
  }, [path, depts]);

  const pick = (k: string) => { setOn(k); setChoosing(false); write(VIEW, k); };
  const isShown = (name: string) => shown[name] ?? filled.some(f => f.name === name);
  const toggle = (name: string) => { const next = { ...shown, [name]: !isShown(name) }; setShown(next); write(SHOWN, next); };
  const dept = depts.find(d => d.key === on);

  return (
    <>
      <div className="dash-tabs" role="tablist" aria-label="What the overview shows">
        <button type="button" role="tab" aria-selected={on === 'calendar'} className={on === 'calendar' ? 'on' : ''}
          style={{ '--fc': 'var(--ink)' } as CSSProperties} onClick={() => pick('calendar')}>Calendar</button>
        {depts.map(d => (
          <button key={d.key} type="button" role="tab" aria-selected={on === d.key} className={on === d.key ? 'on' : ''}
            style={{ '--fc': d.color } as CSSProperties} onClick={() => pick(d.key)} title={d.name}>{d.name}</button>
        ))}
      </div>
      <div role="tabpanel" hidden={on !== 'calendar'}>{calendar}</div>
      {dept && (
        <div role="tabpanel" className="dash-sec">
          <div className="dash-h">
            <h2>{dept.name}</h2>
            <button type="button" className="dash-more pt-link" onClick={() => setChoosing(c => !c)} aria-expanded={choosing}>
              {choosing ? 'Close the list of folders' : 'Choose folders'}
            </button>
          </div>
          {choosing && (
            <div className="dash-pick">
              {dept.folders.map(f => (
                <label key={f.name}>
                  <input type="checkbox" checked={isShown(f.name)} onChange={() => toggle(f.name)} />
                  {f.name}{filled.some(x => x.name === f.name) ? '' : <span>no entries</span>}
                </label>
              ))}
            </div>
          )}
          {dept.folders.filter(f => isShown(f.name)).length === 0 && !choosing && (
            <p className="dash-empty">No folder is checked. Choose folders to show them here.</p>
          )}
          <div className="dash-cards">
            {dept.folders.filter(f => isShown(f.name)).map(f => {
              const data = filled.find(x => x.name === f.name);
              return (
                <div key={f.name} className="dash-card" style={{ '--fc': dept.color } as CSSProperties}>
                  <Link href={f.href} className="dash-card-h">{f.name}</Link>
                  {!data && <p className="dash-empty">Nothing on file yet.</p>}
                  {data?.lines.map(l => (
                    <Link key={l.key} href={l.href} className="dash-line">
                      <b>{l.title}</b>
                      <span>{l.sub}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
