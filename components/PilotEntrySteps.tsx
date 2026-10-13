'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PilotGuidedSteps from '@/components/PilotGuidedSteps';
import { joinPlan, type DemoPlan } from '@/lib/pilot/guided-demo';

/**
 * The steps of an entry, on the entry's own page. The founder set on October 13, 2026 that a resident sees and edits
 * the steps where the entry opens: rename, remove, move, add, and add the agent's faded suggestions. The steps are the
 * same ones Guided Life walks through. They are kept on this device until the database holds steps.
 */
export default function PilotEntrySteps({ plan: base, planKey, start }: { plan: DemoPlan; planKey: string; start: string }) {
  const [plan, setPlan] = useState<DemoPlan>(base);
  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(planKey) || 'null'); setPlan(joinPlan(p, base)); } catch { /* the steps as filed */ }
  }, [planKey]);
  const edit = (next: DemoPlan) => {
    setPlan(next);
    try { localStorage.setItem(planKey, JSON.stringify(next)); } catch { /* kept until the page reloads */ }
  };
  return (
    <div className="es">
      <div className="es-done"><span className="gl-cap">Done when</span><p>{plan.doneWhen}</p></div>
      <PilotGuidedSteps plan={plan} current={-1} onEdit={edit} onJump={() => { window.location.href = start; }} />
      <div className="es-acts">
        <Link href={start} className="pt-btn">Start Guided Life</Link>
        <span className="gp-demo">Kept on this device for now. Faded steps are your agent&apos;s suggestions; press + to add one.</span>
      </div>
    </div>
  );
}
