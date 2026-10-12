'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

/** Logs out of an account that is outside the founder test, so the resident can log in with the test account. */
export default function PilotSwitch() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logOut() {
    setBusy(true);
    try { await supabaseBrowser().auth.signOut(); } catch { /* the session is already closed */ }
    router.push('/login?next=/portal/home');
    router.refresh();
  }
  return (
    <div className="actions" style={{ marginTop: 16 }}>
      <button type="button" className="btn" disabled={busy} onClick={logOut}>Log out of this account</button>
    </div>
  );
}
