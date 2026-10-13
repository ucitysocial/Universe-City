'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';
import type { Client, Known, Msg } from '@/lib/agent/types';
import { supabaseBrowser } from '@/lib/supabase/client';

// ------------------------------------------------------------------ the demo's own state
//
// Every change made to a made up client is kept here, in this browser only. Nothing in it reaches the database, the
// live client, or any message service. Reset the demo clears it.

export type Note = { id: string; kind: 'note' | 'client_said'; text: string; at: string };
export type Proposal = { id: string; folder: string; text: string; from: string; state: 'open' | 'confirmed' | 'discarded' };
export type Demo = {
  sent: Msg[];
  notes: Note[];
  proposals: Proposal[];
  handled: Record<string, string>;     // a need, and what the agent did with it
  tasks: Record<string, boolean[]>;    // a task, and which steps are done
  draft: string;
};
const EMPTY: Demo = { sent: [], notes: [], proposals: [], handled: {}, tasks: {}, draft: '' };
const KEY = 'uc:agent-demo:v1';

type Ctx = {
  agentName: string;
  clients: Client[];
  demo: (id: string) => Demo;
  change: (id: string, fn: (d: Demo) => Demo) => void;
  view: (id: string) => Client | null;
  reset: () => void;
};
const AgentCtx = createContext<Ctx | null>(null);
export const useAgent = () => useContext(AgentCtx)!;

