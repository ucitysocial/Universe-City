'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { ZODIAC, zodiacFromDate, type ZodiacSign } from '@/lib/domain/zodiac';

function localToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function strengthOf(value: string) {
  if (!value) return { score: 0, label: '' };
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length;
  if (groups >= 3) score += 1;
  if (groups === 4) score += 1;
  score = Math.min(score, 4);
  return { score, label: ['','Weak','Fair','Good','Strong'][score] };
}

export default function Signup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [emailAgain, setEmailAgain] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const maxBirthday = useMemo(localToday, []);
  const passwordStrength = strengthOf(password);
  const emailMatches = emailAgain.length > 0 && email.trim().toLowerCase() === emailAgain.trim().toLowerCase();
  const passwordMatches = passwordAgain.length > 0 && password === passwordAgain;

  const zodiac = useMemo<ZodiacSign | null>(() => {
    if (!birthday) return null;
    const [, month, day] = birthday.split('-').map(Number);
    if (!month || !day) return null;
    try { return zodiacFromDate(month, day); }
    catch { return null; }
  }, [birthday]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const first = firstName.trim();
    const last = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanEmailAgain = emailAgain.trim().toLowerCase();

    if (!first || !last) { setErr('Enter your first and last name.'); return; }
    if (!birthday || birthday > maxBirthday) { setErr('Enter a valid birthday.'); return; }
    if (cleanEmail !== cleanEmailAgain) { setErr('The email addresses do not match.'); return; }
    if (password.length < 8) { setErr('Use a password with at least eight characters.'); return; }
    if (password !== passwordAgain) { setErr('The passwords do not match.'); return; }

    setBusy(true);
    const { data, error } = await supabaseBrowser().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: `${first} ${last}`,
          first_name: first,
          last_name: last,
          birth_date: birthday
        },
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
        We sent a confirmation link to {email}. Open the link to finish creating your file. No
        payment has been taken.
      </p>
    </div></div>
  );

  return (
    <div className="wrap">
      <div className="panel signup-panel">
        <p className="kick">Universe City</p>
        <h2 style={{ marginTop: 8 }}>Create your file</h2>
        <p className="note" style={{ marginTop: 6, marginBottom: 20 }}>
          Enter the information that belongs on your file. Your birthday is used to assign your zodiac badge.
          No payment is taken here.
        </p>
        {err && <p className="err">{err}</p>}
        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="fn">First name</label>
              <input id="fn" autoComplete="given-name" value={firstName}
                     onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="ln">Last name</label>
              <input id="ln" autoComplete="family-name" value={lastName}
                     onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="bd">Birthday</label>
            <input id="bd" type="date" autoComplete="bday" max={maxBirthday}
                   value={birthday} onChange={e => setBirthday(e.target.value)} required />
          </div>

          {zodiac && (
            <div className="zodiac-preview" aria-live="polite">
              <span className="zodiac-badge">
                <span className="zodiac-symbol" aria-hidden="true">{ZODIAC[zodiac].symbol}</span>
                <span className="zodiac-label">{zodiac}</span>
              </span>
              <span className="zodiac-preview-note">Assigned from your birthday</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="e">Email</label>
            <input id="e" type="email" autoComplete="email" value={email}
                   onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="e2">Re-enter email</label>
            <input id="e2" type="email" autoComplete="email" value={emailAgain}
                   onChange={e => setEmailAgain(e.target.value)} required />
            {emailAgain && <p className={`match-note ${emailMatches ? 'ok' : ''}`}>{emailMatches ? 'Emails match.' : 'Emails do not match.'}</p>}
          </div>

          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" autoComplete="new-password" minLength={8}
                   value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="password-strength" aria-live="polite">
              <div className="strength-bars" aria-hidden="true">
                {[1,2,3,4].map(n => <span key={n} className={passwordStrength.score >= n ? 'on' : ''} />)}
              </div>
              <span>{password ? passwordStrength.label : 'At least 8 characters'}</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="p2">Re-enter password</label>
            <input id="p2" type="password" autoComplete="new-password" minLength={8}
                   value={passwordAgain} onChange={e => setPasswordAgain(e.target.value)} required />
            {passwordAgain && <p className={`match-note ${passwordMatches ? 'ok' : ''}`}>{passwordMatches ? 'Passwords match.' : 'Passwords do not match.'}</p>}
          </div>

          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Creating file' : 'Create my file'}
          </button>
        </form>
      </div>
    </div>
  );
}
