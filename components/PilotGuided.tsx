'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DRAFT_KEY } from '@/components/PilotAsk';
import PilotGlyph from '@/components/PilotGlyph';
import PilotGuidedSteps from '@/components/PilotGuidedSteps';
import { pickNow, type NowItem, type NowPick } from '@/lib/pilot/now';
import { flatSteps, joinPlan, type DemoPlan } from '@/lib/pilot/guided-demo';
import { markRemote, runRemote, saveRemote, stepByLabel, takeLegacy } from '@/lib/pilot/steps-client';
import { TIME_PATH } from '@/lib/pilot/paths';
import { localNow, sayClock } from '@/lib/pilot/time';

type Level = 'quiet' | 'steps' | 'guided';
type View = 'session' | 'steps' | 'talk';
// marks: the time each step was reported done, by its name. subs: which smaller steps inside a step are checked.
type State = { i: number; done: boolean; paused: boolean; level: Level; outcome: 'yes' | 'not_yet' | null; marks: Record<string, string>; subs: Record<string, boolean[]> };
const START: State = { i: 0, done: false, paused: false, level: 'guided', outcome: null, marks: {}, subs: {} };
export const ACTIVE_KEY = 'uc:gl:active';
export type Active = { key: string; href: string; label: string; step: string; i: number; n: number; paused: boolean };
/** An entry of today, so the session can say when a different entry is the one happening now. */
export type TodayItem = NowItem & { label: string; time: string; go: string };
const NONE: TodayItem[] = [];

const read = (k: string): State => {
  try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ? { ...START, ...v } : START; } catch { return START; }
};

/**
 * Guided Life for one entry. The center of the frame shows one step at a time, with Done, Pause, and a way back one
 * step. The tabs show every step, and the conversation with the agent. The steps and each check, with its time, are
 * kept in the File, so every screen and the agent see the same. The place in the session and the pause are kept in
 * this browser. Leaving the page shows a bar at the top of the frame that leads back.
 */
