# Drafts for Folder 01 Time

Filed October 11, 2026. Each file in this folder is a draft or a reference. No file in this folder is in force.

## 1. What governs

1.1 The documents in force are outside this folder: `LANGUAGE_STANDARD.md`, `ARCHITECTURE.md`, `docs/systems/TIME.md`, `docs/systems/TIME_OPERATIONS.md`, `docs/systems/TIME_DEVELOPMENTS.md`, and the documents in `docs/product/`. Filing this folder changed none of them.

1.2 A tool that writes in this repository follows the documents in force. A draft becomes a document in force when the founder approves it and it replaces the filed document. Until then a draft is read as a proposal.

## 2. The files

| File | What it is | Document in force that it would revise |
|---|---|---|
| `TIME_OPERATIONS_DRAFT.md` | Folder 01 Time Operations, Version 2 | `docs/systems/TIME_OPERATIONS.md`, Version 1 |
| `TIME_DEVELOPMENTS_DRAFT.md` | Folder 01 Time Developments, Version 2 | `docs/systems/TIME_DEVELOPMENTS.md`, Version 1 |
| `TIME_SHARED_DEPENDENCIES_DRAFT.md` | The sixteen shared requirements that Time needs from the platform | None. It is a working list |
| `TIME_DRAFT.md` | Folder 01 Time with the four parts added on October 11, 2026 | `docs/systems/TIME.md` |
| `LANGUAGE_STANDARD_DRAFT.md` | The Language Standard as revised on October 11, 2026 | `LANGUAGE_STANDARD.md` |
| `CONSOLIDATED_OPERATIONS_REVIEW.md` | A review of the Operations draft, written outside this repository | None. It is a reference |
| `CONSOLIDATED_DEVELOPMENTS_REVIEW.md` | A review of the Developments draft, written outside this repository | None. It is a reference |
| `SHARED_ARCHITECTURE_REVIEW.md` | A review of the shared dependency list, written outside this repository | None. It is a reference |
| `FOUNDER_TEST_NOTES.md` | What the founder test is, the choices made to build it, and what it does not do | None. It is a working note |
| `tests/` | The files that tested the tables and queries proposed in the Operations draft | None |

## 3. How the drafts cite each other

3.1 Inside a draft, a document name means the draft of that document in this folder. `TIME.md` means `TIME_DRAFT.md`. `LANGUAGE_STANDARD.md` means `LANGUAGE_STANDARD_DRAFT.md`. `TIME_OPERATIONS.md` means `TIME_OPERATIONS_DRAFT.md`. `TIME_DEVELOPMENTS.md` means `TIME_DEVELOPMENTS_DRAFT.md`.

3.2 The Operations draft cites clauses of `TIME.md` that exist only in `TIME_DRAFT.md`. Sections 5.10 to 5.14 are the largest group. A reader who checks a clause number opens `TIME_DRAFT.md`.

3.3 The two consolidated reviews cite the clause numbers of the Operations draft and the Developments draft. The filed Operations document ends at section 9. Sections 10 to 20 and the two appendixes exist only in the draft.

3.4 Folder 01 Time Curriculum, Version 2, and Folder 01 Time Research are Word files. They are held outside the repository.

## 4. The three reviews

4.1 Each review was supplied by the founder as a Word file on October 11, 2026. Each was converted to Markdown with its wording unchanged.

4.2 Each review closes with an instruction to build a first conversation for the founder to test. The founder gave that instruction herself on October 11, 2026. The build is done on its own branch. It changes no file in this folder and no document in force.

4.3 Each decision that a review recommends waits for the founder. A recommendation in a review is read as a proposal.

4.4 When the Operations document is revised, `CONSOLIDATED_OPERATIONS_REVIEW.md` is read with it. When the Developments document is revised, `CONSOLIDATED_DEVELOPMENTS_REVIEW.md` is read with it. When `ARCHITECTURE.md` or a document in `docs/product/` takes up a shared requirement, `SHARED_ARCHITECTURE_REVIEW.md` is read with it.

## 5. The tests

5.1 `tests/time_core.proposed.sql` is Appendix A of the Operations draft. `tests/time_queries.proposed.sql` is Appendix B. Each is a proposal. Neither was applied to a hosted database. Neither is a migration file, and neither belongs in `supabase/migrations/`.

5.2 Each test file builds a database in memory from the four files in `supabase/migrations/` and runs against that database alone.

5.3 To run the tests, install one package and run each file from the top of the repository:

```
npm install --no-save @electric-sql/pglite
node docs/systems/drafts/tests/t2.mjs
```

5.4 The results on October 11, 2026, at commit `0dbbeac`:

| File | What it runs | Result |
|---|---|---|
| `t1.mjs` | What the built database does today | Prints each finding |
| `t2.mjs` | The rules in Appendix A | 56 of 56 passed |
| `t3.mjs` | The queries in Appendix B, on one seeded week | 34 of 34 passed |
| `t4.mjs` | `supabase/tests/0002_security.sql`, with and without Appendix A | Tests 1 to 3 pass. The file stops at test 4 |
| `t5.mjs` | The same security file with test 4 repaired | Prints each finding |
| `t6.mjs` | What a client can do to a row in `statements` | Prints each finding |

5.5 A pass in this table is a pass of a proposal in a test database. It is no statement about the hosted database or about the website.
