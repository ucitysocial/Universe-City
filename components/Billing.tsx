'use client';
import { useState } from 'react';

export default function Billing() {
  const [busy, setBusy] = useState(false);
  async function open() {
    setBusy(true);
    const r = await fetch('/api/stripe/portal', { method: 'POST' });
    const d = await r.json();
    if (d.url) location.href = d.url; else setBusy(false);
  }
  return (
    <button className="btn ghost" onClick={open} disabled={busy}>
      {busy ? 'Opening billing' : 'Manage membership billing'}
    </button>
  );
}