export const stamp = () => `Today, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

/** A client as the agent sees it now: the File, with what the agent did in the demo laid over it. */
function overlay(c: Client, d: Demo): Client {
  if (c.mode === 'live') return c;
  return {
    ...c,
    needs: c.needs.filter(n => !d.handled[n.id]),
    messages: [...c.messages, ...d.sent],
    known: [...c.known, ...d.proposals.filter(p => p.state === 'confirmed').map<Known>(p => ({ id: p.id, folder: p.folder, text: p.text }))],
    tasks: c.tasks.map(t => {
      const done = d.tasks[t.id];
      if (!done) return t;
      const steps = t.steps.map((s, i) => ({ ...s, done: done[i] ?? s.done }));
      const current = Math.max(0, steps.findIndex(s => !s.done));
      return { ...t, steps, current: steps.every(s => s.done) ? steps.length : current };
    })
  };
}

// ------------------------------------------------------------------ the frame

const clock = (zone: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date()).replace(' at ', ', ');
  } catch { return ''; }
};

export default function AgentShell({ agentName, clients, children }: { agentName: string; clients: Client[]; children: React.ReactNode }) {
  const [all, setAll] = useState<Record<string, Demo>>({});
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setAll(JSON.parse(raw)); } catch { /* the demo starts fresh */ }
  }, []);
  const save = (next: Record<string, Demo>) => {
    setAll(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* kept until the page reloads */ }
  };
  const demo = useCallback((id: string) => ({ ...EMPTY, ...(all[id] || {}) }), [all]);
  const change = useCallback((id: string, fn: (d: Demo) => Demo) => {
    const c = clients.find(x => x.id === id);
    if (!c || c.mode !== 'demo') return;   // The live client takes no demo change.
    setAll(prev => {
      const next = { ...prev, [id]: fn({ ...EMPTY, ...(prev[id] || {}) }) };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* kept until the page reloads */ }
      return next;
    });
  }, [clients]);
  const view = useCallback((id: string) => {
    const c = clients.find(x => x.id === id);
    return c ? overlay(c, demo(id)) : null;
  }, [clients, demo]);
  const reset = () => save({});
  const ctx = useMemo(() => ({ agentName, clients, demo, change, view, reset }), [agentName, clients, demo, change, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const path = usePathname() || '';
  const router = useRouter();
  const openId = /^\/agent\/c\/([^/?#]+)/.exec(path)?.[1] ?? null;
  const open = openId ? view(openId) : null;
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [path]);
  const [now, setNow] = useState('');
  const zone = clients[0]?.zone || 'America/Denver';
  useEffect(() => { setNow(clock(zone)); const t = setInterval(() => setNow(clock(zone)), 15_000); return () => clearInterval(t); }, [zone]);
  const waiting = clients.reduce((n, c) => n + (view(c.id)?.needs.length || 0), 0);

  async function logOut() {
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push('/login?next=/agent');
    router.refresh();
  }

  // The File of the open client, as one tree: each department, and each folder that holds an entry.
  const tree = open ? DEPARTMENTS.map(d => {
    const folders = FOLDERS.filter(f => f.dept === d.key).map(f => ({
      name: f.name, num: f.num,
      count: open.known.filter(k => k.folder === f.name).length + open.days.reduce((n, day) => n + day.items.filter(i => i.folder.startsWith(`${f.name},`)).length, 0)
    })).filter(f => f.count > 0);
    return { ...d, folders };
  }) : [];

  return (
    <AgentCtx.Provider value={ctx}>
      <div className="os ag">
        <aside className={drawer ? 'os-rail open' : 'os-rail'}>
          <div className="os-rail-head">
            <button type="button" className="rail-open" onClick={() => setDrawer(o => !o)} aria-expanded={drawer} aria-label={drawer ? 'Close the client list' : 'Open the client list'}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
            </button>
            <Link href="/agent" className="pt-mark">universe&#9733;city</Link>
            <span className="ag-tag">Agent</span>
          </div>
          {drawer && <div className="rail-back" onClick={() => setDrawer(false)} />}
          <div className="rail-body">
            <nav className="os-places" aria-label="Places">
              <Link href="/agent" className={path === '/agent' ? 'current' : undefined}>Today</Link>
            </nav>
            <div className="ag-clients" aria-label="Clients">
              <p className="ag-h">Clients</p>
              {clients.map(c => {
                const n = view(c.id)?.needs.length || 0;
                return (
                  <Link key={c.id} href={`/agent/c/${c.id}`} className={['ag-client', openId === c.id ? 'on' : ''].join(' ')}>
                    <span className="ag-cname">{c.name}</span>
                    <span className={`ag-mode ${c.mode}`}>{c.mode === 'live' ? 'Live' : 'Demo'}</span>
                    {n > 0 && <em>{n}</em>}
                  </Link>
                );
              })}
            </div>
            {open && (
              <nav className="os-tree ag-tree" aria-label={`File of ${open.name}`}>
                <p className="ag-h">File of {open.name.split(' ')[0]}</p>
                {tree.map(d => (
                  <div key={d.key}>
                    <Link href={`/agent/c/${open.id}?tab=file`} className="tree-row" style={{ '--d': 0, '--fc': d.color } as CSSProperties}>
                      <span className="fi i-folder" /><span className="tree-num">{d.key}</span><span className="tree-label">{d.name}</span>
                    </Link>
                    {d.folders.map(f => (
                      <Link key={f.name} href={`/agent/c/${open.id}?tab=file&folder=${encodeURIComponent(f.name)}`} className="tree-row" style={{ '--d': 1, '--fc': d.color } as CSSProperties}>
                        <span className="fi i-folder" /><span className="tree-num">{String(f.num).padStart(2, '0')}</span><span className="tree-label">{f.name}</span><em>{f.count}</em>
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            )}
            <div className="os-rail-foot">
              <span className="pt-who-name"><strong>{agentName}</strong>, agent</span>
              <Link href="/portal/home" className="pt-link">Open your Resident Portal</Link>
              <button type="button" className="pt-link" onClick={reset}>Reset the demo</button>
              <button type="button" className="pt-link" onClick={logOut}>Log out</button>
            </div>
          </div>
        </aside>
        <main className="os-main">
          <div className="topbar ag-topbar">
            <span className="topbar-t">{open ? open.name : 'Agent Portal'}</span>
            {open && <span className={`ag-mode big ${open.mode}`}>{open.mode === 'live' ? 'Live, read only' : 'Demo data'}</span>}
            <span className="topbar-n" suppressHydrationWarning>{now}</span>
            <Link href="/agent" className="topbar-star ag-star" aria-label={`${waiting} waiting`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" /></svg>
              {waiting > 0 && <i>{waiting}</i>}
            </Link>
          </div>
          {children}
        </main>
      </div>
    </AgentCtx.Provider>
  );
}
