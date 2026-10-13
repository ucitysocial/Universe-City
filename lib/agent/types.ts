// The Agent Portal's picture of one client.
//
// The founder set on October 13, 2026 that the Agent Portal opens two kinds of client, never mixed:
//   live  the founder's own File, read from the same uc_pilot rows as the Resident Portal. Read only for now.
//   demo  made up clients for clicking through. Their data and every change made to it stay in this browser.
// The Language Standard names the person a client in the agent console. The Resident Portal names the same person a
// resident.

export type Mode = 'live' | 'demo';

export type DayItem = { id: string; label: string; start: number | null; end: number | null; dept: string; folder: string; status: string };
export type Msg = { id: string; speaker: 'client' | 'agent software' | 'agent'; body: string; at: string };
export type Known = { id: string; folder: string; text: string };
export type Step = { label: string; done: boolean };
export type Task = { id: string; label: string; when: string; steps: Step[]; current: number };

/** One thing that waits, with where it comes from in the File. */
export type Need = {
  id: string;
  kind: 'carried' | 'pushed' | 'decision' | 'team' | 'follow_up' | 'outcome' | 'missing' | 'stuck';
  title: string;
  why: string;
  source: string;
  action: 'schedule' | 'check_in' | 'decision' | 'follow_up' | 'guided' | 'question';
};

export type Client = {
  id: string;            // 'live' for the founder. A slug for a made up client
  mode: Mode;
  name: string;
  about: string;         // one line on who the client is, for the switcher
  zone: string;
  today: string;         // the client's date
  days: { date: string; items: DayItem[] }[];
  needs: Need[];
  messages: Msg[];
  known: Known[];
  tasks: Task[];
  missing: string[];
  lastFiled: string | null;
};
