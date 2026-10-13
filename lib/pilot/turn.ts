// One reply, from the resident's message to the agent's answer.
//
// 1. The message is kept, as the resident wrote it, before the language model reads a word.
// 2. The model reads the conversation in view and the File, and answers or asks for actions.
// 3. Each action is checked and carried out by this server in its own transaction, with a row in the
//    activity list written in that same transaction. An action that was refused or failed is listed too.
// 4. The answer is kept. The screen shows the resident the server's list of what happened.
//
// A resend of the same message returns the same answer. What the model asked for is kept as it arrives,
// so an interrupted reply continues from where it stopped and carries out no action twice.

import { createHash, randomUUID } from 'node:crypto';
import { costMicro, dailyCapMicro, LIMITS } from './config';
import { isUuid, TS, withResident, type Q } from './db';
import { fileForModel, loadAccess, loadFile, type Access } from './file';
import { cleanReply, clip, removeNumbers } from './guard';
import { getModel, modelAvailable, type Block, type Turn } from './model';
import { hrefsFor } from './paths';
import { PROMPT_VERSION, SYSTEM } from './prompt';
import { addDays, localNow, sayWhen } from './time';
import { placeSchedule, Refusal, TOOL_BY_NAME, TOOLS, type Env, type Result, RETIRED } from './tools';

export type Effect = {
  tool: string; outcome: string; detail: string; target: string | null; target_id: string | null;
  brief: string;          // one short line for the conversation
  href?: string | null;   // where the entry sits in the File
};

// Words that mark where the long account begins. An action filed before the short line existed is cut there.
const LONG_PART = /\s(?:Your words:|Before:|It is now:|Kept as the earlier statement:|Now on file:)/;
const WORD: Record<string, string> = {
  filed: 'Filed', decided: 'Confirmed', unchanged: 'No change', prepared: 'Waiting for you',
  proposed: 'For your agent', refused: 'Left off the File', failed: 'Did not work'
};

/**
 * The short line for one action. A row written before the column existed gets one worked out from its full account:
 * the quote and the earlier values are left off, and a change whose two sides read the same is shown as no change.
 */
