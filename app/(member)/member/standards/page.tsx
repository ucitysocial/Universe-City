import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export default async function StandardsPage() {
  const { count: timeCount } = await supabaseServer().from('blocks')
    .select('id', { count: 'exact', head: true });
  if ((timeCount ?? 0) === 0) redirect('/member/time/setup');
  const { data } = await supabaseServer().from('standards')
    .select('*').order('created_at', { ascending: false });
  const list = data ?? [];

  return (
    <>
      <p className="kick">Department IV &middot; folder 01</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>Standards</h1>
      <p style={{ color: 'var(--dim)', maxWidth: 'var(--text)' }}>
        A signed, dated list of your minimums. Written in your words so a later decision can be
        checked against it.
      </p>

      {list.length === 0 ? (
        <p className="note" style={{ maxWidth: 'var(--text)' }}>
          None on file yet. Your agent writes the first ones down with you, and a standard only
          counts once it is in your own words with a date on it.
        </p>
      ) : (
        <ul className="rows" style={{ maxWidth: 'var(--text)', marginTop: 28 }}>
          {list.map(s => (
            <li key={s.id} style={{ display: 'block' }}>
              <strong style={{ fontSize: 18 }}>{s.wording}</strong>
              <div className="lab" style={{ color: 'var(--dim)', marginTop: 6 }}>
                {s.state} &middot; set {String(s.created_at).slice(0, 10)}
                {s.applies_to ? ` · applies to ${s.applies_to}` : ''}
              </div>
              {s.exceptions && <div className="note" style={{ marginTop: 4 }}>Except: {s.exceptions}</div>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
