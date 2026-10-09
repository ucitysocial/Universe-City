'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type Kind =
  | 'sleep'
  | 'getting_ready'
  | 'travel'
  | 'paid_work'
  | 'unpaid_work'
  | 'household'
  | 'caring'
  | 'appointment'
  | 'people'
  | 'rest'
  | 'building';

type Followup = 'none' | 'before' | 'after' | 'both';
type Confidence = 'very' | 'mostly' | 'ambitious' | 'unlikely';

type Item = {
  key: number;
  label: string;
  start: string;
  end: string;
  kind: Kind;
  progress: boolean;
};

const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'paid_work', label: 'Work' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'travel', label: 'Travel' },
  { value: 'household', label: 'Household' },
  { value: 'caring', label: 'Caring for someone' },
  { value: 'people', label: 'Time with people' },
  { value: 'rest', label: 'Rest / open time' },
  { value: 'building', label: 'Something I am building' },
  { value: 'getting_ready', label: 'Getting ready' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'unpaid_work', label: 'Unpaid work' }
];

const CONFIDENCE: { value: Confidence; label: string }[] = [
  { value: 'very', label: 'Very realistic' },
  { value: 'mostly', label: 'Mostly realistic' },
  { value: 'ambitious', label: 'A little ambitious' },
  { value: 'unlikely', label: 'Honestly, probably not' }
];

const FOLLOWUP: { value: Followup; label: string; hint: string }[] = [
  { value: 'none', label: 'Leave me alone', hint: 'I will close the loop at Daily Close.' },
  { value: 'before', label: 'Before', hint: 'Check in before the important part.' },
  { value: 'after', label: 'After', hint: 'Ask me whether it happened.' },
  { value: 'both', label: 'Both', hint: 'Help me protect it, then close the loop.' }
];

function minutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function addMinutes(time: string, amount: number) {
  const total = minutes(time) + amount;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function normalizedEnd(start: string, end: string) {
  if (minutes(end) > minutes(start)) return end;
  const [h, m] = end.split(':').map(Number);
  return `${String(h + 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function FirstPlan({
  userId,
  date,
  residentName
}: {
  userId: string;
  date: string;
  residentName?: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([
    { key: 1, label: '', start: '09:00', end: '17:00', kind: 'paid_work', progress: false }
  ]);
  const [progressLabel, setProgressLabel] = useState('');
  const [progressStart, setProgressStart] = useState('18:00');
  const [progressEnd, setProgressEnd] = useState('18:30');
  const [progressKind, setProgressKind] = useState<Kind>('building');
  const [confidence, setConfidence] = useState<Confidence>('mostly');
  const [followup, setFollowup] = useState<Followup>('after');
  const [dailyClose, setDailyClose] = useState('21:00');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const validItems = useMemo(
    () => items.filter(x => x.label.trim() && x.start && x.end),
    [items]
  );

  const update = (key: number, patch: Partial<Item>) =>
    setItems(current => current.map(item => item.key === key ? { ...item, ...patch } : item));

  const addItem = () => {
    const key = Math.max(0, ...items.map(x => x.key)) + 1;
    setItems(current => [...current, {
      key,
      label: '',
      start: '18:00',
      end: '19:00',
      kind: 'household',
      progress: false
    }]);
  };

  const removeItem = (key: number) => setItems(current => current.filter(x => x.key !== key));

  async function savePlan() {
    if (validItems.length === 0 && !progressLabel.trim()) {
      setErr('Put at least one real thing on tomorrow before we call it a Plan.');
      return;
    }

    setBusy(true);
    setErr(null);

    const planned = [...validItems];
    if (progressLabel.trim()) {
      planned.push({
        key: -1,
        label: progressLabel.trim(),
        start: progressStart,
        end: progressEnd,
        kind: progressKind,
        progress: true
      });
    }

    const metadata = {
      plan: 'first',
      confidence,
      followup
    };

    const rows = planned.map(item => ({
      user_id: userId,
      date,
      starts_at: item.start,
      ends_at: normalizedEnd(item.start, item.end),
      label: item.label.trim(),
      kind: item.kind,
      status: 'planned',
      paid: item.kind === 'paid_work' ? 'paid' : item.kind === 'unpaid_work' ? 'unpaid' : 'none',
      note: JSON.stringify({ ...metadata, progress: item.progress })
    }));

    rows.push({
      user_id: userId,
      date,
      starts_at: dailyClose,
      ends_at: addMinutes(dailyClose, 15),
      label: 'Universe City · Daily Close',
      kind: 'building',
      status: 'planned',
      paid: 'none',
      note: JSON.stringify({ ...metadata, universe_city: 'daily_close' })
    });

    const sb = supabaseBrowser();
    const { error } = await sb.from('blocks').insert(rows);

    if (error) {
      setBusy(false);
      setErr(error.message);
      return;
    }

    router.push('/member?plan=ready');
    router.refresh();
  }

  return (
    <div className="first-plan">
      <div className="plan-intro">
        <p className="kick">Time · First Plan</p>
        <h1>What is the plan for tomorrow?</h1>
        <p>
          {residentName ? `${residentName}, start` : 'Start'} with what is already true. We are not
          building your ideal life in one night. We are making tomorrow believable enough to learn
          from it.
        </p>
      </div>

      <section className="plan-section">
        <div className="plan-section-head">
          <span className="plan-step">01</span>
          <div>
            <h2>What already has to happen?</h2>
            <p>Work, appointments, errands, care, travel, rest — anything tomorrow already has to hold.</p>
          </div>
        </div>

        <div className="plan-items">
          {items.map(item => (
            <div className="plan-item" key={item.key}>
              <div className="plan-item-main">
                <input
                  aria-label="Plan item"
                  placeholder="e.g. Work"
                  value={item.label}
                  onChange={e => update(item.key, { label: e.target.value })}
                />
                <select value={item.kind} onChange={e => update(item.key, { kind: e.target.value as Kind })}>
                  {KIND_OPTIONS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </div>
              <div className="plan-times">
                <label>From<input type="time" value={item.start} onChange={e => update(item.key, { start: e.target.value })} /></label>
                <label>To<input type="time" value={item.end} onChange={e => update(item.key, { end: e.target.value })} /></label>
                {items.length > 1 && (
                  <button className="text-button danger-link" type="button" onClick={() => removeItem(item.key)}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="btn ghost compact" type="button" onClick={addItem}>+ Add another</button>
      </section>

      <section className="plan-section progress-section">
        <div className="plan-section-head">
          <span className="plan-step">02</span>
          <div>
            <h2>Anything you want tomorrow to be different from usual?</h2>
            <p>One small move is enough. “Nothing” is a valid answer.</p>
          </div>
        </div>
        <div className="progress-grid">
          <input
            placeholder="Optional — e.g. 30 minutes on my portfolio"
            value={progressLabel}
            onChange={e => setProgressLabel(e.target.value)}
          />
          <select value={progressKind} onChange={e => setProgressKind(e.target.value as Kind)}>
            {KIND_OPTIONS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <label>From<input type="time" value={progressStart} onChange={e => setProgressStart(e.target.value)} /></label>
          <label>To<input type="time" value={progressEnd} onChange={e => setProgressEnd(e.target.value)} /></label>
        </div>
      </section>

      <section className="plan-section">
        <div className="plan-section-head">
          <span className="plan-step">03</span>
          <div>
            <h2>How realistic does this Plan feel?</h2>
            <p>This helps us distinguish a commitment from the fantasy version of tomorrow.</p>
          </div>
        </div>
        <div className="choice-grid confidence-grid">
          {CONFIDENCE.map(c => (
            <button key={c.value} type="button"
              className={confidence === c.value ? 'choice on' : 'choice'}
              onClick={() => setConfidence(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        {(confidence === 'ambitious' || confidence === 'unlikely') && (
          <div className="plan-coach">
            <strong>That matters.</strong>
            <p>
              Before you save, look at the day again. If one thing already feels unlikely, moving or
              removing it is better planning than pretending.
            </p>
          </div>
        )}
      </section>

      <section className="plan-section">
        <div className="plan-section-head">
          <span className="plan-step">04</span>
          <div>
            <h2>How should we follow up?</h2>
            <p>You are choosing support, not signing up to be nagged about every item forever.</p>
          </div>
        </div>
        <div className="choice-grid">
          {FOLLOWUP.map(f => (
            <button key={f.value} type="button"
              className={followup === f.value ? 'choice on' : 'choice'}
              onClick={() => setFollowup(f.value)}>
              <strong>{f.label}</strong>
              <span>{f.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="plan-section daily-close">
        <div className="plan-section-head">
          <span className="plan-step">05</span>
          <div>
            <h2>When should Universe City be part of the Plan?</h2>
            <p>
              We need a few minutes to close today and get tomorrow ready. Put that time on the day
              now instead of hoping you remember.
            </p>
          </div>
        </div>
        <label className="daily-close-time">
          Daily Close
          <input type="time" value={dailyClose} onChange={e => setDailyClose(e.target.value)} />
        </label>
      </section>

      {err && <p className="err">{err}</p>}

      <div className="plan-save">
        <div>
          <p className="kick">Tomorrow · {date}</p>
          <strong>{validItems.length + (progressLabel.trim() ? 1 : 0) + 1} planned touchpoints</strong>
          <p className="note">Includes your Universe City Daily Close.</p>
        </div>
        <button className="btn" type="button" disabled={busy} onClick={savePlan}>
          {busy ? 'Saving Plan' : 'This is the Plan'}
        </button>
      </div>
    </div>
  );
}
