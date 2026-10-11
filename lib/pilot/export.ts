// The whole test for one resident, in a form that can be taken out and studied.
//
// It holds the conversation in order, what each reply did and why, what the model asked for step by step,
// every File entry with its earlier versions, and the cost of each reply. It is built for the resident who asks,
// under that resident's own row level security, so it can hold no other resident's row.

import type { Q } from './db';
import { TS } from './db';
import { PROMPT_VERSION } from './prompt';
import { localNow, sayClock, sayDate, sayDays, saySpan } from './time';

export const EXPORT_FORMAT = 'universe-city-founder-test-export-1';

export async function exportAll(q: Q, zone: string) {
  const messages = await q<any>(
    `select m.id, m.speaker, m.body, ${TS('m.created_at')} as created_at, m.session_id, m.reply_to, m.removed
       from uc_pilot.messages m order by m.seq`);
  const turns = await q<any>(
    `select t.id, t.message_id, t.reply_id, t.state, t.error, t.model, t.prompt_version, t.steps,
            t.input_tokens, t.output_tokens, t.cache_read_tokens, t.cache_write_tokens, t.cost_micro::float8 as cost_micro,
            ${TS('t.started_at')} as started_at, ${TS('t.finished_at')} as finished_at, t.transcript
       from uc_pilot.turns t order by t.started_at`);
  const actions = await q<any>(
    `select a.id, a.turn_id, a.message_id, a.tool, a.args, a.outcome, a.detail, a.target, a.target_id, a.actor, ${TS('a.at')} as at
       from uc_pilot.actions a order by a.seq`);
  const statements = await q<any>(
    `select id, said, topic, folder, about_date::text as about_date, state, supersedes, source_message_id, basis, filed_by,
            ${TS('created_at')} as created_at, ${TS('ended_at')} as ended_at, ended_by_message_id
       from uc_pilot.statements order by created_at`);
  const schedule = await q<any>(
    `select id, label, days, start_min, end_min, state, said, source_message_id, basis, filed_by,
            ${TS('created_at')} as created_at, ${TS('ended_at')} as ended_at from uc_pilot.schedule_items order by created_at`);
  const commitments = await q<any>(
    `select id, label, on_date::text as on_date, start_min, end_min, completion, schedule_item_id, execution, actual_start_min, actual_end_min,
            timing, time_is_estimate, outcome_said, outcome_message_id, ${TS('outcome_at')} as outcome_at,
            ${TS('withdrawn_at')} as withdrawn_at, withdrawn_said, withdrawn_message_id, said, source_message_id, basis, filed_by,
            ${TS('created_at')} as created_at from uc_pilot.commitments order by on_date, created_at`);
  const plans = await q<any>(
    `select id, plan_date::text as plan_date, state, ${TS('confirmed_at')} as confirmed_at, confirmed_via, confirmed_message_id, confirmed_items, realism,
            ${TS('created_at')} as created_at from uc_pilot.plans order by plan_date`);
  const waiting = await q<any>(
    `select id, decider, kind, summary, payload, rests_on, state, source_message_id, created_by, ${TS('created_at')} as created_at,
            ${TS('decided_at')} as decided_at, decided_via, decided_message_id, decided_actor, result from uc_pilot.pending order by created_at`);
  const followUps = await q<any>(
    `select id, owner, kind, what, due_on::text as due_on, state, source_message_id, created_by, ${TS('created_at')} as created_at,
            ${TS('closed_at')} as closed_at, closed_said, closed_message_id, closed_by from uc_pilot.follow_ups order by created_at`);
  const revisions = await q<any>(
    `select id, table_name, row_id, before, after, changed, actor, message_id, reason, ${TS('at')} as at from uc_pilot.revisions order by seq`);

  const byTurn = new Map<string, any[]>();
  for (const a of actions) {
    if (!a.turn_id) continue;
    if (!byTurn.has(a.turn_id)) byTurn.set(a.turn_id, []);
    byTurn.get(a.turn_id)!.push(a);
  }
  const turnOf = new Map<string, any>(turns.map((t: any) => [t.message_id, t]));

  // One entry for each exchange: what the resident wrote, what the guide answered, and everything in between.
  const exchanges = messages.filter((m: any) => m.speaker === 'resident').map((m: any) => {
    const t = turnOf.get(m.id);
    const reply = messages.find((x: any) => x.reply_to === m.id) || null;
    return {
      resident: { id: m.id, at: m.created_at, said: m.body, taken_out_before_keeping: m.removed || [] },
      guide: reply ? { id: reply.id, at: reply.created_at, said: reply.body } : null,
      reply_state: t?.state ?? 'no reply was started',
      reply_error: t?.error ?? null,
      model: t?.model ?? null,
      instructions_version: t?.prompt_version ?? null,
      model_calls: t?.steps ?? 0,
      tokens: t ? { read: t.input_tokens, written: t.output_tokens, read_from_cache: t.cache_read_tokens, written_to_cache: t.cache_write_tokens } : null,
      cost_usd: t ? Math.round(t.cost_micro) / 1_000_000 : 0,
      seconds: t?.started_at && t?.finished_at ? Math.round((Date.parse(t.finished_at) - Date.parse(t.started_at)) / 100) / 10 : null,
      actions: (t ? byTurn.get(t.id) || [] : []).map((a: any) => ({ action: a.tool, asked_with: a.args, outcome: a.outcome, what_happened: a.detail, entry: a.target ? { table: a.target, id: a.target_id } : null, at: a.at })),
      // What the model asked for and what the server answered, in order. This is the part to study when a reply went wrong.
      model_steps: Array.isArray(t?.transcript) ? t.transcript : []
    };
  });

  const now = localNow(zone);
  return {
    format: EXPORT_FORMAT,
    made_at: new Date().toISOString(),
    made_at_local: now.label,
    zone,
    instructions_version_now: PROMPT_VERSION,
    counts: {
      messages: messages.length, exchanges: exchanges.length, actions: actions.length, statements: statements.length,
      weekly_schedule_items: schedule.length, commitments: commitments.length, plans: plans.length,
      waiting_items: waiting.length, follow_ups: followUps.length, changes: revisions.length
    },
    total_cost_usd: Math.round(turns.reduce((n: number, t: any) => n + (t.cost_micro || 0), 0)) / 1_000_000,
    exchanges,
    file: { statements, weekly_schedule: schedule, commitments, plans, waiting_items: waiting, follow_ups: followUps },
    changes: revisions,
    actions_from_the_screen: actions.filter((a: any) => !a.turn_id)
  };
}

