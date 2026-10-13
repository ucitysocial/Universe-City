'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import PilotGuidedSteps from '@/components/PilotGuidedSteps';
import { joinPlan, type DemoPlan } from '@/lib/pilot/guided-demo';
import { saveRemote, takeLegacy, type EntryRef } from '@/lib/pilot/steps-client';

/**
 * The steps of an entry, on the entry's own page. The founder set on October 13, 2026 that a resident sees and edits
 * the steps where the entry opens: rename, remove, move, add, and add the agent's faded suggestions. The steps are kept
 * in the File, so Guided Life, the calendar, and the agent see the same steps.
 */
export default function PilotEntrySteps({ plan: base, planKey, start, entry, date, zone }:
  { plan: DemoPlan; planKey: string; start: string; entry: EntryRef; date: string; zone?: string }) {
  const [plan, setPlan] = useState<DemoPlan>(base);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const latest = useRef(plan);
  latest.current = plan;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Steps kept on this device before the File held steps are saved to the File once.
  useEffect(() => {
    const legacy = base.listId ? null : takeLegacy(planKey);
    if (!legacy) return;
    const joined = joinPlan(legacy, base);
    setPlan(joined);
    saveRemote(entry, date, joined).then(setPlan).catch(e => setErr(String(e.message || e)));
  }, [planKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = (next: DemoPlan) => {
    setPlan(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveRemote(entry, date, latest.current)
        .then(p => { setPlan(p); setErr(null); setSaved(true); })
        .catch(e => setErr(String(e.message || e)));
    }, 700);
  };
  const current = Object.keys(plan.marks || {}).length;
  return (
    <div className="es">
      <div className="es-done"><span className="gl-cap">Done when</span><p>{plan.doneWhen}</p></div>
      <PilotGuidedSteps plan={plan} current={current ? current : -1} marks={plan.marks} zone={zone} onEdit={edit} onJump={() => { window.location.href = start; }} />
      {err && <p className="pt-err">{err}</p>}
      <div className="es-acts">
        <Link href={start} className="pt-btn">Start Guided Life</Link>
        <span className="gp-demo">{saved ? 'Saved to your File.' : 'Faded steps are your agent’s suggestions. Press + to add one.'}</span>
      </div>
    </div>
  );
}
