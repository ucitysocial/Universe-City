import { redirect } from 'next/navigation';
import { currentProfile, supabaseServer } from '@/lib/supabase/server';
import { LIVE_FOLDERS, deptOf } from '@/lib/domain/folders';
import { figures, type Block } from '@/lib/domain/time';
import { weekBounds } from '@/lib/domain/dates';

export default async function MemberHome({
  searchParams
}: {
  searchParams?: { welcome?: string; plan?: string };
}) {
  if (searchParams?.welcome === '1') redirect('/member/orientation');

  const profile = await currentProfile();
  const sb = supabaseServer();

  const { count: allTime } = await sb.from('blocks')
    .select('id', { count: 'exact', head: true });

  if ((allTime ?? 0) === 0) redirect('/member/time/setup');

  const { start, end } = weekBounds(profile?.timezone ?? 'America/Denver');

  const { data: blocks } = await sb.from('blocks')
    .select('*').gte('date', start).lte('date', end);
  const { count: standards } = await sb.from('standards')
    .select('*', { count: 'exact', head: true }).eq('state', 'active');

  const f = figures((blocks ?? []) as Block[]);
  const has = (blocks?.length ?? 0) > 0;

  return (
    <>
      {searchParams?.plan === 'ready' && (
        <div className="plan-ready-banner">
          <div>
            <p className="kick">Time is running</p>
            <h2>Your first Plan is on file.</h2>
            <p>Live the day. Universe City now has something real to compare with what actually happens.</p>
          </div>
          <a className="btn ghost compact" href="/member/time">Open Time</a>
        </div>
      )}

      <p className="kick">Dashboard</p>
      <h1 style={{ fontSize: 34, marginTop: 8 }}>{profile?.name}</h1>
      <p style={{ color: 'var(--dim)' }}>
        Case {profile?.case_no}
        {profile?.represented_since ? ` · represented since ${profile.represented_since}` : ''}
      </p>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>This week</h2>
      {has ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                      background: 'var(--ink2)', border: '3px solid var(--ink)',
                      boxShadow: 'var(--shadow)', marginTop: 14, maxWidth: 620 }}>
          {[[ 'Observed', f.observed ], [ 'Estimated', f.estimated ],
            [ 'Unaccounted', f.unaccounted ], [ 'Yours', f.free ]].map(([k, v], i) => (
            <div key={k as string} style={{ padding: '14px 10px', textAlign: 'center',
                 borderRight: i < 3 ? '1px solid rgba(244,239,233,.22)' : undefined }}>
              <div className="vt" style={{ fontSize: 34, lineHeight: 1, color: '#fff' }}>
                {Math.round((v as number) * 10) / 10}
              </div>
              <div className="lab" style={{ color: 'rgba(244,239,233,.55)', fontSize: 10 }}>{k}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="note" style={{ maxWidth: 'var(--text)' }}>
          Your first Plan is on file for the next day. This view will become more useful as planned
          time turns into observed time.
        </p>
      )}

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Your systems</h2>
      <div className="grid4" style={{ marginTop: 16 }}>
        {LIVE_FOLDERS.map(x => {
          const d = deptOf(x.dept);
          const live = x.name === 'Time' || x.name === 'Standards';
          return (
            <article key={x.name} className="deskcard" style={{ borderLeft: `8px solid ${d.color}` }}>
              <div className="top" style={{ background: d.color }}>
                <span className="rn">{x.dept}</span><span className="nm">{x.name}</span>
              </div>
              <div className="in">
                <p className="sys">{x.system}.</p>
                <p className="q">
                  {x.name === 'Time' && has ? `${Math.round(f.free)} hours of this week are yours.` : null}
                  {x.name === 'Standards' ? `${standards ?? 0} active.` : null}
                  {x.name === 'Salary' ? 'Collecting. Needs Time behind it.' : null}
                  {x.name === 'Inventory' ? 'Present in your File. Not active yet.' : null}
                  {x.name === 'Time' && !has ? 'Your first Plan is ready.' : null}
                </p>
                {live && (
                  <p style={{ marginTop: 12 }}>
                    <a className="btn ghost" href={`/member/${x.name.toLowerCase()}`}>Open {x.name}</a>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
