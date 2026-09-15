/** The brief is derived from the record. It is never the source of truth,
 *  and it can always be regenerated from the underlying rows. */
import { supabaseServer } from '@/lib/supabase/server';
import { figures, type Block } from '@/lib/domain/time';

export type Brief = {
  header: { name: string; case_no: string; membership: string;
            represented_since: string | null; period: [string, string]; scheduled_for: string | null };
  since_last: { kind: string; what: string; at: string }[];
  time: { observed: number; required: number; planned: number; estimated: number; unaccounted: number;
          needs_confirmation: { id: string; what: string }[];
          changed: { id: string; what: string; before: string; after: string }[] };
  standards: { new: any[]; changed: any[]; possible_conflicts: { standard: string; because: string }[];
               exceptions: any[] };
  raised: { said: string; channel: string; at: string }[];
  open_proposals: any[];
  last_review: { concentration: string | null; decisions: any; unresolved: any; approved_at: string | null } | null;
};

export async function buildBrief(userId: string, periodStart: string, periodEnd: string,
                                 scheduledFor: string | null = null): Promise<Brief> {
  const sb = supabaseServer();

  const [{ data: profile }, { data: blocks }, { data: standards },
         { data: statements }, { data: proposals }, { data: prior }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', userId).single(),
    sb.from('blocks').select('*').eq('user_id', userId).gte('date', periodStart).lte('date', periodEnd),
    sb.from('standards').select('*').eq('user_id', userId),
    sb.from('statements').select('*').eq('user_id', userId).is('resolved_at', null).order('at', { ascending: false }),
    sb.from('proposals').select('*').eq('user_id', userId).eq('state', 'proposed').order('created_at'),
    sb.from('reviews').select('*').eq('user_id', userId).eq('status', 'closed')
      .order('period_end', { ascending: false }).limit(1).maybeSingle()
  ]);

  const since = prior?.approved_at ?? new Date(Date.now() - 7 * 864e5).toISOString();
  const bl = (blocks ?? []) as Block[];
  const f = figures(bl);

  const { data: revisions } = await sb.from('block_revisions')
    .select('*').eq('user_id', userId).gt('at', since).order('at', { ascending: false });

  const hoursBy = (s: string) =>
    bl.filter(b => b.status === s).reduce((n, b) => {
      const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
      return n + (b.ends_at ? (m(b.ends_at) - m(b.starts_at)) / 60 : 0);
    }, 0);

  /* a standard and the record can disagree. That is a possible conflict, never a violation. */
  const active = (standards ?? []).filter(s => s.state === 'active');
  const conflicts: { standard: string; because: string }[] = [];
  const daysWithWork = new Set(bl.filter(b => b.paid === 'paid').map(b => b.date));
  for (const s of active) {
    if (/day off|unscheduled|full day/i.test(s.wording) && daysWithWork.size >= 7)
      conflicts.push({ standard: s.wording, because: 'The week has commitments on all seven days.' });
  }

  return {
    header: {
      name: profile?.name ?? '', case_no: profile?.case_no ?? '',
      membership: profile?.membership ?? 'none',
      represented_since: profile?.represented_since ?? null,
      period: [periodStart, periodEnd], scheduled_for: scheduledFor
    },
    since_last: [
      ...(revisions ?? []).map(r => ({ kind: 'time.revised', what: `${(r.after as any).label}`, at: r.at })),
      ...bl.filter(b => (b.created_at ?? '') > since).map(b => ({ kind: 'time.added', what: b.label, at: (b as any).created_at })),
      ...active.filter(s => s.created_at > since).map(s => ({ kind: 'standard.new', what: s.wording, at: s.created_at }))
    ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12),
    time: {
      observed: f.observed, required: hoursBy('required'), planned: hoursBy('planned'),
      estimated: f.estimated, unaccounted: f.unaccounted,
      needs_confirmation: bl.filter(b => b.status === 'estimated')
        .map(b => ({ id: b.id, what: `${b.date} ${b.starts_at} to ${b.ends_at ?? '?'} is still estimated` })),
      changed: (revisions ?? []).map(r => ({
        id: r.block_id,
        what: (r.after as any).label,
        before: `${(r.before as any).starts_at} to ${(r.before as any).ends_at}`,
        after: `${(r.after as any).starts_at} to ${(r.after as any).ends_at}`
      }))
    },
    standards: {
      new: active.filter(s => s.created_at > since),
      changed: (standards ?? []).filter(s => s.amended_from && s.created_at > since),
      possible_conflicts: conflicts,
      exceptions: active.filter(s => s.exceptions)
    },
    raised: (statements ?? []).map(s => ({ said: s.said, channel: s.channel, at: s.at })),
    open_proposals: proposals ?? [],
    last_review: prior ? {
      concentration: prior.next_concentration, decisions: prior.decisions,
      unresolved: prior.unresolved, approved_at: prior.approved_at
    } : null
  };
}
