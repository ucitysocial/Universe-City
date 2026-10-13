// Reads the File for the File browser: the counts beside each folder, the list inside a folder, and one entry with
// its history. Every read runs as the resident, so row level security limits it to that resident's rows.
//
// The browser shows what is on file. It builds no entry and changes none.

import { FOLDERS } from '../domain/folders';
import { carries } from './carry';
import type { Q } from './db';
import { isUuid, TS } from './db';
import { belongsTo, type Belongs } from './dept';
import { owedOn, type OwedFile } from './owed';
import { folderPath } from './paths';
import { addDays, localNow, sayClock, sayDate, sayDays, saySpan, weekdayOf } from './time';

// ------------------------------------------------------------------ the index: what each folder holds

export type DayIndex = { date: string; count: number; off: number; plan: string | null };
export type FileIndex = {
  today: string;
  folders: Record<string, { said: number; waiting: number; work: number; cal: number }>;   // by folder name. General holds what fits no folder. cal: calendar entries that belong to the folder
  time: { weekly: number; days: DayIndex[]; followUps: number; history: number };
  proposals: number;                 // interpretations that wait for a person
  messages: number;
  lastFiledAt: string | null;
  lastMessageAt: string | null;
};

const FOLDER_SET = new Set(FOLDERS.map(f => f.name));
const folderKey = (name: string | null) => (name && FOLDER_SET.has(name) ? name : 'General');

export async function loadIndex(q: Q, zone: string): Promise<FileIndex> {
  const today = localNow(zone).date;
  const folders: FileIndex['folders'] = {};
  const at = (name: string | null) => (folders[folderKey(name)] ||= { said: 0, waiting: 0, work: 0, cal: 0 });

  for (const r of await q<{ folder: string; n: number }>(
    `select folder, count(*)::int as n from uc_pilot.statements where state = 'current' group by folder`)) at(r.folder).said += r.n;
  for (const r of await q<{ folder: string; n: number }>(
    `select folder, count(*)::int as n from uc_pilot.work where state = 'open' group by folder`)) at(r.folder).work += r.n;
  // A waiting item sits in the folder its entry would be filed in. An item about the schedule sits in Time.
  let proposals = 0;
  for (const r of await q<{ decider: string; folder: string | null; kind: string; n: number }>(
    `select decider, kind, coalesce(payload -> 'args' ->> 'folder', payload ->> 'folder') as folder, count(*)::int as n
       from uc_pilot.pending where state = 'open' group by 1, 2, 3`)) {
    if (r.decider === 'agent') { proposals += r.n; at(r.folder).waiting += r.n; }
    else at(r.folder ?? 'Time').waiting += r.n;
  }

  // A calendar entry sits in Time and also belongs to the folder its activity is about. That folder counts it.
  for (const r of await q<{ folder: string | null; label: string }>(
    `select folder, label from uc_pilot.commitments where withdrawn_at is null
     union all select folder, label from uc_pilot.schedule_items where state = 'current'`)) {
    const b = belongsTo(r.folder, r.label);
    if (b.folder && b.folder !== 'Time') at(b.folder).cal += 1;
  }

  const days = await q<DayIndex>(
    `select d.date, coalesce(c.count, 0)::int as count, coalesce(c.off, 0)::int as off, p.state as plan
       from (select on_date::text as date from uc_pilot.commitments union select plan_date::text from uc_pilot.plans) d
       left join (select on_date::text as date, count(*) filter (where withdrawn_at is null) as count, count(*) filter (where withdrawn_at is not null) as off
                    from uc_pilot.commitments group by 1) c on c.date = d.date
       left join uc_pilot.plans p on p.plan_date::text = d.date
      order by d.date desc limit 200`);
  const one = (await q<any>(
    `select (select count(*)::int from uc_pilot.schedule_items where state = 'current') as weekly,
            (select count(*)::int from uc_pilot.follow_ups where state = 'open') as follow_ups,
            (select count(*)::int from uc_pilot.revisions where table_name in ('commitments', 'schedule_items', 'plans', 'work')) as history,
            (select count(*)::int from uc_pilot.statements where state <> 'current') as past,
            (select count(*)::int from uc_pilot.messages) as messages,
            (select ${TS('max(at)')} from uc_pilot.actions where outcome in ('filed', 'decided')) as last_filed,
            (select ${TS('max(created_at)')} from uc_pilot.messages) as last_message`))[0];

  return {
    today, folders,
    time: { weekly: one.weekly, days: days.reverse(), followUps: one.follow_ups, history: one.history + one.past },
    proposals, messages: one.messages, lastFiledAt: one.last_filed, lastMessageAt: one.last_message
  };
}

