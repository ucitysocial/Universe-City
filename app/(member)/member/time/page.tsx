import { supabaseServer, currentProfile } from '@/lib/supabase/server';
import { KINDS, STATUSES, figures, hours, deptOfBlock, type Block } from '@/lib/domain/time';
import { DEPARTMENTS } from '@/lib/domain/folders';
import { weekBounds, today } from '@/lib/domain/dates';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const c12 = (m: number) => {
  m = ((m % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60); const s = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12;
  return h + (m % 60 ? ':' + String(m % 60).padStart(2, '0') : ':00') + ' ' + s;
};

export default async function TimePage() {
  const profile = await currentProfile();
  const tz = profile?.timezone ?? 'America/Denver';
  const { start, end, days } = weekBounds(tz);
  const todayIso = today(tz);

  const { data } = await supabaseServer().from('blocks')
    .select('*').gte('date', start).lte('date', end).order('starts_at');
  const blocks = (data ?? []) as Block[];
  const f = figures(blocks);
  const colorOf = (b: Block) =>
    b.kind === 'sleep' ? 'var(--ink)'
      : DEPARTMENTS.find(d => d.key === deptOfBlock(b))!.color;

  return (
    <>
      <p className="kick">Department I &middot; folder 01</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>Time</h1>
      <p style={{ color: 'var(--dim)', maxWidth: 'var(--text)' }}>
        A seven-day operating schedule. It shows how many hours a week are yours and where those
        hours sit.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'var(--ink2)',
                    border: '3px solid var(--ink)', boxShadow: 'var(--shadow)',
                    margin: '26px 0 34px', maxWidth: 620 }}>
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

      {blocks.length === 0 ? (
        <p className="note" style={{ maxWidth: 'var(--text)' }}>
          No Time records are on file for this week. Your agent records confirmed and estimated
          blocks from the information you provide.
        </p>
      ) : (
        <div style={{ maxWidth: 820 }}>
          {days.map(ds => {
            const d = new Date(ds + 'T12:00:00');
            const mine = blocks.filter(b => b.date === ds);
            const free = mine.filter(b => KINDS[b.kind].klass === 'free' && b.status === 'observed')
                             .reduce((n, b) => n + hours(b), 0);
            const isToday = ds === todayIso;
            return (
              <div key={ds} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
                <span style={{ width: 74, flex: 'none' }}>
                  <span className="lab" style={{ color: 'var(--dim)', fontSize: 10 }}>
                    {DAYS[d.getDay()].slice(0, 3)}
                  </span>{' '}
                  <span className="vt" style={{ fontSize: 19, color: isToday ? 'var(--I)' : undefined }}>
                    {d.getDate()}
                  </span>
                </span>
                <span style={{ position: 'relative', flex: 1, height: 30, minWidth: 0,
                               border: `${isToday ? 3 : 2}px solid ${isToday ? 'var(--I)' : 'var(--ink)'}`,
                               background: 'var(--paper2)', overflow: 'hidden' }}>
                  {mine.map(b => {
                    const from = Number(b.starts_at.slice(0,2)) * 60 + Number(b.starts_at.slice(3));
                    const to = b.ends_at ? Number(b.ends_at.slice(0,2)) * 60 + Number(b.ends_at.slice(3)) : from + 60;
                    const L = Math.max(0, Math.min(99.3, (from / 1440) * 100));
                    const W = Math.max(Math.min(100 - L, ((Math.min(to, 1440) - from) / 1440) * 100), 0.7);
                    return <span key={b.id} title={`${b.label} · ${c12(from)} to ${c12(to)}`}
                      style={{ position: 'absolute', top: 0, bottom: 0, left: `${L}%`, width: `${W}%`,
                               background: colorOf(b), borderLeft: '1px solid rgba(255,255,255,.7)' }} />;
                  })}
                </span>
                <span className="vt" style={{ width: 36, textAlign: 'right',
                      fontSize: 20, color: 'var(--IV)' }}>{Math.round(free * 10) / 10}</span>
              </div>
            );
          })}
          <p className="note" style={{ marginTop: 16 }}>
            Each row is one day from midnight to midnight. The figure is the number of hours that
            were yours. Black is sleep. There are {Object.entries(STATUSES).length} statuses. An
            hour that has not been recorded is unaccounted, not free.
          </p>
        </div>
      )}
    </>
  );
}
