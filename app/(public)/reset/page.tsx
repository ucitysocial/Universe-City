'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset/new`
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  }

  return (
    <div className="wrap"><div className="panel">
      <p className="kick">Universe City</p>
      <h2 style={{ marginTop: 8 }}>Reset your password</h2>
      {sent ? (
        <p className="note" style={{ marginTop: 16 }}>
          If an account exists for {email}, we sent a password reset link. The link can be used
          once and expires.
        </p>
      ) : (
        <>
          {err && <p className="err" style={{ marginTop: 18 }}>{err}</p>}
          <form onSubmit={submit} style={{ marginTop: 20 }}>
            <div className="field">
              <label htmlFor="e">Email</label>
              <input id="e" type="email" autoComplete="email" value={email}
                     onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn" style={{ width: '100%' }} disabled={busy}>
              {busy ? 'Sending link' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </div></div>
  );
}