/** How many entries a folder holds. The count beside the folder in the tree and on its tile. */
export function entriesIn(ix: FileIndex, folder: string): number {
  const f = ix.folders[folder] || { said: 0, waiting: 0, work: 0, cal: 0 };
  const time = folder === 'Time' ? ix.time.weekly + ix.time.days.reduce((n, d) => n + d.count, 0) : 0;
  return f.said + f.cal + time;
}
export const waitingIn = (ix: FileIndex, folder: string) => (ix.folders[folder]?.waiting ?? 0);

// ------------------------------------------------------------------ rows

export type Source = { id: string; body: string; at: string; speaker: string } | null;

export type Revision = {
  id: string; at: string; actor: string; reason: string | null; lines: { field: string; now: string; before: string }[];
  notes: string[]; message: Source; via: string | null;
};

const FIELD: Record<string, string> = {
  label: 'Name', on_date: 'Day', start_min: 'Start', end_min: 'End', completion: 'What counts as done',
  execution: 'Outcome', actual_start_min: 'Actual start', actual_end_min: 'Actual end', timing: 'Timing',
  time_is_estimate: 'Rough time', outcome_said: 'Your words on the outcome', days: 'Days', realism: 'How realistic it felt',
  plan_date: 'Day', said: 'Your words', what: 'What is needed', due_on: 'Needed by', folder: 'Folder'
};

function sayValue(key: string, v: unknown): string {
  if (key === 'folder' && !v) return 'none';
  if (v === null || v === undefined || v === '') return 'unknown';
  if (key.endsWith('_min')) return sayClock(Number(v));
  if (key === 'on_date' || key === 'plan_date' || key === 'due_on') return sayDate(String(v).slice(0, 10));
  if (key === 'days' && Array.isArray(v)) return sayDays(v as number[]);
  if (key === 'execution' || key === 'timing') return String(v).replace(/_/g, ' ');
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
}

/** Every change to one entry, newest first, with what each value was before and the message the change rests on. */
export async function revisionsOf(q: Q, table: string, id: string): Promise<Revision[]> {
  const rows = await q<any>(
    `select r.id, r.before, r.after, r.changed, r.actor, r.reason, ${TS('r.at')} as at,
            coalesce(m.id, pm.id) as m_id, coalesce(m.body, pm.body) as m_body,
            coalesce(${TS('m.created_at')}, ${TS('pm.created_at')}) as m_at, coalesce(m.speaker, pm.speaker) as m_speaker,
            coalesce(p.decided_via, e.via) as via
       from uc_pilot.revisions r
       left join uc_pilot.messages m on m.id = r.message_id
       -- A change the resident confirmed came from a waiting card, in the same transaction, so the two rows carry the
       -- same time. The card names the message it rested on.
       left join lateral (
         select x.decided_via, x.source_message_id from uc_pilot.pending x
          where x.result ->> 'target_id' = r.row_id::text and x.state = 'confirmed' and x.decided_at = r.at
          limit 1) p on true
       -- A change the resident made in the form on the entry is listed as an action in the same transaction.
       left join lateral (
         select 'edit' as via from uc_pilot.actions a
          where a.tool = 'screen_edit' and a.target_id = r.row_id and a.at = r.at limit 1) e on true
       left join uc_pilot.messages pm on pm.id = p.source_message_id and r.message_id is null
      where r.table_name = $1 and r.row_id = $2 order by r.seq desc limit 60`, [table, id]);
  return rows.map((r: any) => {
    const changed = r.changed as string[];
    const notes: string[] = [];
    if (changed.includes('withdrawn_at') && r.after?.withdrawn_at) notes.push('Taken off. No outcome is on file for it.');
    if (changed.includes('confirmed_at') && r.after?.confirmed_at) notes.push('Confirmed by you.');
    if (changed.includes('state') && table === 'schedule_items' && r.after?.state === 'ended') notes.push('Ended from that day on.');
    if (changed.includes('state') && table === 'work') notes.push(r.after?.state === 'done' ? 'Closed as settled.' : 'Closed as dropped.');
    if (changed.includes('state') && table === 'follow_ups') notes.push(r.after?.state === 'done' ? 'Closed as done.' : 'Closed as dropped.');
    return {
      id: r.id, at: r.at, actor: r.actor, reason: r.reason,
      lines: changed.filter(k => FIELD[k]).map(k => ({ field: FIELD[k], now: sayValue(k, r.after?.[k]), before: sayValue(k, r.before?.[k]) })),
      notes, via: r.via ?? null,
      message: r.m_id ? { id: r.m_id, body: r.m_body, at: r.m_at, speaker: r.m_speaker } : null
    };
  }).filter((r: Revision) => r.lines.length > 0 || r.notes.length > 0);
}