const OUTCOME: Record<string, string> = {
  filed: 'FILED', unchanged: 'NO CHANGE', prepared: 'WAITING FOR YOU', proposed: 'SENT TO YOUR AGENT',
  refused: 'LEFT OFF THE FILE', failed: 'DID NOT WORK', read: 'READ', decided: 'DECIDED'
};

/** The same export as plain text, to read from top to bottom. */
export function exportText(x: Awaited<ReturnType<typeof exportAll>>): string {
  const L: string[] = [];
  const when = (iso: string) => localNow(x.zone, new Date(iso)).label;
  L.push('UNIVERSE CITY FOUNDER TEST');
  L.push(`Made ${x.made_at_local}. Zone ${x.zone}.`);
  L.push(`${x.counts.exchanges} exchanges. ${x.counts.actions} actions. Model cost $${x.total_cost_usd.toFixed(4)}.`);
  L.push('');
  L.push('==================== CONVERSATION ====================');
  for (const e of x.exchanges) {
    L.push('');
    L.push(`[${when(e.resident.at)}] YOU`);
    L.push(e.resident.said);
    if (e.resident.taken_out_before_keeping.length) L.push(`  (taken out before the message was kept: ${e.resident.taken_out_before_keeping.join(', ')})`);
    if (e.guide) {
      L.push('');
      L.push(`[${when(e.guide.at)}] GUIDE, SOFTWARE`);
      L.push(e.guide.said);
    } else {
      L.push('');
      L.push(`  (no reply was written. State: ${e.reply_state}${e.reply_error ? `. ${e.reply_error}` : ''})`);
    }
    for (const a of e.actions) L.push(`  ${OUTCOME[a.outcome] || a.outcome} | ${a.action} | ${a.what_happened ?? ''}`);
    L.push(`  (${e.model ?? 'no model'}, instructions ${e.instructions_version ?? 'unknown'}, ${e.model_calls} model ${e.model_calls === 1 ? 'call' : 'calls'}, ${e.seconds ?? '?'} seconds, $${e.cost_usd.toFixed(4)})`);
  }
  L.push('');
  L.push('==================== FILE: WHAT YOU SAID ====================');
  for (const s of x.file.statements) {
    L.push(`- [${s.state}] ${s.folder} / ${s.topic}: ${s.said} (rests on: ${String(s.basis).replace(/_/g, ' ')}, filed ${when(s.created_at)})`);
  }
  if (!x.file.statements.length) L.push('No statement is on file.');
  L.push('');
  L.push('==================== FILE: WEEKLY SCHEDULE ====================');
  for (const s of x.file.weekly_schedule) L.push(`- [${s.state}] ${s.label}, ${sayDays(s.days)}, ${saySpan(s.start_min, s.end_min)}${s.said ? `. Your words: ${s.said}` : ''}`);
  if (!x.file.weekly_schedule.length) L.push('No weekly schedule item is on file.');
  L.push('');
  L.push('==================== FILE: DAYS ====================');
  let day = '';
  for (const c of x.file.commitments) {
    if (c.on_date !== day) {
      day = c.on_date;
      const plan = x.file.plans.find((p: any) => p.plan_date === day);
      L.push(`${sayDate(day)}. ${plan ? (plan.state === 'confirmed' ? 'Plan confirmed by you.' : 'Plan is a draft.') : 'No Plan.'}`);
    }
    const outcome = c.withdrawn_at ? 'taken off' : c.execution === 'planned' ? 'no outcome reported' : String(c.execution).replace(/_/g, ' ');
    const actual = c.actual_start_min !== null || c.actual_end_min !== null ? `, actual ${c.actual_start_min !== null ? sayClock(c.actual_start_min) : '?'} to ${c.actual_end_min !== null ? sayClock(c.actual_end_min) : '?'}` : '';
    L.push(`  - ${c.label}, ${saySpan(c.start_min, c.end_min)}. ${outcome}${actual}. Rests on: ${String(c.basis).replace(/_/g, ' ')}${c.said ? `. Your words: ${c.said}` : ''}`);
  }
  if (!x.file.commitments.length) L.push('No commitment is on file.');
  L.push('');
  L.push('==================== WAITING ITEMS AND FOLLOW UPS ====================');
  for (const p of x.file.waiting_items) L.push(`- [${p.state}] for ${p.decider === 'agent' ? 'a person' : 'you'}: ${p.summary}`);
  for (const f of x.file.follow_ups) L.push(`- [${f.state}] follow up for ${f.owner}: ${f.what}${f.due_on ? `, needed by ${sayDate(f.due_on)}` : ''}`);
  if (!x.file.waiting_items.length && !x.file.follow_ups.length) L.push('None.');
  L.push('');
  L.push('==================== CHANGES ====================');
  for (const r of x.changes) {
    const keys = (r.changed as string[]).filter(k => !['search'].includes(k));
    L.push(`- ${when(r.at)} | ${r.table_name} | by ${r.actor}${r.reason ? ` | ${r.reason}` : ''} | ${keys.map(k => `${k}: ${JSON.stringify(r.before?.[k] ?? null)} became ${JSON.stringify(r.after?.[k] ?? null)}`).join('; ')}`);
  }
  if (!x.changes.length) L.push('No entry has changed.');
  return L.join('\n');
}
