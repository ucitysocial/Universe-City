'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GhostTemplate, MissingKey } from '@/lib/pilot/ghosts';

type Props = { initial: GhostTemplate[]; ready: boolean };
const WHEN: { value: string; label: string }[] = [
  { value: '', label: 'Always offer (until disabled)' },
  { value: 'sleep', label: 'Only while sleep/wake is missing' },
  { value: 'morning', label: 'Only while morning routine is missing' },
  { value: 'work', label: 'Only while work schedule is missing' },
  { value: 'meals', label: 'Only while meals are missing' },
  { value: 'night', label: 'Only while night routine is missing' }
];
const PLACE = [
  { value: -3, label: 'At the beginning of the day' },
  { value: -2, label: 'After waking' },
  { value: 360, label: 'Around 6 AM' },
  { value: 540, label: 'Around 9 AM' },
  { value: 720, label: 'Around noon' },
  { value: 1080, label: 'Around 6 PM' },
  { value: 1438, label: 'Near the end of the day' },
  { value: 1439, label: 'Last in the day' }
];
const blank = (): GhostTemplate => ({
  key: 'new', label: '', ask: '', at: 720, whenMissing: null, enabled: true
});

export default function AgentSuggestionsEditor({ initial, ready }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [creating, setCreating] = useState<GhostTemplate>(blank());
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: string, change: Partial<GhostTemplate>) =>
    setItems(a => a.map(x => x.key === key ? { ...x, ...change } : x));

  async function save(s: GhostTemplate) {
    if (!ready || saving) return;
    setSaving(s.key); setNotice(null);
    try {
      const res = await fetch('/api/pilot/studio/suggestions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'save', ...s })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'The server did not save that suggestion.');
      if (s.key === 'new') {
        setItems(a => [...a, { ...s, key: data.key }]);
        setCreating(blank());
      }
      setNotice('Saved. The resident schedule will use this suggestion when its condition applies.');
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Not saved.');
    } finally { setSaving(null); }
  }

  function fields(s: GhostTemplate, onEdit: (c: Partial<GhostTemplate>) => void) {
    return (
      <div className="studio-fields">
        <label>Label
          <input value={s.label} maxLength={100} onChange={e => onEdit({ label: e.target.value })} />
        </label>
        <label>What pressing the faded suggestion asks the guide
          <textarea value={s.ask} maxLength={300} rows={2} onChange={e => onEdit({ ask: e.target.value })} />
        </label>
        <label>When it appears
          <select value={s.whenMissing ?? ''} onChange={e => onEdit({ whenMissing: (e.target.value || null) as MissingKey })}>
            {WHEN.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </label>
        <label>Where to display it in the day
          <select value={PLACE.some(p => p.value === s.at) ? s.at : 'custom'} onChange={e => onEdit({ at: Number(e.target.value) })}>
            {!PLACE.some(p => p.value === s.at) && <option value="custom" disabled>Custom placement: {s.at}</option>}
            {PLACE.map(p => <option value={p.value} key={p.value}>{p.label}</option>)}
          </select>
        </label>
        <label className="studio-check">
          <input type="checkbox" checked={s.enabled} onChange={e => onEdit({ enabled: e.target.checked })} />
          Visible when its condition applies
        </label>
      </div>
    );
  }

  return (
    <div className="studio-edit">
      {!ready && <p className="pt-err">Viewing only. The Agent Studio database migration has not been applied. The six existing resident suggestions remain unchanged.</p>}
      <div className="studio-intro">
        <h1>Faded schedule suggestions</h1>
        <p>These are optional ideas for the resident's schedule. Edit the labels, placement, and questions that open with the guide.</p>
      </div>
      {notice && <p className="studio-notice" role="status">{notice}</p>}
      <div className="studio-list">
        {items.map(s => (
          <section className="studio-card" key={s.key}>
            <div className="studio-card-head">
              <strong>{s.label || 'Untitled suggestion'}</strong>
              <span className="studio-chip">{s.key.startsWith('custom-') ? 'Added by agent' : 'Built in'}</span>
            </div>
            {fields(s, change => update(s.key, change))}
            <div className="studio-actions">
              <button type="button" className="pt-btn" disabled={!ready || !!saving} onClick={() => void save(s)}>
                {saving === s.key ? 'Saving…' : 'Save changes'}
              </button>
              <span className="studio-sub">Disabling hides the idea without deleting its history.</span>
            </div>
          </section>
        ))}
      </div>
      <section className="studio-card studio-add">
        <div className="studio-card-head"><strong>Add a suggestion</strong><span className="studio-chip">New</span></div>
        {fields(creating, change => setCreating(x => ({ ...x, ...change })))}
        <button type="button" className="pt-btn" disabled={!ready || !!saving || !creating.label.trim() || !creating.ask.trim()}
          onClick={() => void save(creating)}>Add to resident suggestions</button>
      </section>
    </div>
  );
}