async function sourceOf(q: Q, messageId: string | null): Promise<Source> {
  if (!messageId) return null;
  const m = (await q<any>(`select id, body, ${TS('created_at')} as at, speaker from uc_pilot.messages where id = $1`, [messageId]))[0];
  return m ? { id: m.id, body: m.body, at: m.at, speaker: m.speaker } : null;
}

// ------------------------------------------------------------------ Time: days and commitments

export type CommitmentFull = {
  id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; completion: string | null;
  schedule_item_id: string | null; execution: string; actual_start_min: number | null; actual_end_min: number | null;
  timing: string | null; time_is_estimate: boolean; outcome_said: string | null; outcome_at: string | null;
  withdrawn_at: string | null; withdrawn_said: string | null; basis: string; said: string | null; filed_by: string;
  created_at: string; source_message_id: string | null; outcome_message_id: string | null; changes: number; folder: string | null;
};

const COMMITMENT = `c.id, c.label, c.folder, c.on_date::text as on_date, c.start_min, c.end_min, c.completion, c.schedule_item_id, c.execution,
  c.actual_start_min, c.actual_end_min, c.timing, c.time_is_estimate, c.outcome_said, ${TS('c.outcome_at')} as outcome_at,
  ${TS('c.withdrawn_at')} as withdrawn_at, c.withdrawn_said, c.basis, c.said, c.filed_by, ${TS('c.created_at')} as created_at,
  c.source_message_id, c.outcome_message_id,
  (select count(*)::int from uc_pilot.revisions r where r.table_name = 'commitments' and r.row_id = c.id) as changes`;

export type PlanFull = { id: string; plan_date: string; state: string; confirmed_at: string | null; confirmed_via: string | null; realism: string | null } | null;

export async function loadDay(q: Q, date: string): Promise<{ commitments: CommitmentFull[]; plan: PlanFull; waiting: WaitingRow[] }> {
  const commitments = await q<CommitmentFull>(
    `select ${COMMITMENT} from uc_pilot.commitments c where c.on_date = $1::date
      order by c.withdrawn_at is not null, c.start_min nulls last, c.created_at`, [date]);
  const plan = (await q<any>(
    `select id, plan_date::text as plan_date, state, ${TS('confirmed_at')} as confirmed_at, confirmed_via, realism from uc_pilot.plans where plan_date = $1::date`, [date]))[0] || null;
  const waiting = (await loadWaiting(q)).filter(w =>
    w.payload?.date === date || commitments.some(c => typeof w.payload?.args?.ref === 'string' && c.id.startsWith(String(w.payload.args.ref).toLowerCase())) || w.payload?.args?.date === date);
  return { commitments, plan, waiting };
}

