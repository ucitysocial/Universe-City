'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DRAFT_KEY } from '@/components/PilotAsk';
import { flatSteps, type DemoPlan } from '@/lib/pilot/guided-demo';
import { TIME_PATH } from '@/lib/pilot/paths';
import { localNow, sayClock } from '@/lib/pilot/time';

type Level = 'quiet' | 'steps' | 'guided';
type View = 'session' | 'steps' | 'talk';
type State = { i: number; done: boolean; paused: boolean; level: Level; outcome: 'yes' | 'not_yet' | null };
const START: State = { i: 0, done: false, paused: false, level: 'guided', outcome: null };
export const ACTIVE_KEY = 'uc:gl:active';
export type Active = { key: string; href: string; label: string; step: string; i: number; n: number; paused: boolean };

const read = (k: string): State => {
  try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ? { ...START, ...v } : START; } catch { return START; }
};

/**
 * Guided Life for one entry. The center of the frame shows one step at a time, with Done, Pause, and a way back one
 * step. The tabs show every step, and the conversation with the agent. The place in the steps is kept in this browser,
 * so it is the same after the page changes. Leaving the page shows a bar at the top of the frame that leads back.
 * The founder set it on October 13, 2026, as a demo: nothing pressed here is filed.
 */
export default function PilotGuided({ sessionKey, href, label, when, date, end, zone, plan }:
  { sessionKey: string; href: string; label: string; when: string; date: string; end: number | null; zone: string; plan: DemoPlan }) {
  const router = useRouter();
  const steps = flatSteps(plan);
  const n = steps.length;
  const [st, setSt] = useState<State>(START);
  const [view, setView] = useState<View>('session');
  const [loaded, setLoaded] = useState(false);
  const [aloud, setAloud] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const big = useRef<HTMLHeadingElement>(null);

  useEffect(() => { setSt(read(sessionKey)); setLoaded(true); }, [sessionKey]);
  useEffect(() => {
    const tick = () => { const l = localNow(zone); setNow(l.date === date ? l.minutes : null); };
    tick();
    const t = setInterval(tick, 20_000);
    return () => clearInterval(t);
  }, [zone, date]);

  // Each change is kept, and the bar at the top of the frame is told where the session stands.
  function save(next: State) {
    setSt(next);
    try {
      localStorage.setItem(sessionKey, JSON.stringify(next));
      if (next.outcome) localStorage.removeItem(ACTIVE_KEY);
      else {
        const a: Active = { key: sessionKey, href, label, step: next.done ? 'Every step done' : steps[next.i].label, i: next.i, n, paused: next.paused };
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

  const doneStep = () => {
    if (st.paused) return save({ ...st, paused: false });
    if (st.i >= n - 1) return save({ ...st, i: n, done: true });
    save({ ...st, i: st.i + 1 });
    big.current?.focus();
  };
  const toAgent = (text: string) => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, place: `Guided Life, ${label}, ${st.done ? 'every step done' : `step ${st.i + 1} of ${n}: ${steps[st.i].label}`}` })); } catch { /* the box opens empty */ }
    router.push('/portal/home');
  };

  const x = steps[Math.min(st.i, n - 1)];
  const left = end !== null && now !== null ? end - now : null;
  const status = st.outcome ? 'Finished' : st.done ? 'Every step done' : st.paused ? 'Paused' : 'In progress';

  return (
    <div className="gl">
      <div className="gl-top">
        <span className="gl-cap">Guided Life</span>
        <span className={`gl-chip ${st.paused ? 'p' : st.done ? 'd' : ''}`}>{status}</span>
        <span className="gl-chip demo">Demo</span>
      </div>
      <div className="gl-head">
        <div>
          <h1>{label}</h1>
          <p>{when}</p>
        </div>
        <button type="button" className="gl-ghost" onClick={() => { save(START); setView('session'); }}>Start over</button>
      </div>

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

          {!st.done && (
            <>
              <div className="gl-now">
                <span className="gl-cap">{st.paused ? 'Paused' : `${x.group ? `${x.group}, step` : 'Step'} ${st.i + 1} of ${n}`}</span>
                <h2 ref={big} tabIndex={-1}>{x.label}</h2>
                {st.paused
                  ? <p>Your place is kept.</p>
                  : st.level !== 'quiet' && <p>{st.i + 1 < n ? `Next: ${steps[st.i + 1].label}` : 'This is the last step'}</p>}
              </div>
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

          {st.done && !st.outcome && (
            <div className="gl-end">
              <h2>That is every step</h2>
              <p>{plan.finish}</p>
              <div className="gl-row c">
                <button type="button" className="gl-done" onClick={() => save({ ...st, outcome: 'yes' })}>Yes</button>
                <button type="button" className="gl-pause wide" onClick={() => { save({ ...st, outcome: 'not_yet' }); setMsg(`I did every step of ${label.toLowerCase()}. ${plan.finish} Not yet.`); setView('talk'); }}>Not yet</button>
              </div>
            </div>
          )}
          {st.outcome && (
            <div className="gl-end">
              <h2>{st.outcome === 'yes' ? `${label} is done` : 'Your agent can help with the rest'}</h2>
              <p>In the full version this answer goes in your File. In this demo nothing was filed.</p>
              <div className="gl-row c"><Link href={TIME_PATH} className="gl-done">Open your schedule</Link></div>
            </div>
          )}
        </div>
      )}

      {view === 'steps' && (
        <div className="gl-list">
          {plan.groups.map((g, gi) => {
            const before = plan.groups.slice(0, gi).reduce((m, h) => m + h.steps.length, 0);
            return (
              <div key={gi}>
                {g.name && <p className="gl-cap gl-grp">{g.name}</p>}
                {g.steps.map((s, k) => {
                  const idx = before + k;
                  const state = idx < st.i ? 'Done' : idx === st.i && !st.done ? 'Now' : 'Coming up';
                  return (
                    <button key={s.label} type="button" className={`gl-step ${state === 'Now' ? 'on' : ''} ${state === 'Done' ? 'did' : ''}`}
                      onClick={() => { save({ ...st, i: idx, done: false, outcome: null, paused: false }); setView('session'); }}>
                      <i aria-hidden="true">{state === 'Done' ? '✓' : ''}</i>
                      <span><b>{s.label}</b><em>{state}</em></span>
                    </button>
                  );
                })}
              </div>
            );
          })}
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
