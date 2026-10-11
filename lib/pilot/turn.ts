// One reply, from the resident's message to the guide's answer.
//
// 1. The message is kept, as the resident wrote it, before the language model reads a word.
// 2. The model reads the conversation in view and the File, and answers or asks for actions.
// 3. Each action is checked and carried out by this server in its own transaction, with a row in the
//    activity list written in that same transaction. An action that was refused or failed is listed too.
// 4. The answer is kept. The screen shows the resident the server's list of what happened.
//
// A resend of the same message returns the same answer. An interrupted reply can be finished without
// carrying out any action twice.

import { createHash, randomUUID } from 'node:crypto';
import { costMicro, dailyCapMicro, LIMITS, type Usage } from './config';
import { isUuid, TS, withResident, type Q } from './db';
import { fileForModel, loadAccess, loadFile, type Access } from './file';
import { cleanReply, clip, removeNumbers } from './guard';
import { getModel, modelAvailable, type Block, type Turn } from './model';
import { PROMPT_VERSION, SYSTEM } from './prompt';
import { localNow, sayWhen } from './time';
import { Refusal, TOOL_BY_NAME, TOOLS, type Env, type Result } from './tools';

export type Effect = { tool: string; outcome: string; detail: string; target: string | null; target_id: string | null };

export type MessageView = {
  id: string; speaker: 'resident' | 'software' | 'agent'; body: string; created_at: string;
  removed: string[] | null; reply_to: string | null; request_key?: string | null;
};

export type TurnResult = {
  state: 'done' | 'running' | 'failed' | 'refused';
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
  return q<Effect>(
    `select tool, outcome, detail, target, target_id from uc_pilot.actions
      where turn_id = $1 and outcome <> 'read' order by seq`, [turnId]);
}

