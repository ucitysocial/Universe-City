import { AgentClient } from '@/components/agent/AgentViews';

/** One client: check-in, conversation, schedule, File, and Guided Life. */
export default function AgentClientPage({ params }: { params: { id: string } }) {
  return <AgentClient id={params.id} />;
}
