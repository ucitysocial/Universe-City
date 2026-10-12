// Local work only. Fills the database in memory with one made up conversation, so each screen has entries to show.
// The conversation runs through the same server code as a real one, with a scripted stand in for the language model.
// A production build never loads this file: local.ts loads it only on a development server with PILOT_LOCAL_SEED=1.

import { randomUUID } from 'node:crypto';
import { withResident } from './db';
import { useModel, type Block, type Model } from './model';
import { addDays, localNow, weekdayOf } from './time';
import { decide } from './tools';
import { continueAfterPress, receive } from './turn';

export async function seedLocal(userId: string): Promise<void> {
  const zone = 'America/Denver';
  let queue: Block[][] = [];
  const scripted: Model = {
    name: () => 'scripted for local work',
    async create() {
      return { content: queue.shift() || [{ type: 'text', text: 'Understood.' }], stop: 'end_turn', usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, model: 'scripted' };
    }
  };
  useModel(scripted);
  let n = 0;
  const call = (name: string, input: Record<string, unknown>): Block => ({ type: 'tool_use', id: `seed${++n}`, name, input });
  const say = (text: string): Block[] => [{ type: 'text', text }];
  const send = (text: string, script: Block[][]) => { queue = [...script]; return receive(userId, text, randomUUID()); };
  const today = localNow(zone).date;
  let friday = today;
  while (weekdayOf(friday) !== 5) friday = addDays(friday, 1);

  await withResident({ userId, actor: 'resident' }, q => q(`update uc_pilot.access set notice_seen_at = now() where user_id = uc_pilot.uid()`));
  await send('hi', [say('Hi. What would you like to talk about?')]);
  await send('i need to get my schedule in line its a mess', [
    [call('open_work', { label: 'Weekly schedule', folder: 'Time', quote: 'i need to get my schedule in line' })],
    say('Okay. Nothing is on file yet, so we start from the beginning. What repeats in your week, such as work shifts or classes?')
  ]);
  await send('its kind of all over.. i work at a bar , so sometimes i work thursday, friday, saturday, sunday.. sometimes just 2 of those days', [
    [call('file_statement', { quote: 'i work at a bar , so sometimes i work thursday, friday, saturday, sunday', topic: 'Bar work pattern', folder: 'Time' })],
    say('That is on file. The days change, so I filed no weekly shift. Which days do you work this coming week?')
  ]);
  await send('bar opens thursday and friday at 5pm , and saturday and sunday at 4pm , sometimes i come in 1-2 hours early.. and when we leave is dependent on how busy it is', [
    [call('file_statement', { quote: 'bar opens thursday and friday at 5pm , and saturday and sunday at 4pm', topic: 'Bar opening hours', folder: 'Time' }),
      call('file_statement', { quote: 'sometimes i come in 1-2 hours early', topic: 'Arrival before opening', folder: 'Time' }),
      call('file_statement', { quote: 'when we leave is dependent on how busy it is', topic: 'Shift end varies', folder: 'Time' })],
    say('Three statements are on file. The end of a shift stays unknown. Which days do you work this coming week?')
  ]);
  const one = await send('just one day: Friday', [
    [call('add_commitment', { date: friday, label: 'Bar shift', quote: 'just one day: Friday' })],
    say('The bar shift is on Friday. What time do you plan to arrive at the bar on Friday?')
  ]);
  const shift = one.effects[0]?.target_id as string;
  await send('i will probably get there at 3PM', [
    [call('prepare', { action: 'change_commitment', args: { ref: shift.slice(0, 8), start: '15:00' }, rests_on: 'You said you will probably get there at 3 PM.' })],
    say('You said probably, so the time is not filed yet. Should I set the Friday bar shift to start at 3:00 PM?')
  ]);
  const card = (await withResident({ userId, actor: 'resident' }, q => q<{ id: string }>(`select id from uc_pilot.pending where state = 'open' limit 1`)))[0].id;
  await withResident({ userId, actor: 'resident' }, async q => {
    const r = await decide({ q, userId, messageId: null, messageText: '', now: localNow(zone), basis: 'resident_confirmation', via: 'screen' }, card, 'confirm');
    await q(`insert into uc_pilot.actions (tool, args, outcome, detail, brief, target, target_id, idem_key) values ('screen_decision', '{}'::jsonb, 'decided', $1, $2, $3, $4, $5)`,
      [r.detail, r.brief ?? null, r.target ?? null, r.targetId ?? null, `screen:${card}`]);
  });
  queue = [say('The Friday bar shift starts at 3:00 PM. What else already has to happen this week?')];
  await continueAfterPress(userId, card);
  await send('i have class every tuesday from 6 to 8 PM', [
    [call('set_schedule_item', { label: 'Class', days: ['Tuesday'], start: '18:00', end: '20:00', quote: 'i have class every tuesday from 6 to 8 PM' })],
    say('Class is in the weekly schedule, Tuesday, 6:00 PM to 8:00 PM. What else already has to happen this week?')
  ]);
  await send('actually i will get to the bar at 3:30 PM on friday', [
    [call('change_commitment', { ref: shift.slice(0, 8), start: '15:30', quote: 'i will get to the bar at 3:30 PM on friday' })],
    say('The Friday bar shift now starts at 3:30 PM. It was 3:00 PM before.')
  ]);
  await send('i decided cash only for groceries from now on. and i might do laundry sunday', [
    [call('file_statement', { quote: 'i decided cash only for groceries from now on', topic: 'Groceries cash only', folder: 'Finance' }),
      call('prepare', { action: 'add_commitment', args: { date: addDays(friday, 2), label: 'Laundry' }, rests_on: 'You said you might do laundry on Sunday.' })],
    say('The grocery decision is on file under Finance. Laundry on Sunday was said as a thought, so it waits for your answer.')
  ]);
}
