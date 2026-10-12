import Link from 'next/link';
import PilotDecide from '@/components/PilotDecide';
import { spanWords, type SideView } from '@/lib/pilot/browse';
import { belongsTo } from '@/lib/pilot/dept';
import { TIME_PATH } from '@/lib/pilot/paths';
import { sayDate } from '@/lib/pilot/time';
import { briefOf } from '@/lib/pilot/turn';

/**
 * The small window at the right of the frame. It stays in place on every screen and shows what the File holds
 * right now: what is pending, what was filed lately, and what comes next.
 * Each line is read from the File. The window keeps no entry of its own.
 */
export default function PilotSide({ side, hrefs }: { side: SideView; hrefs: Record<string, string> }) {
  return (
    <aside className="os-side" aria-label="Now on file">
      <div className="win">
        <div className="win-bar">Now on file</div>
        <div className="win-body">
          <section>
            <h2>Pending</h2>
            {side.waiting.length === 0 && <p className="win-none">Nothing is pending.</p>}
            {side.waiting.map(p => (
              <div key={p.id} className="win-wait">
                <p>{p.summary}</p>
                <PilotDecide id={p.id} kind={p.kind} />
              </div>
            ))}
          </section>
          <section>
            <h2>Filed lately</h2>
            {side.filed.length === 0 && <p className="win-none">No entry is filed yet.</p>}
            {side.filed.map(a => {
              const line = briefOf(a.outcome, a.brief, a.detail).replace(/^[A-Z][a-z ]{2,24}: /, '');
              const href = a.target_id ? hrefs[a.target_id] : null;
              return href
                ? <Link key={a.id} href={href} className="win-line"><span className="fi i-page" /><span>{line}</span></Link>
                : <p key={a.id} className="win-line"><span className="fi i-page" /><span>{line}</span></p>;
            })}
          </section>
          <section>
            <h2>Next on file</h2>
            {side.next.length === 0 && <p className="win-none">No commitment is on file for today or a day ahead.</p>}
            {side.next.map(c => (
              <Link key={c.id} href={`${TIME_PATH}/${c.on_date}/${c.id}`} className="win-line">
                <span className="fi i-day" style={{ ['--fc' as string]: belongsTo(c.folder, c.label).color }} />
                <span><b>{c.label}</b><br />{sayDate(c.on_date).replace(/, \d{4}$/, '')}, {spanWords(c.start_min, c.end_min)}</span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </aside>
  );
}
