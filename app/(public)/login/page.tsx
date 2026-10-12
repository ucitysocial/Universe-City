'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

// What the page says when a visitor arrives from an emailed link.
const LINK_NOTE: Record<string, string> = {
  expired: 'That link has expired. Enter your email and press Send a new confirmation email. For a new password, use Reset my password.',
  failed: 'That link did not work. Enter your email and press Send a new confirmation email. For a new password, use Reset my password.',
  opened: 'The link opened, and this browser started no login from it. Log in with your email and password. For a new password, press Reset my password and open the new link in this browser.'
};

export default function Login() {
  const params = useSearchParams();
  // The page to open after login is a path on this site. A full address or a script is replaced with the Resident Portal.
  const asked = params.get('next') || '';
  const next = /^\/(?![\/\\])[^\s]*$/.test(asked) ? asked : '/portal';
  const arrived = params.get('link') || (params.get('error') === 'link' ? 'expired' : '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  // A preview is outside the list of addresses the login service returns a link to. The public site is on that list.
  const onPreview = process.env.PILOT_CONTEXT === 'deploy-preview';
  const publicAppUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? (typeof window === 'undefined' ? '' : window.location.origin);
  const resetHref = onPreview ? `${publicAppUrl}/reset` : '/reset';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setSentTo(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      if (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) { setUnconfirmed(true); return; }
      setUnconfirmed(false);
      setErr(error.message);
      return;
    }
    // The page loads in full, so the server reads the new login on the first request.
    setOpening(true);
    window.location.assign(next);
  }

  async function sendConfirmation() {
    const to = email.trim();
    if (!to) { setErr('Enter your email first.'); return; }
    setBusy(true); setErr(null);
    // A first login after confirmation opens the application, the same page the first confirmation email opens.
    const after = asked && next !== '/portal' ? next : '/apply';
    const { error } = await supabaseBrowser().auth.resend({
      type: 'signup',
      email: to,
      options: { emailRedirectTo: `${publicAppUrl}/auth/callback?next=${encodeURIComponent(after)}` }
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSentTo(to);
  }

  const showSend = unconfirmed || arrived === 'expired' || arrived === 'failed';

  return (
    <div className="simple-auth-page">
      <div className="wrap">
      <div className="panel">
        <p className="kick">Universe City</p>
        <h2 style={{ marginTop: 8 }}>Log in</h2>
        {err && <p className="err" style={{ marginTop: 18 }}>{err}</p>}
        {!err && sentTo && (
          <p className="err" style={{ marginTop: 18, borderLeftColor: 'var(--IV)' }}>
            If the account under {sentTo} is waiting for confirmation, a new link is on its way. It works once and it expires.
            Open the link, then log in on this page.
          </p>
        )}
        {!err && !sentTo && unconfirmed && (
          <p className="err" style={{ marginTop: 18 }}>
            The email for this account is waiting for confirmation. Press Send a new confirmation email, then open the link in that email.
          </p>
        )}
        {!err && !sentTo && !unconfirmed && LINK_NOTE[arrived] && (
          <p className="err" style={{ marginTop: 18, ...(arrived === 'opened' ? { borderLeftColor: 'var(--IV)' } : {}) }}>{LINK_NOTE[arrived]}</p>
        )}
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
          <button className="btn" style={{ width: '100%' }} disabled={busy || opening}>
            {opening ? 'Opening the Resident Portal' : busy ? 'Logging in' : 'Log in'}
          </button>
          {opening && (
            <div className="opening" role="status">
              <p className="kick">Universe City</p>
              <p className="opening-line">You are logged in. The Resident Portal is loading.</p>
              <span className="opening-bar" aria-hidden="true" />
            </div>
          )}
          {showSend && (
            <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 12 }} disabled={busy} onClick={sendConfirmation}>
              Send a new confirmation email
            </button>
          )}
        </form>
        <p className="note">
          No account yet? <Link href="/apply">Apply for residency</Link>.
          <br />Forgotten your password? <a href={resetHref}>Reset my password</a>.
        </p>
      </div>
      </div>
    </div>
  );
}
