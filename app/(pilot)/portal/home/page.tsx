import type { CSSProperties } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PilotCalPop from '@/components/PilotCalPop';
import PilotConversation from '@/components/PilotConversation';
import { Countdown } from '@/components/PilotPanelBits';
import PilotPending from '@/components/PilotPending';
import { FOLDERS } from '@/lib/domain/folders';
import { who } from '@/lib/pilot/auth';
import { loadBelonging, loadIndex, loadPanel, loadSaid, spanWords } from '@/lib/pilot/browse';
import { DAY_FIT, loadCalendar, type CalItem } from '@/lib/pilot/calendar';
import { withResident } from '@/lib/pilot/db';
import { belongsTo } from '@/lib/pilot/dept';
import { loadFile } from '@/lib/pilot/file';
import { modelRoute } from '@/lib/pilot/model';
import { folderPath, SCHEDULE_PATH, slugOf, TIME_PATH } from '@/lib/pilot/paths';
import { addDays, localNow, sayDate, weekdayName, weekdayOf } from '@/lib/pilot/time';
import { thread } from '@/lib/pilot/turn';
import { popData } from '../file/[[...path]]/calendar';

export const dynamic = 'force-dynamic';

/**
 * Resident Portal home: where the agent is. The dashboard runs across the top: what is happening now, one view the
 * resident picks, and what waits for the resident. The conversation with the agent sits beneath it. The views are the schedule and each
 * folder that holds entries, so the list grows as the File does. After each reply the page is read again, so the
 * dashboard shows each entry the agent filed while the resident watches.
 */
export default async function HomePage({ searchParams }: { searchParams?: { show?: string } }) {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/home');
  const zone = w.access.timezone;
  const now = localNow(zone);
  const t = await thread(w.userId);
  const d = await withResident({ userId: w.userId, actor: 'resident' }, async q => {
    const ix = await loadIndex(q, zone);
    const filled = FOLDERS.filter(f => f.name !== 'Time')
      .map(f => ({ f, n: (ix.folders[f.name]?.said || 0) + (ix.folders[f.name]?.work || 0) + (ix.folders[f.name]?.cal || 0) }))
      .filter(x => x.n > 0);
    const pick = filled.find(x => slugOf(x.f.name) === searchParams?.show)?.f.name || null;
    return {
      filled, pick,
      view: await loadFile(q, zone, { statements: 1 }),
      panel: await loadPanel(q, zone),
      cal: pick ? null : await loadCalendar(q, now.date, addDays(now.date, 6), now.date, DAY_FIT),
      said: pick ? (await loadSaid(q, pick)).filter(s => s.state === 'current').slice(0, 12) : [],
      belong: pick ? await loadBelonging(q, pick, now.date) : null
    };
  });
  const { panel, cal, filled, pick, said, belong } = d;
  const { now: cur, then } = panel;
  const short = (date: string) => sayDate(date).replace(/, \d{4}$/, '');
  const waiting = panel.pending.length;

  const board = (
    <>
      {cur ? (
        <Link href={`${TIME_PATH}/${cur.on_date}/${cur.id}`} className="dash-now a-now" style={{ '--fc': belongsTo(cur.folder, cur.label).color } as CSSProperties}>
          <span className="dash-k">{cur.live ? 'Now' : 'Coming up'}</span>
          <b>{cur.label}</b>
          <Countdown until={cur.minutesUntil} left={cur.minutesLeft} live={cur.live} />
          <span className="dash-t">{cur.on_date === now.date ? 'Today' : short(cur.on_date)}, {spanWords(cur.start_min, cur.end_min)}</span>
          {then && <span className="dash-then">Then {then.label}, {spanWords(then.start_min, then.end_min)}</span>}
        </Link>
      ) : (
        <p className="dash-now none a-now">Nothing is on file for the rest of today or tomorrow.</p>
      )}

      <nav className="dash-tabs a-tabs" aria-label="What the dashboard shows">
        <Link href="/portal/home" className={pick ? '' : 'on'} aria-current={pick ? undefined : 'page'} style={{ '--fc': 'var(--I)' } as CSSProperties}>Calendar</Link>
        {filled.map(({ f }) => (
          <Link key={f.name} href={`/portal/home?show=${slugOf(f.name)}`} className={pick === f.name ? 'on' : ''} aria-current={pick === f.name ? 'page' : undefined}
            style={{ '--fc': belongsTo(f.name, '').color } as CSSProperties}>{f.name}</Link>
        ))}
      </nav>

      {cal && (
        <div className="dash-sec a-view">
          <div className="dash-h">
            <h2>Today and the next six days</h2>
            <Link href={SCHEDULE_PATH} className="dash-more">Open the calendar</Link>
          </div>
          <div className="dash-days">
            {cal.days.map(day => {
              const items: CalItem[] = [...day.untimed, ...day.timed].sort((a, b) => (a.start ?? -1) - (b.start ?? -1));
              return (
                <div key={day.date} className={`dash-row${day.date === now.date ? ' today' : ''}`}>
                  <Link href={`${TIME_PATH}/${day.date}`} className="dash-dname">
                    <span>{day.date === now.date ? 'Today' : weekdayName(weekdayOf(day.date)).slice(0, 3)}</span>
                    <b>{Number(day.date.slice(8, 10))}</b>
                  </Link>
                  <div className="dash-items">
                    {items.length === 0 && <p className="dash-empty">Nothing on file</p>}
                    {items.map(i => (
                      <a key={i.key} href={i.href} className={`dash-item d-${i.dept} ${i.kind}`} {...popData(i)}>
                        <span className="dash-it">{i.start === null ? 'No time' : i.timeShort}</span>
                        <span className="dash-il">{i.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pick && (
        <div className="dash-sec a-view">
          <div className="dash-h">
            <h2>{pick}</h2>
            <Link href={folderPath(pick)} className="dash-more">Open the folder</Link>
          </div>
          <div className="dash-said">
            {belong?.ahead.map(c => (
              <Link key={c.id} href={`${TIME_PATH}/${c.on_date}/${c.id}`} className="dash-st">
                <b>{c.label}</b>
                <span>{c.on_date === now.date ? 'Today' : short(c.on_date)}, {spanWords(c.start_min, c.end_min)}</span>
              </Link>
            ))}
            {said.map(s => (
              <Link key={s.id} href={`${folderPath(pick)}/said/${s.id}`} className="dash-st">
                <b>{s.topic}</b>
                <span>{s.said}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="dash-sec a-pend">
        <div className="dash-h"><h2>Pending</h2>{waiting > 0 && <span className="dash-count">{waiting}</span>}</div>
        <div className="dash-pending"><PilotPending panel={panel} /></div>
      </div>
    </>
  );

  return (
    <div className="home-split pt-dash">
      <span id="uc-path" data-path="Resident Portal home" hidden />
      <aside className="home-dash" aria-label="Dashboard">
        <div className="home-dash-in">{board}</div>
      </aside>
      <div className="home-talk">
        <PilotConversation
          initial={{
            messages: t.messages as any,
            more: t.more,
            presses: t.presses,
            waiting: d.view.waitingResident.map(p => ({ id: p.id, kind: p.kind, summary: p.summary })),
            noticeSeen: !!w.access.notice_seen_at,
            ownAccount: modelRoute() === 'own account'
          }}
        />
      </div>
      <details className="home-dash-phone">
        <summary>{cur ? `${cur.live ? 'Now' : 'Coming up'}: ${cur.label}` : 'Dashboard'}{waiting ? `. ${waiting} pending` : ''}</summary>
        <div className="home-dash-in">{board}</div>
      </details>
      <PilotCalPop />
    </div>
  );
}