export function briefOf(outcome: string, brief: string | null | undefined, detail: string | null | undefined): string {
  if (brief && brief.trim()) return brief.trim();
  const full = String(detail || '').trim();
  const confirmed = /^Confirmed\. /.test(full);
  const d = full.replace(/^Confirmed\. /, '');
  const word = confirmed ? 'Confirmed' : WORD[outcome] || 'Done';
  let m: RegExpMatchArray | null;
  if ((m = d.match(/^Changed: (.+?)\. Before: (.+?)\.(?: Your words:.*)?$/))) {
    return m[1] === m[2] ? `No change: ${clip(m[1], 150)}.` : `${confirmed ? 'Confirmed' : 'Updated'}: ${clip(m[1], 150)}.`;
  }
  if ((m = d.match(/^Filed under ([^:]{1,40}): "/))) return `${word}: a statement, under ${m[1]}.`;
  if ((m = d.match(/^Filed for ([^:]{1,40}): (.+?)\.(?: Your words:.*)?$/))) return `${word}: ${clip(m[2], 110)}, on ${m[1]}.`;
  const rest = d.replace(/^(?:Prepared for your answer: |Not (?:done|filed)\. )/, '');
  const cut = rest.search(LONG_PART);
  return `${word}: ${clip((cut > 0 ? rest.slice(0, cut) : rest).trim(), 150)}`;
}

// What a reply did, apart from reading. The screen leaves a refused action to the activity list.
// Tidying stays out of the conversation. The founder set on October 12, 2026 that it shows in Activity only.
const SHOWN = `outcome <> 'read' and tool <> 'tidy_statement'`;

export type MessageView = {
  id: string; speaker: 'resident' | 'software' | 'agent'; body: string; created_at: string;
  removed: string[] | null; reply_to: string | null; request_key?: string | null;
};

export type TurnResult = {
  state: 'done' | 'running' | 'failed';
  message: MessageView | null;
  reply: MessageView | null;
  effects: Effect[];
  note?: string;
};

export class NoAccess extends Error {}

const MESSAGE_COLS = `id, speaker, body, ${TS('created_at')} as created_at, removed, reply_to, request_key`;

function stable(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  return `{${Object.keys(v as object).sort().map(k => `${JSON.stringify(k)}:${stable((v as any)[k])}`).join(',')}}`;
}

export async function effectsOf(q: Q, turnId: string): Promise<Effect[]> {
  const rows = await q<Effect>(
    `select tool, outcome, detail, brief, target, target_id from uc_pilot.actions
      where turn_id = $1 and ${SHOWN} order by seq`, [turnId]);
  const hrefs = await hrefsFor(q, rows);
  return rows.map(r => ({ ...r, brief: briefOf(r.outcome, r.brief, r.detail), href: r.target_id ? hrefs.get(r.target_id) ?? null : null }));
}

type Soft = { userId: string; messageId: string; turnId: string; messageText: string; zone: string };

/** Carries out one action the model asked for. Returns what the model is told. */
async function act(ctx: Soft, name: string, input: Record<string, unknown>): Promise<{ text: string; isError: boolean }> {
  const tool = TOOL_BY_NAME[name];
  const key = `${ctx.turnId}:${name}:${createHash('sha256').update(stable(input)).digest('hex').slice(0, 20)}`;
  const run = { userId: ctx.userId, actor: 'software' as const, messageId: ctx.messageId, turnId: ctx.turnId };
  if (!tool) {
    await withResident(run, q =>
      q(`insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, idem_key) values ($1, $2, $3, $4::jsonb, 'refused', $5, $6)`,
        [ctx.turnId, ctx.messageId, clip(name, 60), '{}', 'That action is not on the list of actions software can take.', `${key}:${randomUUID()}`]));
    return { text: JSON.stringify({ ok: false, result: 'Not done. That action does not exist.' }), isError: true };
  }
  try {
    const result = await withResident(run, async q => {
      const before = await q<any>(`select outcome, detail from uc_pilot.actions where idem_key = $1`, [key]);
      if (before.length) return { outcome: before[0].outcome, detail: before[0].detail, data: { already_done_in_this_reply: true } } as Result;
      const env: Env = {
        q, userId: ctx.userId, messageId: ctx.messageId, messageText: ctx.messageText,
        now: localNow(ctx.zone), basis: 'resident_statement', via: 'conversation'
      };
      const r = await tool.run(env, input || {});
      await q(
        `insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, brief, target, target_id, idem_key)
         values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10)`,
        [ctx.turnId, ctx.messageId, name, JSON.stringify(input || {}), r.outcome, clip(r.detail, 900), r.brief ? clip(r.brief, 300) : null, r.target || null, r.targetId || null, key]);
      return r;
    });
    return { text: JSON.stringify({ ok: true, result: result.detail, ...(result.data && typeof result.data === 'object' ? (result.data as object) : {}) }), isError: false };
  } catch (e: any) {
    const refused = e instanceof Refusal;
    // A database rule that stopped the write is a refusal too. Its sentence is written for a reader.
    const fromRule = !refused && e?.code === 'P0001' && typeof e?.message === 'string';
    const detail = refused || fromRule ? String(e.message) : 'Not done. The server could not carry out the action. Nothing was filed.';
    try {
      await withResident(run, q =>
        q(`insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, idem_key) values ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
          [ctx.turnId, ctx.messageId, name, JSON.stringify(input || {}), refused || fromRule ? 'refused' : 'failed', clip(detail, 900), `${key}:${randomUUID()}`]));
    } catch { /* the activity list could not be written. The model is still told the action did not happen. */ }
    return { text: JSON.stringify({ ok: false, result: detail }), isError: true };
  }
}

export type Press = { id: string; at: string; brief: string | null; detail: string | null; outcome: string };

/**
 * The conversation as the model reads it. A press on the screen sits in it at the moment it happened, so the model
 * knows the resident already answered a waiting item with the button.
 */
function historyFor(rows: MessageView[], zone: string, presses: Press[] = []): Turn[] {
  const out: Turn[] = [];
  const push = (role: Turn['role'], textOf: string) => {
    const last = out[out.length - 1];
    if (last && last.role === role) last.content = `${last.content as string}\n\n${textOf}`;
    else out.push({ role, content: textOf });
  };
  const line = (p: Press) => `(A press on the screen, ${sayWhen(p.at, zone)}. This line is written by the server. The resident typed no words.) ${briefOf(p.outcome, p.brief, p.detail)}`;
  let i = 0;
  const sorted = [...presses].sort((a, b) => (a.at < b.at ? -1 : 1));
  for (const m of rows) {
    while (i < sorted.length && sorted[i].at <= m.created_at) push('user', line(sorted[i++]));
    const body = clip(m.body, LIMITS.messageClip);
    const textOf = m.speaker === 'software' ? body
      : m.speaker === 'agent' ? `(a message from the agent, a person, sent ${sayWhen(m.created_at, zone)})\n${body}`
        : `(sent ${sayWhen(m.created_at, zone)})\n${body}`;
    push(m.speaker === 'software' ? 'assistant' : 'user', textOf);
  }
  while (i < sorted.length) push('user', line(sorted[i++]));
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

/** Each press on the screen since the first message in view. */
async function pressesSince(q: Q, since: string | null): Promise<Press[]> {
  return q<Press>(
    `select id, ${TS('at')} as at, brief, detail, outcome from uc_pilot.actions
      where turn_id is null and tool in ('screen_decision', 'screen_edit', 'screen_note') and ($1::timestamptz is null or at >= $1::timestamptz)
      order by seq desc limit 12`, [since]);
}

/**
 * Takes one message from the resident and returns the agent's reply.
 * requestKey comes from the browser. Sending the same key again returns the same result.
 */
export async function receive(userId: string, rawText: string, requestKey: string, opts: { viewing?: string | null; answering?: string | null } = {}): Promise<TurnResult> {
  if (!isUuid(userId)) throw new NoAccess('No resident.');
  if (!isUuid(requestKey)) throw new Refusal('The message carried no valid key. Send it again from the screen.');
  const trimmed = (rawText || '').replace(/\r\n/g, '\n').trim();
  if (!trimmed) throw new Refusal('The message is empty.');
  if (trimmed.length > LIMITS.messageChars) throw new Refusal(`The message is longer than ${LIMITS.messageChars} characters. Send it in two parts.`);
  const cleaned = removeNumbers(trimmed);

  // 1. Keep the message. Nothing reads it before it is kept.
  const start = await withResident({ userId, actor: 'resident' }, async q => {
    const access = await loadAccess(q);
    if (!access) throw new NoAccess('This account is not part of the founder test.');
    let message = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [requestKey]))[0];
    if (!message) {
      const last = (await q<any>(`select id, last_at > now() - interval '4 hours' as live from uc_pilot.sessions order by last_at desc limit 1`))[0];
      const sessionId = last?.live ? last.id : (await q<any>(`insert into uc_pilot.sessions default values returning id`))[0].id;
      await q(`update uc_pilot.sessions set last_at = now() where id = $1`, [sessionId]);
      message = (await q<MessageView>(
        `insert into uc_pilot.messages (session_id, body, request_key, removed) values ($1, $2, $3, $4::text[])
         on conflict (user_id, request_key) do nothing returning ${MESSAGE_COLS}`,
        [sessionId, cleaned.text, requestKey, cleaned.removed.length ? `{${cleaned.removed.map(r => `"${r}"`).join(',')}}` : null]))[0]
        || (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [requestKey]))[0];
    }
    const made = (await q<any>(
      `insert into uc_pilot.turns (message_id, prompt_version) values ($1, $2) on conflict (message_id) do nothing returning id`, [message.id, PROMPT_VERSION]))[0];
    let turnId: string;
    let transcript: Turn[] = [];
    if (made) {
      turnId = made.id;
    } else {
      const turn = (await q<any>(`select id, state, reply_id from uc_pilot.turns where message_id = $1`, [message.id]))[0];
      turnId = turn.id;
      if (turn.state === 'done') {
        const reply = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where id = $1`, [turn.reply_id]))[0] || null;
        return { access, message, done: { reply, effects: await effectsOf(q, turn.id) }, turnId, running: false, spent: 0, transcript };
      }
      // Only one request finishes an interrupted reply. The row is claimed in one statement, so a second request finds it taken.
      const claimed = (await q<any>(
        `update uc_pilot.turns set state = 'running', started_at = now(), finished_at = null, error = null
          where id = $1 and (state = 'failed' or (state = 'running' and started_at < now() - ($2 || ' milliseconds')::interval))
        returning transcript`, [turnId, String(LIMITS.runningStaleMs)]))[0];
      if (!claimed) return { access, message, done: null, turnId, running: true, spent: 0, transcript };
      transcript = Array.isArray(claimed.transcript) ? claimed.transcript : [];
    }
    const spent = (await q<any>(
      `select coalesce(sum(cost_micro), 0)::float8 as c from uc_pilot.turns where (started_at at time zone $1)::date = (now() at time zone $1)::date`, [access.timezone]))[0].c as number;
    return { access, message, done: null, turnId, running: false, spent, transcript };
  });

  if (start.done) return { state: 'done', message: start.message, reply: start.done.reply, effects: start.done.effects };
  if (start.running) return { state: 'running', message: start.message, reply: null, effects: [] };

  const access: Access = start.access;
  const message = start.message;
  const turnId = start.turnId;
  const soft: Soft = { userId, messageId: message.id, turnId, messageText: message.body, zone: access.timezone };
  const run = { userId, actor: 'software' as const, messageId: message.id, turnId };
  let modelUsed = getModel().name();

  const finish = async (body: string, state: 'done' | 'failed', error?: string): Promise<TurnResult> =>
    withResident(run, async q => {
      let reply: MessageView | null = null;
      if (state === 'done') {
        reply = (await q<MessageView>(
          `insert into uc_pilot.messages (session_id, body, reply_to) select session_id, $2, id from uc_pilot.messages where id = $1
           on conflict (reply_to) where reply_to is not null do nothing returning ${MESSAGE_COLS}`, [message.id, body]))[0]
          || (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where reply_to = $1`, [message.id]))[0];
      }
      await q(`update uc_pilot.turns set state = $2, finished_at = now(), error = $3, model = $4, reply_id = $5 where id = $1`,
        [turnId, state, error ? clip(error, 500) : null, modelUsed, reply?.id || null]);
      return { state, message, reply, effects: await effectsOf(q, turnId), note: state === 'failed' ? body : undefined };
    });

  // 2. A day's limit on model use keeps one long test from spending past what was set.
  if (start.spent >= dailyCapMicro()) {
    return finish('The test has reached its limit for the language model today. Your message is kept. Nothing was filed from it. The limit starts again tomorrow.', 'done');
  }
  if (!modelAvailable()) {
    return finish('No reply was written. The language model is not connected to this test. Your message is kept. Nothing was filed from it.', 'failed', 'model not configured');
  }

  try {
    const before = await withResident(run, async q => {
      // The weekly schedule is placed on the days in view, so each day shows what it holds and a change to one day
      // changes that day's entry. A commitment the resident took off stays off.
      const today = localNow(access.timezone).date;
      for (let i = 0; i <= LIMITS.placeDaysAhead; i++) await placeSchedule({ q }, addDays(today, i));
      const view = await loadFile(q, access.timezone);
      const recent = await q<MessageView>(
        `select * from (select ${MESSAGE_COLS}, seq from uc_pilot.messages where id <> $1 and seq < (select seq from uc_pilot.messages where id = $1)
                         order by seq desc limit $2) t order by seq`, [message.id, LIMITS.recentMessages]);
      const presses = await pressesSince(q, recent[0]?.created_at ?? null);
      return { view, recent, presses };
    });

    const system = [
      { type: 'text' as const, text: SYSTEM, cache_control: { type: 'ephemeral' as const } },
      { type: 'text' as const, text: fileForModel(before.view, access.display_name) }
    ];
    const tools = TOOLS.filter(t => !RETIRED.has(t.name)).map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
    const messages: Turn[] = historyFor(before.recent, access.timezone, before.presses);
    // The part of the File the resident wrote the message from is context for the message. It is no instruction.
    const viewing = opts.viewing ? clip(opts.viewing.replace(/[^\w ,.:'›\-]/g, ' ').replace(/\s+/g, ' ').trim(), 160) : '';
    const answering = opts.answering ? clip(opts.answering.replace(/\s+/g, ' ').trim(), 300) : '';
    const mine = `(sent ${localNow(access.timezone, new Date(message.created_at)).label}${viewing ? `. The resident wrote this from this part of the File: ${viewing}` : ''}${answering ? `. The resident wrote this as the answer to this question in the side panel: ${answering}` : ''})\n${message.body}`;
    const lastTurn = messages[messages.length - 1];
    if (lastTurn && lastTurn.role === 'user') lastTurn.content = `${lastTurn.content as string}\n\n${mine}`;
    else messages.push({ role: 'user', content: mine });
    // Everything up to the resident's message is the same for each call of this reply. It is marked so the later
    // calls read it at the lower price.
    const lastMessage = messages[messages.length - 1];
    lastMessage.content = [{ type: 'text', text: lastMessage.content as string, cache_control: { type: 'ephemeral' } } as any];

    // What the model already asked for in this reply, and what the server answered. Empty on a first attempt.
    const transcript: Turn[] = start.transcript;
    const keep = () => withResident(run, q => q(`update uc_pilot.turns set transcript = $2::jsonb where id = $1`, [turnId, JSON.stringify(transcript)]));
    const answer = async (calls: Extract<Block, { type: 'tool_use' }>[]) => {
      const results: Block[] = [];
      for (const c of calls) {
        const r = await act(soft, c.name, (c.input || {}) as Record<string, unknown>);
        results.push({ type: 'tool_result', tool_use_id: c.id, content: r.text, is_error: r.isError || undefined });
      }
      transcript.push({ role: 'user', content: results });
      await keep();
    };
    const callsIn = (content: string | Block[]) =>
      (Array.isArray(content) ? content : []).filter((b): b is Extract<Block, { type: 'tool_use' }> => b.type === 'tool_use');

    // An interrupted reply stopped after the model asked and before every answer was kept. The same requests are answered now.
    const tail = transcript[transcript.length - 1];
    if (tail && tail.role === 'assistant' && callsIn(tail.content).length) await answer(callsIn(tail.content));

    const t0 = Date.now();
    let steps = transcript.filter(t => t.role === 'assistant').length;
    let actions = transcript.reduce((n, t) => n + (t.role === 'assistant' ? callsIn(t.content).length : 0), 0);
    let finalText = '';
    while (steps < LIMITS.steps) {
      const late = Date.now() - t0 > LIMITS.softDeadlineMs;
      const allow = !late && steps < LIMITS.steps - 1 && actions < LIMITS.actionsPerReply;
      const res = await getModel().create({ system, tools, messages: [...messages, ...transcript], maxTokens: LIMITS.replyTokens, allowActions: allow });
      steps += 1;
      modelUsed = res.model || modelUsed;
      // What the call cost is written as soon as it is known, so a reply that is cut off still counts toward the day's limit.
      await withResident(run, q => q(
        `update uc_pilot.turns set steps = steps + 1, model = $2, input_tokens = input_tokens + $3, output_tokens = output_tokens + $4,
                cache_read_tokens = cache_read_tokens + $5, cache_write_tokens = cache_write_tokens + $6, cost_micro = cost_micro + $7 where id = $1`,
        [turnId, modelUsed, res.usage.input, res.usage.output, res.usage.cacheRead, res.usage.cacheWrite, costMicro(modelUsed, res.usage)]));
      const calls = callsIn(res.content).slice(0, Math.max(0, LIMITS.actionsPerReply - actions));
      const said = res.content.filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text').map(b => b.text).join('\n').trim();
      if (calls.length === 0 || !allow) { finalText = said; break; }
      actions += calls.length;
      // The model's requests are kept before any of them is carried out.
      transcript.push({ role: 'assistant', content: res.content.filter(b => b.type === 'text' || calls.includes(b as any)) });
      await keep();
      await answer(calls);
    }

    // The model can stop with no words: it ran out of room, or it asked for an action after the last allowed one.
    // It is asked once more for words alone.
    if (!cleanReply(finalText)) {
      const res = await getModel().create({
        system, tools, maxTokens: LIMITS.replyTokens, allowActions: false,
        messages: [...messages, ...transcript, { role: 'user', content: 'Write your reply to the resident now, in plain sentences, from the results above. Take no further action.' }]
      });
      await withResident(run, q => q(
        `update uc_pilot.turns set steps = steps + 1, input_tokens = input_tokens + $2, output_tokens = output_tokens + $3,
                cache_read_tokens = cache_read_tokens + $4, cache_write_tokens = cache_write_tokens + $5, cost_micro = cost_micro + $6 where id = $1`,
        [turnId, res.usage.input, res.usage.output, res.usage.cacheRead, res.usage.cacheWrite, costMicro(res.model || modelUsed, res.usage)]));
      finalText = res.content.filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text').map(b => b.text).join('\n').trim();
    }
    const body = cleanReply(finalText);
    if (!body) {
      return finish('No reply was written. Your message is kept. The list under this note shows each action that was carried out before the reply stopped.', 'failed', 'the model returned no text');
    }
    return finish(body, 'done');
  } catch (e: any) {
    const why = typeof e?.message === 'string' ? e.message : 'unknown';
    try {
      return await finish('No reply was written, because the language model or the database did not answer. Your message is kept. The list under this note shows each action that was carried out before the reply stopped. Send the message again to finish the reply. No action is carried out twice.', 'failed', why);
    } catch {
      return { state: 'failed', message, reply: null, effects: [], note: 'No reply was written, because the database did not answer. Your message is kept.' };
    }
  }
}

/** The conversation as the screen shows it: messages in order, with the server's list of what each reply did. */
export async function thread(userId: string, opts: { before?: string | null; limit?: number } = {}) {
  return withResident({ userId, actor: 'resident' }, async q => {
    const access = await loadAccess(q);
    if (!access) throw new NoAccess('This account is not part of the founder test.');
    const limit = Math.min(Math.max(opts.limit || 60, 1), 200);
    const rows = await q<MessageView>(
      `select * from (select ${MESSAGE_COLS}, m.seq as seq_n from uc_pilot.messages m
                       where ($1::uuid is null or m.seq < (select x.seq from uc_pilot.messages x where x.id = $1))
                       order by m.seq desc limit $2) t order by t.seq_n`, [opts.before && isUuid(opts.before) ? opts.before : null, limit + 1]);
    const more = rows.length > limit;
    const page = more ? rows.slice(1) : rows;
    // A reply shows what its own turn did, even when the resident message it answers sits on an earlier page.
    const asked = [...new Set(page.map(m => (m.speaker === 'resident' ? m.id : m.reply_to)).filter((x): x is string => !!x))];
    const turns = asked.length ? await q<any>(
      `select t.id, t.message_id, t.state, t.started_at < now() - ($2 || ' milliseconds')::interval as stale
         from uc_pilot.turns t where t.message_id = any ($1::uuid[])`, [`{${asked.join(',')}}`, String(LIMITS.runningStaleMs)]) : [];
    const effects = turns.length ? await q<Effect & { turn_id: string }>(
      `select turn_id, tool, outcome, detail, brief, target, target_id from uc_pilot.actions
        where turn_id = any ($1::uuid[]) and ${SHOWN} order by seq`, [`{${turns.map((t: any) => t.id).join(',')}}`]) : [];
    // Each press on the screen in the span of this page, so the conversation shows the decision where it happened.
    const presses = page.length ? await q<Press & { target: string | null; target_id: string | null }>(
      `select id, ${TS('at')} as at, brief, detail, outcome, target, target_id from uc_pilot.actions
        where turn_id is null and tool in ('screen_decision', 'screen_edit', 'screen_note') and at >= $1::timestamptz
          and ($2::timestamptz is null or at < $2::timestamptz)
        order by seq`, [page[0].created_at, opts.before && isUuid(opts.before) ? page[page.length - 1].created_at : null]) : [];
    const hrefs = await hrefsFor(q, [...effects, ...presses]);
    const turnFor = (messageId: string | null) => {
      const t = messageId ? turns.find((x: any) => x.message_id === messageId) : null;
      return t ? {
        state: (t.state === 'running' && t.stale ? 'failed' : t.state) as string,
        effects: effects.filter(e => e.turn_id === t.id).map(({ turn_id, detail, ...e }) => ({
          ...e, brief: briefOf(e.outcome, e.brief, detail), href: e.target_id ? hrefs.get(e.target_id) ?? null : null
        }))
      } : null;
    };
    return {
      access,
      more,
      presses: presses.map(p => ({ id: p.id, at: p.at, brief: briefOf(p.outcome, p.brief, p.detail), href: p.target_id ? hrefs.get(p.target_id) ?? null : null })),
      messages: page.map(m => ({
        id: m.id, speaker: m.speaker, body: m.body, created_at: m.created_at, removed: m.removed, reply_to: m.reply_to,
        key: m.speaker === 'resident' ? m.request_key ?? null : null,
        // On a resident message: the state of its reply. On a reply: what that reply did.
        turn: turnFor(m.speaker === 'resident' ? m.id : m.reply_to)
      }))
    };
  });
}


/**
 * After the resident answers a waiting item with the button, the agent goes on with one short reply: what is now on
 * file, then the next question of the open work. The reply takes no action. It is written once for each press.
 */
export async function continueAfterPress(userId: string, pendingId: string): Promise<{ state: 'written' | 'already' | 'skipped'; reply: MessageView | null }> {
  const skipped = { state: 'skipped' as const, reply: null };
  if (!isUuid(userId) || !isUuid(pendingId)) return skipped;
  const run = { userId, actor: 'software' as const };
  const start = await withResident(run, async q => {
    const access = await loadAccess(q);
    if (!access) throw new NoAccess('This account is not part of the founder test.');
    const p = (await q<any>(`select id, decider, state, decided_via from uc_pilot.pending where id = $1`, [pendingId]))[0];
    if (!p || p.decider !== 'resident' || p.state === 'open' || p.decided_via !== 'screen') return null;
    const existing = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [pendingId]))[0];
    if (existing) return { existing };
    const last = (await q<any>(`select session_id from uc_pilot.messages order by seq desc limit 1`))[0];
    if (!last) return null;
    const spent = (await q<any>(
      `select coalesce(sum(cost_micro), 0)::float8 as c from uc_pilot.turns where (started_at at time zone $1)::date = (now() at time zone $1)::date`, [access.timezone]))[0].c as number;
    const today = localNow(access.timezone).date;
    for (let i = 0; i <= LIMITS.placeDaysAhead; i++) await placeSchedule({ q }, addDays(today, i));
    const view = await loadFile(q, access.timezone);
    const recent = await q<MessageView>(
      `select * from (select ${MESSAGE_COLS}, seq from uc_pilot.messages order by seq desc limit $1) t order by seq`, [LIMITS.recentMessages]);
    const presses = await pressesSince(q, recent[0]?.created_at ?? null);
    return { access, view, recent, presses, sessionId: last.session_id as string, spent };
  });
  if (!start) return skipped;
  if ('existing' in start) return { state: 'already', reply: start.existing ?? null };
  if (start.spent >= dailyCapMicro() || !modelAvailable()) return skipped;

  const system = [
    { type: 'text' as const, text: SYSTEM, cache_control: { type: 'ephemeral' as const } },
    { type: 'text' as const, text: fileForModel(start.view, start.access.display_name) }
  ];
  const tools = TOOLS.filter(t => !RETIRED.has(t.name)).map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
  const messages = historyFor(start.recent, start.access.timezone, start.presses);
  const ask = '(The server asks, after the press above: write the agent\'s next reply now. The on-screen action line already states the updated facts; do not repeat the dates, before/after, or tool history. If the press requires a missing answer or a closely related next question, ask one briefly. Do not automatically switch to unrelated ongoing schedule intake after a simple confirmation. Otherwise acknowledge briefly. Take no action.)';
  const lastTurn = messages[messages.length - 1];
  if (lastTurn && lastTurn.role === 'user') lastTurn.content = `${lastTurn.content as string}\n\n${ask}`;
  else messages.push({ role: 'user', content: ask });

  let body = '';
  let usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let model = getModel().name();
  try {
    const res = await getModel().create({ system, tools, messages, maxTokens: 500, allowActions: false });
    usage = res.usage;
    model = res.model || model;
    body = cleanReply(res.content.filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text').map(b => b.text).join('\n').trim());
  } catch { return skipped; }
  if (!body) return skipped;

  return withResident(run, async q => {
    const reply = (await q<MessageView>(
      `insert into uc_pilot.messages (session_id, body, request_key) values ($1, $2, $3)
       on conflict (user_id, request_key) do nothing returning ${MESSAGE_COLS}`, [start.sessionId, body, pendingId]))[0];
    if (!reply) {
      const existing = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [pendingId]))[0] || null;
      return { state: 'already' as const, reply: existing };
    }
    // The cost of this reply counts toward the day's limit, in the same table as every other reply.
    await q(
      `insert into uc_pilot.turns (message_id, prompt_version, state, finished_at, model, steps, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micro, reply_id)
       values ($1, $2, 'done', now(), $3, 1, $4, $5, $6, $7, $8, $1)`,
      [reply.id, PROMPT_VERSION, model, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, costMicro(model, usage)]);
    return { state: 'written' as const, reply };
  });
}


/**
 * A person on the team writes to the resident through the agent. The founder set on October 13, 2026 that the
 * message is written by the same agent software, under the same rules and confirmations, and that the resident sees
 * it as the agent. The person's words are the direction. The agent writes the message from them and from the File.
 * It takes no action in this step. A change it proposes waits for the resident, as every proposal does.
 */
export async function sayThroughAgent(userId: string, direction: string, key: string): Promise<{ state: 'written' | 'already' | 'skipped'; reply: MessageView | null; why?: string }> {
  if (!isUuid(userId) || !isUuid(key)) return { state: 'skipped', reply: null, why: 'No client.' };
  const said = (direction || '').replace(/\r\n/g, '\n').trim().slice(0, 2000);
  if (!said) return { state: 'skipped', reply: null, why: 'Write the message first.' };
  const run = { userId, actor: 'software' as const };
  const start = await withResident(run, async q => {
    const access = await loadAccess(q);
    if (!access) throw new NoAccess('This account is not part of the founder test.');
    const existing = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [key]))[0];
    if (existing) return { existing };
    const last = (await q<any>(`select id, last_at > now() - interval '4 hours' as live from uc_pilot.sessions order by last_at desc limit 1`))[0];
    const sessionId = last?.live ? last.id : (await q<any>(`insert into uc_pilot.sessions default values returning id`))[0].id;
    const spent = (await q<any>(
      `select coalesce(sum(cost_micro), 0)::float8 as c from uc_pilot.turns where (started_at at time zone $1)::date = (now() at time zone $1)::date`, [access.timezone]))[0].c as number;
    const view = await loadFile(q, access.timezone);
    const recent = await q<MessageView>(
      `select * from (select ${MESSAGE_COLS}, seq from uc_pilot.messages order by seq desc limit $1) t order by seq`, [LIMITS.recentMessages]);
    const presses = await pressesSince(q, recent[0]?.created_at ?? null);
    return { access, view, recent, presses, sessionId: sessionId as string, spent };
  });
  if ('existing' in start) return { state: 'already', reply: start.existing ?? null };
  if (start.spent >= dailyCapMicro()) return { state: 'skipped', reply: null, why: 'The model limit for today is reached.' };
  if (!modelAvailable()) return { state: 'skipped', reply: null, why: 'The language model is not connected.' };

  const system = [
    { type: 'text' as const, text: SYSTEM, cache_control: { type: 'ephemeral' as const } },
    { type: 'text' as const, text: fileForModel(start.view, start.access.display_name) }
  ];
  const tools = TOOLS.filter(t => !RETIRED.has(t.name)).map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
  const messages = historyFor(start.recent, start.access.timezone, start.presses);
  const ask = `(A person on the Universe City team asks you to write to the resident now. Their direction, in their words: "${said.replace(/"/g, "'")}". Write your next message to the resident from it. Keep its meaning and every time and name it gives. Write it in your own voice and under your rules, as a short message. When it proposes a change to an entry, ask the resident; the resident decides. Take no action.)`;
  const lastTurn = messages[messages.length - 1];
  if (lastTurn && lastTurn.role === 'user') lastTurn.content = `${lastTurn.content as string}\n\n${ask}`;
  else messages.push({ role: 'user', content: ask });

  let body = '';
  let usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let model = getModel().name();
  try {
    const res = await getModel().create({ system, tools, messages, maxTokens: 500, allowActions: false });
    usage = res.usage;
    model = res.model || model;
    body = cleanReply(res.content.filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text').map(b => b.text).join('\n').trim());
  } catch (e: any) { return { state: 'skipped', reply: null, why: `The agent did not answer. ${String(e?.message || '').slice(0, 120)}` }; }
  if (!body) return { state: 'skipped', reply: null, why: 'The agent wrote no message.' };

  return withResident(run, async q => {
    await q(`update uc_pilot.sessions set last_at = now() where id = $1`, [start.sessionId]);
    const reply = (await q<MessageView>(
      `insert into uc_pilot.messages (session_id, body, request_key) values ($1, $2, $3)
       on conflict (user_id, request_key) do nothing returning ${MESSAGE_COLS}`, [start.sessionId, body, key]))[0];
    if (!reply) return { state: 'already' as const, reply: (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [key]))[0] || null };
    await q(
      `insert into uc_pilot.turns (message_id, prompt_version, state, finished_at, model, steps, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micro, reply_id)
       values ($1, $2, 'done', now(), $3, 1, $4, $5, $6, $7, $8, $1)`,
      [reply.id, PROMPT_VERSION, model, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, costMicro(model, usage)]);
    return { state: 'written' as const, reply };
  });
}
