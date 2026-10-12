import type { CSSProperties } from 'react';
import Link from 'next/link';
import PilotDecide from '@/components/PilotDecide';
import { Answer, Countdown } from '@/components/PilotPanelBits';
import { spanWords, type PanelView } from '@/lib/pilot/browse';
import { belongsTo } from '@/lib/pilot/dept';
import { TIME_PATH } from '@/lib/pilot/paths';
import { sayDate, weekdayName, weekdayOf } from '@/lib/pilot/time';

const short = (date: string) => sayDate(date).replace(/, \d{4}$/, '');

/**
 * The panel at the right of the frame. It stays in place on every screen.
 *   Now        what the resident is in, or what comes next, and how long until it starts
 *   This week  Monday to Sunday, how full each day is, and how many days are planned. On a Sunday it shows the
 *              coming week, because most planning happens on Sunday
 *   Pending    each item that waits for the resident: an overlap, an entry that passed with its end or its outcome
 *              unknown, and each item that waits for a yes or a no
 * The guide's job is to keep the resident planned seven days out. This panel shows how that stands.
 */
export default function PilotSide({ panel }: { panel: PanelView }) {
  const { now, then } = panel;
  const level = (h: number, n: number) => (n === 0 ? 0 : h < 3 ? 1 : h < 6 ? 2 : 3);
  return (
    <aside className="os-side" aria-label="Now and this week">
      <div className="win">
        <div className="win-bar">{sayDate(panel.today).replace(/, \d{4}$/, '')}</div>
        <div className="win-body">
          <section>
            <h2>Now</h2>
            {!now && <p className="win-none">Nothing is on file for the rest of today or tomorrow.</p>}
            {now && (
              <Link href={`${TIME_PATH}/${now.on_date}/${now.id}`} className="pn-now" style={{ '--fc': belongsTo(now.folder, now.label).color } as CSSProperties}>
                <b>{now.label}</b>
                <Countdown until={now.minutesUntil} left={now.minutesLeft} live={now.live} />
                <span className="pn-time">{now.on_date === panel.today ? '' : `${short(now.on_date)}. `}{spanWords(now.start_min, now.end_min)}</span>
              </Link>
            )}
            {then && <p className="pn-then">Then: <Link href={`${TIME_PATH}/${then.on_date}/${then.id}`}>{then.label}</Link>, {then.on_date === panel.today ? 'today' : short(then.on_date)}, {spanWords(then.start_min, then.end_min)}</p>}
          </section>

          <section>
            <h2>{panel.week.some(d => d.date === panel.today) ? 'This week' : 'The coming week'}</h2>
            <div className="pn-week">
              {panel.week.map(d => (
                <Link key={d.date} href={`${TIME_PATH}/${d.date}`} className={`pn-day l${level(d.hours, d.count)}${d.date === panel.today ? ' today' : ''}`}
                  title={`${sayDate(d.date)}. ${d.count} ${d.count === 1 ? 'entry' : 'entries'}.`}>
                  <i aria-hidden="true" />
                  <span>{weekdayName(weekdayOf(d.date)).slice(0, 3)}</span>
                </Link>
              ))}
            </div>
            <p className="pn-count">{panel.planned} of 7 days planned</p>
          </section>

          <section>
            <h2>Pending</h2>
            {panel.pending.length === 0 && <p className="win-none">No item waits for you.</p>}
            {panel.pending.map(p => p.type === 'ask' ? (
              <div key={p.key} className="pn-need">
                <p><Link href={p.href}>{p.question}</Link></p>
                <Answer question={p.question} />
              </div>
            ) : (
              <div key={p.key} className="win-wait">
                <p>{p.summary}</p>
                {p.overlap
                  ? <PilotDecide id={p.id} kind={p.kind} yes="Keep both entries" no="Leave this one off" />
                  : <PilotDecide id={p.id} kind={p.kind} />}
              </div>
            ))}
            {panel.more > 0 && <p className="win-none">{panel.more} more {panel.more === 1 ? 'question waits' : 'questions wait'}. The guide asks in the conversation.</p>}
          </section>
        </div>
      </div>
    </aside>
  );
}
