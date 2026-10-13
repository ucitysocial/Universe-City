'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { DemoPlan } from '@/lib/pilot/guided-demo';

/**
 * What an entry needs, shown in the window that opens from the calendar: what counts as done, then the steps, then
 * the button that starts Guided Life. Groups of steps open and close. In the demo the steps are written for it.
 */
export default function PilotGuidedPlan({ plan, label, href, onGo }: { plan: DemoPlan; label: string; href: string; onGo?: () => void }) {
  const [open, setOpen] = useState<boolean[]>(() => plan.groups.map((_, i) => i === 0));
  const count = plan.groups.reduce((n, g) => n + g.steps.length, 0);
  return (
    <div className="gp">
      <div className="gp-done">
        <span>Done when</span>
        <p>{plan.doneWhen}</p>
      </div>
      <div className="gp-steps">
        <span className="gp-h">Steps <em>{count}</em></span>
        {plan.groups.map((g, i) => g.name ? (
          <div key={i}>
            <button type="button" className="gp-grp" aria-expanded={open[i]} onClick={() => setOpen(o => o.map((v, k) => (k === i ? !v : v)))}>
              <i className={open[i] ? 'gp-tri on' : 'gp-tri'} aria-hidden="true" />{g.name}<em>{g.steps.length}</em>
            </button>
            {open[i] && <ol className="gp-list sub">{g.steps.map(x => <li key={x.label}>{x.label}</li>)}</ol>}
          </div>
        ) : (
          <ol key={i} className="gp-list">{g.steps.map(x => <li key={x.label}>{x.label}</li>)}</ol>
        ))}
      </div>
      <Link href={href} className="pt-btn gp-start" onClick={onGo}>Start {label.toLowerCase()}</Link>
      <p className="gp-demo">Demo. The steps are examples, and nothing you press in Guided Life is filed.</p>
    </div>
  );
}