export default function PilotGuided({ sessionKey, planKey, href, label, when, date, end, zone, plan: base, entryId, weekly = false, today = NONE }:
  { sessionKey: string; planKey?: string; href: string; label: string; when: string; date: string; end: number | null; zone: string; plan: DemoPlan; entryId: string; weekly?: boolean; today?: TodayItem[] }) {
  const router = useRouter();
  const [plan, setPlanState] = useState<DemoPlan>(base);
  const steps = flatSteps(plan);
  const n = steps.length;
  const [st, setSt] = useState<State>(START);
  const [view, setView] = useState<View>('session');
  const [loaded, setLoaded] = useState(false);
  const [aloud, setAloud] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [pick, setPick] = useState<NowPick>(null);
  const big = useRef<HTMLHeadingElement>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  // When the resident started this run today. Opening the page starts nothing. The press on Start does.
  const [startedAt, setStartedAt] = useState<string | null>(base.run?.startedAt ?? null);
  const entry = { id: entryId, weekly };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<DemoPlan>(base);
  latest.current = plan;

  // The steps and the checks of the day come from the File. Steps kept on this device before the File held steps are
  // saved to the File once. The place in the session, the pause, and the level stay on this device.
  useEffect(() => {
    const local = read(sessionKey);
    const marks = { ...local.marks, ...(base.marks || {}) };
    const subs = { ...local.subs, ...(base.subs || {}) };
    const list = flatSteps(base);
    const first = list.findIndex(z => !marks[z.label]);
    const i = Object.keys(base.marks || {}).length ? (first < 0 ? list.length : Math.max(first, Math.min(local.i, list.length))) : local.i;
    setSt({ ...local, marks, subs, i, done: list.length > 0 && (local.done || first < 0 && Object.keys(base.marks || {}).length > 0) });
    const legacy = base.listId ? null : takeLegacy(planKey || `${sessionKey}:plan`);
    if (legacy) {
      const joined = joinPlan(legacy, base);
      setPlanState(joined);
      saveRemote(entry, date, joined).then(p => setPlanState(p)).catch(e => setSaveErr(String(e.message || e)));
    }
    setLoaded(true);
  }, [sessionKey, planKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // A plan read back from the File, with a row for each step. A step with no row yet is saved first.
  async function withRows(): Promise<DemoPlan> {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const p = latest.current;
    if (p.listId && flatSteps(p).every(z => z.id && (!z.sub || z.subIds?.length === z.sub.length))) return p;
    const saved = await saveRemote(entry, date, p);
    setPlanState(saved);
    return saved;
  }
  async function check(label: string, done: boolean, subIndex?: number, next?: string) {
    try {
      const p = await withRows();
      const step = stepByLabel(p, label);
      const id = subIndex === undefined ? step?.id : step?.subIds?.[subIndex];
      if (id) await markRemote(entry, date, id, done);
      // The next step starts the moment this one is done.
      const nid = next ? stepByLabel(p, next)?.id : undefined;
      if (nid) await runRemote(entry, date, 'begin', { step: nid });
      setSaveErr(null);
    } catch (e: any) { setSaveErr(String(e?.message || e)); }
  }
  async function begin() {
    const at = new Date().toISOString();
    setStartedAt(at);
    try {
      const p = await withRows();
      await runRemote(entry, date, 'start');
      const first = flatSteps(p).find(z => !st.marks[z.label]);
      if (first?.id) await runRemote(entry, date, 'begin', { step: first.id });
      setSaveErr(null);
    } catch (e: any) { setSaveErr(String(e?.message || e)); }
  }
  const finish = (outcome: 'done' | 'not_yet') => { runRemote(entry, date, 'end', { outcome }).catch(e => setSaveErr(String(e.message || e))); };
  const clockAt = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone });
  useEffect(() => {
    const tick = () => {
      const l = localNow(zone);
      setNow(l.date === date ? l.minutes : null);
      setPick(l.date === date ? pickNow(today, l.minutes) : null);
    };
    tick();
    const t = setInterval(tick, 20_000);
    return () => clearInterval(t);
  }, [zone, date, today]);

  // Each change is kept, and the bar at the top of the frame is told where the session stands.
  function save(next: State) {
    setSt(next);
    try {
      localStorage.setItem(sessionKey, JSON.stringify(next));
      if (next.outcome) localStorage.removeItem(ACTIVE_KEY);
      else {
        const a: Active = { key: sessionKey, href, label, step: next.done || !steps[next.i] ? 'Every step done' : steps[next.i].label, i: next.i, n, paused: next.paused };
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
      }
    } catch { /* kept until the page reloads */ }
    window.dispatchEvent(new Event('uc:gl'));
  }
  useEffect(() => { if (loaded && !st.outcome) save(st); }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // With Read out loud on, the step and its words are read out when the step changes.
  useEffect(() => {
    if (!aloud || !loaded || st.done || st.paused || typeof speechSynthesis === 'undefined') return;
    const x = steps[st.i];
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(st.level === 'guided' && x.cue ? x.cue : x.label));
  }, [st.i, st.paused, aloud, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); }, []);

  // A change to the steps is kept in this browser. The current step stays the same step when it moves.
  function editPlan(next: DemoPlan) {
    const was = steps[st.i]?.label;
    const list = flatSteps(next);
    setPlanState(next);
    // The change is saved to the File a moment after the last key press.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      saveRemote(entry, date, latest.current).then(p => { setPlanState(p); setSaveErr(null); }).catch(e => setSaveErr(String(e.message || e)));
    }, 700);
    // Before the first step is done, the session starts from the first step. After that, the current step stays.
    const started = Object.keys(st.marks).length > 0;
    const at = !started ? 0 : was ? list.findIndex(z => z.label === was) : -1;
    const i = at >= 0 ? at : Math.max(0, Math.min(st.i, list.length - 1));
    save({ ...st, i, done: list.length > 0 && st.done && i >= list.length });
  }
  // The entry happening now, when it is a different entry from this one.
  const elsewhere = pick && pick.live ? today.find(t => t.key === pick.key && t.key.split(':')[0] !== entryId) ?? null : null;

  const doneStep = () => {
    if (st.paused) return save({ ...st, paused: false });
    const marks = steps[st.i] ? { ...st.marks, [steps[st.i].label]: new Date().toISOString() } : st.marks;
    if (steps[st.i]) void check(steps[st.i].label, true, undefined, steps[st.i + 1]?.label);
    if (st.i >= n - 1) return save({ ...st, marks, i: n, done: true });
    save({ ...st, marks, i: st.i + 1 });
    big.current?.focus();
  };
  const toAgent = (text: string) => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, place: `Guided Life, ${label}, ${st.done ? 'every step done' : `step ${st.i + 1} of ${n}: ${steps[st.i].label}`}` })); } catch { /* the box opens empty */ }
    router.push('/portal/home');
  };

  const x = steps[Math.min(st.i, n - 1)] ?? { label: 'No steps', cue: '', group: null };
  const left = end !== null && now !== null ? end - now : null;
  const status = st.outcome ? 'Finished' : st.done ? 'Every step done' : st.paused ? 'Paused' : 'In progress';

  return (
    <div className="gl">
      <div className="gl-top">
        <span className="gl-cap">Guided Life</span>
        <span className={`gl-chip ${st.paused ? 'p' : st.done ? 'd' : ''}`}>{status}</span>
      </div>
      <div className="gl-head">
        <div>
          <h1>{label}</h1>
          <p>{when}{startedAt ? `. Started ${clockAt(startedAt)}` : ''}</p>
        </div>
        <button type="button" className="gl-ghost" onClick={() => { save(START); setView('session'); }}>Start over</button>
      </div>

      {elsewhere && (
        <a href={elsewhere.go} className="gl-other">
          <PilotGlyph name="star" size={24} />
          <span><b>Now: {elsewhere.label}</b> {elsewhere.time}</span>
          <em>Go to it</em>
        </a>
      )}

      {saveErr && <p className="pt-err">{saveErr}</p>}

      <div className="gl-tabs" role="tablist" aria-label="Guided Life">
        {([['session', 'Guided Life'], ['steps', 'Steps'], ['talk', 'Conversation']] as [View, string][]).map(([v, t]) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? 'on' : undefined} onClick={() => setView(v)}>{t}</button>
        ))}
      </div>

      {view === 'session' && (
        <div className="gl-panel">
          <div className="gl-nums">
            <div><span className="gl-cap">{left !== null && left >= 0 ? 'Time left' : 'Planned'}</span><b>{left !== null && left >= 0 ? `${left} min` : end !== null ? `Until ${sayClock(end)}` : 'No end time'}</b></div>
            <div className="r"><span className="gl-cap">Steps</span><b>{Math.min(st.i, n)} of {n}</b></div>
          </div>
          <div className="gl-bar" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={Math.min(st.i, n)} aria-label="Steps done">
            <i style={{ width: `${(100 * Math.min(st.i, n)) / n}%` }} />
          </div>

          {n === 0 && (
            <div className="gl-end">
              <PilotGlyph name="clipboard" size={52} className="gl-end-g" />
              <h2>No steps yet</h2>
              <p>Your agent suggested steps. Add the ones you do.</p>
              <div className="gl-row c"><button type="button" className="gl-done" onClick={() => setView('steps')}>Open the steps</button></div>
            </div>
          )}
          {n > 0 && !st.done && !startedAt && Object.keys(st.marks).length === 0 && (
            <div className="gl-end">
              <PilotGlyph name="clock" size={52} className="gl-end-g" />
              <h2>{n === 1 ? 'One step' : `${n} steps`}</h2>
              <p>First: {steps[0].label}</p>
              <div className="gl-row c"><button type="button" className="gl-done" onClick={() => void begin()}>Start {label.toLowerCase()}</button></div>
            </div>
          )}
          {n > 0 && !st.done && (startedAt || Object.keys(st.marks).length > 0) && (
            <>
              <div className="gl-now">
                <span className="gl-cap">{st.paused ? 'Paused' : `${x.group ? `${x.group}, step` : 'Step'} ${st.i + 1} of ${n}`}</span>
                <h2 ref={big} tabIndex={-1}>{x.label}</h2>
                {st.paused
                  ? <p>Your place is kept.</p>
                  : st.level !== 'quiet' && <p>{st.i + 1 < n ? `Next: ${steps[st.i + 1].label}` : 'This is the last step'}</p>}
              </div>
              {x.sub && x.sub.length > 0 && !st.paused && (
                <ul className="gl-sub">
                  {x.sub.map((t, k) => {
                    const on = !!st.subs[x.label]?.[k];
                    return (
                      <li key={t}>
                        <label className={on ? 'on' : undefined}>
                          <input type="checkbox" checked={on} onChange={() => {
                            const cur = [...(st.subs[x.label] ?? x.sub!.map(() => false))];
                            cur[k] = !cur[k];
                            save({ ...st, subs: { ...st.subs, [x.label]: cur } });
                            void check(x.label, cur[k], k);
                          }} />
                          {t}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {st.level === 'guided' && !st.paused && x.cue && (
                <div className="gl-cue"><i aria-hidden="true">&#9733;</i><p>{x.cue}</p></div>
              )}
              <div className="gl-acts">
                <button type="button" className="gl-done" onClick={doneStep}>{st.paused ? 'Keep going' : 'Done'}</button>
                <button type="button" className="gl-pause" onClick={() => save({ ...st, paused: !st.paused })} aria-label={st.paused ? 'Keep going' : 'Pause'}>
                  {st.paused
                    ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5l9 5.5-9 5.5z" /></svg>
                    : <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" /></svg>}
                </button>
              </div>
              <div className="gl-row">
                <button type="button" className="gl-ghost" disabled={st.i === 0} onClick={() => save({ ...st, i: Math.max(0, st.i - 1), paused: false })}>Back one step</button>
                <button type="button" className="gl-ghost" onClick={() => setView('talk')}>Ask your agent</button>
              </div>
            </>
          )}

          {n > 0 && st.done && !st.outcome && (
            <div className="gl-end">
              <PilotGlyph name={/leave/i.test(plan.finish) ? 'door' : 'check'} size={52} className="gl-end-g" />
              <h2>That is every step</h2>
              <p>{plan.finish}</p>
              <div className="gl-row c">
                <button type="button" className="gl-done" onClick={() => { save({ ...st, outcome: 'yes' }); finish('done'); }}>Yes</button>
                <button type="button" className="gl-pause wide" onClick={() => { save({ ...st, outcome: 'not_yet' }); finish('not_yet'); setMsg(`I did every step of ${label.toLowerCase()}. ${plan.finish} Not yet.`); setView('talk'); }}>Not yet</button>
              </div>
            </div>
          )}
          {st.outcome && (
            <div className="gl-end">
              <PilotGlyph name={st.outcome === 'yes' ? 'check' : 'speech'} size={52} className="gl-end-g" />
              <h2>{st.outcome === 'yes' ? `${label} is done` : 'Your agent can help with the rest'}</h2>
              <p>In the full version this answer goes in your File. In this demo nothing was filed.</p>
              <div className="gl-row c"><Link href={TIME_PATH} className="gl-done">Open your schedule</Link></div>
            </div>
          )}
        </div>
      )}

      {view === 'steps' && (
        <div className="gl-list">
          <PilotGuidedSteps plan={plan} current={st.done ? n : st.i} marks={st.marks} zone={zone} onEdit={editPlan}
            onJump={idx => { save({ ...st, i: idx, done: false, outcome: null, paused: false }); setView('session'); }} />
          <button type="button" className="gl-pause wide" onClick={() => setView('session')}>Go to the current step</button>
        </div>
      )}

      {view === 'talk' && (
        <div className="gl-talk">
          <div className="gl-ctx"><span className="gl-cap">You are on</span><p>{label}, {st.done ? 'every step done' : x.label.toLowerCase()}</p></div>
          <p className="gl-note">This goes to your conversation. Your agent sees which step you are on.</p>
          <label className="vh" htmlFor="gl-msg">Your message to the agent</label>
          <textarea id="gl-msg" rows={3} value={msg} placeholder="I am running late. Which step can wait?" onChange={e => { setMsg(e.target.value); setErr(false); }} />
          {err && <p className="pt-err">Write a message first.</p>}
          <div className="gl-row">
            <button type="button" className="gl-ghost" onClick={() => setView('session')}>Go to the current step</button>
            <button type="button" className="gl-done" onClick={() => { if (!msg.trim()) { setErr(true); return; } toAgent(msg.trim()); }}>Send to your agent</button>
          </div>
        </div>
      )}

      {view === 'session' && !st.done && (
        <div className="gl-level">
          <span>Your agent</span>
          <div className="gl-tabs small" role="radiogroup" aria-label="How much the agent says">
            {([['quiet', 'Quiet'], ['steps', 'Steps only'], ['guided', 'Talks me through']] as [Level, string][]).map(([v, t]) => (
              <button key={v} type="button" role="radio" aria-checked={st.level === v} className={st.level === v ? 'on' : undefined} onClick={() => save({ ...st, level: v })}>{t}</button>
            ))}
          </div>
          <label className="gl-aloud"><input type="checkbox" checked={aloud} onChange={e => setAloud(e.target.checked)} /> Read the steps out loud</label>
        </div>
      )}
    </div>
  );
}
