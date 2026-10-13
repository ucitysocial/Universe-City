// The founder's own File, as the Agent Portal reads it.
//
// It reads the same uc_pilot rows the Resident Portal reads, inside a transaction limited by row level security to
// the founder's own rows. It changes nothing. Each load reads what is on file at that moment, so a change made in the
// Resident Portal shows the next time the Agent Portal loads.

import { loadBoard } from '../pilot/board';
import { loadIndex } from '../pilot/browse';
import { TS, withResident } from '../pilot/db';
import type { Access } from '../pilot/file';
import { loadFile } from '../pilot/file';
import { localNow, sayClock } from '../pilot/time';
import type { Client, Msg, Need } from './types';

export async function loadLiveClient(userId: string, access: Access): Promise<Client> {
  return withResident({ userId, actor: 'resident' }, async q => {
    const zone = access.timezone;
    const ix = await loadIndex(q, zone);
    const board = await loadBoard(q, zone, ix);
    const v = await loadFile(q, zone, { statements: 120 });
    const rows = await q<{ id: string; speaker: string; body: string; at: string }>(
      `select id, speaker, body, ${TS('created_at')} as at from uc_pilot.messages
        where speaker in ('resident', 'agent') order by seq desc limit 14`);
    const today = localNow(zone).date;
    const when = (at: string) => {
      const n = localNow(zone, new Date(at));
      return `${n.date === today ? 'Today' : n.label.replace(/, \d{4},.*$/, '')}, ${sayClock(n.minutes)}`;
    };
    const messages: Msg[] = rows.reverse().map(r => ({ id: r.id, speaker: r.speaker === 'resident' ? 'client' : 'agent software', body: r.body, at: when(r.at) }));

    const needs: Need[] = [];
    for (const p of board.panel.pending) {
      if (p.type !== 'decide') continue;
      needs.push({ id: `wait:${p.id}`, kind: 'decision', title: p.summary, why: 'It waits for the client to confirm or decline.', source: 'Pending, in the File', action: 'decision' });
    }
    for (const p of v.waitingAgent) {
      needs.push({ id: `team:${p.id}`, kind: 'team', title: p.summary, why: 'The agent software proposed it. A person on the team decides.', source: 'Proposals for a person', action: 'decision' });
    }
    for (const f of v.followUps.filter(f => f.state === 'open')) {
      needs.push({
        id: `fu:${f.id}`, kind: 'follow_up', title: f.what,
        why: f.owner === 'agent' ? 'An agent owns this follow up.' : f.owner === 'resident' ? 'The client owns this follow up.' : 'The software owns this follow up.',
        source: `Follow up${f.due_on ? `, due ${f.due_on}` : ''}`, action: 'follow_up'
      });
    }
    v.notEstablished.filter(s => s.startsWith('What happened')).slice(0, 4).forEach((s, i) => {
      needs.push({ id: `out:${i}`, kind: 'outcome', title: s.replace(/ No outcome is reported\.$/, ''), why: 'No outcome is on file for it.', source: 'Schedule', action: 'question' });
    });
    const missing = board.intake.items.filter(i => !i.done).map(i => i.label);
    if (missing.length) {
      needs.push({ id: 'missing', kind: 'missing', title: `Time still needs: ${missing.join(', ').toLowerCase()}`, why: 'The agent software cannot plan full days without them.', source: 'Time, Progress', action: 'question' });
    }

    return {
      id: 'live', mode: 'live', name: access.display_name || 'Founder', about: 'Live founder test. Your own File, read only.',
      zone, today: board.today,
      days: board.days.map(d => ({
        date: d.date,
        items: d.items.map(i => ({ id: i.key, label: i.label, start: i.start, end: i.end, dept: i.dept, folder: i.belongs, status: i.kind }))
      })),
      needs, messages,
      known: v.statements.map(s => ({ id: s.id, folder: s.folder, text: s.entry ?? s.said })),
      tasks: [],
      missing,
      lastFiled: v.statements[0]?.created_at ?? null
    };
  });
}
