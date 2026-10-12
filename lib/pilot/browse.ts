// Reads the File for the File browser: the counts beside each folder, the list inside a folder, and one entry with
// its history. Every read runs as the resident, so row level security limits it to that resident's rows.
//
// The browser shows what is on file. It builds no entry and changes none.

import { FOLDERS } from '../domain/folders';
import type { Q } from './db';
import { isUuid, TS } from './db';
import { folderPath } from './paths';
import { localNow, sayClock, sayDate, sayDays, saySpan } from './time';

// ------------------------------------------------------------------ the index: what each folder holds

export type DayIndex = { date: string; count: number; off: number; plan: string | null };
export type FileIndex = {
  today: string;
  folders: Record<string, { said: number; waiting: number; work: number }>;   // by folder name. General holds what fits no folder
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
  const at = (name: string | null) => (folders[folderKey(name)] ||= { said: 0, waiting: 0, work: 0 });

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
  const f = ix.folders[folder] || { said: 0, waiting: 0, work: 0 };
  const time = folder === 'Time' ? ix.time.weekly + ix.time.days.reduce((n, d) => n + d.count, 0) : 0;
  return f.said + f.work + time;
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
  plan_date: 'Day', said: 'Your words', what: 'What is needed', due_on: 'Needed by'
};

function sayValue(key: string, v: unknown): string {
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
            p.decided_via as via
       from uc_pilot.revisions r
       left join uc_pilot.messages m on m.id = r.message_id
       -- A change the resident confirmed came from a waiting card, in the same transaction, so the two rows carry the
       -- same time. The card names the message it rested on.
       left join lateral (
         select x.decided_via, x.source_message_id from uc_pilot.pending x
          where x.result ->> 'target_id' = r.row_id::text and x.state = 'confirmed' and x.decided_at = r.at
          limit 1) p on true
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
  created_at: string; source_message_id: string | null; outcome_message_id: string | null; changes: number;
};

const COMMITMENT = `c.id, c.label, c.on_date::text as on_date, c.start_min, c.end_min, c.completion, c.schedule_item_id, c.execution,
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
  return {
    c, weekly, waiting,
    source: await sourceOf(q, c.source_message_id),
    outcomeSource: await sourceOf(q, c.outcome_message_id),
    history: await revisionsOf(q, 'commitments', c.id)
  };
}

// ------------------------------------------------------------------ Time: the weekly schedule

export type WeeklyFull = {
  id: string; label: string; days: number[]; start_min: number | null; end_min: number | null; state: string; said: string | null;
  basis: string; created_at: string; ended_at: string | null; source_message_id: string | null; changes: number;
};
const WEEKLY = `s.id, s.label, s.days, s.start_min, s.end_min, s.state, s.said, s.basis, ${TS('s.created_at')} as created_at,
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
  id: string; said: string; topic: string; folder: string; state: string; basis: string; filed_by: string; about_date: string | null;
  supersedes: string | null; created_at: string; ended_at: string | null; source_message_id: string | null; ended_by_message_id: string | null;
};
const STATEMENT = `id, said, topic, folder, state, basis, filed_by, about_date::text as about_date, supersedes,
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
