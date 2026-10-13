import Link from 'next/link';
import { notFound } from 'next/navigation';
import PilotGuidedLife from '@/components/PilotGuidedLife';
import { who } from '@/lib/pilot/auth';
import { withResident, isUuid } from '@/lib/pilot/db';
import { loadCommitment } from '@/lib/pilot/browse';
import { TIME_PATH } from '@/lib/pilot/paths';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agent Guided Life | Universe City', robots: { index: false, follow: false } };

// Founder-only support view of the SAME resident commitment. Real staff assignments
// and other residents are not authorized by this view.
export default async function AgentGuidedPage({ params }: { params:{id:string} }) {
  const w=await who();
  if(!w.ok || !w.access.decides_proposals || !isUuid(params.id)) notFound();
  const item=await withResident({userId:w.userId,actor:'resident'},q=>loadCommitment(q,params.id));
  if(!item)notFound();
  return (
    <div className="pt-page gl-agent-page">
      <p className="pt-kick">AGENT PORTAL / FOUNDER REVIEW</p>
      <h1>Support this commitment</h1>
      <p className="pt-lede">You are viewing the founder's existing File. An agent can prepare proposed steps; the resident chooses the plan and reports what happened.</p>
      <p className="gl-back"><Link href={`${TIME_PATH}/${item.c.on_date}/${item.c.id}`}>← Open resident commitment</Link></p>
      <PilotGuidedLife commitmentId={item.c.id} label={item.c.label} mode="agent" />
      <p className="gl-fine">This founder test view does not grant access to other residents' Files. Human agent assignments and approvals need their own rules before wider release.</p>
    </div>
  );
}
