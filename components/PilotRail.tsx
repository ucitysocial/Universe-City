'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { FileIndex } from '@/lib/pilot/browse';
import { SearchBox, SearchResults, useSearch } from '@/components/PilotSearch';
import { FILE_ROOT } from '@/lib/pilot/paths';
import { treeRows } from '@/lib/pilot/tree';
import { supabaseBrowser } from '@/lib/supabase/client';

const PLACES = [
  { href: '/portal/home', name: 'Home' },
  { href: FILE_ROOT, name: 'File', narrow: true },
  { href: '/portal/search', name: 'Search', narrow: true },
  { href: '/portal/activity', name: 'Activity' }
];

/**
 * The left side of the frame. It stays in place on every screen: the search, the places, and the File as one tree.
 * A row is open when the address on screen is inside it, so the tree shows where the resident is.
 * While the search box holds words, the results take the place of the tree.
 */
export default function PilotRail({ index, name, synthetic }: { index: FileIndex; name: string | null; synthetic: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const rows = useMemo(() => treeRows(index, path), [index, path]);
  const tree = useRef<HTMLDivElement>(null);
  const search = useSearch();

  // The selected row is kept in view when the address changes from outside the tree.
  useEffect(() => {
    const on = tree.current?.querySelector<HTMLElement>('.tree-row.on');
    on?.scrollIntoView({ block: 'nearest' });
  }, [path]);

  async function logOut() {
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="os-rail">
      <div className="os-rail-head">
        <Link href="/portal/home" className="pt-mark">universe&#9733;city</Link>
        <div style={{ marginTop: 8 }}><span className="pt-tag">Founder test</span></div>
      </div>
      <SearchBox text={search.text} setText={search.setText} id="os-search-box" />
      <nav className="os-places" aria-label="Places">
        {PLACES.map(p => (
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
        <span className="pt-who-name"><strong>{name || 'Resident'}</strong>{synthetic ? ' (made up resident)' : ''}</span>
        <button type="button" className="pt-link" onClick={logOut}>Log out of the test</button>
      </div>
    </aside>
  );
}
