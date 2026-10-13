// Steps in the File.
//
// The founder set on October 13, 2026 that steps are the same on every screen, in Guided Life, and for the agent.
// A list of steps belongs to one routine, one weekly item, or one entry. The steps the resident keeps come first, in
// order, with their groups and their smaller steps. The agent's suggestions the resident has not taken out follow,
// faded. A step is checked on one day, with the time it was done. Nothing here deletes a row: a step taken out keeps
// its row with the state removed, and a suggestion taken out keeps a row with the state dismissed.

import type { Q } from './db';
import type { DemoPlan, PlanStep } from './guided-demo';

export type Owner = { routine: string } | { scheduleItemId: string } | { commitmentId: string };

type Row = { id: string; parent_id: string | null; position: number; label: string; group_name: string | null; origin: string | null; state: string };
type ListRow = { id: string; done_when: string | null };

function where(o: Owner): [string, unknown] {
  if ('routine' in o) return ['routine = $1', o.routine];
  if ('scheduleItemId' in o) return ['schedule_item_id = $1', o.scheduleItemId];
  return ['commitment_id = $1', o.commitmentId];
}

async function findList(q: Q, o: Owner): Promise<ListRow | null> {
  const [w, v] = where(o);
  return (await q<ListRow>(`select id, done_when from uc_pilot.step_lists where ${w} limit 1`, [v]))[0] ?? null;
}

/**
 * The steps of an owner as a plan, built over the plan the File and the agent hold (base). With no list in the File,
 * the base comes back as it is. date: the day whose checks are read.
 */
export async function loadSteps(q: Q, o: Owner, base: DemoPlan, date: string): Promise<DemoPlan> {
  const list = await findList(q, o);
  if (!list) return base;
  const rows = await q<Row>(
    `select id, parent_id, position, label, group_name, origin, state from uc_pilot.steps where list_id = $1 order by position`, [list.id]);
  const top = rows.filter(r => !r.parent_id && r.state === 'current');
  const kids = (id: string) => rows.filter(r => r.parent_id === id && r.state === 'current');
  const groups: DemoPlan['groups'] = [];
  for (const r of top) {
    const step: PlanStep = {
      id: r.id, label: r.label, cue: base.groups.flatMap(g => g.steps).find(x => x.label === (r.origin ?? r.label))?.cue ?? '',
      orig: r.origin && base.groups.some(g => g.steps.some(x => x.suggested && x.label === r.origin)) ? r.origin : undefined,
      sub: kids(r.id).map(k => k.label), subIds: kids(r.id).map(k => k.id)
    };
    if (!step.sub?.length) { delete step.sub; delete step.subIds; }
    const last = groups[groups.length - 1];
    if (last && last.name === r.group_name) last.steps.push(step);
    else groups.push({ name: r.group_name, steps: [step] });
  }
  const dismissed = rows.filter(r => r.state === 'dismissed').map(r => r.label);
  // What the File and the agent hold and the list does not: a step filed for the routine, and each suggestion not
  // taken out.
  const have = new Set(rows.filter(r => r.state === 'current').flatMap(r => [r.label.toLowerCase(), (r.origin ?? '').toLowerCase()]));
  const gone = new Set(dismissed.map(d => d.toLowerCase()));
  const missing = base.groups.flatMap(g => g.steps).filter(x => !have.has(x.label.toLowerCase()) && !gone.has(x.label.toLowerCase()));
  const filed = missing.filter(x => !x.suggested);
  const sug = missing.filter(x => x.suggested);
  if (!groups.length) groups.push({ name: null, steps: [] });
  groups[0] = { ...groups[0], steps: [...filed, ...groups[0].steps] };
  groups[groups.length - 1] = { ...groups[groups.length - 1], steps: [...groups[groups.length - 1].steps, ...sug] };

  const ids = rows.map(r => r.id);
  const marks = ids.length ? await q<{ step_id: string; done: boolean; marked_at: string; started_at: string | null }>(
    `select step_id, done, marked_at::text as marked_at, started_at::text as started_at from uc_pilot.step_marks
      where on_date = $1::date and step_id = any ($2::uuid[])`, [date, ids]) : [];
  const done = new Map(marks.filter(m => m.done).map(m => [m.step_id, new Date(m.marked_at).toISOString()]));
  const begun = new Map(marks.filter(m => m.started_at).map(m => [m.step_id, new Date(m.started_at!).toISOString()]));
  const run = (await q<{ started_at: string; ended_at: string | null; outcome: string | null }>(
    `select started_at::text as started_at, ended_at::text as ended_at, outcome from uc_pilot.guided_runs where list_id = $1 and on_date = $2::date`, [list.id, date]))[0];
  const plan: DemoPlan = {
    ...base, listId: list.id, doneWhen: list.done_when ?? base.doneWhen, groups, dismissed, marks: {}, subs: {}, starts: {},
    run: run ? { startedAt: new Date(run.started_at).toISOString(), endedAt: run.ended_at ? new Date(run.ended_at).toISOString() : null, outcome: run.outcome } : null
  };
  for (const r of top) {
    if (begun.has(r.id)) plan.starts![r.label] = begun.get(r.id)!;
    if (done.has(r.id)) plan.marks![r.label] = done.get(r.id)!;
    const k = kids(r.id);
    if (k.some(x => done.has(x.id))) plan.subs![r.label] = k.map(x => done.has(x.id));
  }
  return plan;
}

