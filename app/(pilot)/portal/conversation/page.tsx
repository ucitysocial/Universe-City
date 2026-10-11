import { redirect } from 'next/navigation';
import PilotConversation from '@/components/PilotConversation';
import { who } from '@/lib/pilot/auth';
import { withResident } from '@/lib/pilot/db';
import { loadFile } from '@/lib/pilot/file';
import { thread } from '@/lib/pilot/turn';

export const dynamic = 'force-dynamic';

export default async function ConversationPage() {
  const w = await who();
  if (!w.ok) redirect('/login?next=/portal/conversation');
  const t = await thread(w.userId);
  const view = await withResident({ userId: w.userId, actor: 'resident' }, q => loadFile(q, w.access.timezone, { statements: 1 }));
  return (
    <PilotConversation
      initial={{
        messages: t.messages as any,
        more: t.more,
        waiting: view.waitingResident.map(p => ({ id: p.id, kind: p.kind, summary: p.summary })),
        noticeSeen: !!w.access.notice_seen_at
      }}
    />
  );
}
