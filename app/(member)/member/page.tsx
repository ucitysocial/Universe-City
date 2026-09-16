import { currentProfile, supabaseServer } from '@/lib/supabase/server';
import { LIVE_FOLDERS, deptOf } from '@/lib/domain/folders';
import { figures, type Block } from '@/lib/domain/time';
import { weekBounds } from '@/lib/domain/dates';

const displayDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));

export default async function MemberHome() {
  const profile = await currentProfile();
  const sb = supabaseServer();
  const { start, end } = weekBounds(profile?.timezone ?? 'America/Denver');

  const { data: blocks } = await sb.from('blocks')
    .select('*').gte('date', start).lte('date', end);
  const { count: standards } = await sb.from('standards')
    .select('*', { count: 'exact', head: true }).eq('state', 'active');

  const f = figures((blocks ?? []) as Block[]);
  const has = (blocks?.length ?? 0) > 0;

  return (
    <>
      <p className="kick">Your file</p>
      <h1 style={{ fontSize: 34, marginTop: 8 }}>{profile?.name}</h1>
      <p style={{ color: 'var(--dim)' }}>
        Case {profile?.case_no}
        {profile?.represented_since ? ` · represented since ${displayDate(profile.represented_since)}` : ''}
      </p>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>This week</h2>
      {has ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                      background: 'var(--ink2)', border: '3px solid var(--ink)',
                      boxShadow: 'var(--shadow)', marginTop: 14, maxWidth: 620 }}>
          {[['Observed', f.observed], ['Estimated', f.estimated],
            ['Unaccounted', f.unaccounted], ['Yours', f.free]].map(([k, v], i) => (
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
          No Time records are on file for this week. Your agent records the information you
          establish during your review.
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
                  {x.name === 'Salary' ? 'Not established yet.' : null}
                  {x.name === 'Inventory' ? 'Not established yet.' : null}
                  {x.name === 'Time' && !has ? 'Not established yet.' : null}
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
