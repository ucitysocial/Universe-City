import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { buildBrief } from '@/lib/brief';

/** The meeting opens here. Ten sections, in the order they are needed. */
export default async function ClientFile({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: profile } = await sb.from('profiles').select('*').eq('id', params.id).single();
  if (!profile) notFound();

  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const brief = await buildBrief(params.id, iso(start), iso(now));

  const H = ({ n, children }: { n: string; children: React.ReactNode }) => (
    <h2 style={{ fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase',
                 color: 'var(--dim)', borderBottom: '2px solid var(--II)',
                 paddingBottom: 6, margin: '38px 0 14px' }}>
      <span className="vt" style={{ fontSize: 17, marginRight: 8 }}>{n}</span>{children}
    </h2>
  );
  const Empty = ({ children }: { children: React.ReactNode }) =>
    <p className="note" style={{ margin: 0 }}>{children}</p>;

  return (
    <div style={{ maxWidth: 820 }}>
      {/* 1 */}
      <p className="kick">Member</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>{profile.name}</h1>
      <p style={{ color: 'var(--dim)' }}>
        {profile.case_no} &middot; {profile.membership}
        {profile.represented_since ? ` · represented since ${profile.represented_since}` : ''}
        <br />Week of {brief.header.period[0]} to {brief.header.period[1]}
      </p>

      {/* 2 */}
      <H n="02">Since last review</H>
      {brief.since_last.length ? (
        <ul className="rows">
          {brief.since_last.map((c, i) => (
            <li key={i}>
              <span className="rn lab" style={{ width: 110 }}>{c.kind.replace('.', ' ')}</span>
              <span style={{ flex: 1 }}>{c.what}</span>
              <span className="note">{String(c.at).slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      ) : <Empty>Nothing has changed since the last approved review.</Empty>}

      {/* 3 */}
      <H n="03">Time</H>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
                    border: '2px solid var(--ink)', maxWidth: 560 }}>
        {[['Observed', brief.time.observed], ['Required', brief.time.required],
          ['Planned', brief.time.planned], ['Estimated', brief.time.estimated],
          ['Unaccounted', brief.time.unaccounted]].map(([k, v], i) => (
          <div key={k as string} style={{ padding: '10px 6px', textAlign: 'center',
               borderRight: i < 4 ? '1px solid var(--rule)' : undefined }}>
            <div className="vt" style={{ fontSize: 26, lineHeight: 1 }}>
              {Math.round((v as number) * 10) / 10}
            </div>
            <div className="lab" style={{ fontSize: 9, color: 'var(--dim)' }}>{k}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 22, fontSize: 14 }}>Needs confirmation</h3>
      {brief.time.needs_confirmation.length ? (
        <ul className="rows">
          {brief.time.needs_confirmation.map(x => (
            <li key={x.id}><span className="rn">&#9675;</span><span>{x.what}</span></li>
          ))}
        </ul>
      ) : <Empty>Nothing outstanding.</Empty>}

      <h3 style={{ marginTop: 22, fontSize: 14 }}>Changed</h3>
      {brief.time.changed.length ? (
        <ul className="rows">
          {brief.time.changed.map((x, i) => (
            <li key={i}>
              <span className="rn">&#8594;</span>
              <span><strong>{x.what}</strong><br />
                <span className="note">was {x.before}, corrected to {x.after}</span></span>
            </li>
          ))}
        </ul>
      ) : <Empty>No corrections this period.</Empty>}

      {/* 4 */}
      <H n="04">Standards</H>
      {brief.standards.possible_conflicts.map((c, i) => (
        <div key={i} style={{ border: '3px solid var(--I)', background: 'var(--paper2)',
                              padding: '12px 14px', marginBottom: 10 }}>
          <div className="lab" style={{ color: 'var(--I)' }}>Possible conflict</div>
          <div style={{ marginTop: 6 }}><strong>{c.standard}</strong></div>
          <div className="note">{c.because}</div>
        </div>
      ))}
      {brief.standards.new.length ? (
        <ul className="rows">
          {brief.standards.new.map(s => (
            <li key={s.id}><span className="rn">new</span><span>{s.wording}</span></li>
          ))}
        </ul>
      ) : null}
      {!brief.standards.possible_conflicts.length && !brief.standards.new.length &&
        <Empty>Nothing new, and nothing on the calendar disagrees with an active standard.</Empty>}

      {/* 5 */}
      <H n="05">They raised</H>
      {brief.raised.length ? (
        <ul className="rows">
          {brief.raised.map((r, i) => (
            <li key={i}>
              <span className="rn">&ldquo;</span>
              <span style={{ flex: 1 }}>{r.said}
                <span className="note" style={{ display: 'block' }}>{r.channel} &middot; {String(r.at).slice(0, 10)}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : <Empty>Nothing outstanding from them.</Empty>}

      {/* 6 */}
      <H n="06">The read</H>
      <div style={{ border: '3px solid var(--II)', background: '#fbf7ec', padding: 14 }}>
        <div className="lab" style={{ color: 'var(--II)' }}>Private to you</div>
        <p className="note" style={{ marginTop: 8 }}>
          Generated before the meeting from the record above. Not built in this pass, and it is
          guidance rather than anything shown to the resident.
        </p>
      </div>

      {/* 7 */}
      <H n="07">Open proposals</H>
      {brief.open_proposals.length ? (
        <ul className="rows">
          {brief.open_proposals.map((p: any) => (
            <li key={p.id}>
              <span className="rn lab">{p.origin}</span>
              <span style={{ flex: 1 }}><strong>{p.kind}</strong>
                <span className="note" style={{ display: 'block' }}>{p.reason}</span></span>
              <span className="lab" style={{ color: 'var(--dim)' }}>Approve &middot; Edit &middot; Reject</span>
            </li>
          ))}
        </ul>
      ) : <Empty>Nothing waiting on you.</Empty>}

      {/* 8 */}
      <H n="08">Last review</H>
      {brief.last_review ? (
        <p>
          <strong>{brief.last_review.concentration ?? 'No concentration recorded'}</strong>
          <span className="note" style={{ display: 'block' }}>
            approved {String(brief.last_review.approved_at).slice(0, 10)}
          </span>
        </p>
      ) : <Empty>This would be the first review.</Empty>}

      {/* 9 and 10 */}
      <H n="09">Meeting</H>
      <Empty>
        Notes, decisions, approvals and the next concentration are written here during the call.
        Closing a review generates the summary and that becomes next week&rsquo;s baseline.
      </Empty>
    </div>
  );
}