export async function loadCommitment(q: Q, id: string) {
  if (!isUuid(id)) return null;
  const c = (await q<CommitmentFull>(`select ${COMMITMENT} from uc_pilot.commitments c where c.id = $1`, [id]))[0];
  if (!c) return null;
  const weekly = c.schedule_item_id
    ? (await q<any>(`select id, label, days, start_min, end_min, state from uc_pilot.schedule_items where id = $1`, [c.schedule_item_id]))[0] || null : null;
  const waiting = (await loadWaiting(q)).filter(w => typeof w.payload?.args?.ref === 'string' && c.id.startsWith(String(w.payload.args.ref).toLowerCase()));
  const notes = await q<{ id: string; said: string; created_at: string; source_message_id: string | null }>(
    `select id, said, ${TS('created_at')} as created_at, source_message_id from uc_pilot.statements
      where commitment_id = $1 and state = 'current' order by created_at`, [c.id]);
  return {
    c, weekly, waiting, notes,
    source: await sourceOf(q, c.source_message_id),
    outcomeSource: await sourceOf(q, c.outcome_message_id),
    history: await revisionsOf(q, 'commitments', c.id)
  };
}

/**
 * What the Pending field of one entry reads from the File: whether a statement is in Salary, and whether a statement
 * in Finance is about this entry. The rest comes from the entry itself.
 */
export async function owedFile(q: Q, zone: string, commitmentId: string | null): Promise<OwedFile> {
  const now = localNow(zone);
  const r = (await q<{ salary: boolean; pay: boolean }>(
    `select exists (select 1 from uc_pilot.statements where folder = 'Salary' and state = 'current') as salary,
            exists (select 1 from uc_pilot.statements where folder = 'Finance' and state = 'current' and commitment_id = $1::uuid) as pay`,
    [commitmentId]))[0];
  return { today: now.date, nowMin: now.minutes, salaryOnFile: !!r?.salary, payOnFile: !!r?.pay };
}

/** The Pending field of one commitment. */
export async function owedOnCommitment(q: Q, zone: string, c: CommitmentFull, b: Belongs) {
  return owedOn({ on_date: c.on_date, start_min: c.start_min, end_min: c.end_min, execution: c.execution, actual_end_min: c.actual_end_min, withdrawn: !!c.withdrawn_at },
    b, await owedFile(q, zone, c.id));
}

/** The Pending field of one item that repeats each week. */
export async function owedOnWeekly(q: Q, zone: string, s: { start_min: number | null; end_min: number | null; state: string }, b: Belongs) {
  return owedOn({ on_date: null, start_min: s.start_min, end_min: s.end_min, execution: 'planned', actual_end_min: null, withdrawn: s.state !== 'current' },
    b, await owedFile(q, zone, null));
}

