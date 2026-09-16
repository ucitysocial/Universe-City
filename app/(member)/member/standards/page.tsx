import { supabaseServer } from '@/lib/supabase/server';

const displayDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));

export default async function StandardsPage() {
  const { data } = await supabaseServer().from('standards')
    .select('*').order('created_at', { ascending: false });
  const list = data ?? [];

  return (
    <>
      <p className="kick">Department IV &middot; folder 01</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>Standards</h1>
      <p style={{ color: 'var(--dim)', maxWidth: 'var(--text)' }}>
        A signed, dated list of your minimums. Each standard is written in your own words and can
        be checked against later decisions.
      </p>

      {list.length === 0 ? (
        <p className="note" style={{ maxWidth: 'var(--text)' }}>
          No standards are on file yet. Your agent records each standard in your own words with
          the date it was set.
        </p>
      ) : (
        <ul className="rows" style={{ maxWidth: 'var(--text)', marginTop: 28 }}>
          {list.map(s => (
            <li key={s.id} style={{ display: 'block' }}>
              <strong style={{ fontSize: 18 }}>{s.wording}</strong>
              <div className="lab" style={{ color: 'var(--dim)', marginTop: 6 }}>
                {s.state} &middot; set {displayDate(s.created_at)}
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
