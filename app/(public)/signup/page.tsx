'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const DEPTS = [
  ['I', 'Agency Assessment', '#5C0F1B'],
  ['II', 'Housing Stability', '#A07818'],
  ['III', 'Career Development', '#4A2A78'],
  ['IV', 'Life Management', '#2A4B3C']
] as const;

function passwordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

function passwordLabel(score: number) {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Strong';
}

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => passwordScore(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setErr(null);

    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || !last) {
      setErr('Enter your first and last name.');
      return;
    }

    if (password.length < 8) {
      setErr('Your password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErr('The passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const publicAppUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? window.location.origin;
      const { data, error } = await supabaseBrowser().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: first,
            last_name: last
          },
          emailRedirectTo: `${publicAppUrl}/auth/callback?next=/apply`
        }
      });

      if (error) {
        setErr(error.message);
        return;
      }

      if (data.session) {
        window.location.assign(`${publicAppUrl}/apply`);
        return;
      }

      setSent(true);
    } catch (error) {
      console.error('Account creation failed', error);
      setErr('We could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <p className="kick">Universe City residency</p>
        <h1>Start with the life you’re actually living.</h1>
        <p className="lede">
          Create your account and confirm your email. Agency Assessment is your enrollment and
          establishes your starting point across the first 12 areas of your residency.
        </p>

        <div className="auth-departments" aria-label="Universe City departments">
          {DEPTS.map(([roman, label, color]) => (
            <div key={roman} style={{ '--folder-color': color } as CSSProperties}>
              <span>{roman}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <div className="auth-path">
          <span>Create account</span>
          <span>Confirm email</span>
          <span>Agency Assessment</span>
          <span>Begin residency</span>
        </div>
      </section>

      <section className="auth-card">
        {!sent ? (
          <>
            <p className="kick">Create account</p>
            <h2>Start your account.</h2>
            <p className="note auth-card-note">
              Enter your name, email, and password. No card is collected on this screen.
            </p>

            {err && (
              <p className="err" role="alert">
                {err}
              </p>
            )}

            <form onSubmit={submit}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="first-name">First name</label>
                  <input
                    id="first-name"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="last-name">Last name</label>
                  <input
                    id="last-name"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
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
                  aria-describedby="password-help password-strength"
                />
                <p id="password-help" className="field-help">
                  Use at least 8 characters. A longer password with upper and lowercase letters,
                  a number, and a symbol is stronger.
                </p>
                <div id="password-strength" className="password-strength" aria-live="polite">
                  <div className="strength-bars" aria-hidden="true">
                    {[1, 2, 3, 4].map(level => (
                      <span key={level} className={strength >= level ? 'on' : ''} />
                    ))}
                  </div>
                  <span>{password ? passwordLabel(strength) : 'Password strength'}</span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  aria-describedby={confirmPassword ? 'password-match' : undefined}
                />
                {confirmPassword && (
                  <p
                    id="password-match"
                    className={passwordsMatch ? 'match-note ok' : 'match-note'}
                    aria-live="polite"
                  >
                    {passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
                  </p>
                )}
              </div>

              <button className="btn auth-submit" type="submit" disabled={busy}>
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
            <p className="kick">Confirm email</p>
            <h2>Confirm your email.</h2>
            <p>
              We sent the confirmation link to <strong>{email}</strong>.
            </p>
            <p>
              Open it to return to Universe City. Agency Assessment is your enrollment and
              establishes your starting point before the rest of your residency begins.
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
