/** The five statuses, and the twelve kinds. Nothing else may be a status. */
export const STATUSES = {
  observed:  'It happened and you know it',
  required:  'Externally fixed. You do not choose it',
  planned:   'You intend to establish it',
  suggested: 'We placed it. You have not adopted it',
  estimated: 'We know it happens. We cannot time it yet'
} as const;
export type BlockStatus = keyof typeof STATUSES;

export const KINDS = {
  sleep:         { label: 'Sleep',                          klass: 'necessary', dept: 'I'   },
  getting_ready: { label: 'Getting ready',                  klass: 'necessary', dept: 'I'   },
  travel:        { label: 'Travel',                         klass: 'necessary', dept: 'II'  },
  paid_work:     { label: 'Paid work',                      klass: 'committed', dept: 'III' },
  unpaid_work:   { label: 'Unpaid work time',               klass: 'committed', dept: 'III' },
  household:     { label: 'Household time',                 klass: 'committed', dept: 'II'  },
  caring:        { label: 'Caring for people',              klass: 'committed', dept: 'IV'  },
  appointment:   { label: 'Appointments',                   klass: 'committed', dept: 'I'   },
  people:        { label: 'Time with people',               klass: 'free',      dept: 'IV'  },
  rest:          { label: 'Rest and leisure',               klass: 'free',      dept: 'IV'  },
  building:      { label: 'Time on what you are building',  klass: 'free',      dept: 'IV'  }
} as const;
export type Kind = keyof typeof KINDS;

export type Block = {
  id: string; user_id: string; date: string;
  starts_at: string; ends_at: string | null;
  label: string; kind: Kind; status: BlockStatus;
  paid: 'paid' | 'unpaid' | 'none';
  cost_of: string | null; note: string | null;
  source?: 'member' | 'agent' | 'ai';
  created_at?: string; updated_at?: string;
};

export const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const hours = (b: Block) => b.ends_at ? (mins(b.ends_at) - mins(b.starts_at)) / 60 : 0;

/** Career Development holds paid labour only. A cost of the job carries the job's colour. */
export const deptOfBlock = (b: Block) =>
  (b.paid === 'paid' || b.paid === 'unpaid') ? 'III' : KINDS[b.kind].dept;

/** Observed and estimated are never added together. An unrecorded hour is
 *  unaccounted, never free. */
export function figures(week: Block[]) {
  let observed = 0, estimated = 0, free = 0, freeEstimated = 0;
  for (const b of week) {
    const h = hours(b);
    if (b.status === 'observed' || b.status === 'required') observed += h; else estimated += h;
    if (KINDS[b.kind].klass === 'free') {
      if (b.status === 'observed') free += h; else freeEstimated += h;
    }
  }
  return { observed, estimated, free, freeEstimated,
           unaccounted: Math.max(0, 168 - observed - estimated) };
}
