// A change the resident makes in the form on an entry, and a note the resident writes there.
//
// The form is the resident's own hand. No language model reads it and no language model writes the entry.
// It runs the same server action the conversation runs, so the same rules hold: an entry with an outcome is
// changed by a correction, a span of eighteen hours is refused, and each earlier value is kept in the history.
// The change and its line in the activity list are written in one transaction.

import { randomUUID } from 'node:crypto';
import { isUuid, withResident } from './db';
import type { Access } from './file';
import { clip } from './guard';
import { localNow } from './time';
import { markStep } from './steps';
import { placeSchedule, Refusal, TOOLS, type Env, type Result } from './tools';

const tool = (name: string) => TOOLS.find(t => t.name === name)!;

export type Patch = { label?: string; date?: string; start?: string; end?: string; keepBoth?: boolean };

async function listed(env: Env, kind: 'screen_edit' | 'screen_note' | 'screen_done' | 'screen_step', args: unknown, r: Result) {
  // A save that changed no value is no action. The activity list and the conversation keep to what changed.
  if (r.outcome === 'unchanged') return;
  await env.q(
    `insert into uc_pilot.actions (tool, args, outcome, detail, brief, target, target_id, idem_key)
     values ($1, $2::jsonb, $3, $4, $5, $6, $7, $8)`,
    [kind, JSON.stringify(args), 'decided', clip(r.detail, 900), r.brief ? clip(r.brief, 300) : null,
      r.target || null, r.targetId || null, `${kind}:${randomUUID()}`]);
}

/** Changes the name, the day, or the time of one commitment, as the resident entered it in the form. */
export async function editCommitment(userId: string, access: Access, id: string, patch: Patch): Promise<Result> {
  if (!isUuid(id)) throw new Refusal('Not changed. The request named no entry.');
  return withResident({ userId, actor: 'resident' }, async q => {
    const env: Env = { q, userId, messageId: null, messageText: '', now: localNow(access.timezone), basis: 'resident_confirmation', via: 'screen' };
    const old = (await q<{ start_min: number | null; end_min: number | null }>(`select start_min, end_min from uc_pilot.commitments where id = $1`, [id]))[0];
    if (!old) throw new Refusal('Not changed. That entry is not on file.');
    // The form cannot empty a time that is on file. That keeps an empty box from reading as a change.
    if ((old.start_min !== null && patch.start === '') || (old.end_min !== null && patch.end === '')) {
      throw new Refusal('Not changed. A time that is on file stays until a new time replaces it. To take a time off this entry, tell the agent.');
    }
    const args: Record<string, unknown> = { ref: id };
    for (const k of ['label', 'date', 'start', 'end'] as const) if (typeof patch[k] === 'string' && patch[k]!.trim()) args[k] = patch[k]!.trim();
    // The screen showed the overlap and the resident pressed the button that keeps both.
    if (patch.keepBoth === true) args.despite_overlap = true;
    const r = await tool('change_commitment').run(env, args);
    await listed(env, 'screen_edit', args, r);
    return r;
  });
}

/** Files a note the resident wrote on one commitment. The note is a statement in Time that names the commitment. */
export async function noteOnCommitment(userId: string, access: Access, id: string, note: string): Promise<Result> {
  if (!isUuid(id)) throw new Refusal('Not filed. The request named no entry.');
  const said = note.replace(/\s+/g, ' ').trim();
  if (!said) throw new Refusal('Not filed. The note is empty.');
  if (said.length > 1000) throw new Refusal('Not filed. A note holds 1000 characters at most.');
  return withResident({ userId, actor: 'resident' }, async q => {
    const env: Env = { q, userId, messageId: null, messageText: '', now: localNow(access.timezone), basis: 'resident_confirmation', via: 'screen' };
    const c = (await q<{ label: string }>(`select label from uc_pilot.commitments where id = $1`, [id]))[0];
    if (!c) throw new Refusal('Not filed. That entry is not on file.');
    const r = await tool('file_statement').run(env, { quote: said, topic: clip(`Note on ${c.label}`, 80), folder: 'Time', about_ref: id });
    const out: Result = r.outcome === 'filed' ? { ...r, brief: `Filed: Note on ${c.label}.` } : r;
    await listed(env, 'screen_note', { ref: id }, out);
    return out;
  });
}

