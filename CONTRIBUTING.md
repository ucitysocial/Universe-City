# Contributing to Universe City

Universe City uses GitHub for engineering work and Google Drive for canonical company/product documentation.

## Before you code

1. Read `AGENTS.md`.
2. Read the relevant current Drive document(s) and the Master Index.
3. Confirm whether the task is:
   - an implementation correction that should match existing doctrine; or
   - a product decision that changes doctrine and therefore requires documentation reconciliation.

## Branches

Do not work directly on `main`.

Use short task branches:

- `fix/...` for bugs or implementation corrections
- `feat/...` for new behavior
- `chore/...` for engineering/infrastructure work
- `docs/...` for repository documentation only

Examples:

- `fix/time-status-figures`
- `feat/time-intake`
- `chore/ci-typecheck`

## Pull requests

Keep one logical change per PR. The PR must explain:

- the problem;
- the change;
- testing performed;
- database/deployment impact;
- documentation impact;
- governing Drive documents.

If product doctrine changed, the relevant canonical Drive document must be updated and verified before the PR is considered complete.

If the code was simply corrected to match an already-current document, say so explicitly; a Drive rewrite is not required.

## Migrations

All database schema/policy changes must be represented by committed migration files. Never rely on an undocumented manual production change.

## Secrets

Never commit real credentials. Local secrets belong in ignored `.env*` files or the deployment provider's secret/environment system.

## Merge standard

A PR is ready to merge when:

- the implementation is reviewable;
- relevant checks pass;
- data/security implications were considered;
- documentation impact was resolved;
- no secrets or generated local artifacts are included.

After merge, `main` becomes the new engineering source of truth.