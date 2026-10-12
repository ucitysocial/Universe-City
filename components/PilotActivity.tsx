'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type ActivityLine = { id: string; day: string; time: string; group: Group; word: string; tone: string; line: string; by: string };
type Group = 'filed' | 'changed' | 'decided' | 'pending' | 'left' | 'read';

const GROUPS: { key: Group; label: string }[] = [
  { key: 'filed', label: 'Filed' },
  { key: 'changed', label: 'Changed' },
  { key: 'decided', label: 'Decided' },
  { key: 'pending', label: 'Pending' },
  { key: 'left', label: 'Left off' },
  { key: 'read', label: 'Looked up' }
];

const csv = (rows: ActivityLine[]) => ['Day,Time,What happened,Entry,By']
  .concat(rows.map(r => [r.day, r.time, r.word, r.line, r.by].map(v => `"${v.replace(/"/g, '""')}"`).join(',')))
  .join('\n');

/**
 * What changed in the File, one line each, by day. The resident filters by kind and by words, and downloads the lines
 * in view as a spreadsheet file.
 */
export default function PilotActivity({ lines }: { lines: ActivityLine[] }) {
  const [on, setOn] = useState<Set<Group>>(new Set(['filed', 'changed', 'decided', 'pending', 'left']));
  const [words, setWords] = useState('');
  const shown = useMemo(() => {
    const w = words.trim().toLowerCase();
    return lines.filter(l => on.has(l.group) && (!w || l.line.toLowerCase().includes(w)));
  }, [lines, on, words]);
  const days = useMemo(() => {
    const out: { day: string; rows: ActivityLine[] }[] = [];
    for (const l of shown) {
      const last = out[out.length - 1];
      if (last && last.day === l.day) last.rows.push(l); else out.push({ day: l.day, rows: [l] });
    }
    return out;
  }, [shown]);
  const flip = (g: Group) => setOn(prev => { const n = new Set(prev); if (n.has(g)) n.delete(g); else n.add(g); return n; });
  const download = () => {
    const url = URL.createObjectURL(new Blob([csv(shown)], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'universe-city-activity.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="act">
      <div className="act-tools">
        <div className="act-chips" role="group" aria-label="Kinds of change to show">
          {GROUPS.map(g => (
            <button key={g.key} type="button" aria-pressed={on.has(g.key)} className={on.has(g.key) ? 'on' : ''} onClick={() => flip(g.key)}>{g.label}</button>
          ))}
        </div>
        <label className="vh" htmlFor="act-words">Find words in the list</label>
        <input id="act-words" className="act-find" placeholder="Find words in the list" value={words} onChange={e => setWords(e.target.value)} />
      </div>
      <div className="act-dl">
        <span>{shown.length} {shown.length === 1 ? 'line' : 'lines'}</span>
        <button type="button" className="pt-link" onClick={download}>Download these lines as a spreadsheet</button>
        <Link className="pt-link" href="/api/pilot/export?format=text" prefetch={false}>Download the conversation</Link>
        <Link className="pt-link" href="/api/pilot/export" prefetch={false}>Download every entry as data</Link>
      </div>
      {days.length === 0 && <p className="pt-empty">No line matches.</p>}
      {days.map(d => (
        <section key={d.day} className="act-day">
          <h2>{d.day}</h2>
          {d.rows.map(r => (
            <div key={r.id} className="act-row">
              <span className="act-time">{r.time}</span>
              <span className={`pt-chip ${r.tone}`}>{r.word}</span>
              <span className="act-line">{r.line}</span>
              {r.by !== 'Agent' && <span className="act-by">{r.by}</span>}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
