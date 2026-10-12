'use client';

import { usePathname } from 'next/navigation';
import PilotConversation from '@/components/PilotConversation';

/**
 * The right side of the frame: the guide, beside the File.
 * The Conversation screen is the same conversation at full width, so the side is left off there.
 */
export default function PilotGuide() {
  const path = usePathname();
  if (path.startsWith('/portal/conversation')) return null;
  return (
    <aside className="os-guide" aria-label="The guide">
      <PilotConversation mode="side" />
    </aside>
  );
}
