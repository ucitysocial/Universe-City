# Founder Test Notes

> **Working note. This file is not in force.** It states what the founder test is, what was decided to build it, what was found, and what it does not do. It changes no document in force. Each choice below that a governing document does not already make is a choice for this test alone, and it waits for the founder.

Written October 11, 2026. Branch `pilot/founder-test`. Pull request 19. The pull request is a draft and is not for merging.

## 1. What it is

1.1 The founder asked on October 11, 2026 for a working conversation she can log in to and test on herself, before a further documentation cycle. This is that test.

1.2 The resident talks with the guide. The guide is software. The conversation is kept word for word. The server files entries from it under `docs/systems/TIME.md` 5.6 and `ARCHITECTURE.md`.

1.3 Three screens exist: Conversation, File, and Activity. They are under `/portal/conversation`, `/portal/file`, and `/portal/activity`. They have their own layout, so the Resident Portal layout and its residency rule are unchanged.

## 2. Where it runs

2.1 The preview is the Netlify deploy preview of pull request 19. The screens answer Not Found on a production deploy.

2.2 The test data belongs in one separate schema, `uc_pilot`, built by `supabase/pilot/0001_founder_test.sql`. That file is not a migration. It changes no table in `public` or `auth`.

2.3 The language model is Claude, reached through the Netlify AI Gateway. No key for it is stored in the repository or in the site settings.

## 3. Choices made for this test

Each row is a choice for the test. None is a ruling.

| Subject | What the test does | Where the governing answer belongs |
|---|---|---|
| Who the software is | It is named the guide and states that it is software. It never presents as the agent | `TIME.md` 5.2 and Language Standard 10.8.1 already require this |
| Software asking intake and Plan questions | The guide asks them, for the founder alone, in this test. The founder asked for this on October 11, 2026 | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` |
| A direct report | Filed as the resident's statement when the resident's own words in the latest message state it. The words are kept beside the entry | `TIME.md` 5.6.5 |
| A thought, a question, another person's words | Nothing is filed | `TIME.md` 5.6.5, Language Standard 10.3 |
| What software worked out | Prepared, and the resident confirms or declines | `TIME.md` 5.6.2 and 5.6.7 |
| An interpretation | A proposal for a person. The database refuses a decision by software | `ARCHITECTURE.md`, first rule |
| A yes at Daily Close | Files no outcome. An outcome is filed only for a commitment the resident reports on | Operations draft 9.5. Open |
| A partly executed commitment | Can be reported executed later. The earlier report is kept | Operations draft 2.2.15 and 3.3. Open |
| A commitment taken off before it was due | Kept as a change, with no outcome | Operations draft 2.2.15. Open |
| Block statuses | The test uses commitments with an Execution value and a rough time mark. It does not use the block status list | Operations draft 2.1.4. Open |
| The weekly schedule | Stored as items that repeat on named days. Placed on today and the next seven days | Operations draft 2.6. Proposed |
| Time figures | The guide states no total and no count of hours. The figures are not built | `lib/domain/time.ts` and Operations draft section 5 |
| Folders other than Time | The resident's own statements are filed under the folder name. No other record is built | Each folder's specification |
| A request for a person | Opens a follow up owned by the agent. No person is told yet | `docs/product/AGENT_MODEL.md` |

## 4. What the server keeps, whatever the model asks

4.1 `tests/pilot/guardrails.mts` holds 71 checks. Each runs the server and the schema against a database in memory with a scripted stand in for the model. Run `npm install`, then `npm run test:pilot`.

4.2 An independent review of the code was run on October 11, 2026. Its findings and what was done about each are in section 6.

4.3 Conversations with the real model were run with made up residents, from GitHub Actions. The results are comments on pull request 19.

## 5. What it does not do

5.1 No voice, no Guided Life session, no reminder, no message sent outside the screen, no payment.

5.2 No Time figure, no Report, no Review, no agent console for the test. A proposal is decided on the File screen by the founder, who holds the agent's part in this test.

5.3 No folder other than Time has a record of its own.

5.4 The Morning Plan and Daily Close are not sent by software. The resident starts each conversation.

5.5 A follow up for the agent reaches no person. The step that tells a person is not built.

5.6 The model's replies are checked for a hyphen and a dash after they are written. The other clauses of the Language Standard are given to the model as instructions and are not checked by code.

## 6. Review findings

| Finding | Status |
|---|---|
| A script could run through the `next` value on the login page | Fixed on this branch. `main` still has it, in `app/(public)/login/page.tsx` and `app/auth/callback/route.ts` |
| A pull request from a fork could be built with the test's settings | Open. The two secret values are marked secret in Netlify. The site's policy for sensitive variables was not readable from here and should read Require approval |
| The wording check could be passed with a part of a sentence | Fixed. 11 cases are tests |
| A confirm in conversation accepted any words | Fixed |
| A waiting card showed the model's sentence | Fixed. The server writes the card from the fields |
| A Plan confirm used the list at press time | Fixed. The Plan is confirmed as the list shown |
| A resumed reply could file twice | Fixed. The model's requests are kept as they arrive, and one request claims the reply |
| Number removal missed common written forms | Improved. A number written in an unusual way can still pass. The notice says so |
| The database connection did not verify the database's certificate | Open until the test database is connected. The code verifies when the authority's certificate is set |
| The working role could attach the history function to a table of its own | Fixed |
| Rules that held only in code | Fixed. Updates reach named columns, and the database decides who may decide a proposal |

## 7. Removing the test

7.1 Close pull request 19 and delete the branch.

7.2 Run the three statements at the top of `supabase/pilot/0001_founder_test.sql`.

7.3 Delete the Netlify variables whose names start with `PILOT_`.
