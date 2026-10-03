'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/member';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="wrap">
      <div className="panel">
        <p className="kick">Universe City</p>
        <h2 style={{ marginTop: 8 }}>Log in</h2>
        {err && <p className="err" style={{ marginTop: 18 }}>{err}</p>}
        <form onSubmit={submit} style={{ marginTop: 22 }}>
          <div className="field">
            <label htmlFor="e">Email</label>
            <input id="e" type="email" autoComplete="email" value={email}
                   onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" autoComplete="current-password" value={password}
                   onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'One moment' : 'Open my file'}
          </button>
        </form>
        <p className="note">
          No account yet? <Link href="/apply">Apply to Universe City</Link>.
          <br />Forgotten your password? <Link href="/reset">Reset it</Link>.
        </p>
      </div>
    </div>
  );
}
