'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { FileIndex } from '@/lib/pilot/browse';
import { SearchBox, SearchResults, useSearch } from '@/components/PilotSearch';
import { FILE_ROOT } from '@/lib/pilot/paths';
import { treeRows } from '@/lib/pilot/tree';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { RosterRow } from '@/lib/agent/roster';

/** Set when a person on the team opened a client from the Agent Portal. */
export type RailAgent = { name: string | null; clients: RosterRow[]; current: string };

const PLACES = [
  { href: '/portal/home', name: 'Home' },
  { href: FILE_ROOT, name: 'File', narrow: true },
  { href: '/portal/search', name: 'Search', narrow: true },
  { href: '/portal/settings', name: 'Settings', narrow: true }
];

/**
 * The left side of the frame. It stays in place on every screen: the search, the places, and the File as one tree.
 * A row is open when the address on screen is inside it, so the tree shows where the resident is.
 * While the search box holds words, the results take the place of the tree.
 * On a phone the left side folds into the bar at the top. The button at its left opens it as a drawer over the page,
 * with the search, Home, the File as one tree, Settings, and Log out. It closes when the page changes.
 */
export default function PilotRail({ index, name, synthetic, agent }: { index: FileIndex; name: string | null; synthetic: boolean; agent?: RailAgent }) {
  const path = usePathname();
  const router = useRouter();
  const rows = useMemo(() => treeRows(index, path), [index, path]);
  const tree = useRef<HTMLDivElement>(null);
  const search = useSearch();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);

  // The selected row is kept in view when the address changes from outside the tree.
  useEffect(() => {
    const on = tree.current?.querySelector<HTMLElement>('.tree-row.on');
    on?.scrollIntoView({ block: 'nearest' });
  }, [path]);

  async function logOut() {
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push(agent ? '/login?next=/agent' : '/login');
    router.refresh();
  }

  return (
    <aside className={open ? 'os-rail open' : 'os-rail'}>
      <div className="os-rail-head">
        <button type="button" className="rail-open" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Close My File' : 'Open My File'}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
        </button>
        <Link href="/portal/home" className="pt-mark">universe&#9733;city</Link>
        {agent && <span className="ag-tag">Agent</span>}
      </div>
      {open && <div className="rail-back" onClick={() => setOpen(false)} />}
      <div className="rail-body">
      {agent && (
        <div className="ag-switch">
          <label htmlFor="ag-client">Client</label>
          <select id="ag-client" value={agent.current} onChange={e => { window.location.href = `/agent/open/${e.target.value}`; }}>
            {agent.clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.mode === 'live' ? ' (you)' : ''}{c.waiting ? `, ${c.waiting} waiting` : ''}</option>
            ))}
          </select>
          <a href="/agent" className="pt-link">All clients</a>
        </div>
      )}
      <SearchBox text={search.text} setText={search.setText} id="os-search-box" />
      <nav className="os-places" aria-label="Places">
        {PLACES.filter(p => !agent || p.href !== '/portal/settings').map(p => (
          <Link key={p.href} href={p.href}
            className={[path === p.href || path.startsWith(`${p.href}/`) ? 'current' : '', p.narrow ? 'only-narrow' : ''].join(' ').trim() || undefined}>
            {p.name}
          </Link>
        ))}
      </nav>
      <nav className="os-tree" aria-label={search.active ? 'Search results' : 'My File'} ref={tree}>
        {search.active && <SearchResults found={search.found} err={search.err} />}
        {!search.active && rows.map(r => (
          <Link key={r.href} href={r.href} title={r.label}
            className={['tree-row', r.on ? 'on' : '', r.open && !r.on ? 'open' : ''].join(' ').trim()}
            aria-current={r.on ? 'page' : undefined}
            style={{ '--d': r.depth, '--fc': r.color || 'var(--ink)' } as CSSProperties}>
            <span className={`fi ${r.icon.split(' ').map(x => `i-${x}`).join(' ')}${r.open && r.icon === 'folder' ? ' i-is-open' : ''}`} />
            {r.num && <span className="tree-num">{r.num}</span>}
            <span className="tree-label">{r.label}</span>
            {r.count ? <em>{r.count}</em> : null}
          </Link>
        ))}
      </nav>
      <div className="os-rail-foot">
        {agent ? (
          <>
            <span className="pt-who-name"><strong>{agent.name || 'Agent'}</strong>, agent</span>
            <a href="/agent/leave?to=portal" className="pt-link">Open your Resident Portal</a>
            <button type="button" className="pt-link" onClick={logOut}>Log out</button>
          </>
        ) : (
          <>
            <span className="pt-who-name"><strong>{name || 'Resident'}</strong>{synthetic ? ' (made up resident)' : ''}</span>
            <Link href="/portal/settings" className={path.startsWith('/portal/settings') ? 'pt-link current' : 'pt-link'}>Settings</Link>
            <button type="button" className="pt-link" onClick={logOut}>Log out of the test</button>
          </>
        )}
      </div>
      </div>
    </aside>
  );
}
