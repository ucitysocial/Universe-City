'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { prepareCheckIn } from '@/lib/agent/checkin';
import type { Client, Need } from '@/lib/agent/types';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';
import { stamp, useAgent } from './AgentShell';

const KIND: Record<Need['kind'], string> = {
  carried: 'To schedule', pushed: 'Pushed twice or more', decision: 'Waits for the client', team: 'Waits for a person',
  follow_up: 'Follow up', outcome: 'No outcome yet', missing: 'Missing pieces', stuck: 'Hard to start'
};
const ACTION: Record<Need['action'], { label: string; tab: Tab }> = {
  schedule: { label: 'Propose a time', tab: 'conversation' },
  check_in: { label: 'Prepare the check in', tab: 'checkin' },
  decision: { label: 'Review the decision', tab: 'waiting' },
  follow_up: { label: 'Open the follow up', tab: 'waiting' },
  guided: { label: 'Open Guided Life', tab: 'guided' },
  question: { label: 'Prepare a question', tab: 'checkin' }
};
const LIVE_NOTE = 'Your live File is read only here. Agent actions on it open after you approve them.';
const clock = (m: number | null) => {
  if (m === null) return 'No time';
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};
const dayName = (date: string, today: string) => {
  if (date === today) return 'Today';
  const d = new Date(`${date}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
const deptColor = (key: string) => DEPARTMENTS.find(d => d.key === key)?.color || 'var(--ink)';

// ------------------------------------------------------------------ home: who needs attention, and why

export function AgentHome() {
  const { clients, view } = useAgent();
  const list = clients.map(c => view(c.id)!).filter(Boolean);
  const total = list.reduce((n, c) => n + c.needs.length, 0);
  return (
    <div className="fb-pane ag-home">
      <div className="ag-hero">
        <h1>Your clients need attention</h1>
        <p><b>{total}</b> {total === 1 ? 'item waits' : 'items wait'} across {list.filter(c => c.needs.length).length} clients. Each card says what changed, why it matters, and where it comes from in the File.</p>
      </div>
      {list.map(c => (
        <section key={c.id} className="ag-group">
          <div className="ag-group-h">
            <Link href={`/agent/c/${c.id}`}><h2>{c.name}</h2></Link>
            <span className={`ag-mode ${c.mode}`}>{c.mode === 'live' ? 'Live, read only' : 'Demo data'}</span>
            <span className="ag-about">{c.about}</span>
            <Link href={`/agent/c/${c.id}?tab=checkin`} className="pt-btn ghost ag-small">Prepare the check in</Link>
          </div>
          {c.needs.length === 0 && <p className="dash-empty">Nothing waits for {c.name.split(' ')[0]}.</p>}
          <div className="ag-cards">
            {c.needs.map(n => <NeedCard key={n.id} c={c} n={n} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function NeedCard({ c, n, inline = false, children }: { c: Client; n: Need; inline?: boolean; children?: React.ReactNode }) {
  const { change } = useAgent();
  const a = ACTION[n.action];
  return (
    <article className={`ag-card k-${n.kind}`}>
      <span className="ag-kind">{KIND[n.kind]}</span>
      <b>{n.title}</b>
      <p>{n.why}</p>
      <span className="ag-src">From: {n.source}</span>
      <div className="ag-acts">
        {!inline && <Link href={`/agent/c/${c.id}?tab=${a.tab}&need=${encodeURIComponent(n.id)}`} className="pt-btn ag-small">{a.label}</Link>}
        {children}
        {c.mode === 'demo'
          ? <button type="button" className="pt-btn ghost ag-small" onClick={() => change(c.id, d => ({ ...d, handled: { ...d.handled, [n.id]: 'Marked reviewed' } }))}>Mark reviewed</button>
          : null}
      </div>
    </article>
  );
}

// ------------------------------------------------------------------ one client

type Tab = 'checkin' | 'conversation' | 'notes' | 'schedule' | 'file' | 'guided' | 'waiting';
const TABS: { key: Tab; label: string }[] = [
  { key: 'checkin', label: 'Check in' },
  { key: 'conversation', label: 'Conversation' },
  { key: 'notes', label: 'Notes' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'guided', label: 'Guided Life' },
  { key: 'file', label: 'File' },
  { key: 'waiting', label: 'Waiting' }
];

export function AgentClient({ id }: { id: string }) {
  const { view } = useAgent();
  const params = useSearchParams();
  const router = useRouter();
  const c = view(id);
  const tab = (TABS.find(t => t.key === params.get('tab'))?.key || 'checkin') as Tab;
  const go = (t: Tab, extra = '') => router.replace(`/agent/c/${id}?tab=${t}${extra}`, { scroll: false });
  if (!c) return <div className="fb-pane"><p className="fb-empty">No client with that name is in your list.</p></div>;
  return (
    <div className="fb-pane ag-client-pane">
      <div className="ag-head">
        <div>
          <p className="ag-about">{c.about}</p>
          {c.mode === 'demo' && <p className="ag-demo-line">Made up client. Every change here stays in this browser and reaches no one.</p>}
          {c.mode === 'live' && <p className="ag-demo-line live">Read from your File as it stands now. Changes you make in the Resident Portal show the next time this page loads.</p>}
        </div>
        <div className="ag-buttons">
          <button type="button" className="pt-btn" onClick={() => go('checkin')}>Prepare the check in</button>
          <button type="button" className="pt-btn ghost" onClick={() => go('conversation')}>Send a message</button>
          <button type="button" className="pt-btn ghost" onClick={() => go('notes')}>Add a note</button>
          <button type="button" className="pt-btn ghost" onClick={() => go('schedule')}>Review the schedule</button>
          <button type="button" className="pt-btn ghost" onClick={() => go('guided')}>Open Guided Life</button>
          <button type="button" className="pt-btn ghost" onClick={() => go('waiting')}>Resolve what waits{c.needs.length ? ` (${c.needs.length})` : ''}</button>
        </div>
      </div>
      <nav className="ag-tabs" aria-label="Views">
        {TABS.map(t => (
          <button key={t.key} type="button" className={tab === t.key ? 'on' : undefined} aria-current={tab === t.key ? 'page' : undefined} onClick={() => go(t.key)}>
            {t.label}{t.key === 'waiting' && c.needs.length ? <i>{c.needs.length}</i> : null}
          </button>
        ))}
      </nav>
      <div className="ag-body">
        {tab === 'checkin' && <CheckIn c={c} onUse={q => go('conversation', `&q=${encodeURIComponent(q)}`)} />}
        {tab === 'conversation' && <Conversation c={c} />}
        {tab === 'notes' && <Notes c={c} />}
        {tab === 'schedule' && <Schedule c={c} />}
        {tab === 'guided' && <Guided c={c} onSuggest={q => go('conversation', `&q=${encodeURIComponent(q)}`)} />}
        {tab === 'file' && <FileView c={c} folder={params.get('folder')} />}
        {tab === 'waiting' && <Waiting c={c} focus={params.get('need')} onDraft={q => go('conversation', `&q=${encodeURIComponent(q)}`)} />}
      </div>
    </div>
  );
}

function CheckIn({ c, onUse }: { c: Client; onUse: (q: string) => void }) {
  const brief = useMemo(() => prepareCheckIn(c), [c]);
  return (
    <div className="ag-brief">
      <p className="ag-made">Put together from the File by fixed rules. No AI wrote it. Each line names where it comes from.</p>
      {brief.sections.map((s, n) => (
        <div key={s.title}>
          <section className="ag-sec">
            <h3>{s.title}</h3>
            <ul>{s.lines.map((l, i) => <li key={i}><span>{l.text}</span><em>{l.source}</em></li>)}</ul>
          </section>
          {n === Math.min(1, brief.sections.length - 1) && (
            <section className="ag-sec">
              <h3>Questions you could ask</h3>
              {brief.questions.length === 0 && <p className="dash-empty">No question is suggested. Nothing waits.</p>}
              <ul className="ag-qs">
                {brief.questions.map((q, i) => (
                  <li key={i}>
                    <span>{q.text}</span>
                    <em>Suggested because: {q.why}</em>
                    <button type="button" className="pt-btn ghost ag-small" onClick={() => onUse(q.text)}>Use this question</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ))}
    </div>
  );
}

function Conversation({ c }: { c: Client }) {
  const { change } = useAgent();
  const params = useSearchParams();
  const [text, setText] = useState(params.get('q') || '');
  const [said, setSaid] = useState<string | null>(null);
  useEffect(() => { const q = params.get('q'); if (q) setText(q); }, [params]);
  const first = c.name.split(' ')[0];
  function send() {
    const body = text.trim();
    if (!body) return;
    change(c.id, d => ({ ...d, sent: [...d.sent, { id: `sent-${Date.now()}`, speaker: 'agent', body, at: stamp() }] }));
    setText('');
    setSaid('Shown in the demo conversation. Nothing was sent to anyone.');
  }
  return (
    <div className="ag-convo">
      <div className="ag-msgs">
        {c.messages.length === 0 && <p className="dash-empty">No message is on file.</p>}
        {c.messages.map(m => (
          <div key={m.id} className={`ag-msg ${m.speaker === 'client' ? 'client' : m.speaker === 'agent' ? 'you' : 'soft'}`}>
            <span className="ag-who">{m.speaker === 'client' ? first : m.speaker === 'agent' ? 'You, agent' : 'Agent software'} <em>{m.at}</em></span>
            <p>{m.body}</p>
          </div>
        ))}
      </div>
      <form className="ag-compose" onSubmit={e => { e.preventDefault(); if (c.mode === 'demo') send(); }}>
        <label htmlFor="ag-draft">Your message to {first}. You can change every word before it goes.</label>
        <textarea id="ag-draft" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={`Write to ${first}`} />
        <div className="pt-btns">
          <button type="submit" className="pt-btn" disabled={c.mode !== 'demo' || !text.trim()}>Send the message</button>
          <button type="button" className="pt-btn ghost" disabled={!text} onClick={() => setText('')}>Discard the draft</button>
        </div>
        {c.mode === 'live' && <p className="ag-made">{LIVE_NOTE}</p>}
        {said && <p className="pop-ok" role="status">{said}</p>}
      </form>
    </div>
  );
}

function Notes({ c }: { c: Client }) {
  const { demo, change } = useAgent();
  const d = demo(c.id);
  const [kind, setKind] = useState<'note' | 'client_said'>('note');
  const [text, setText] = useState('');
  const [folder, setFolder] = useState('Time');
  const first = c.name.split(' ')[0];
  function save() {
    const body = text.trim();
    if (!body) return;
    const id = `n-${Date.now()}`;
    change(c.id, x => ({
      ...x,
      notes: [{ id, kind, text: body, at: stamp() }, ...x.notes],
      proposals: kind === 'client_said' ? [{ id: `p-${id}`, folder, text: body, from: `${first} said it to you. You typed it.`, state: 'open' }, ...x.proposals] : x.proposals
    }));
    setText('');
  }
  return (
    <div className="ag-notes">
      <form className="ag-compose" onSubmit={e => { e.preventDefault(); if (c.mode === 'demo') save(); }}>
        <div className="ag-seg" role="radiogroup" aria-label="What this is">
          <button type="button" className={kind === 'note' ? 'on' : undefined} onClick={() => setKind('note')}>Your note</button>
          <button type="button" className={kind === 'client_said' ? 'on' : undefined} onClick={() => setKind('client_said')}>What {first} said</button>
        </div>
        <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={kind === 'note' ? 'What you noticed or did' : `What ${first} told you, in ${first}'s words`} />
        {kind === 'client_said' && (
          <label className="ag-folder">It belongs in
            <select value={folder} onChange={e => setFolder(e.target.value)}>{FOLDERS.map(f => <option key={f.name}>{f.name}</option>)}</select>
          </label>
        )}
        <div className="pt-btns"><button type="submit" className="pt-btn" disabled={c.mode !== 'demo' || !text.trim()}>{kind === 'note' ? 'Save the note' : 'Prepare the File update'}</button></div>
        {kind === 'client_said' && <p className="ag-made">What {first} said becomes a proposed File update. It goes on file only when you confirm it.</p>}
        {c.mode === 'live' && <p className="ag-made">{LIVE_NOTE}</p>}
      </form>
      {d.proposals.filter(p => p.state === 'open').length > 0 && (
        <section className="ag-sec">
          <h3>Proposed File updates</h3>
          {d.proposals.filter(p => p.state === 'open').map(p => (
            <div key={p.id} className="ag-card k-team">
              <span className="ag-kind">Proposed File update</span>
              <b>{p.folder}: {p.text}</b>
              <span className="ag-src">From: {p.from}</span>
              <div className="ag-acts">
                <button type="button" className="pt-btn ag-small" onClick={() => change(c.id, x => ({ ...x, proposals: x.proposals.map(y => y.id === p.id ? { ...y, state: 'confirmed' } : y) }))}>Confirm the update</button>
                <button type="button" className="pt-btn ghost ag-small" onClick={() => change(c.id, x => ({ ...x, proposals: x.proposals.map(y => y.id === p.id ? { ...y, state: 'discarded' } : y) }))}>Discard the update</button>
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="ag-sec">
        <h3>Notes</h3>
        {d.notes.length === 0 && <p className="dash-empty">No note yet.</p>}
        <ul className="ag-notelist">
          {d.notes.map(n => <li key={n.id}><span className="ag-kind">{n.kind === 'note' ? 'Your note' : `${first} said, typed by you`}</span><p>{n.text}</p><em>{n.at}</em></li>)}
        </ul>
      </section>
    </div>
  );
}

function Schedule({ c }: { c: Client }) {
  return (
    <div className="ag-sched">
      {c.days.map(d => (
        <section key={d.date} className="ag-sec">
          <h3>{dayName(d.date, c.today)}</h3>
          {d.items.length === 0 && <p className="dash-empty">Nothing is on file for this day.</p>}
          {d.items.length > 0 && (
            <div className="ents">
              {d.items.map(i => (
                <div key={i.id} className="ent" style={{ '--fc': deptColor(i.dept) } as CSSProperties}>
                  <span className="fi i-page" />
                  <b>{i.label}</b>
                  <span className="right">{i.start === null ? 'No time' : `${clock(i.start)}${i.end !== null ? ` to ${clock(i.end)}` : ''}`}</span>
                  <span className="sub">{i.folder}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function Guided({ c, onSuggest }: { c: Client; onSuggest: (q: string) => void }) {
  const { change } = useAgent();
  if (!c.tasks.length) return <p className="dash-empty">{c.mode === 'live' ? 'Guided Life is not built into your live File yet. The demo clients show how it will work.' : `${c.name.split(' ')[0]} has no task with steps right now.`}</p>;
  return (
    <div className="ag-guided">
      {c.tasks.map(t => {
        const done = t.steps.filter(s => s.done).length;
        const cur = t.steps[t.current];
        return (
          <section key={t.id} className="ag-sec ag-task">
            <h3>{t.label} <em>{t.when}</em></h3>
            <div className="ag-prog" role="img" aria-label={`${done} of ${t.steps.length} steps done`}>{t.steps.map((s, i) => <i key={i} className={s.done ? 'on' : i === t.current ? 'cur' : undefined} />)}</div>
            <p className="ag-made">{done} of {t.steps.length} steps done. The client marks steps. You support and suggest.</p>
            <ol>
              {t.steps.map((s, i) => <li key={i} className={s.done ? 'done' : i === t.current ? 'cur' : undefined}>{s.label}{i === t.current && !s.done ? <span className="ag-now">Current step</span> : null}</li>)}
            </ol>
            <div className="ag-acts">
              {cur && <button type="button" className="pt-btn ag-small" onClick={() => onSuggest(`Next small step: ${cur.label.toLowerCase()}. Want to start it now?`)}>Suggest this step to the client</button>}
              {cur && c.mode === 'demo' && <button type="button" className="pt-btn ghost ag-small" onClick={() => change(c.id, d => ({ ...d, tasks: { ...d.tasks, [t.id]: t.steps.map((s, i) => s.done || i === t.current) } }))}>Show the client finishing this step</button>}
              {!cur && <span className="pt-chip filed">All steps done</span>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FileView({ c, folder }: { c: Client; folder: string | null }) {
  const groups = DEPARTMENTS.map(d => ({
    d, folders: FOLDERS.filter(f => f.dept === d.key).map(f => ({ f, known: c.known.filter(k => k.folder === f.name) })).filter(x => x.known.length && (!folder || x.f.name === folder))
  })).filter(g => g.folders.length);
  return (
    <div className="ag-file">
      {folder && <p className="ag-made">Showing {folder}. <Link href={`/agent/c/${c.id}?tab=file`}>Show every folder</Link></p>}
      {groups.length === 0 && <p className="dash-empty">Nothing is on file here yet.</p>}
      {groups.map(g => (
        <section key={g.d.key} className="ag-sec">
          <h3 style={{ borderLeftColor: g.d.color }} className="ag-dept">{g.d.name}</h3>
          {g.folders.map(x => (
            <div key={x.f.name} className="ag-folder-box">
              <b>{x.f.name}</b>
              <ul>{x.known.map(k => <li key={k.id}>{k.text}</li>)}</ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function Waiting({ c, focus, onDraft }: { c: Client; focus: string | null; onDraft: (q: string) => void }) {
  const { change } = useAgent();
  const handle = (n: Need, what: string) => change(c.id, d => ({ ...d, handled: { ...d.handled, [n.id]: what } }));
  if (!c.needs.length) return <p className="dash-empty">Nothing waits for {c.name.split(' ')[0]}.</p>;
  return (
    <div className="ag-waiting">
      {c.mode === 'live' && <p className="ag-made">{LIVE_NOTE}</p>}
      {c.needs.map(n => (
        <div key={n.id} className={focus === n.id ? 'ag-focus' : undefined}>
          <NeedCard c={c} n={n} inline>
            {c.mode === 'demo' && <>
              {n.kind === 'decision' && <><button type="button" className="pt-btn ag-small" onClick={() => onDraft(`Quick question: ${n.title}`)}>Ask the client</button><button type="button" className="pt-btn ghost ag-small" onClick={() => handle(n, 'Left for the client')}>Leave it for the client</button></>}
              {n.kind === 'team' && <><button type="button" className="pt-btn ag-small" onClick={() => handle(n, 'Approved by you')}>Approve the proposal</button><button type="button" className="pt-btn ghost ag-small" onClick={() => handle(n, 'Declined by you')}>Decline the proposal</button></>}
              {n.kind === 'follow_up' && <button type="button" className="pt-btn ag-small" onClick={() => handle(n, 'Resolved by you')}>Resolve the follow up</button>}
              {(n.kind === 'carried' || n.kind === 'outcome') && <button type="button" className="pt-btn ag-small" onClick={() => onDraft(`${n.title.replace(/ (carried|open).*$/, '')}: when can it get done today?`)}>Propose a time</button>}
              {(n.kind === 'pushed' || n.kind === 'stuck') && <button type="button" className="pt-btn ag-small" onClick={() => onDraft('Want to start with one small step? I can break it down with you.')}>Offer a first step</button>}
              {n.kind === 'missing' && <button type="button" className="pt-btn ag-small" onClick={() => onDraft('What time do you usually wake up, and when do you go to sleep?')}>Ask about it</button>}
            </>}
          </NeedCard>
        </div>
      ))}
    </div>
  );
}
