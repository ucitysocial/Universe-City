'use client';

import { useAgent } from './AgentShell';
import type { Client, Need } from '@/lib/agent/types';

const KIND: Record<Need['kind'], string> = {
  carried: 'To schedule', pushed: 'Pushed twice or more', decision: 'Waits for the client', team: 'Waits for a person',
  follow_up: 'Follow up', outcome: 'No outcome yet', missing: 'Missing pieces', stuck: 'Hard to start'
};

// ------------------------------------------------------------------ home: who needs attention, and why

export function AgentHome() {
  const { clients: list } = useAgent();
  const total = list.reduce((n, c) => n + c.needs.length, 0);
  return (
    <div className="fb-pane ag-home">
      <div className="ag-hero">
        <h1>Your clients</h1>
        <p><b>{total}</b> {total === 1 ? 'item waits' : 'items wait'} across {list.filter(c => c.needs.length).length} clients. Open a client to see the File, the schedule, and the conversation the client sees, with the Agency Guide beside it.</p>
      </div>
      {list.map(c => (
        <section key={c.id} className="ag-group">
          <div className="ag-group-h">
            <a href={`/agent/open/${c.id}`}><h2>{c.name}</h2></a>
            <span className={`ag-mode ${c.mode}`}>{c.mode === 'live' ? 'Your own File' : 'Made up resident of the test'}</span>
            <span className="ag-about">{c.about}</span>
            <a href={`/agent/open/${c.id}`} className="pt-btn ghost ag-small">Open {c.name.split(' ')[0]}</a>
          </div>
          {c.needs.length === 0 && <p className="dash-empty">Nothing waits for {c.name.split(' ')[0]}.</p>}
          <div className="ag-cards">
            {c.needs.map(n => <NeedCard key={n.id} c={c} n={n} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function NeedCard({ n, children }: { c: Client; n: Need; children?: React.ReactNode }) {
  return (
    <article className={`ag-card k-${n.kind}`}>
      <span className="ag-kind">{KIND[n.kind]}</span>
      <b>{n.title}</b>
      <p>{n.why}</p>
      <span className="ag-src">From: {n.source}</span>
      <div className="ag-acts">
        {children}
      </div>
    </article>
  );
}