/** Saves a plan as the resident left it. Returns the plan read back from the File, with the rows it now has. */
export async function saveSteps(q: Q, o: Owner, plan: DemoPlan, base: DemoPlan, date: string): Promise<DemoPlan> {
  let list = await findList(q, o);
  if (!list) {
    const cols = 'routine' in o ? ['routine', o.routine] : 'scheduleItemId' in o ? ['schedule_item_id', o.scheduleItemId] : ['commitment_id', o.commitmentId];
    list = (await q<ListRow>(`insert into uc_pilot.step_lists (${cols[0]}) values ($1) returning id, done_when`, [cols[1]]))[0];
  }
  if (plan.doneWhen && plan.doneWhen !== (list.done_when ?? base.doneWhen)) {
    await q(`update uc_pilot.step_lists set done_when = $2 where id = $1`, [list.id, plan.doneWhen.slice(0, 400)]);
  }
  const rows = await q<Row>(`select id, parent_id, position, label, group_name, origin, state from uc_pilot.steps where list_id = $1`, [list.id]);
  const byId = new Map(rows.map(r => [r.id, r]));
  const kept = new Set<string>();
  let pos = 0;
  const clean = (t: string) => t.replace(/\s+/g, ' ').trim().slice(0, 120);

  for (const g of plan.groups) {
    for (const x of g.steps) {
      if (x.suggested) continue;
      const label = clean(x.label) || clean(x.orig || '') || 'Step';
      pos += 1;
      let id = x.id && byId.has(x.id) ? x.id : null;
      if (id) {
        const r = byId.get(id)!;
        if (r.label !== label || r.position !== pos || r.group_name !== (g.name || null) || r.state !== 'current' || r.parent_id) {
          await q(`update uc_pilot.steps set label = $2, position = $3, group_name = $4, state = 'current', parent_id = null where id = $1`, [id, label, pos, g.name || null]);
        }
      } else {
        id = (await q<{ id: string }>(
          `insert into uc_pilot.steps (list_id, position, label, group_name, origin) values ($1, $2, $3, $4, $5) returning id`,
          [list.id, pos, label, g.name || null, (x.orig || label).slice(0, 120)]))[0].id;
      }
      kept.add(id);
      // The smaller steps of this step, matched by row, then by name.
      const subs = (x.sub ?? []).map(clean).filter(Boolean);
      const old = rows.filter(r => r.parent_id === id);
      for (let k = 0; k < subs.length; k++) {
        const want = x.subIds?.[k];
        const match = (want && old.find(r => r.id === want)) || old.find(r => r.label === subs[k] && !kept.has(r.id));
        pos += 1;
        if (match) {
          if (match.label !== subs[k] || match.position !== pos || match.state !== 'current') {
            await q(`update uc_pilot.steps set label = $2, position = $3, state = 'current' where id = $1`, [match.id, subs[k], pos]);
          }
          kept.add(match.id);
        } else {
          const nid = (await q<{ id: string }>(
            `insert into uc_pilot.steps (list_id, parent_id, position, label, origin) values ($1, $2, $3, $4, $4) returning id`,
            [list.id, id, pos, subs[k]]))[0].id;
          kept.add(nid);
        }
      }
    }
  }
  // A step no longer in the plan is taken out. Its row and its checks stay.
  for (const r of rows) {
    if (r.state === 'current' && !kept.has(r.id)) await q(`update uc_pilot.steps set state = 'removed' where id = $1`, [r.id]);
  }
  // A suggestion taken out is kept as dismissed, so it is not suggested again.
  const dismissed = new Set(rows.filter(r => r.state === 'dismissed').map(r => r.label.toLowerCase()));
  for (const d of plan.dismissed ?? []) {
    const label = clean(d);
    if (!label || dismissed.has(label.toLowerCase())) continue;
    pos += 1;
    await q(`insert into uc_pilot.steps (list_id, position, label, origin, state) values ($1, $2, $3, $3, 'dismissed')`, [list.id, Math.min(pos, 400), label]);
    dismissed.add(label.toLowerCase());
  }
  return loadSteps(q, o, base, date);
}

/** Checks one step, or a smaller step, on one day. at: the time it was done, when the resident gave one. */
export async function markStep(q: Q, stepId: string, date: string, done: boolean, at?: string | null): Promise<void> {
  await q(
    `insert into uc_pilot.step_marks (step_id, on_date, done, marked_at) values ($1, $2::date, $3, coalesce($4::timestamptz, now()))
     on conflict (user_id, step_id, on_date) do update set done = excluded.done, marked_at = excluded.marked_at`,
    [stepId, date, done, at ?? null]);
}

/** The resident started Guided Life through a list on a day. A second start on the same day keeps the first time. */
export async function startRun(q: Q, listId: string, date: string): Promise<void> {
  await q(`insert into uc_pilot.guided_runs (list_id, on_date) values ($1, $2::date) on conflict (user_id, list_id, on_date) do nothing`, [listId, date]);
}

/** A step became the current step. The first time on a day is kept. */
export async function beginStep(q: Q, stepId: string, date: string): Promise<void> {
  await q(
    `insert into uc_pilot.step_marks (step_id, on_date, done, started_at) values ($1, $2::date, false, now())
     on conflict (user_id, step_id, on_date) do update set started_at = coalesce(uc_pilot.step_marks.started_at, excluded.started_at)`,
    [stepId, date]);
}

/** The resident answered the question at the end of the run. */
export async function endRun(q: Q, listId: string, date: string, outcome: 'done' | 'not_yet'): Promise<void> {
  await q(`update uc_pilot.guided_runs set ended_at = now(), outcome = $3 where list_id = $1 and on_date = $2::date`, [listId, date, outcome]);
}

/** The list of an owner, or null. */
export async function listOf(q: Q, o: Owner): Promise<string | null> {
  return (await findList(q, o))?.id ?? null;
}
