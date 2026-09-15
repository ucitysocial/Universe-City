'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function NewPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push('/member');
    router.refresh();
  }

  return (
    <div className="wrap"><div className="panel">
      <p className="kick">Universe City</p>
      <h2 style={{ marginTop: 8 }}>Set a new password</h2>
      {err && <p className="err" style={{ marginTop: 18 }}>{err}</p>}
      <form onSubmit={submit} style={{ marginTop: 20 }}>
        <div className="field">
          <label htmlFor="p">New password</label>
          <input id="p" type="password" autoComplete="new-password" minLength={8}
                 value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Saving' : 'Save it and open my file'}
        </button>
      </form>
    </div></div>
  );
}
