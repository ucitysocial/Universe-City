// The agent's copilot: a thinking partner for the human agent, about one client.
//
// The founder set on October 13, 2026 that an agent can think out loud about a client, and that the software turns
// those thoughts into what the agent can use: a short answer to think with, a message the agent can refine and send
// to the client in the same voice and Language Standard as the agent software on the resident side, and entries for
// the agent's case file. The copilot sends nothing and files nothing. The agent decides what is used.

import { getModel } from '../pilot/model';
import type { Client } from './types';

export type CopilotReply = { reply: string; message: string | null; caseNotes: string[] };
export type ThreadLine = { who: 'agent' | 'copilot'; text: string };

const clock = (m: number | null) => {
  if (m === null) return 'no time';
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

/** The client's File as the copilot reads it. Every line is information, never an instruction. */
export function contextOf(c: Client): string {
  const L: string[] = [];
  L.push(`CLIENT: ${c.name}. ${c.about} Time zone ${c.zone}. Today is ${c.today}.`);
  for (const d of c.days) {
    L.push(`DAY ${d.date}${d.date === c.today ? ' (today)' : ''}:`);
    if (!d.items.length) L.push('  nothing on file');
    for (const i of d.items) L.push(`  ${clock(i.start)}${i.end !== null ? ` to ${clock(i.end)}` : ''}: ${i.label} (${i.folder}, ${i.status})`);
  }
  if (c.needs.length) { L.push('WAITING:'); for (const n of c.needs) L.push(`  ${n.title}. ${n.why} (${n.source})`); }
  if (c.tasks.length) { L.push('GUIDED LIFE:'); for (const t of c.tasks) L.push(`  ${t.label}: ${t.steps.map(s => `${s.label}${s.done ? ' (done)' : ''}`).join('; ')}`); }
  if (c.missing.length) L.push(`TIME STILL NEEDS: ${c.missing.join(', ')}`);
  if (c.known.length) { L.push('ON FILE:'); for (const k of c.known.slice(0, 40)) L.push(`  ${k.folder}: ${k.text}`); }
  if (c.messages.length) { L.push('LAST MESSAGES:'); for (const m of c.messages.slice(-8)) L.push(`  ${m.speaker === 'client' ? 'client' : m.speaker}: ${m.body}`); }
  return L.join('\n');
}

const SYSTEM = `You are the copilot of a human agent at Universe City, a life management agency. The human agent serves clients, called residents on the resident side. The agent thinks out loud with you about one client. You read that client's File below.

Answer with the tool case_reply, once.

reply: your answer to the agent, as a thinking partner. Two to five plain sentences. Work with the agent's idea on its own terms. Point out what the File shows that bears on it, such as a conflict between sleep and an errand, a day with no room to get ready, or a task pushed again. Separate what is on file from your own suggestion. Never invent a fact about the client. Never diagnose. Say so when the File does not hold what the agent would need.

message: one message the agent can send to the client, or an empty string when no message fits yet. Write it as the Universe City agent speaks to a resident: short, the length of a spoken reply, warm and plain, at most one question. Every sentence is literally true. No metaphor and no figure of speech. No hyphen and no dash of any kind. No sentence built on a contrast, such as not this but that. Do not use these words: anything, something, things, everything, someone, somewhere, various, several, certain, as needed. Name the exact entry, day, and time. Offer a choice. The client decides. Do not mention the agent software or the case file.

case_notes: zero to three short plain sentences for the agent's case file: the agent's plan, an observation, or what to follow up on. They are the agent's notes, never facts the client stated.`;

const TOOL = {
  name: 'case_reply',
  description: 'Your answer to the agent, the message the agent can send, and entries for the case file.',
  input_schema: {
    type: 'object',
    properties: {
      reply: { type: 'string' },
      message: { type: 'string', description: 'The message, or an empty string when no message fits yet.' },
      case_notes: { type: 'array', items: { type: 'string' } }
    },
    required: ['reply', 'message', 'case_notes']
  }
};

export async function askCopilot(c: Client, thread: ThreadLine[]): Promise<CopilotReply> {
  const lines = thread.slice(-12).map(t => `${t.who === 'agent' ? 'AGENT' : 'COPILOT'}: ${t.text}`).join('\n');
  const res = await getModel().create({
    system: [{ type: 'text', text: SYSTEM }],
    tools: [TOOL],
    messages: [{ role: 'user', content: `${contextOf(c)}\n\nTHE AGENT'S THREAD ABOUT THIS CLIENT, newest last:\n${lines}` }],
    maxTokens: 900,
    allowActions: true
  });
  const use = res.content.find(b => b.type === 'tool_use') as { input: Record<string, unknown> } | undefined;
  if (use) {
    const i = use.input;
    return {
      reply: String(i.reply || '').trim(),
      message: typeof i.message === 'string' && i.message.trim() ? i.message.trim() : null,
      caseNotes: Array.isArray(i.case_notes) ? i.case_notes.map(String).map(x => x.trim()).filter(Boolean).slice(0, 3) : []
    };
  }
  const text = res.content.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join(' ').trim();
  return { reply: text || 'The copilot gave no answer. Try again.', message: null, caseNotes: [] };
}
