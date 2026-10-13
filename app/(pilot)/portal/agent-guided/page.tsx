import Link from 'next/link';
import { notFound } from 'next/navigation';
import { who } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { TIME_PATH } from '@/lib/pilot/paths';
import { localNow, addDays } from '@/lib/pilot/time';

export const dynamic='force-dynamic';
export const metadata={title:'Guided Life agent support | Universe City',robots:{index:false,follow:false}};

// Founder-only agent support queue; all records belong to the *same* authenticated founder.
// The true multi-resident Agent Portal requires verified assignment permissions and is separate.
export default async function AgentGuidedIndex() {
  const w=await who();
  if(!w.ok||!w.access.decides_proposals)notFound();
  const today=localNow(w.access.timezone).date;
  const items=await withResident({userId:w.userId,actor:'resident'},q=>q<{id:string;label:string;on_date:string;execution:string}>(
    `select id,label,on_date::text as on_date,execution from uc_pilot.commitments
      where withdrawn_at is null and on_date between $1::date and $2::date
      order by on_date,start_min nulls last,created_at desc limit 40`,
    [addDays(today,-14),addDays(today,14)]
  ));
  return <div className="pt-page gl-agent-page">
    <p className="pt-kick">AGENT SUPPORT / FOUNDER TEST</p>
    <h1>Guided Life</h1>
    <p className="pt-lede">Open a resident commitment to help prepare its steps. Your suggestions stay separate from what the resident has accepted or done.</p>
    <div className="gl-agent-list">
      {items.length===0&&<p className="pt-empty">No commitments are in this date range.</p>}
      {items.map(item=><div className="gl-agent-row" key={item.id}>
        <div><strong>{item.label}</strong><p className="gl-muted">{item.on_date} · {item.execution.replace(/_/g,' ')}</p></div>
        <div className="gl-actions">
          <Link className="pt-btn" href={`/portal/agent-guided/${item.id}`}>Prepare steps</Link>
          <Link className="pt-btn ghost" href={`${TIME_PATH}/${item.on_date}/${item.id}`}>Resident view</Link>
        </div>
      </div>)}
    </div>
    <p className="gl-fine">This page reads only the founder's own File. It is not yet the full human-agent roster or a way to access another resident.</p>
  </div>;
}
