# Universe City

A responsive website. Public site, member area, private agent console.

    npm install
    cp .env.example .env.local        # fill it in
    npm run dev

## Order of setup

1. Supabase project. Run `supabase/migrations/0001_init.sql` in the SQL editor.
   It creates the schema, row level security, the profile trigger, and the
   block revision trigger.
2. Make yourself an agent:
   `update profiles set role = 'agent' where email = 'you@example.com';`
3. Stripe. One recurring membership product. Put the configured Stripe price id in
   `STRIPE_PRICE_MEMBERSHIP`. Point a webhook at `/api/stripe/webhook` for
   `checkout.session.completed`, `customer.subscription.updated` and
   `customer.subscription.deleted`.
4. Vercel. Add every variable from `.env.example`. `SUPABASE_SERVICE_ROLE_KEY`
   and `ANTHROPIC_API_KEY` are server only and must never be prefixed
   `NEXT_PUBLIC_`.

## The rules this codebase exists to keep

Nothing is recorded that the member did not say.

A correction revises the record and keeps what was believed before it.
`block_revisions` is written by a database trigger, so it cannot be skipped.

AI proposes. It does not write. Everything interpreted lands in `proposals`
and waits for approval.

The brief is derived from the record and can always be regenerated.
It is a cache, never the source of truth.

No secret ever reaches the browser. The anon key plus row level security is
all the client gets.


## Product language

Public explanations of Universe City systems follow [SYSTEM_EXPLANATION_STANDARD.md](SYSTEM_EXPLANATION_STANDARD.md).

The standard defines how to balance what a system is with how a resident actually uses it, how an agent participates, and how the system develops through continued use.
