'use client';
import { useState } from 'react';

export default function Checkout() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/stripe/checkout', { method: 'POST' });
      const d = await r.json();
      if (d.url) { location.href = d.url; return; }
      setErr(d.error ?? 'Checkout did not open.');
    } catch { setErr('Checkout did not open.'); }
    setBusy(false);
  }

  return (
    <>
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ width: '100%' }} onClick={go} disabled={busy}>
        {busy ? 'Opening checkout' : 'Complete enrollment'}
      </button>
      <p className="note">
        Stripe processes your card information. Universe City does not receive your card number.
      </p>
    </>
  );
}
