// Made up clients for the Agent Portal demo.
//
// Every name, schedule, message, and fact here is invented. None of it is read from or written to the database. The
// founder set on October 13, 2026 that the demo shows how an agent works with several clients, and that it never mixes
// with her live File. Days are placed relative to the day the page opens, so the demo always reads as this week.

import { belongsTo } from '../pilot/dept';
import { addDays } from '../pilot/time';
import type { Client, DayItem, Known, Msg, Need, Task } from './types';

const t = (h: number, m = 0) => h * 60 + m;
const item = (id: string, label: string, folder: string, start: number | null, end: number | null, status = 'planned'): DayItem => {
  const b = belongsTo(folder, label);
  return { id, label, start, end, dept: b.dept, folder: b.folder ? `${b.folder}, in ${b.deptName}` : b.deptName, status };
};
const said = (id: string, speaker: Msg['speaker'], body: string, _today: string, hhmm: string, back = 0): Msg => {
  const [h, m] = hhmm.split(':').map(Number);
  return { id, speaker, body, at: `${back ? 'Yesterday' : 'Today'}, ${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` };
};
const fact = (id: string, folder: string, text: string): Known => ({ id, folder, text });

export function demoClients(today: string): Client[] {
  const d = (n: number) => addDays(today, n);

  const dana: Client = {
    id: 'dana', mode: 'demo', name: 'Dana Reyes', about: 'Works overnight shifts. Days move around.',
    zone: 'America/Denver', today,
    days: [
      { date: d(0), items: [item('dana-1', 'Laundry', 'Sanitation', null, null), item('dana-2', 'Sleep', 'Regulation', t(8), t(15)), item('dana-3', 'Grocery run', 'Inventory', t(16), t(17)), item('dana-4', 'Night shift', 'Schedule', t(22), t(30))] },
      { date: d(1), items: [item('dana-5', 'Sleep', 'Regulation', t(8), t(15)), item('dana-6', 'Night shift', 'Schedule', t(22), t(30))] },
      { date: d(2), items: [item('dana-7', 'Day off', 'Schedule', null, null), item('dana-8', 'Call the clinic about a refill', 'Health', t(10), t(10, 15))] }
    ],
    needs: [
      { id: 'dana-n1', kind: 'carried', title: 'Laundry carried from yesterday', why: 'It was not marked done. It has no time today.', source: 'Schedule, yesterday', action: 'schedule' },
      { id: 'dana-n2', kind: 'pushed', title: 'Chart notes before shift end, pushed twice', why: 'Moved from 5 AM to 5:30 AM, then to 6 AM.', source: 'Schedule, history of the entry', action: 'guided' },
      { id: 'dana-n3', kind: 'decision', title: 'Move the grocery run to Thursday at 10 AM?', why: 'The agent software prepared it. Dana has not answered.', source: 'Pending', action: 'decision' }
    ],
    messages: [
      said('dana-m1', 'client', 'i got off late again so laundry didnt happen', today, '07:42', 1),
      said('dana-m2', 'agent software', 'Laundry stays open. When can it get done?', today, '07:42', 1),
      said('dana-m3', 'client', 'not sure. i sleep till 3', today, '07:44', 1)
    ],
    known: [fact('dana-k1', 'Employment', 'Works overnight as a nursing assistant.'), fact('dana-k2', 'Regulation', 'Sleeps from about 8 AM to 3 PM after a night shift.'), fact('dana-k3', 'Salary', 'Paid every other Friday.')],
    tasks: [{ id: 'dana-t1', label: 'Chart notes before shift end', when: `${d(0)} 6:00 AM`, current: 1, steps: [{ label: 'Open the charting screen', done: true }, { label: 'Notes for room 4', done: false }, { label: 'Notes for room 7', done: false }, { label: 'Sign and submit', done: false }] }],
    missing: ['Meals'], lastFiled: `${d(-1)} 07:44`
  };

  const marcus: Client = {
    id: 'marcus', mode: 'demo', name: 'Marcus Hill', about: 'Student with a part time warehouse job.',
    zone: 'America/Denver', today,
    days: [
      { date: d(0), items: [item('mar-1', 'Biology class', 'Education', t(9), t(10, 30)), item('mar-2', 'Study for the biology exam', 'Education', t(13), t(15)), item('mar-3', 'Warehouse shift', 'Schedule', t(17), t(22))] },
      { date: d(1), items: [item('mar-4', 'Biology exam', 'Education', t(9), t(11)), item('mar-5', 'Call the financial aid office', 'Finance', t(14), t(14, 30))] }
    ],
    needs: [
      { id: 'mar-n1', kind: 'follow_up', title: 'Call the financial aid office back by Friday', why: 'An agent owns this follow up. Marcus asked for help with the call.', source: 'Follow up, due Friday', action: 'follow_up' },
      { id: 'mar-n2', kind: 'stuck', title: 'Said studying is hard to start', why: 'He wrote it this morning, before the study block.', source: 'Conversation, today', action: 'guided' }
    ],
    messages: [
      said('mar-m1', 'client', 'i have to study for bio but i keep putting it off', today, '08:10'),
      said('mar-m2', 'agent software', 'The study block is at 1 PM. Want to break it into steps?', today, '08:10'),
      said('mar-m3', 'client', 'yeah', today, '08:12')
    ],
    known: [fact('mar-k1', 'Education', 'Biology exam on file for tomorrow at 9 AM.'), fact('mar-k2', 'Employment', 'Works at a warehouse, evenings, about 20 hours a week.'), fact('mar-k3', 'Finance', 'Waiting on a financial aid answer.')],
    tasks: [{ id: 'mar-t1', label: 'Study for the biology exam', when: `${d(0)} 1:00 PM`, current: 0, steps: [{ label: 'Read the chapter 6 summary', done: false }, { label: 'Make 10 flash cards', done: false }, { label: 'Do the practice quiz', done: false }, { label: 'Check the wrong answers', done: false }] }],
    missing: ['Sleep and wake times', 'Morning routine'], lastFiled: `${d(0)} 08:12`
  };

  const tasha: Client = {
    id: 'tasha', mode: 'demo', name: 'Tasha Monroe', about: 'New client. Moved into a new apartment this month.',
    zone: 'America/Denver', today,
    days: [
      { date: d(0), items: [item('tas-1', 'Bring the lease papers to the office', 'Administration', t(11), t(11, 30)), item('tas-2', 'Bus to work', 'Transportation', t(13, 15), t(13, 50)), item('tas-3', 'Shift at the cafe', 'Schedule', t(14), t(20))] },
      { date: d(1), items: [] }
    ],
    needs: [
      { id: 'tas-n1', kind: 'missing', title: 'Time still needs sleep and wake times, meals, and a night routine', why: 'Intake is not finished. Tomorrow holds nothing.', source: 'Time, Progress', action: 'question' },
      { id: 'tas-n2', kind: 'team', title: 'File under Administration: lease starts on the 1st, rent due on the 5th?', why: 'The agent software read this from a photo note. A person decides.', source: 'Proposals for a person', action: 'decision' }
    ],
    messages: [
      said('tas-m1', 'client', 'got the keys yesterday!! lease papers are due at the office today', today, '09:30'),
      said('tas-m2', 'agent software', 'Bringing the lease papers is on file for 11 AM today.', today, '09:31')
    ],
    known: [fact('tas-k1', 'Administration', 'Moved into a new apartment this month.'), fact('tas-k2', 'Employment', 'Works at a cafe, afternoons.')],
    tasks: [],
    missing: ['Sleep and wake times', 'Meals', 'Night routine'], lastFiled: `${d(0)} 09:31`
  };

  const leo: Client = {
    id: 'leo', mode: 'demo', name: 'Leo Park', about: 'Looking for work. Building daily routines.',
    zone: 'America/Denver', today,
    days: [
      { date: d(0), items: [item('leo-1', 'Morning routine', 'Regulation', t(7), t(7, 45)), item('leo-2', 'Clean the office', 'Sanitation', null, null), item('leo-3', 'Apply to 3 jobs', 'Employment', t(10), t(12)), item('leo-4', 'Night routine', 'Regulation', t(22), t(22, 30))] },
      { date: d(1), items: [item('leo-5', 'Morning routine', 'Regulation', t(7), t(7, 45)), item('leo-6', 'Job fair downtown', 'Employment', t(13), t(16))] }
    ],
    needs: [
      { id: 'leo-n1', kind: 'carried', title: 'Clean the office, open 2 days', why: 'Carried from Monday. It has no time today.', source: 'Schedule', action: 'schedule' },
      { id: 'leo-n2', kind: 'pushed', title: 'Clean the office, pushed 3 times', why: 'Moved from 12 PM to 1 PM, to 2 PM, then to the next day.', source: 'Schedule, history of the entry', action: 'guided' },
      { id: 'leo-n3', kind: 'follow_up', title: 'Send Leo the job fair address', why: 'An agent owns this follow up.', source: 'Follow up, due today', action: 'follow_up' }
    ],
    messages: [
      said('leo-m1', 'client', 'ok im not doing the office today either', today, '11:05', 1),
      said('leo-m2', 'agent software', 'It stays open for tomorrow.', today, '11:05', 1)
    ],
    known: [fact('leo-k1', 'Employment', 'Looking for warehouse or retail work.'), fact('leo-k2', 'Regulation', 'Morning routine at 7 AM on weekdays.')],
    tasks: [{ id: 'leo-t1', label: 'Clean the office', when: `${d(0)} no time yet`, current: 0, steps: [{ label: 'Take out the trash', done: false }, { label: 'Clear the desk', done: false }, { label: 'Put the supplies back', done: false }, { label: 'Wipe the surfaces', done: false }] }],
    missing: ['Meals'], lastFiled: `${d(-1)} 11:05`
  };

  return [dana, marcus, tasha, leo];
}
