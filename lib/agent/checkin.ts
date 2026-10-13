// Prepare check-in: what an agent reads before talking with a client.
//
// It is put together from the client's File by fixed rules. No language model writes it, and the page says so.
// Each line names where it comes from. A suggested question is a suggestion for the agent, never a fact.

import type { Client, Need } from './types';

export type Brief = { sections: { title: string; lines: { text: string; source: string }[] }[]; questions: { text: string; why: string }[] };

const clock = (m: number | null) => {
  if (m === null) return 'No time';
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

function question(n: Need, c: Client): { text: string; why: string } | null {
  const first = c.tasks.find(t => n.title.startsWith(t.label))?.steps.find(s => !s.done)?.label;
  switch (n.kind) {
    case 'carried': return { text: `When can ${n.title.replace(/ (carried|open).*$/, '').toLowerCase()} get done today?`, why: n.why };
    case 'pushed': return { text: first ? `Want to start with one small step: ${first.toLowerCase()}?` : `What usually makes ${n.title.replace(/, pushed.*$/, '').toLowerCase()} hard to begin?`, why: n.why };
    case 'stuck': return { text: first ? `Want to start with the first step: ${first.toLowerCase()}?` : 'What is the first small part of it?', why: n.why };
    case 'decision': return { text: `Do you want this: ${n.title.replace(/\?$/, '').toLowerCase()}?`, why: 'It waits for an answer.' };
    case 'missing': return { text: 'What time do you usually wake up, and when do you go to sleep?', why: n.title };
    case 'outcome': return { text: `${n.title.replace(/^What happened with /, 'How did ')} go?`, why: n.why };
    case 'follow_up': return n.why.startsWith('An agent') ? { text: `I am working on this: ${n.title.toLowerCase()}. Anything new on your side?`, why: 'You own this follow up.' } : null;
    default: return null;
  }
}

export function prepareCheckIn(c: Client): Brief {
  const today = c.days.find(d => d.date === c.today);
  const sections: Brief['sections'] = [];
  sections.push({
    title: 'Today',
    lines: today && today.items.length
      ? today.items.map(i => ({ text: `${clock(i.start)}  ${i.label}`, source: i.folder }))
      : [{ text: 'Nothing is on file for today.', source: 'Schedule' }]
  });
  if (c.needs.length) sections.push({ title: 'Waiting', lines: c.needs.map(n => ({ text: n.title, source: n.source })) });
  const open = c.tasks.filter(t => t.steps.some(s => !s.done));
  if (open.length) {
    sections.push({
      title: 'Work in progress',
      lines: open.map(t => ({ text: `${t.label}: ${t.steps.filter(s => s.done).length} of ${t.steps.length} steps done`, source: 'Guided Life' }))
    });
  }
  const last = c.messages.slice(-3);
  if (last.length) sections.push({ title: 'Last conversation', lines: last.map(m => ({ text: `${m.speaker === 'client' ? c.name.split(' ')[0] : m.speaker === 'agent' ? 'You' : 'Agent software'}: ${m.body}`, source: m.at })) });
  if (c.known.length) sections.push({ title: 'On file', lines: c.known.slice(0, 4).map(k => ({ text: k.text, source: k.folder })) });
  const questions = c.needs.map(n => question(n, c)).filter((x): x is { text: string; why: string } => !!x).slice(0, 4);
  return { sections, questions };
}
