# Universe City — Repository Instructions

This repository is the live engineering record for Universe City.

## Sources of truth

- GitHub is authoritative for source code, migrations, tests, engineering history, branches, pull requests, and releases.
- Google Drive is authoritative for company/product doctrine, canonical operating documents, and the Master Index.
- Start in Google Drive: `Universe City / 02 Build / Development Handoff`.
- Do not copy product doctrine into code comments or repo docs when a canonical Drive document already owns it. Reference the governing document instead.

## Required workflow

1. Read the relevant code and governing Drive documentation before changing behavior.
2. Never make product work directly on `main`.
3. Create a short branch named for the task, such as `fix/time-status-figures` or `feat/time-intake`.
4. Keep one logical change per branch/PR.
5. Run relevant tests/type checks before requesting merge.
6. Open a pull request into `main`.
7. Complete the Documentation Impact section in the PR template.
8. Merge only after the implementation and documentation agree.

## Documentation impact rule

A code change does NOT require rewriting Drive docs when it only fixes implementation so that it matches an already-current rule.

A Drive document MUST be reviewed and usually updated when the change alters intended product behavior, authority, data meaning, workflow, pricing/access, AI behavior, human-agent behavior, review operations, taxonomy, or design rules.

Typical ownership:

- Time behavior -> Time documents
- Proposal/canonical/record authority -> Record and Authority Standard / Platform Operations
- AI behavior -> AI Casework Training
- Human agent role -> Agent Operations
- Weekly review behavior -> Weekly Review Operations
- Visual system -> Design Specification
- Taxonomy -> The 48 Folders
- Canonical document status/version/dependencies -> Master Index

If a product decision changes, do not silently encode the new decision in code. Reconcile the governing Drive document and Master Index as required.

## Data and security

- Never commit secrets, API keys, `.env`, `.env.local`, service-role keys, webhook secrets, or production credentials.
- `.env.example` may contain variable names and non-secret examples only.
- Database changes use migrations; do not make untracked production-only schema edits.
- Preserve record history and authority boundaries defined by the canonical documents.

## Change quality

For every PR, state:

- what changed;
- why;
- what was tested;
- database/deployment impact;
- governing Drive document(s);
- whether those documents changed and why or why not.

Do not mark work complete merely because code was written. Completion means the intended behavior is implemented, tested, reviewable, and documentation state is reconciled.