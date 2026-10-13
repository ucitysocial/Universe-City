'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { prepareCheckIn } from '@/lib/agent/checkin';
import type { Client, Need } from '@/lib/agent/types';
import { DEPARTMENTS, FOLDERS } from '@/lib/domain/folders';
import { stamp, useAgent } from './AgentShell';

const KIND: Record<Need['kind'], string> = {
  carried: 'To schedule', pushed: 'Pushed twice or more', decision: 'Waits for the client', team: 'Waits for a person',
  follow_up: 'Follow up', outcome: 'No outcome yet', missing: 'Missing pieces', stuck: 'Hard to start'
};
const ACTION: Record<Need['action'], { label: string; tab: string }> = {
  schedule: { label: 'Propose a time', tab: 'chat' },
  check_in: { label: 'Prepare the check in', tab: 'checkin' },
  decision: { label: 'Review the decision', tab: 'overview' },
  follow_up: { label: 'Open the follow up', tab: 'overview' },
  guided: { label: 'Open Guided Life', tab: 'overview' },
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
//
// The founder set on October 13, 2026 that a client's page mirrors the Resident Portal. The center is the
// conversation with the client, with the agent's own notes beside it. The right side is the client's day, what waits,
// and their Guided Life. Their portal shows what the client sees.

type Mode = 'chat' | 'notes' | 'case' | 'checkin' | 'portal' | 'file' | 'overview';
const MODES: { key: Mode; label: string; narrow?: boolean }[] = [
  { key: 'chat', label: 'Conversation' },
  { key: 'notes', label: 'Think it through' },
  { key: 'case', label: 'Case file' },
  { key: 'checkin', label: 'Check in' },
  { key: 'portal', label: 'Their portal' },
  { key: 'file', label: 'File' },
  { key: 'overview', label: 'Today', narrow: true }
];

export function AgentClient({ id }: { id: string }) {
  const { view } = useAgent();
  const params = useSearchParams();
  const router = useRouter();
  const c = view(id);
  const asked = params.get('tab');
  const legacy: Record<string, Mode> = { conversation: 'chat', guided: 'overview', waiting: 'overview', schedule: 'overview' };
  const mode = (MODES.find(m => m.key === asked)?.key || (asked && legacy[asked]) || 'chat') as Mode;
  const go = (m: Mode) => router.replace(`/agent/c/${id}?tab=${m}`, { scroll: false });
  const [chatDraft, setChatDraft] = useState(params.get('q') || '');
  const [noteDraft, setNoteDraft] = useState('');
  if (!c) return <div className="fb-pane"><p className="fb-empty">No client with that name is in your list.</p></div>;
  const toChat = (t: string) => { setChatDraft(t); go('chat'); };
  const toNotes = (t: string) => { setNoteDraft(t); go('notes'); };
  const first = c.name.split(' ')[0];
  return (
    <div className="ag-work">
      <div className="ag-center">
        <div className="ag-strip">
          <div className="ag-seg ag-modes" role="tablist" aria-label="Views">
            {MODES.map(m => (
              <button key={m.key} type="button" className={[mode === m.key ? 'on' : '', m.narrow ? 'only-narrow' : ''].join(' ').trim() || undefined} onClick={() => go(m.key)} aria-current={mode === m.key ? 'page' : undefined}>
                {m.key === 'portal' ? `${first}'s portal` : m.label}
              </button>
            ))}
          </div>
          <span className="ag-strip-note">{c.mode === 'demo' ? 'Made up client. Nothing here reaches anyone.' : 'Your live File, read only.'}</span>
        </div>
        {mode === 'chat' && <Conversation c={c} draft={chatDraft} setDraft={setChatDraft} />}
        {mode === 'notes' && <AgentNotes c={c} draft={noteDraft} setDraft={setNoteDraft} onSend={toChat} />}
        {mode === 'case' && <div className="ag-scroll"><CaseFile c={c} /></div>}
        {mode === 'checkin' && <div className="ag-scroll"><CheckIn c={c} onUse={toChat} /></div>}
        {mode === 'portal' && <div className="ag-scroll"><TheirPortal c={c} /></div>}
        {mode === 'file' && <div className="ag-scroll"><FileView c={c} folder={params.get('folder')} /></div>}
        {mode === 'overview' && <div className="ag-scroll"><Overview c={c} onChat={toChat} onNote={toNotes} /></div>}
      </div>
      <aside className="ag-right" aria-label={`${first} today`}>
        <Overview c={c} onChat={toChat} onNote={toNotes} />
      </aside>
    </div>
  );
}

/** The right side: the client's day, what waits, and Guided Life. Each entry can start a message or a note. */
function Overview({ c, onChat, onNote }: { c: Client; onChat: (t: string) => void; onNote: (t: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const d = c.days[n];
  const first = c.name.split(' ')[0];
  const nowMin = (() => {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: c.zone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      return Number(p.find(x => x.type === 'hour')?.value) * 60 + Number(p.find(x => x.type === 'minute')?.value);
    } catch { return -1; }
  })();
  return (
    <div className="ag-over">
      <div className="sday-top">
        <h2>{d ? dayName(d.date, c.today) : 'Today'}</h2>
        <span className="cal-seg sday-move">
          <button type="button" onClick={() => setN(n - 1)} disabled={n === 0} aria-label="The day before">&#8249;</button>
          <button type="button" onClick={() => setN(0)} disabled={n === 0}>Today</button>
          <button type="button" onClick={() => setN(n + 1)} disabled={n >= c.days.length - 1} aria-label="The day after">&#8250;</button>
        </span>
      </div>
      {d && d.items.length === 0 && <p className="dash-empty">Nothing is on file for this day.</p>}
      {d && d.items.length > 0 && (
        <div className="ents sday-list">
          {d.items.map(i => {
            const live = d.date === c.today && i.start !== null && nowMin >= i.start && nowMin < (i.end ?? i.start + 60);
            const when = i.start === null ? 'No time' : `${clock(i.start)}${i.end !== null ? ` to ${clock(i.end)}` : ''}`;
            return (
              <div key={i.id} className={`ent sday-row ag-entry${live ? ' is-now' : ''}`} style={{ '--fc': deptColor(i.dept) } as CSSProperties}>
                <span className="fi i-page" />
                <button type="button" className="sday-open" onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id}>
                  {live && <span className="day-flag">Now</span>}
                  <b>{i.label}</b>
                  <span className="sub sday-time">{when}</span>
                  <span className="sub ag-folder-line">{i.folder}</span>
                </button>
                {open === i.id && (
                  <div className="ag-entry-acts">
                    <button type="button" className="pt-btn ag-small" onClick={() => onChat(`About ${i.label.toLowerCase()} ${i.start === null ? '' : `at ${clock(i.start)} `}${dayName(d.date, c.today) === 'Today' ? 'today' : `on ${dayName(d.date, c.today)}`}: `)}>Suggest a change to {first}</button>
                    <button type="button" className="pt-btn ghost ag-small" onClick={() => onNote(`${i.label}, ${when}: `)}>Add a note about it</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {c.tasks.length > 0 && (
        <section className="ag-sec ag-over-sec">
          <h3>Guided Life</h3>
          {c.tasks.map(t => {
            const done = t.steps.filter(s => s.done).length;
            const cur = t.steps[t.current];
            return (
              <div key={t.id} className="ag-mini-task">
                <b>{t.label}</b>
                <div className="ag-prog" role="img" aria-label={`${done} of ${t.steps.length} steps done`}>{t.steps.map((s, k) => <i key={k} className={s.done ? 'on' : k === t.current ? 'cur' : undefined} />)}</div>
                <span className="ag-made">{cur ? `Now on: ${cur.label}` : 'All steps done'}</span>
                {cur && <button type="button" className="pt-btn ghost ag-small" onClick={() => onChat(`Next small step: ${cur.label.toLowerCase()}. Want to start it now?`)}>Suggest the next step</button>}
              </div>
            );
          })}
        </section>
      )}
      <section className="ag-sec ag-over-sec">
        <h3>Waiting {c.needs.length ? <em>{c.needs.length}</em> : null}</h3>
        {c.needs.length === 0 && <p className="dash-empty">Nothing waits for {first}.</p>}
        <Waiting c={c} focus={null} onDraft={onChat} />
      </section>
    </div>
  );
}

function Conversation({ c, draft, setDraft }: { c: Client; draft: string; setDraft: (t: string) => void }) {
  const { change } = useAgent();
  const [said, setSaid] = useState<string | null>(null);
  const first = c.name.split(' ')[0];
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [c.messages.length]);
  function send() {
    const body = draft.trim();
    if (!body || c.mode !== 'demo') return;
    change(c.id, d => ({ ...d, sent: [...d.sent, { id: `sent-${Date.now()}`, speaker: 'agent', body, at: stamp() }] }));
    setDraft('');
    setSaid('Shown in the demo conversation. Nothing was sent to anyone.');
  }
  return (
    <div className="ag-chat">
      <div className="ag-msgs">
        {c.messages.length === 0 && <p className="dash-empty">No message is on file.</p>}
        {c.messages.map(m => (
          <div key={m.id} className={`ag-msg ${m.speaker === 'client' ? 'client' : m.speaker === 'agent' ? 'you' : 'soft'}`}>
            <span className="ag-who">{m.speaker === 'client' ? first : m.speaker === 'agent' ? 'You, agent' : 'Agent software'} <em>{m.at}</em></span>
            <p>{m.body}</p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="ag-composer" onSubmit={e => { e.preventDefault(); send(); }}>
        <label htmlFor="ag-chat-box" className="vh">Your message to {first}</label>
        <textarea id="ag-chat-box" rows={2} value={draft} onChange={e => setDraft(e.target.value)} placeholder={c.mode === 'live' ? 'Your live File is read only here' : `Write to ${first}`}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
        <button type="submit" className="pt-btn" disabled={c.mode !== 'demo' || !draft.trim()}>Send the message</button>
      </form>
      {said && <p className="pop-ok ag-said" role="status">{said}</p>}
      {c.mode === 'live' && <p className="ag-made ag-said">{LIVE_NOTE}</p>}
    </div>
  );
}

/** The agent's own thread about one client. The client never sees it. */
function AgentNotes({ c, draft, setDraft, onSend }: { c: Client; draft: string; setDraft: (t: string) => void; onSend: (t: string) => void }) {
  const { demo, change, addNote, addCase, agentName } = useAgent();
  const d = demo(c.id);
  const [kind, setKind] = useState<'note' | 'client_said'>('note');
  const [thinking, setThinking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filed, setFiled] = useState<Set<string>>(new Set());
  async function ask(thread: { who: 'agent' | 'copilot'; text: string }[]) {
    setThinking(true); setErr(null);
    try {
      const res = await fetch('/api/agent/copilot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ client: c.id, thread }) });
      const x = await res.json().catch(() => ({}));
      if (!res.ok) setErr(x.error || 'The copilot did not answer.');
      else addNote(c.id, { id: `cp-${Date.now()}`, kind: 'copilot', text: x.reply, message: x.message, caseNotes: x.caseNotes, at: stamp(), by: 'Copilot' });
    } catch { setErr('The copilot did not answer, because the server did not answer.'); }
    setThinking(false);
  }
  const [folder, setFolder] = useState('Time');
  const first = c.name.split(' ')[0];
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [d.notes.length]);
  function save() {
    const body = draft.trim();
    if (!body) return;
    const id = `n-${Date.now()}`;
    addNote(c.id, { id, kind, text: body, at: stamp(), by: agentName });
    if (kind === 'note') {
      const thread = [...d.notes.filter(n => n.kind !== 'client_said').map(n => ({ who: (n.kind === 'copilot' ? 'copilot' : 'agent') as 'agent' | 'copilot', text: n.text })), { who: 'agent' as const, text: body }];
      void ask(thread);
    }
    if (kind === 'client_said' && c.mode === 'demo') {
      change(c.id, x => ({ ...x, proposals: [{ id: `p-${id}`, folder, text: body, from: `${first} said it to you. You typed it.`, state: 'open' }, ...x.proposals] }));
    }
    setDraft('');
  }
  const open = d.proposals.filter(p => p.state === 'open');
  return (
    <div className="ag-chat notes">
      <div className="ag-msgs">
        <p className="ag-private">Think it through with the copilot. Only agents see this thread. {first} never sees it, and nothing here is sent or filed until you choose. Notes are kept in this browser for now.</p>
        {d.notes.length === 0 && <p className="dash-empty">Write what you notice and how you could support {first} today. The copilot reads {first}&apos;s File, answers, and drafts a message you can refine.</p>}
        {d.notes.map(n => n.kind === 'copilot' ? (
          <div key={n.id} className="ag-msg copilot">
            <span className="ag-who">Copilot <em>{n.at}</em></span>
            <p>{n.text}</p>
            {n.message && (
              <div className="ag-draft">
                <span className="ag-kind">A message you could send {first}</span>
                <p>{n.message}</p>
                <button type="button" className="pt-btn ag-small" onClick={() => onSend(n.message!)}>Put it in the conversation to refine</button>
              </div>
            )}
            {(n.caseNotes || []).map((t, k) => {
              const key = `${n.id}:${k}`;
              return (
                <div key={key} className="ag-casenote">
                  <span>{t}</span>
                  <button type="button" className="ag-link" disabled={filed.has(key)} onClick={() => { addCase(c.id, { id: `cf-${Date.now()}-${k}`, text: t, at: stamp(), by: agentName }); setFiled(f => new Set(f).add(key)); }}>{filed.has(key) ? 'In the case file' : 'Add to the case file'}</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div key={n.id} className={`ag-msg note ${n.kind === 'client_said' ? 'heard' : ''}`}>
            <span className="ag-who">{n.kind === 'client_said' ? `${first} said, typed by ${n.by || 'you'}` : n.by || 'You'} <em>{n.at}</em></span>
            <p>{n.text}</p>
            {n.kind === 'note' && <button type="button" className="ag-link" onClick={() => { addCase(c.id, { id: `cf-${Date.now()}`, text: n.text, at: stamp(), by: agentName }); }}>Add to the case file</button>}
          </div>
        ))}
        {thinking && <p className="ag-made">The copilot is reading {first}&apos;s File and your note.</p>}
        {err && <p className="pt-err" role="status">{err}</p>}
        {open.map(p => (
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
        <div ref={end} />
      </div>
      <form className="ag-composer col" onSubmit={e => { e.preventDefault(); save(); }}>
        <div className="ag-seg small" role="radiogroup" aria-label="What this is">
          <button type="button" className={kind === 'note' ? 'on' : undefined} onClick={() => setKind('note')}>Your thought</button>
          <button type="button" className={kind === 'client_said' ? 'on' : undefined} onClick={() => setKind('client_said')} disabled={c.mode !== 'demo'}>What {first} said</button>
          {kind === 'client_said' && <select value={folder} onChange={e => setFolder(e.target.value)} aria-label="It belongs in">{FOLDERS.map(f => <option key={f.name}>{f.name}</option>)}</select>}
        </div>
        <div className="ag-composer-row">
          <label htmlFor="ag-note-box" className="vh">Your note about {first}</label>
          <textarea id="ag-note-box" rows={2} value={draft} onChange={e => setDraft(e.target.value)} placeholder={kind === 'note' ? `What you notice, and how you can support ${first} today` : `What ${first} told you, in ${first}'s words`}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); save(); } }} />
          <button type="submit" className="pt-btn" disabled={!draft.trim()}>{kind === 'note' ? 'Save the note' : 'Prepare the File update'}</button>
        </div>
      </form>
    </div>
  );
}

/** What the client sees in the Resident Portal: their day, the pieces Time still needs, what waits, and their File. */
function TheirPortal({ c }: { c: Client }) {
  const first = c.name.split(' ')[0];
  const d = c.days.find(x => x.date === c.today);
  return (
    <div className="ag-portal">
      <p className="ag-made">A view of {first}&apos;s Resident Portal, as {first} sees it today. You cannot change anything from here.</p>
      <div className="ag-portal-frame">
        <div className="ag-portal-bar"><span>universe&#9733;city</span><span>{first}&apos;s overview</span></div>
        <section className="ag-sec">
          <h3>Today</h3>
          <div className="ents">
            {c.missing.includes('Sleep and wake times') && <div className="ent ghost"><span className="ghost-plus">+</span><b>Wake up</b><span className="sub">Not on file yet</span></div>}
            {(d?.items || []).map(i => (
              <div key={i.id} className="ent" style={{ '--fc': deptColor(i.dept) } as CSSProperties}>
                <span className="fi i-page" /><b>{i.label}</b>
                <span className="sub sday-time">{i.start === null ? 'No time' : `${clock(i.start)}${i.end !== null ? ` to ${clock(i.end)}` : ''}`}</span>
              </div>
            ))}
            {c.missing.filter(m => m !== 'Sleep and wake times').map(m => <div key={m} className="ent ghost"><span className="ghost-plus">+</span><b>{m}</b><span className="sub">Not on file yet</span></div>)}
            {c.missing.includes('Sleep and wake times') && <div className="ent ghost"><span className="ghost-plus">+</span><b>Bedtime</b><span className="sub">Not on file yet</span></div>}
          </div>
        </section>
        <section className="ag-sec">
          <h3>Waiting for {first}</h3>
          {c.needs.filter(n => n.kind === 'decision' || n.kind === 'carried').length === 0 && <p className="dash-empty">Nothing waits.</p>}
          <ul>{c.needs.filter(n => n.kind === 'decision' || n.kind === 'carried').map(n => <li key={n.id}><span>{n.title}</span></li>)}</ul>
        </section>
        <section className="ag-sec">
          <h3>My File</h3>
          <ul>
            {DEPARTMENTS.map(dep => {
              const k = c.known.filter(x => FOLDERS.find(f => f.name === x.folder)?.dept === dep.key).length;
              return <li key={dep.key}><span><i className="dot" style={{ background: dep.color }} /> {dep.name}</span><em>{k} on file</em></li>;
            })}
          </ul>
        </section>
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


/** The agent's case file on one client: the agent's plans and observations. Never the client's own statements. */
function CaseFile({ c }: { c: Client }) {
  const { demo, addCase, agentName } = useAgent();
  const [text, setText] = useState('');
  const list = demo(c.id).caseFile;
  return (
    <div className="ag-case">
      <p className="ag-made">Your case file on {c.name.split(' ')[0]}: your plans, what you noticed, and what to follow up on. It is the agent side. The client does not see it. Kept in this browser for now.</p>
      <form className="ag-composer" onSubmit={e => { e.preventDefault(); const t = text.trim(); if (t) { addCase(c.id, { id: `cf-${Date.now()}`, text: t, at: stamp(), by: agentName }); setText(''); } }}>
        <label htmlFor="ag-case-box" className="vh">A case file entry</label>
        <textarea id="ag-case-box" rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="A plan, an observation, or a follow up" />
        <button type="submit" className="pt-btn" disabled={!text.trim()}>Add the entry</button>
      </form>
      {list.length === 0 && <p className="dash-empty">The case file is empty.</p>}
      <ul className="ag-notelist">
        {[...list].reverse().map(x => <li key={x.id}><p>{x.text}</p><em>{x.by}, {x.at}</em></li>)}
      </ul>
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
