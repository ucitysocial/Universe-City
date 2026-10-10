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
4. Netlify. Production public traffic is served at `https://ucitysocial.com`.
   Add every required variable from `.env.example`. Server only secrets must
   never be prefixed `NEXT_PUBLIC_`.

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


## Current product sources of truth

Use these before extending public or resident facing behavior:

1. [LANGUAGE_STANDARD.md](LANGUAGE_STANDARD.md) for every word a resident, an agent, or a contributor reads. Read it before writing text. Run `python3 scripts/language-check.py` before a commit.
2. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for visual hierarchy, public shell, navigation, typography, mobile density, and the distinction between public and working surfaces.
3. [SYSTEM_EXPLANATION_STANDARD.md](SYSTEM_EXPLANATION_STANDARD.md) for agent behavior, system explanations, commitments, follow ups, and interaction patterns.
4. [ARCHITECTURE.md](ARCHITECTURE.md) for data ownership, provenance, history, and server side constraints.

Do not copy an older page or component merely because it already exists. If it conflicts with the current standards, update the component rather than reintroducing the old behavior.


## Route ownership

The repository contains two delivery layers.

### Canonical public marketing pages

The public marketing source lives in `ucitysocial/` and is served on `https://ucitysocial.com`.

Canonical static public routes include:

- `/`
- `/membership`
- `/agency-assessment`
- `/housing-stability`
- `/career-development`
- `/life-management`
- `/founder`

### Application and workspace routes

The Next application owns account, authentication, resident, agent, and API routes. Production reverse proxies those routes through the public domain.

These include:

- `/apply`
- `/login`
- `/signup`
- `/reset`
- `/auth/*`
- `/api/*`
- `/member/*`
- `/agent/*`

The public shell used by the Next application must stay aligned with the current static marketing shell. Do not treat the stage application's old homepage or older public components as the marketing source of truth.
