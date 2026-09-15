import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export default async function AgentHome() {
  const sb = supabaseServer();
  const { data: reviews } = await sb.from('reviews')
    .select('id, user_id, scheduled_for, status, period_start, period_end')
    .in('status', ['scheduled', 'open']).order('scheduled_for');
  const { data: members } = await sb.from('profiles')
    .select('id, name, case_no, membership').eq('role', 'member');

  const nameOf = (id: string) => members?.find(m => m.id === id)?.name ?? id.slice(0, 8);

  return (
    <>
      <p className="kick">Agent</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>This week</h1>
      <p style={{ color: 'var(--dim)' }}>
        {members?.filter(m => m.membership === 'active').length ?? 0} represented
        &middot; {reviews?.length ?? 0} reviews to run
      </p>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>Reviews</h2>
      {reviews?.length ? (
        <ul className="rows" style={{ maxWidth: 720 }}>
          {reviews.map(r => (
            <li key={r.id}>
              <span className="rn">{r.status === 'open' ? '\u25CF' : '\u25CB'}</span>
              <span style={{ flex: 1 }}>
                <Link href={`/agent/clients/${r.user_id}`}><strong>{nameOf(r.user_id)}</strong></Link>
                <span className="note" style={{ display: 'block', marginTop: 2 }}>
                  {r.period_start} to {r.period_end}
                  {r.scheduled_for ? ` · ${new Date(r.scheduled_for).toLocaleString()}` : ' · unscheduled'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="note">Nothing scheduled.</p>}

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Members</h2>
      <ul className="rows" style={{ maxWidth: 720 }}>
        {members?.map(m => (
          <li key={m.id}>
            <span className="rn vt">{m.case_no?.slice(-4)}</span>
            <span style={{ flex: 1 }}>
              <Link href={`/agent/clients/${m.id}`}>{m.name ?? 'Unnamed'}</Link>
            </span>
            <span className="lab" style={{ color: 'var(--dim)' }}>{m.membership}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
