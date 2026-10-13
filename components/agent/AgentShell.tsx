'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Client } from '@/lib/agent/types';
import { supabaseBrowser } from '@/lib/supabase/client';

type Ctx = { agentName: string; clients: Client[] };
const AgentCtx = createContext<Ctx | null>(null);
export const useAgent = () => useContext(AgentCtx)!;

const clock = (zone: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date()).replace(' at ', ', ');
  } catch { return ''; }
};

/**
 * The first page of the Agent Portal: the list of clients. Opening a client opens the same frame the client sees,
 * with the Agency Guide on the right.
 */
export default function AgentShell({ agentName, clients, children }: { agentName: string; clients: Client[]; children: React.ReactNode }) {
  const path = usePathname() || '';
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [path]);
  const [now, setNow] = useState('');
  const zone = clients[0]?.zone || 'America/Denver';
  useEffect(() => { setNow(clock(zone)); const t = setInterval(() => setNow(clock(zone)), 15_000); return () => clearInterval(t); }, [zone]);

  async function logOut() {
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push('/login?next=/agent');
    router.refresh();
  }

  return (
    <AgentCtx.Provider value={{ agentName, clients }}>
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
              <Link href="/agent" className={path === '/agent' ? 'current' : undefined}>All clients</Link>
            </nav>
            <div className="ag-clients" aria-label="Clients">
              <p className="ag-h">Clients</p>
              {clients.map(c => (
                <a key={c.id} href={`/agent/open/${c.id}`} className="ag-client">
                  <span className="ag-cname">{c.name}</span>
                  <span className={`ag-mode ${c.mode}`}>{c.mode === 'live' ? 'You' : 'Made up'}</span>
                  {c.needs.length > 0 && <em>{c.needs.length}</em>}
                </a>
              ))}
            </div>
            <div className="os-rail-foot">
              <span className="pt-who-name"><strong>{agentName}</strong>, agent</span>
              <a href="/agent/leave?to=portal" className="pt-link">Open your Resident Portal</a>
              <button type="button" className="pt-link" onClick={logOut}>Log out</button>
            </div>
          </div>
        </aside>
        <main className="os-main">
          <div className="topbar ag-topbar">
            <span className="topbar-t">Agent Portal</span>
            <span className="topbar-n" suppressHydrationWarning>{now}</span>
          </div>
          {children}
        </main>
      </div>
    </AgentCtx.Provider>
  );
}