/** The calendar entries that belong to one folder: what is ahead first, then the most recent before today. */
export async function loadBelonging(q: Q, folder: string, today: string) {
  type Row = { id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null; execution: string };
  const rows = (await q<Row>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, execution from uc_pilot.commitments
      where withdrawn_at is null order by on_date, start_min nulls last limit 2000`)).filter(r => belongsTo(r.folder, r.label).folder === folder);
  const weekly = (await q<{ id: string; label: string; days: number[]; start_min: number | null; end_min: number | null; folder: string | null }>(
    `select id, label, days, start_min, end_min, folder from uc_pilot.schedule_items where state = 'current'`)).filter(r => belongsTo(r.folder, r.label).folder === folder);
  return {
    ahead: rows.filter(r => r.on_date >= today).slice(0, 12),
    before: rows.filter(r => r.on_date < today).reverse().slice(0, 8),
    weekly
  };
}

// ------------------------------------------------------------------ Time: the weekly schedule

export type WeeklyFull = {
  id: string; label: string; days: number[]; start_min: number | null; end_min: number | null; state: string; said: string | null;
  basis: string; created_at: string; ended_at: string | null; source_message_id: string | null; changes: number; folder: string | null;
};
const WEEKLY = `s.id, s.label, s.folder, s.days, s.start_min, s.end_min, s.state, s.said, s.basis, ${TS('s.created_at')} as created_at,
  ${TS('s.ended_at')} as ended_at, s.source_message_id,
  (select count(*)::int from uc_pilot.revisions r where r.table_name = 'schedule_items' and r.row_id = s.id) as changes`;

export const loadWeekly = (q: Q) =>
  q<WeeklyFull>(`select ${WEEKLY} from uc_pilot.schedule_items s order by s.state <> 'current', s.start_min nulls last, s.label`);

export async function loadWeeklyItem(q: Q, id: string) {
  if (!isUuid(id)) return null;
  const s = (await q<WeeklyFull>(`select ${WEEKLY} from uc_pilot.schedule_items s where s.id = $1`, [id]))[0];
  if (!s) return null;
  return { s, source: await sourceOf(q, s.source_message_id), history: await revisionsOf(q, 'schedule_items', s.id) };
}

// ------------------------------------------------------------------ what the resident said

export type StatementFull = {
  id: string; said: string; entry: string | null; topic: string; folder: string; state: string; basis: string; filed_by: string; about_date: string | null;
  supersedes: string | null; created_at: string; ended_at: string | null; source_message_id: string | null; ended_by_message_id: string | null;
};
const STATEMENT = `id, said, entry, topic, folder, state, basis, filed_by, about_date::text as about_date, supersedes,
  ${TS('created_at')} as created_at, ${TS('ended_at')} as ended_at, source_message_id, ended_by_message_id`;

/** The statements in one folder: what is current first, then what was replaced or withdrawn. */
export async function loadSaid(q: Q, folder: string): Promise<StatementFull[]> {
  const rows = await q<StatementFull>(
    `select ${STATEMENT} from uc_pilot.statements order by state <> 'current', created_at desc limit 400`);
  return rows.filter(r => folderKey(r.folder) === folder);
}

export async function loadStatement(q: Q, id: string) {
  if (!isUuid(id)) return null;
  const s = (await q<StatementFull>(`select ${STATEMENT} from uc_pilot.statements where id = $1`, [id]))[0];
  if (!s) return null;
  // The chain of earlier versions, newest first, and the version that replaced this one when there is one.
  const earlier: StatementFull[] = [];
  let prev = s.supersedes;
  for (let i = 0; prev && i < 20; i++) {
    const e = (await q<StatementFull>(`select ${STATEMENT} from uc_pilot.statements where id = $1`, [prev]))[0];
    if (!e) break;
    earlier.push(e);
    prev = e.supersedes;
  }
  const later = (await q<StatementFull>(`select ${STATEMENT} from uc_pilot.statements where supersedes = $1 limit 1`, [s.id]))[0] || null;
  return { s, earlier, later, source: await sourceOf(q, s.source_message_id), endedBy: await sourceOf(q, s.ended_by_message_id) };
}

// ------------------------------------------------------------------ waiting, follow ups, ongoing work

export type WaitingRow = {
  id: string; decider: string; kind: string; summary: string; rests_on: string | null; state: string; created_at: string;
  payload: any; folder: string; source: Source;
};

export async function loadWaiting(q: Q): Promise<WaitingRow[]> {
  const rows = await q<any>(
    `select p.id, p.decider, p.kind, p.summary, p.rests_on, p.state, ${TS('p.created_at')} as created_at, p.payload,
            coalesce(p.payload -> 'args' ->> 'folder', p.payload ->> 'folder') as folder,
            m.id as m_id, m.body as m_body, ${TS('m.created_at')} as m_at, m.speaker as m_speaker
       from uc_pilot.pending p left join uc_pilot.messages m on m.id = p.source_message_id
      where p.state = 'open' order by p.created_at`);
  return rows.map((r: any) => ({
    id: r.id, decider: r.decider, kind: r.kind, summary: r.summary, rests_on: r.rests_on, state: r.state, created_at: r.created_at, payload: r.payload,
    folder: r.decider === 'agent' ? folderKey(r.folder) : folderKey(r.folder ?? 'Time'),
    source: r.m_id ? { id: r.m_id, body: r.m_body, at: r.m_at, speaker: r.m_speaker } : null
  }));
}

export type FollowUpFull = { id: string; owner: string; kind: string; what: string; due_on: string | null; state: string; created_at: string; closed_at: string | null; closed_said: string | null };
export const loadFollowUps = (q: Q) =>
  q<FollowUpFull>(
    `select id, owner, kind, what, due_on::text as due_on, state, ${TS('created_at')} as created_at, ${TS('closed_at')} as closed_at, closed_said
       from uc_pilot.follow_ups order by state <> 'open', due_on nulls last, created_at desc limit 200`);

export type WorkFull = {
  id: string; label: string; said: string; folder: string; state: string; created_at: string; closed_at: string | null;
  closed_said: string | null; source_message_id: string | null;
};
const WORK = `id, label, said, folder, state, ${TS('created_at')} as created_at, ${TS('closed_at')} as closed_at, closed_said, source_message_id`;

export async function loadWork(q: Q, folder: string): Promise<WorkFull[]> {
  const rows = await q<WorkFull>(`select ${WORK} from uc_pilot.work order by state <> 'open', created_at desc limit 200`);
  return rows.filter(r => folderKey(r.folder) === folder);
}

export async function loadWorkItem(q: Q, id: string) {
  if (!isUuid(id)) return null;
  const w = (await q<WorkFull>(`select ${WORK} from uc_pilot.work where id = $1`, [id]))[0];
  if (!w) return null;
  return { w, source: await sourceOf(q, w.source_message_id), history: await revisionsOf(q, 'work', w.id) };
}

// ------------------------------------------------------------------ history of one folder

export type Change = { id: string; at: string; title: string; href: string | null; lines: string[]; message: string | null };

/** Each change to an entry in Time, newest first. Each line names the entry and links to it. */
export async function loadTimeHistory(q: Q): Promise<Change[]> {
  const rows = await q<any>(
    `select r.id, r.table_name, r.row_id, r.before, r.after, r.changed, ${TS('r.at')} as at,
            (select m.body from uc_pilot.messages m where m.id = r.message_id) as message
       from uc_pilot.revisions r
      where r.table_name in ('commitments', 'schedule_items', 'plans', 'work') order by r.seq desc limit 150`);
  const time = folderPath('Time');
  return rows.map((r: any) => {
    const changed = r.changed as string[];
    const lines = changed.filter(k => FIELD[k]).map(k => `${FIELD[k]}: ${sayValue(k, r.after?.[k])}. Before: ${sayValue(k, r.before?.[k])}.`);
    if (changed.includes('withdrawn_at') && r.after?.withdrawn_at) lines.unshift('Taken off.');
    if (changed.includes('confirmed_at') && r.after?.confirmed_at) lines.unshift('Confirmed by you.');
    if (changed.includes('state') && r.table_name === 'work') lines.unshift(r.after?.state === 'done' ? 'Closed as settled.' : 'Closed as dropped.');
    if (changed.includes('state') && r.table_name === 'schedule_items' && r.after?.state === 'ended') lines.unshift('Ended from that day on.');
    const day = r.after?.on_date ? String(r.after.on_date).slice(0, 10) : r.after?.plan_date ? String(r.after.plan_date).slice(0, 10) : null;
    const title = r.table_name === 'commitments' ? `${r.after?.label}, ${sayDate(day!)}`
      : r.table_name === 'schedule_items' ? `${r.after?.label}, weekly schedule`
        : r.table_name === 'plans' ? `Plan for ${sayDate(day!)}` : `Ongoing work: ${r.after?.label}`;
    const href = r.table_name === 'commitments' ? `${time}/${day}/${r.row_id}`
      : r.table_name === 'schedule_items' ? `${time}/weekly/${r.row_id}`
        : r.table_name === 'plans' ? `${time}/${day}` : `${folderPath(String(r.after?.folder || 'General'))}/work/${r.row_id}`;
    return { id: r.id, at: r.at, title, href, lines, message: r.message ?? null };
  }).filter((c: Change) => c.lines.length > 0);
}

/** A short phrase for the time of an entry, in the words the File uses. */
export const spanWords = (start: number | null, end: number | null) =>
  saySpan(start, end).replace('time not established', 'Time unknown').replace('end not established', 'end unknown').replace('start not established', 'start unknown');

// ------------------------------------------------------------------ the panel at the right of the frame

type Entry = { id: string; label: string; on_date: string; start_min: number | null; end_min: number | null; folder: string | null; execution: string };
/**
 * One item in Pending. Each item waits for the resident.
 *   ask     a question the resident answers in words: an entry that has passed with its end or its outcome unknown
 *   decide  an item that waits for a yes or a no. An entry that overlaps another is one of these
 */
export type PendingItem =
  | { type: 'ask'; key: string; question: string; href: string }
  | { type: 'decide'; key: string; id: string; kind: string; summary: string; overlap: boolean };
export type PanelView = {
  today: string;
  now: (Entry & { live: boolean; minutesUntil: number; minutesLeft: number | null }) | null;
  then: Entry | null;
  week: { date: string; hours: number; count: number }[];
  planned: number;
  pending: PendingItem[];
  more: number;                       // questions past the first three. The agent asks them in the conversation
};

const dayWord = (date: string) => sayDate(date).replace(/, \d{4}$/, '');

/**
 * The panel at the right: what is happening now or next, how much of the week is planned, and what waits for the
 * resident. Each line is read from the File. The panel keeps no entry.
 */
export async function loadPanel(q: Q, zone: string): Promise<PanelView> {
  const n = localNow(zone);
  const today = n.date;
  const tomorrow = addDays(today, 1);
  const soon = await q<Entry>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, execution from uc_pilot.commitments
      where withdrawn_at is null and execution = 'planned' and on_date between $1::date and $2::date and start_min is not null
      order by on_date, start_min`, [today, tomorrow]);
  let now: PanelView['now'] = null;
  let then: Entry | null = null;
  // When entries overlap, the one that started last is the one happening now. See pickNow in now.ts.
  const span = (c: Entry) => {
    const at = (c.on_date === today ? 0 : 1440) + (c.start_min as number);
    return { at, till: (c.on_date === today ? 0 : 1440) + (c.end_min ?? (c.start_min as number) + 60) };
  };
  const ahead = soon.filter(c => span(c).till > n.minutes);
  const live = ahead.filter(c => span(c).at <= n.minutes).sort((a, b) => span(b).at - span(a).at);
  const first = live[0] ?? ahead[0] ?? null;
  if (first) {
    const { at, till } = span(first);
    now = { ...first, live: at <= n.minutes, minutesUntil: Math.max(0, at - n.minutes), minutesLeft: first.end_min !== null ? till - n.minutes : null };
    then = ahead.find(c => c !== first && span(c).at > n.minutes) ?? null;
  }

  // An entry that has passed with its end or its outcome unknown, in the last seven days.
  const asks: PendingItem[] = [];
  const passed = await q<Entry>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, execution, schedule_item_id from uc_pilot.commitments
      where withdrawn_at is null and execution = 'planned' and on_date between $1::date and $2::date
      order by on_date desc, start_min nulls last`, [addDays(today, -7), today]);
  for (const c of passed) {
    // An unfinished task from an earlier day is shown again on today. See carry.ts. It is asked about there.
    if (c.on_date < today && carries(c as Entry & { schedule_item_id: string | null })) continue;
    // Sleep is asked about as wake and bed times, never as a question each day.
    if (/\b(sleep|nap)\b/i.test(c.label)) continue;
    const over = c.on_date < today || (c.start_min !== null && (c.end_min ?? c.start_min + 60) <= n.minutes);
    if (!over) continue;
    asks.push({
      type: 'ask', key: `ended:${c.id}`, href: `${folderPath('Time')}/${c.on_date}/${c.id}`,
      question: c.end_min === null ? `What time did ${c.label} on ${dayWord(c.on_date)} end?` : `Did ${c.label} on ${dayWord(c.on_date)} happen as planned?`
    });
  }
  const open = await q<{ id: string; kind: string; summary: string; rests_on: string | null }>(
    `select id, kind, summary, rests_on from uc_pilot.pending where state = 'open' and decider = 'resident' order by created_at`);
  const decides: PendingItem[] = open.map(p => ({
    type: 'decide', key: `wait:${p.id}`, id: p.id, kind: p.kind, summary: p.summary, overlap: (p.rests_on || '').startsWith('It overlaps')
  }));

  // The week the resident keeps planned: Monday to Sunday, the coming one on a Sunday.
  const wd = weekdayOf(today);
  const monday = wd === 0 ? tomorrow : addDays(today, 1 - wd);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const inWeek = await q<Entry>(
    `select id, label, on_date::text as on_date, start_min, end_min, folder, execution from uc_pilot.commitments
      where withdrawn_at is null and on_date between $1::date and $2::date`, [days[0], days[6]]);
  const week = days.map(date => {
    const mine = inWeek.filter(c => c.on_date === date);
    const hours = mine.reduce((h, c) => h + (c.start_min !== null && c.end_min !== null ? (c.end_min - c.start_min) / 60 : 1), 0);
    return { date, hours, count: mine.length };
  });
  return {
    today, now, then,
    week, planned: week.filter(d => d.count > 0).length,
    pending: [...decides.filter(d => d.type === 'decide' && d.overlap), ...asks.slice(0, 3), ...decides.filter(d => d.type === 'decide' && !d.overlap)],
    more: Math.max(0, asks.length - 3)
  };
}

// ------------------------------------------------------------------ search

export type Found = { key: string; href: string; title: string; sub: string; kind: 'entry' | 'message'; at: string | null };

/** Looks for words in the File and in the conversation. Each result leads to the entry or the message. */
/** The start of a long text, ended at a whole word. The words say that more follows. */
const excerpt = (text: string, max = 150) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60))} (more text follows)`;
};

