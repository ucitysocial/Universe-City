'use client';

import { usePathname } from 'next/navigation';

function contextFromPath(path: string) {
  if (path.includes('/time')) return 'Time';
  if (path.includes('/standards')) return 'Standards';
  if (path.includes('/orientation')) return 'Orientation';
  if (path.includes('/account')) return 'Account';
  return 'Dashboard';
}

export default function AgentRail({ timeStarted }: { timeStarted: boolean }) {
  const path = usePathname();
  const context = contextFromPath(path);

  return (
    <aside className="agent-rail" data-tour="agent">
      <div className="agent-rail-head">
        <p className="kick">Agent</p>
        <h2>Universe City</h2>
        <p className="agent-context">Working in: {context}</p>
      </div>

      {!timeStarted ? (
        <div className="agent-prompt">
          <p className="agent-time">FIRST FOCUS</p>
          <strong>We start with Time.</strong>
          <p>
            Your first Plan gives us something real to work from. We will use it to learn how your
            days actually move, not how they are supposed to look on paper.
          </p>
        </div>
      ) : (
        <div className="agent-prompt quiet">
          <p className="agent-time">TODAY</p>
          <strong>Nothing needed from you right now.</strong>
          <p>
            Your Agent will use your Plan, active systems, and open questions to decide when a
            follow-up is actually useful.
          </p>
        </div>
      )}

      <div className="agent-thread-preview">
        <div className="thread-line">
          <span className="thread-dot" />
          <p>
            <b>Agent stays here.</b><br />
            As you move through your systems, this space keeps the conversation in context.
          </p>
        </div>
      </div>

      <div className="agent-composer-shell" aria-label="Agent messaging preview">
        <div>Message your Agent</div>
        <button type="button" disabled title="Agent messaging is wired in the next build slice">
          Send
        </button>
      </div>
    </aside>
  );
}
