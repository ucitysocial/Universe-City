'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const DEPTS = [
  ['I', 'Agency Assessment', '#5C0F1B'],
  ['II', 'Housing Stability', '#A07818'],
  ['III', 'Career Development', '#4A2A78'],
  ['IV', 'Life Management', '#2A4B3C']
] as const;

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    const publicAppUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? location.origin;
    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${publicAppUrl}/auth/callback?next=/apply`
      }
    });

    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (data.session) {
      location.assign(`${publicAppUrl}/apply`);
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <p className="kick">Universe City membership</p>
        <h1>Start with the life you’re actually living.</h1>
        <p className="lede">
          Start with an account. After you confirm your email and activate membership, we walk you
          through the resident interface and begin with Time.
        </p>

        <div className="auth-departments" aria-label="Universe City departments">
          {DEPTS.map(([roman, label, color]) => (
            <div key={roman} style={{ '--folder-color': color } as React.CSSProperties}>
              <span>{roman}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <div className="auth-path">
          <span>Create account</span>
          <span>Confirm email</span>
          <span>Activate membership</span>
          <span>Orientation</span>
          <span>Plan tomorrow</span>
        </div>
      </section>

      <section className="auth-card">
        {!sent ? (
          <>
            <p className="kick">Create account</p>
            <h2>Start your account.</h2>
            <p className="note auth-card-note">
              Just your name, email and password. No card is collected on this screen.
            </p>

            {err && <p className="err">{err}</p>}

            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="n">What should we call you?</label>
                <input
                  id="n"
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="e">Email</label>
                <input
                  id="e"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="p">Password</label>
                <input
                  id="p"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <p className="field-help">At least 8 characters.</p>
              </div>

              <button className="btn auth-submit" disabled={busy}>
                {busy ? 'Creating account' : 'Create account'}
              </button>
            </form>

            <p className="note auth-login">
              Already have an account? <Link href="/login?next=/apply">Log in</Link>.
            </p>
          </>
        ) : (
          <div className="auth-confirm">
            <div className="mail-mark">✉</div>
            <p className="kick">One step left</p>
            <h2>Confirm your email.</h2>
            <p>
              We sent the confirmation link to <strong>{email}</strong>.
            </p>
            <p>
              Open it to continue enrollment. After membership activation, your first resident
              screen is Orientation — then we start with tomorrow's Plan.
            </p>
            <div className="confirm-rule" />
            <p className="note">
              Wrong address? Refresh this page and create the account again with the correct email.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