export async function searchAll(q: Q, text: string): Promise<Found[]> {
  const words = text.toLowerCase().replace(/[%_\\]/g, ' ').split(/\s+/).filter(w => w.length > 1).slice(0, 5);
  if (!words.length) return [];
  const like = `{${words.map(w => `"%${w.replace(/"/g, '')}%"`).join(',')}}`;
  const time = folderPath('Time');
  const out: Found[] = [];
  for (const r of await q<any>(
    `select id, said, topic, folder, state, ${TS('created_at')} as at from uc_pilot.statements
      where lower(said || ' ' || topic || ' ' || folder) like all ($1::text[]) order by state <> 'current', created_at desc limit 20`, [like])) {
    out.push({ key: r.id, href: `${folderPath(r.folder)}/said/${r.id}`, title: r.topic, sub: `${r.folder}. ${excerpt(r.said)}${r.state !== 'current' ? ' (replaced or withdrawn)' : ''}`, kind: 'entry', at: r.at });
  }
  for (const r of await q<any>(
    `select id, label, on_date::text as on_date, start_min, end_min, coalesce(said, '') as said from uc_pilot.commitments
      where lower(label || ' ' || coalesce(said, '')) like all ($1::text[]) order by on_date desc limit 20`, [like])) {
    out.push({ key: r.id, href: `${time}/${r.on_date}/${r.id}`, title: r.label, sub: `Time. ${sayDate(r.on_date)}, ${spanWords(r.start_min, r.end_min)}`, kind: 'entry', at: null });
  }
  for (const r of await q<any>(
    `select id, label, days, start_min, end_min from uc_pilot.schedule_items where lower(label || ' ' || coalesce(said, '')) like all ($1::text[]) limit 10`, [like])) {
    out.push({ key: r.id, href: `${time}/weekly/${r.id}`, title: r.label, sub: `Time. Weekly schedule, ${sayDays(r.days)}, ${spanWords(r.start_min, r.end_min)}`, kind: 'entry', at: null });
  }
  for (const r of await q<any>(
    `select id, label, said, folder from uc_pilot.work where lower(label || ' ' || said) like all ($1::text[]) limit 10`, [like])) {
    out.push({ key: r.id, href: `${folderPath(r.folder)}/work/${r.id}`, title: r.label, sub: `${r.folder}. Ongoing work. ${excerpt(r.said)}`, kind: 'entry', at: null });
  }
  for (const r of await q<any>(
    `select id, speaker, body, ${TS('created_at')} as at from uc_pilot.messages where lower(body) like all ($1::text[]) order by seq desc limit 25`, [like])) {
    out.push({ key: r.id, href: `/portal/home#m-${r.id}`, title: r.speaker === 'resident' ? 'You' : r.speaker === 'agent' ? 'A person on the team' : 'Agent, software', sub: excerpt(r.body), kind: 'message', at: r.at });
  }
  return out;
}
