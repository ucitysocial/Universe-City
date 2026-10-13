'use client';

import { useState } from 'react';
import PilotGlyph from '@/components/PilotGlyph';
import type { DemoPlan } from '@/lib/pilot/guided-demo';

/**
 * Every step of an entry, in its groups. The founder set on October 13, 2026 that the list stays clean: a number and
 * the name of each step, and nothing more. The handle and the remove mark show only when the pointer is over a step or
 * a step has focus. Edit opens names to change, steps to add, and arrows to move a step on a phone.
 * Pressing a step outside Edit goes to that step.
 */
export default function PilotGuidedSteps({ plan, current, marks = {}, zone, onEdit, onJump }:
  { plan: DemoPlan; current: number; marks?: Record<string, string>; zone?: string; onEdit: (next: DemoPlan) => void; onJump: (idx: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState<boolean[]>(() => plan.groups.map(() => true));
  const [drag, setDrag] = useState<[number, number] | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const copy = () => plan.groups.map(g => ({ ...g, steps: [...g.steps] }));
  const move = (from: [number, number], to: [number, number]) => {
    const G = copy();
    const [item] = G[from[0]].steps.splice(from[1], 1);
    let at = to[1];
    if (from[0] === to[0] && from[1] < to[1]) at -= 1;
    G[to[0]].steps.splice(Math.max(0, at), 0, item);
    onEdit({ ...plan, groups: G });
  };
  // Taking out a step that was added from a suggestion puts the suggestion back, faded, under its first name. Only
  // the × on a faded suggestion takes it out of the routine.
  const remove = (g: number, k: number) => {
    const G = copy();
    const x = G[g].steps[k];
    if (!x.suggested && x.orig) G[g].steps[k] = { ...x, label: x.orig, suggested: true, orig: undefined };
    else G[g].steps.splice(k, 1);
    const dismissed = x.suggested ? [...(plan.dismissed || []), x.label] : plan.dismissed;
    onEdit({ ...plan, groups: G, dismissed });
  };
  const rename = (g: number, k: number, label: string) => { const G = copy(); G[g].steps[k] = { ...G[g].steps[k], label }; onEdit({ ...plan, groups: G }); };
  const renameGroup = (g: number, name: string) => { const G = copy(); G[g] = { ...G[g], name }; onEdit({ ...plan, groups: G }); };
  const accept = (g: number, k: number) => { const G = copy(); G[g].steps[k] = { ...G[g].steps[k], suggested: false, orig: G[g].steps[k].label }; onEdit({ ...plan, groups: G }); };
  const at = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(zone ? { timeZone: zone } : {}) });
  const add = (g: number) => { const G = copy(); G[g].steps.push({ label: 'New step', cue: '' }); onEdit({ ...plan, groups: G }); };

  let idx = 0;
  return (
    <div className={editing ? 'gs editing' : 'gs'}>
      <div className="gs-head">
        <PilotGlyph name="clipboard" size={26} />
        <span className="gl-cap">Steps</span>
        <button type="button" className="gl-ghost" onClick={() => setEditing(e => !e)}>{editing ? 'Finish editing' : 'Edit'}</button>
      </div>
      {plan.groups.map((g, gi) => {
        let k0 = idx;
        const nums = g.steps.map(x => (x.suggested ? -1 : k0++));
        idx = k0;
        return (
          <div key={gi} className="gs-group">
            {g.name !== null && (
              editing
                ? <input className="gs-gname" value={g.name ?? ''} placeholder="Name of the group" onChange={e => renameGroup(gi, e.target.value)} aria-label="Name of the group" />
                : <button type="button" className="gs-g" aria-expanded={open[gi]} onClick={() => setOpen(o => o.map((v, k) => (k === gi ? !v : v)))}>
                    <i className={open[gi] ? 'gp-tri on' : 'gp-tri'} aria-hidden="true" />{g.name}<em>{g.steps.filter(x => !x.suggested).length}</em>
                  </button>
            )}
            {(open[gi] || editing) && g.steps.map((s, k) => {
              const n = nums[k];
              if (s.suggested) return (
                <div key={`${gi}:${k}`} className="gs-row sug">
                  <span className="gs-grip" aria-hidden="true" />
                  <button type="button" className="gs-plus" onClick={() => accept(gi, k)} aria-label={`Add ${s.label}`}>+</button>
                  <span className="gs-name">{s.label}{s.sub && <small>{s.sub.join(', ')}</small>}</span>
                  <button type="button" className="gs-x" onClick={() => remove(gi, k)} aria-label={`Take ${s.label} out of the routine`} title="Take it out of the routine">&times;</button>
                </div>
              );
              const state = n < current ? 'did' : n === current ? 'now' : '';
              const id = `${gi}:${k}`;
              return (
                <div key={id} className={['gs-row', state, over === id ? 'over' : ''].join(' ')}
                  draggable={!editing}
                  onDragStart={() => setDrag([gi, k])} onDragEnd={() => { setDrag(null); setOver(null); }}
                  onDragOver={e => { e.preventDefault(); setOver(id); }} onDragLeave={() => setOver(null)}
                  onDrop={e => { e.preventDefault(); if (drag) move(drag, [gi, k]); setDrag(null); setOver(null); }}>
                  <span className="gs-grip" aria-hidden="true" />
                  <span className="gs-n">{state === 'did' ? '✓' : n + 1}</span>
                  {editing
                    ? <input className="gs-name" value={s.label} onChange={e => rename(gi, k, e.target.value)} aria-label={`Step ${n + 1}`} />
                    : <button type="button" className="gs-name" onClick={() => onJump(n)}>{s.label}{state === 'now' && <em>Now</em>}{state === 'did' && marks[s.label] && <em className="t">Done {at(marks[s.label])}</em>}{s.sub && <small>{s.sub.join(', ')}</small>}</button>}
                  {editing && (
                    <span className="gs-arrows">
                      <button type="button" disabled={k === 0} onClick={() => move([gi, k], [gi, k - 1])} aria-label="Move up">&#8593;</button>
                      <button type="button" disabled={k === g.steps.length - 1} onClick={() => move([gi, k], [gi, k + 2])} aria-label="Move down">&#8595;</button>
                    </span>
                  )}
                  <button type="button" className="gs-x" onClick={() => remove(gi, k)} aria-label={s.orig ? `Put ${s.orig} back as a suggestion` : `Remove ${s.label}`} title={s.orig ? 'Put it back as a suggestion' : 'Remove it'}>&times;</button>
                </div>
              );
            })}
            {editing && <button type="button" className="gl-ghost gs-add" onClick={() => add(gi)}>Add a step</button>}
          </div>
        );
      })}
    </div>
  );
}