/** Carries out one action the model asked for. Returns what the model is told. */
async function act(
  ctx: { userId: string; messageId: string; turnId: string; messageText: string; zone: string },
  name: string, input: Record<string, unknown>
): Promise<{ text: string; isError: boolean }> {
  const tool = TOOL_BY_NAME[name];
  const key = `${ctx.turnId}:${name}:${createHash('sha256').update(stable(input)).digest('hex').slice(0, 20)}`;
  if (!tool) {
    await withResident({ userId: ctx.userId, actor: 'software', messageId: ctx.messageId, turnId: ctx.turnId }, q =>
      q(`insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, idem_key) values ($1, $2, $3, $4::jsonb, 'refused', $5, $6)`,
        [ctx.turnId, ctx.messageId, clip(name, 60), '{}', 'That action is not on the list of actions software can take.', `${key}:${randomUUID()}`]));
    return { text: JSON.stringify({ ok: false, result: 'Not done. That action does not exist.' }), isError: true };
  }
  try {
    const result = await withResident({ userId: ctx.userId, actor: 'software', messageId: ctx.messageId, turnId: ctx.turnId }, async q => {
      const before = await q<any>(`select outcome, detail from uc_pilot.actions where idem_key = $1`, [key]);
      if (before.length) return { outcome: before[0].outcome, detail: before[0].detail, data: { already_done_in_this_reply: true } } as Result;
      const env: Env = {
        q, userId: ctx.userId, messageId: ctx.messageId, messageText: ctx.messageText,
        now: localNow(ctx.zone), basis: 'resident_statement', via: 'conversation'
      };
      const r = await tool.run(env, input || {});
      await q(
        `insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, target, target_id, idem_key)
         values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)`,
        [ctx.turnId, ctx.messageId, name, JSON.stringify(input || {}), r.outcome, clip(r.detail, 900), r.target || null, r.targetId || null, key]);
      return r;
    });
    return { text: JSON.stringify({ ok: true, result: result.detail, ...(result.data && typeof result.data === 'object' ? (result.data as object) : {}) }), isError: false };
  } catch (e: any) {
    const refused = e instanceof Refusal;
    // A database rule that stopped the write is a refusal too. Its sentence is written for a reader.
    const fromRule = !refused && typeof e?.message === 'string' && /^(An |A |No |The )/.test(e.message) && e?.code === 'P0001';
    const detail = refused || fromRule ? String(e.message) : 'Not done. The server could not carry out the action. Nothing was filed.';
    try {
      await withResident({ userId: ctx.userId, actor: 'software', messageId: ctx.messageId, turnId: ctx.turnId }, q =>
        q(`insert into uc_pilot.actions (turn_id, message_id, tool, args, outcome, detail, idem_key) values ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
          [ctx.turnId, ctx.messageId, name, JSON.stringify(input || {}), refused || fromRule ? 'refused' : 'failed', clip(detail, 900), `${key}:${randomUUID()}`]));
    } catch { /* the activity list could not be written. The model is still told the action did not happen. */ }
    return { text: JSON.stringify({ ok: false, result: detail }), isError: true };
  }
}

function historyFor(rows: MessageView[], zone: string): Turn[] {
  const out: Turn[] = [];
  for (const m of rows) {
    const role: Turn['role'] = m.speaker === 'software' ? 'assistant' : 'user';
    const body = clip(m.body, 1800);
    const textOf = m.speaker === 'software' ? body
      : m.speaker === 'agent' ? `(a message from the agent, a person, sent ${sayWhen(m.created_at, zone)})\n${body}`
        : `(sent ${sayWhen(m.created_at, zone)})\n${body}`;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content = `${last.content as string}\n\n${textOf}`;
    else out.push({ role, content: textOf });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

/**
 * Takes one message from the resident and returns the guide's reply.
 * requestKey comes from the browser. Sending the same key again returns the same result.
 */
export async function receive(userId: string, rawText: string, requestKey: string): Promise<TurnResult> {
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
    const existing = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where request_key = $1`, [requestKey]))[0];
    let message = existing;
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
    const turn = (await q<any>(
      `select id, state, reply_id, started_at < now() - ($2 || ' milliseconds')::interval as stale from uc_pilot.turns where message_id = $1`,
      [message.id, String(LIMITS.runningStaleMs)]))[0];
    if (turn?.state === 'done') {
      const reply = (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where id = $1`, [turn.reply_id]))[0] || null;
      return { access, message, done: { reply, effects: await effectsOf(q, turn.id) }, turnId: turn.id as string, running: false, spent: 0 };
    }
    if (turn?.state === 'running' && !turn.stale) return { access, message, done: null, turnId: turn.id as string, running: true, spent: 0 };
    const spent = (await q<any>(
      `select coalesce(sum(cost_micro), 0)::float8 as c from uc_pilot.turns where (started_at at time zone $1)::date = (now() at time zone $1)::date`, [access.timezone]))[0].c as number;
    let turnId: string;
    if (turn) {
      turnId = turn.id;
      await q(`update uc_pilot.turns set state = 'running', started_at = now(), finished_at = null, error = null where id = $1`, [turnId]);
    } else {
      const made = (await q<any>(
        `insert into uc_pilot.turns (message_id, prompt_version) values ($1, $2) on conflict (message_id) do nothing returning id`, [message.id, PROMPT_VERSION]))[0];
      if (!made) {
        // Another request for the same message started the reply a moment ago.
        const other = (await q<any>(`select id from uc_pilot.turns where message_id = $1`, [message.id]))[0];
        return { access, message, done: null, turnId: other.id as string, running: true, spent };
      }
      turnId = made.id;
    }
    return { access, message, done: null, turnId, running: false, spent };
  });

  if (start.done) return { state: 'done', message: start.message, reply: start.done.reply, effects: start.done.effects };
  if (start.running) return { state: 'running', message: start.message, reply: null, effects: [] };

  const access: Access = start.access;
  const message = start.message;
  const turnId = start.turnId;
  const soft = { userId, messageId: message.id, turnId, messageText: message.body, zone: access.timezone };
  const usage: Usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let steps = 0;
  let modelUsed = getModel().name();

  const finish = async (body: string, state: 'done' | 'failed', error?: string): Promise<TurnResult> =>
    withResident({ userId, actor: 'software', messageId: message.id, turnId }, async q => {
      let reply: MessageView | null = null;
      if (state === 'done') {
        reply = (await q<MessageView>(
          `insert into uc_pilot.messages (session_id, body, reply_to) select session_id, $2, id from uc_pilot.messages where id = $1
           on conflict (reply_to) where reply_to is not null do nothing returning ${MESSAGE_COLS}`, [message.id, body]))[0]
          || (await q<MessageView>(`select ${MESSAGE_COLS} from uc_pilot.messages where reply_to = $1`, [message.id]))[0];
      }
      await q(
        `update uc_pilot.turns set state = $2, finished_at = now(), error = $3, model = $4, steps = $5, input_tokens = $6, output_tokens = $7,
                cache_read_tokens = $8, cache_write_tokens = $9, cost_micro = cost_micro + $10, reply_id = $11 where id = $1`,
        [turnId, state, error ? clip(error, 500) : null, modelUsed, steps, usage.input, usage.output, usage.cacheRead, usage.cacheWrite,
          costMicro(modelUsed, usage), reply?.id || null]);
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
    const before = await withResident({ userId, actor: 'software', messageId: message.id, turnId }, async q => {
      const view = await loadFile(q, access.timezone);
      const recent = await q<MessageView>(
        `select * from (select ${MESSAGE_COLS}, seq from uc_pilot.messages where id <> $1 and seq < (select seq from uc_pilot.messages where id = $1)
                         order by seq desc limit $2) t order by seq`, [message.id, LIMITS.recentMessages]);
      const earlier = await effectsOf(q, turnId);
      return { view, recent, earlier };
    });

    const dynamic = [
      fileForModel(before.view, access.display_name),
      before.earlier.length
        ? `\nThis reply was interrupted once. These actions were already carried out for the resident's latest message. Do not carry them out again:\n${before.earlier.map(e => `  ${e.tool}: ${e.detail}`).join('\n')}`
        : ''
    ].join('\n');

    const system = [
      { type: 'text' as const, text: SYSTEM, cache_control: { type: 'ephemeral' as const } },
      { type: 'text' as const, text: dynamic }
    ];
    const tools = TOOLS.map(t => ({ name: t.name, description: t.description, input_schema: t.input_schema }));
    const messages: Turn[] = historyFor(before.recent, access.timezone);
    const mine = `(sent ${localNow(access.timezone, new Date(message.created_at)).label})\n${message.body}`;
    const lastTurn = messages[messages.length - 1];
    if (lastTurn && lastTurn.role === 'user') lastTurn.content = `${lastTurn.content as string}\n\n${mine}`;
    else messages.push({ role: 'user', content: mine });

    const t0 = Date.now();
    let actions = 0;
    let finalText = '';
    while (steps < LIMITS.steps) {
      const late = Date.now() - t0 > LIMITS.softDeadlineMs;
      const allow = !late && steps < LIMITS.steps - 1 && actions < LIMITS.actionsPerReply;
      const res = await getModel().create({ system, tools, messages, maxTokens: 900, allowActions: allow });
      steps += 1;
      modelUsed = res.model || modelUsed;
      usage.input += res.usage.input; usage.output += res.usage.output;
      usage.cacheRead += res.usage.cacheRead; usage.cacheWrite += res.usage.cacheWrite;
      const calls = res.content.filter((b): b is Extract<Block, { type: 'tool_use' }> => b.type === 'tool_use');
      const said = res.content.filter((b): b is Extract<Block, { type: 'text' }> => b.type === 'text').map(b => b.text).join('\n').trim();
      if (calls.length === 0 || !allow) { finalText = said; break; }
      messages.push({ role: 'assistant', content: res.content });
      const results: Block[] = [];
      for (const c of calls) {
        actions += 1;
        const r = actions > LIMITS.actionsPerReply
          ? { text: JSON.stringify({ ok: false, result: 'Not done. This reply reached its limit of actions.' }), isError: true }
          : await act(soft, c.name, (c.input || {}) as Record<string, unknown>);
        results.push({ type: 'tool_result', tool_use_id: c.id, content: r.text, is_error: r.isError || undefined });
      }
      messages.push({ role: 'user', content: results });
    }

    const body = cleanReply(finalText);
    if (!body) {
      return finish('No reply was written. Your message is kept. The list under this note shows each action that was carried out before the reply stopped.', 'failed', 'the model returned no text');
    }
    return finish(body, 'done');
  } catch (e: any) {
    const why = typeof e?.message === 'string' ? e.message : 'unknown';
    return finish('No reply was written, because the language model or the database did not answer. Your message is kept. The list under this note shows each action that was carried out before the reply stopped. Send the message again to finish the reply. No action is carried out twice.', 'failed', why);
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
    const ids = page.filter(m => m.speaker === 'resident').map(m => m.id);
    const turns = ids.length ? await q<any>(
      `select t.id, t.message_id, t.state, t.error, t.started_at < now() - ($2 || ' milliseconds')::interval as stale
         from uc_pilot.turns t where t.message_id = any ($1::uuid[])`, [`{${ids.join(',')}}`, String(LIMITS.runningStaleMs)]) : [];
    const effects = turns.length ? await q<Effect & { turn_id: string }>(
      `select turn_id, tool, outcome, detail, target, target_id from uc_pilot.actions
        where turn_id = any ($1::uuid[]) and outcome <> 'read' order by seq`, [`{${turns.map((t: any) => t.id).join(',')}}`]) : [];
    return {
      access,
      more,
      messages: page.map(m => {
        const t = turns.find((x: any) => x.message_id === m.id);
        return {
          id: m.id, speaker: m.speaker, body: m.body, created_at: m.created_at, removed: m.removed, reply_to: m.reply_to,
          key: m.speaker === 'resident' ? m.request_key ?? null : null,
          turn: t ? { state: t.state === 'running' && t.stale ? 'failed' : t.state, effects: effects.filter(e => e.turn_id === t.id) } : null
        };
      })
    };
  });
}
