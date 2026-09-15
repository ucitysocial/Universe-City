'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { data, error } = await supabaseBrowser().auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${location.origin}/auth/callback?next=/join`
      }
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    if (data.session) { router.push('/join'); router.refresh(); return; }
    setSent(true);
  }

  if (sent) return (
    <div className="wrap"><div className="panel">
      <p className="kick">Universe City</p>
      <h2 style={{ marginTop: 8 }}>Check your email</h2>
      <p className="note">
        We sent a link to {email}. Open it and your file is created. Nothing is charged yet.
      </p>
    </div></div>
  );

  return (
    <div className="wrap">
      <div className="panel">
        <p className="kick">Universe City</p>
        <h2 style={{ marginTop: 8 }}>Create your file</h2>
        <p className="note" style={{ marginTop: 6, marginBottom: 20 }}>
          Two things and a password. Nothing is charged on this screen.
        </p>
        {err && <p className="err">{err}</p>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="n">What should we call you</label>
            <input id="n" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="e">Email</label>
            <input id="e" type="email" autoComplete="email" value={email}
                   onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" autoComplete="new-password" minLength={8}
                   value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'One moment' : 'Create my file'}
          </button>
        </form>
      </div>
    </div>
  );
}
