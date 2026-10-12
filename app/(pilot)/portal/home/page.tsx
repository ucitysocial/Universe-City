import type { CSSProperties } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PilotAsk from '@/components/PilotAsk';
import { who } from '@/lib/pilot/auth';
import { loadIndex, loadWaiting, spanWords } from '@/lib/pilot/browse';
import { withResident } from '@/lib/pilot/db';
import { belongsTo } from '@/lib/pilot/dept';
import { FILE_ROOT, folderPath, TIME_PATH } from '@/lib/pilot/paths';
import { localNow, sayDate } from '@/lib/pilot/time';
import { totalEntries } from '@/lib/pilot/tree';

export const dynamic = 'force-dynamic';

/**
 * Resident Portal home in the founder test. It shows where the two working places are, and what the File holds
 * next. Each line is read from the File. The home screen keeps no entry of its own.
 */
export default async function HomePage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/home');
  const zone = w.access.timezone;
  const now = localNow(zone);
  const { ix, waiting, next, work } = await withResident({ userId: w.userId, actor: 'resident' }, async q => ({
    ix: await loadIndex(q, zone),
    waiting: (await loadWaiting(q)).filter(p => p.decider === 'resident'),
    next: await q<{ id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null }>(
      `select id, label, on_date::text as on_date, start_min, end_min, folder from uc_pilot.commitments
        where withdrawn_at is null and execution = 'planned' and on_date >= $1::date
        order by on_date, start_min nulls last limit 4`, [now.date]),
    work: await q<{ id: string; label: string; folder: string }>(`select id, label, folder from uc_pilot.work where state = 'open' order by created_at limit 4`)
  }));
  const entries = totalEntries(ix);
  const said = ix.lastMessageAt ? `Last message ${localNow(zone, new Date(ix.lastMessageAt)).label}` : 'No message yet';

  return (
    <div className="pt-home">
    <div className="pt-home-scroll">
    <div className="pt-page">
      <span id="uc-path" data-path="Resident Portal home" hidden />
      <div className="home-top">
        <h1>Resident Portal</h1>
        <p className="pt-kick">{now.label}</p>
      </div>
      <p className="pt-lede">Your File holds what is on file about your life. The guide keeps it from what you say in the conversation.</p>

      <div className="doors home-doors">
        <Link href={FILE_ROOT} className="door">
          <span className="fi i-folder i-big" />
          <b>My File</b>
          <span className="meta">4 departments / 48 folders / {entries} {entries === 1 ? 'entry' : 'entries'}</span>
          <span className="list">Agency Assessment, Housing Stability, Career Development, Life Management</span>
        </Link>
        <Link href="/portal/conversation" className="door">
          <span className="fi i-talk" />
          <b>Conversation</b>
          <span className="meta">{ix.messages} {ix.messages === 1 ? 'message' : 'messages'}</span>
          <span className="list">{said}. The guide is Universe City software.</span>
        </Link>
      </div>

      {/* On a wide screen the small window at the right holds these three lists. Here they show where it is absent. */}
      <div className="when-no-window">
      {waiting.length > 0 && (
        <>
          <h2>Waiting for your answer</h2>
          <div className="ents">
            {waiting.map(p => (
              <Link key={p.id} href={`${folderPath(p.folder)}/waiting`} className="ent">
                <span className="fi i-wait" /><b>{p.summary}</b><span className="pt-chip wait">Waiting for you</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2>Next on file</h2>
      {next.length === 0 && <p className="pt-empty">No commitment is on file for today or a day ahead.</p>}
      {next.length > 0 && (
        <div className="ents">
          {next.map(c => (
            <Link key={c.id} href={`${TIME_PATH}/${c.on_date}/${c.id}`} className="ent" style={{ '--fc': belongsTo(c.folder, c.label).color } as CSSProperties}>
              <span className="fi i-day" style={{ '--fc': belongsTo(c.folder, c.label).color } as CSSProperties} />
              <b>{c.label}</b>
              <span className="right">{spanWords(c.start_min, c.end_min)}</span>
              <span className="sub">{sayDate(c.on_date)}{c.on_date === now.date ? ', today' : ''}</span>
            </Link>
          ))}
        </div>
      )}

      {work.length > 0 && (
        <>
          <h2>Ongoing work</h2>
          <div className="ents">
            {work.map(x => (
              <Link key={x.id} href={`${folderPath(x.folder)}/work/${x.id}`} className="ent">
                <span className="fi i-work" /><b>{x.label}</b><span className="pt-chip wait">Open</span>
                <span className="sub">The guide leads it and asks the next question in the conversation.</span>
              </Link>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
    </div>
    <PilotAsk />
    </div>
  );
}
