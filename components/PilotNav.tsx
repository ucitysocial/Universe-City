'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

const PLACES = [
  { href: '/portal/conversation', name: 'Conversation' },
  { href: '/portal/file', name: 'File' },
  { href: '/portal/activity', name: 'Activity' }
];

export default function PilotNav({ name, synthetic }: { name: string | null; synthetic: boolean }) {
  const path = usePathname();
  const router = useRouter();

  async function logOut() {
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="pt-side">
      <div>
        <Link href="/portal/conversation" className="pt-mark">universe&#9733;city</Link>
        <div style={{ marginTop: 8 }}><span className="pt-tag">Founder test</span></div>
      </div>
      <nav className="pt-nav" aria-label="Founder test">
        {PLACES.map(p => (
          <Link key={p.href} href={p.href} className={path.startsWith(p.href) ? 'current' : undefined}>{p.name}</Link>
        ))}
      </nav>
      <div className="pt-foot">
        <span className="pt-who-name"><strong>{name || 'Resident'}</strong>{synthetic ? ' (made up resident)' : ''}</span>
        <button type="button" className="pt-link" onClick={logOut}>Log out of the test</button>
      </div>
    </aside>
  );
}