/**
 * Marks one commitment done, as the resident pressed it on the screen. The founder set on October 12, 2026 that the
 * press is enough: the agent files nothing for it and says nothing about it, and it can refer to it later. A press
 * never reports partly done or did not happen. For those the resident tells the agent.
 */
export async function markDone(userId: string, access: Access, id: string): Promise<Result> {
  if (!isUuid(id)) throw new Refusal('Not marked. The request named no entry.');
  return withResident({ userId, actor: 'resident' }, async q => {
    const now = localNow(access.timezone);
    const env: Env = { q, userId, messageId: null, messageText: '', now, basis: 'resident_confirmation', via: 'screen' };
    const c = (await q<{ label: string; on_date: string; start_min: number | null; execution: string; withdrawn_at: string | null }>(
      `select label, on_date::text as on_date, start_min, execution, withdrawn_at::text as withdrawn_at from uc_pilot.commitments where id = $1`, [id]))[0];
    if (!c) throw new Refusal('Not marked. That entry is not on file.');
    if (c.withdrawn_at) throw new Refusal('Not marked. That entry was taken off.');
    if (c.execution === 'executed') return { outcome: 'unchanged', detail: `${c.label} is already done.`, brief: `No change: ${c.label} is already done.`, target: 'commitments', targetId: id };
    if (c.on_date > now.date) throw new Refusal('Not marked. That entry is on a day ahead. Mark it done on its day, or move it to today first.');
    await q(`select set_config('uc.reason', 'The resident marked it done on the screen.', true)`);
    await q(`update uc_pilot.commitments set execution = 'executed', outcome_via = 'screen', outcome_at = now() where id = $1`, [id]);
    const r: Result = { outcome: 'filed', detail: `Marked done on the screen: ${c.label}, ${c.on_date}.`, brief: `Done: ${c.label}.`, target: 'commitments', targetId: id };
    await listed(env, 'screen_done', { ref: id }, r);
    return r;
  });
}

/** Marks one step done or not done on one day's entry. A weekly item that is not on that day yet is placed first. */
export async function markStepOnScreen(userId: string, access: Access, p: { id: string; weekly?: boolean; date?: string; step: string; done: boolean }): Promise<Result & { commitment: string }> {
  if (!isUuid(p.id) || !isUuid(p.step)) throw new Refusal('Not marked. The request named no step.');
  return withResident({ userId, actor: 'resident' }, async q => {
    const env: Env = { q, userId, messageId: null, messageText: '', now: localNow(access.timezone), basis: 'resident_confirmation', via: 'screen' };
    let commitment = p.id;
    if (p.weekly) {
      if (!p.date || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw new Refusal('Not marked. The request named no day.');
      await placeSchedule(env, p.date);
      const row = (await q<{ id: string }>(`select id from uc_pilot.commitments where schedule_item_id = $1 and on_date = $2::date`, [p.id, p.date]))[0];
      if (!row) throw new Refusal('Not marked. That routine does not fall on that day.');
      commitment = row.id;
    }
    await q(`select set_config('uc.reason', 'The resident marked a step on the screen.', true)`);
    let r;
    try { r = await markStep(q, commitment, p.step, p.done); } catch (e: any) { throw new Refusal(`Not marked. ${e?.message || 'The step was not found.'}`); }
    const out = { outcome: r.changed ? 'filed' : 'unchanged', detail: `Step ${p.done ? 'done' : 'not done'}: ${r.label}.`, brief: `${p.done ? 'Done' : 'Not done'}: ${r.label}.`, target: 'commitments', targetId: commitment, commitment } as Result & { commitment: string };
    await listed(env, 'screen_step', { ref: commitment, step: p.step, done: p.done }, out);
    return out;
  });
}
