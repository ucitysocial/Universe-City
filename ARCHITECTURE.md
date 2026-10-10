# Architecture notes

The rules this schema exists to keep, and why each table is shaped the way it is.
Six months from now these matter more than remembering why a table was named
something.

## The six rules

**AI never writes a canonical fact.** Anything interpreted lands in `proposals`
and waits. Only an agent moves a proposal to confirmed, edited or rejected, and
the decision records who made it.

**A correction revises.** Updating a block writes `block_revisions` from a
database trigger, so there is no code path that forgets. One current block, and
a trail showing what it used to say.

**Briefs are derived.** `reviews.brief` is a cache. Delete it and
`lib/brief.ts` rebuilds it from blocks, revisions, standards, statements and
proposals.

**Unknown stays unknown.** NULL is not established. 0 is a confirmed zero.
Nothing coerces a missing value to zero, no calculation substitutes one, and a
calculation whose operands are NULL returns not established rather than a
number.

**Reviews are meetings.** Each has `scheduled_for`, `status` and an explicit
`period_start` and `period_end`. One a week is the cadence, never a constraint,
so an extra meeting is always possible and "since last review" is deterministic
rather than guessed.

**Nothing is deleted because it changed.** A retired standard keeps its row. A
corrected block keeps its history. A cancelled membership keeps the case.

## RLS matrix

Service means the service role key, used only by webhooks and server jobs.
Every cell is enforced at the database, not in a query or a component.

### Member owned. They write it.

`blocks` · `standards` · `inventory_items` · `entries` · `statements` · `salary`

| | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Member (own) | yes | yes | yes | yes |
| Member (other) | no | no | no | no |
| Agent | yes | yes | yes | **no** |
| Service | yes | yes | yes | yes |

An agent can correct a record on a member's behalf. An agent cannot delete a
member's record, because representing somebody is not owning them.

### System owned. No client writes at all.

`subscriptions` · `block_revisions` · `stripe_events`

| | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Member (own) | yes, except stripe_events | no | no | no |
| Agent | yes, except stripe_events | no | no | no |
| Service | yes | yes | yes | yes |
| Trigger | writes `block_revisions` as SECURITY DEFINER | | | |

No insert, update or delete policy exists on these tables. `block_revisions`
additionally has a trigger that rejects update and delete outright, so a
revision is immutable even for the service role path through PostgREST.
`stripe_events` has RLS enabled and no policy of any kind, so it is invisible to
every client.

### Agent owned. The member reads.

`proposals` · `reviews`

| | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Member (own) | yes | no | no | no |
| Agent | yes | yes | yes | no |
| Service | yes | yes | yes | yes |

This is what stops a member approving a proposal about themselves, and what
keeps meeting decisions trustworthy.

### profiles. The row is theirs. Four columns are not.

| | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Member (own) | yes | own id only | yes, guarded columns | no |
| Member (other) | no | no | no | no |
| Agent | yes | no | yes | no |
| Service | yes | yes | yes | yes |

## Protected columns

Postgres cannot scope a policy to a column, so `uc_guard_profile` is a trigger
that raises when a protected column changed and the caller is not an agent.

**Member may change:** `name`, `city`, `timezone`.

**Only an agent or the service role may change:** `role`, `membership`,
`case_no`, `represented_since`.

**Nobody may change through the profile:** `email`. It is the authentication
identity. It changes through the Supabase Auth email flow and is synchronised
into the profile by a trigger on `auth.users`, so the two records cannot
disagree.

## Provenance

`blocks.source`, `entries.source` and `proposals.origin` describe who actually
created the information. They are not user-selectable metadata.

A member's write is forced to `member` regardless of what was sent. An agent may
write `agent` and is refused `ai`. Only a server-side path with the service role
can record `ai`. The revision trigger derives origin from the authenticated
actor rather than from the row, so a member cannot make their own history claim
it came from AI.

## Case numbers

`UC-0401` and upward, from `uc_case_seq`. The sequence is the public identifier
and `profiles.id` is the key. Random four digits, as in 0001, collide and fail
the insert on signup.

## Stripe idempotency

`stripe_events` stores the Stripe event id as its primary key with a status of
received, processing, processed or failed. The handler claims the event, does
the work, and marks it processed only afterwards. A failure marks it failed and
returns a non 2xx so Stripe retries. An event already processed returns early.
Marking an event handled before the business operation succeeds is the bug this
shape exists to prevent.

## Timezone

`profiles.timezone` holds an IANA zone. Every day and week boundary is computed
in it, in `lib/domain/dates.ts`, using `Intl.DateTimeFormat` rather than
`toISOString`. At 7:30pm in Denver, UTC is already the following day, so a UTC
boundary puts Tuesday evening into Wednesday and moves the whole week. Time is
the first product, so this is the one to get right first.

Block times are stored as local wall clock strings because a schedule is lived
locally. An end past `24:00` crosses midnight and belongs to the day it started
on.

## Environments

Real separation, not a flag. Production Supabase with live Stripe, staging
Supabase with Stripe test mode. `profiles.is_test` marks a seeded or rehearsal
record inside an environment and is a convenience, never a substitute.

## Account lifecycle

`none` on signup, before payment. `active` once the Stripe webhook says so.
`past_due` on a failed payment. `canceled` on cancellation, where the record
stays and the systems close.

Membership is set from the webhook only. A browser returning from checkout is
not proof of payment.


## Public explanation layer

Architecture describes how Universe City works internally. Public language should translate that structure into something a resident can picture themselves using.

The source of truth for that translation is [SYSTEM_EXPLANATION_STANDARD.md](SYSTEM_EXPLANATION_STANDARD.md). Product and engineering decisions should preserve enough clarity about each system's purpose, resident interaction, agent contribution, and ongoing maintenance that the public explanation remains true.
