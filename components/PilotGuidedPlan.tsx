'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PilotGlyph from '@/components/PilotGlyph';
import { joinPlan, type DemoPlan } from '@/lib/pilot/guided-demo';

/**
 * What an entry needs, shown in the window that opens from the calendar: what counts as done, then the steps, then
 * the button that starts Guided Life. Groups of steps open and close. In the demo the steps are written for it.
 */
export default function PilotGuidedPlan({ plan: base, planKey, label, href, onGo }: { plan: DemoPlan; planKey?: string; label: string; href: string; onGo?: () => void }) {
  // The steps as the resident last changed them on the entry page or in Guided Life, on this device.
  const [plan, setPlan] = useState<DemoPlan>(base);
  useEffect(() => {
    if (!planKey) return;
    try { const p = JSON.parse(localStorage.getItem(planKey) || 'null'); setPlan(joinPlan(p, base)); } catch { /* the steps as filed */ }
  }, [planKey]);
  const [open, setOpen] = useState<boolean[]>(() => plan.groups.map((_, i) => i === 0));
  const count = plan.groups.reduce((n, g) => n + g.steps.filter(x => !x.suggested).length, 0);
  return (
    <div className="gp">
      <div className="gp-done">
        <span>Done when</span>
        <p>{plan.doneWhen}</p>
      </div>
      <div className="gp-steps">
        <span className="gp-h"><PilotGlyph name="clipboard" size={22} />{count ? <>Steps <em>{count}</em></> : 'Suggested steps'}</span>
        {plan.groups.map((g, i) => g.name ? (
          <div key={i}>
            <button type="button" className="gp-grp" aria-expanded={open[i]} onClick={() => setOpen(o => o.map((v, k) => (k === i ? !v : v)))}>
              <i className={open[i] ? 'gp-tri on' : 'gp-tri'} aria-hidden="true" />{g.name}<em>{g.steps.length}</em>
            </button>
            {open[i] && <ol className="gp-list sub">{g.steps.map(x => <li key={x.label} className={x.suggested ? 'sug' : undefined}>{x.label}</li>)}</ol>}
          </div>
        ) : (
          <ol key={i} className="gp-list">{g.steps.map(x => <li key={x.label} className={x.suggested ? 'sug' : undefined}>{x.label}</li>)}</ol>
        ))}
      </div>
      <Link href={href} className="pt-btn gp-start" onClick={onGo}>Start {label.toLowerCase()}</Link>
      <p className="gp-demo">Faded steps are your agent's suggestions. Add the ones you do in Guided Life, under Steps.</p>
    </div>
  );
}
