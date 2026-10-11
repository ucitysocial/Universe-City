# Founder Test Notes

> **Working note. This file is not in force.** It states what the founder test is, what was decided to build it, what was found, and what it does not do. It changes no document in force. Each choice below that a governing document does not already make is a choice for this test alone, and it waits for the founder.

Written October 11, 2026. Branch `pilot/founder-test`. Pull request 19. The pull request is a draft and is not for merging.

## 1. What it is

1.1 The founder asked on October 11, 2026 for a working conversation she can log in to and test on herself, before a further documentation cycle. This is that test.

1.2 The resident talks with the guide. The guide is software. The conversation is kept word for word. The server files entries from it under `docs/systems/TIME.md` 5.6 and `ARCHITECTURE.md`.

1.3 Three screens exist: Conversation, File, and Activity. They are under `/portal/conversation`, `/portal/file`, and `/portal/activity`. They have their own layout, so the Resident Portal layout and its residency rule are unchanged.

## 2. Where it runs

2.1 The preview is the Netlify deploy preview of pull request 19. The screens answer Not Found on a production deploy.

2.2 The test data is held in one separate schema, `uc_pilot`, inside the Universe City database. The founder approved that place on October 11, 2026. The schema is built by `supabase/pilot/0001_founder_test.sql`. That file is not a migration. It changes no table in `public` or `auth`. No web key of the site reaches the schema: the roles `anon`, `authenticated`, and `service_role` hold no privilege in it.

2.3 The hosted schema was compared with the file on October 11, 2026, part by part: columns, constraints, indexes, triggers, policies, functions, grants, and row level security. Each part equals the file. One function in the file is absent from the hosted schema: `clear_my_test_data`. Clause 5.7 states why.

2.4 The test list holds three rows: the founder's login, and two made up residents named Dana and Marcus. The checks speak only for the two made up residents.

2.5 The language model is Claude Sonnet 5.5. It is reached through the Netlify AI Gateway, and Netlify bills the founder's Netlify account for each reply. The founder chose on October 11, 2026 to pay Anthropic directly. When the variable `PILOT_ANTHROPIC_KEY` holds her key, each reply goes to Anthropic under her own account. No key is stored in the repository.

2.6 The preview reads four Netlify variables, each set for deploy previews alone and each marked secret: `PILOT_DATABASE_URL`, `PILOT_DATABASE_CA`, `PILOT_SELFTEST_KEY`, and `PILOT_SELFTEST_USERS`.

2.7 One resident's replies stop for the day when their model cost reaches 1 dollar. `PILOT_DAILY_CAP_USD` changes that amount.

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

4.1 `tests/pilot/guardrails.mts` holds 74 checks. Each runs the server and the schema against a database in memory with a scripted stand in for the model. Run `npm install`, then `npm run test:pilot`.

4.2 An independent review of the code was run on October 11, 2026. Its findings and what was done about each are in section 6.

4.3 Conversations with the real model were run with made up residents, from GitHub Actions. The results are comments on pull request 19.

4.4 The hosted preview and the hosted database were checked on October 11, 2026:

| Check | Result |
|---|---|
| The database login role, before it takes the working role | It can use no table in the schema and it bypasses no rule |
| A resident who is outside the test list | Reads 0 rows. A write is refused by row level security |
| The connection to the database | Encrypted, and the database's certificate is verified against the authority's certificate |
| A conversation of 8 messages as Dana | A weekly schedule item, a Finance statement, a commitment, a confirmed Plan, a corrected time with its history, and a reported outcome were filed. The database rows match the replies |
| A question as Marcus about Dana's entries | The guide found no entry. Marcus's File is empty |
| Each screen and each route, asked with no login | Each screen sends the visitor to Log in. Each route answers 401 or 404 |
| A write that names a different site as its origin | Refused with 403 |

4.5 The cost of those 9 hosted messages was 14 cents. The first message of a conversation costs 3 cents and each later message costs 1 to 2 cents.

## 5. What it does not do

5.1 No voice, no Guided Life session, no reminder, no message sent outside the screen, no payment.

5.2 No Time figure, no Report, no Review, no agent console for the test. A proposal is decided on the File screen by the founder, who holds the agent's part in this test.

5.3 No folder other than Time has a record of its own.

5.4 The Morning Plan and Daily Close are not sent by software. The resident starts each conversation.

5.5 A follow up for the agent reaches no person. The step that tells a person is not built.

5.6 The model's replies are checked for a hyphen and a dash after they are written. The other clauses of the Language Standard are given to the model as instructions and are not checked by code.

5.7 The Clear my test data button clears no row yet. The database tool asks the founder to confirm each statement that holds a delete, and the function that clears the test holds one. The function is installed when the founder confirms it. Until then the button states that the function is not installed. For the same reason the rows of Dana and Marcus stay in the schema.

5.8 The founder's own login was not used in a check. The screens were checked with no login, and the server was checked with the made up residents.

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
| The database connection did not verify the database's certificate | Fixed. The authority's certificate is set and the connection is verified. The certificate was taken from the first connection. It was not compared with a second published copy |
| The database functions read the caller's search path | Fixed. Each function reads this schema and the built in catalog alone |
| The database login can call the functions in `public` that every visitor of the site can call | Open. The grant is to every role in the database, so the login gains no reach that a visitor lacks. Closing it changes `public` |
| The working role could attach the history function to a table of its own | Fixed |
| Rules that held only in code | Fixed. Updates reach named columns, and the database decides who may decide a proposal |

## 7. Taking the test out to study it

7.1 The Activity screen holds two downloads. Each holds the whole test for the login that asks: every message word for word, every File entry with the words it rests on, every change with what the entry said before, every action the server took with its result, and the model, tokens, and cost of each reply.

7.2 One download is a JSON file for a tool to read. Its format name is `universe-city-founder-test-export-1`. The other is a plain text file that reads from top to bottom.

7.3 The address is `/api/pilot/export`, and `/api/pilot/export?format=text` for the text file. It answers only the resident who is logged in, and only with that resident's rows.

## 8. Removing the test

8.1 Close pull request 19 and delete the branch.

8.2 Run the three statements at the top of `supabase/pilot/0001_founder_test.sql`.

8.3 Delete the Netlify variables whose names start with `PILOT_`.
