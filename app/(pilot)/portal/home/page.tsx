import { redirect } from 'next/navigation';
import PilotConversation from '@/components/PilotConversation';
import { who } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { loadFile } from '@/lib/pilot/file';
import { modelRoute } from '@/lib/pilot/model';
import { thread } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';

/**
 * Resident Portal home: the conversation with the agent. The dashboard sits at the right of the frame. After each
 * reply the page is read again, so the dashboard shows each entry the agent filed while the resident watches.
 */
export default async function HomePage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/home');
  const t = await thread(w.userId);
  const view = await withResident({ userId: w.userId, actor: 'resident' }, q => loadFile(q, w.access.timezone, { statements: 1 }));
  return (
    <div className="home-talk">
      <span id="uc-path" data-path="Resident Portal home" hidden />
      <PilotConversation
        initial={{
          messages: t.messages as any,
          more: t.more,
          presses: t.presses,
          waiting: view.waitingResident.map(p => ({ id: p.id, kind: p.kind, summary: p.summary })),
          noticeSeen: !!w.access.notice_seen_at || !!w.agent,
          agentView: w.agent ? { name: (w.access.display_name || 'the resident').split(' ')[0] } : undefined,
          ownAccount: modelRoute() === 'own account'
        }}
      />
    </div>
  );
}
