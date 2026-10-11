# Enrollment audit

**Status:** FINDINGS, October 10, 2026

This file answers one question. Can the database and the application, as they stand, support the Agency Assessment conversation described in `RESIDENT_INTERFACE.md`?

It was written by reading the migrations in `supabase/migrations/`, the live database, and the code in `app/`, `components/`, and `lib/`.

---

## The four questions

### 1. Can the current structure hold the agent's progression list?

No.

The database has no place for an assessment question, for a Start selection, for a Target selection, or for the date of either. It has no place for what is known and what is missing in a folder. The agent console shows a weekly brief and nothing about coverage.

### 2. Can one piece of information belong to several folders?

No.

`entries.folder` and `statements.folder` each hold one folder name. A resident who mentions a job, a commute, and rent in one message produces one row with one folder.

### 3. Are the resident's own words preserved?

In part.

`statements.said` and `entries.said_verbatim` exist to hold exact words. No table holds a conversation. A message the resident sends has nowhere to be stored, and a reply has nowhere to be stored. No code writes to `statements` or `entries` today. The brief reads `statements` and that is the only use.

### 4. How does proposed information become part of the File?

The gate exists. The path through it does not.

`proposals` holds a proposed change with a state: proposed, confirmed, rejected, superseded, or edited. Database triggers stop a resident from approving a proposal about themselves and force the recorded origin to be true. The security tests cover both.

Three parts are missing. Only an agent can create a proposal, so software has no way to file one. No code applies a confirmed proposal to the table it names. The resident has no screen where a proposal can be confirmed.

---

## What is already solid

- **Origin is enforced by the database.** Every block and entry records whether a resident, an agent, or software wrote it, and a resident cannot claim a different origin.
- **Corrections keep history.** A changed block writes the earlier version to `block_revisions`, and that table cannot be edited or deleted.
- **One resident cannot read another.** Row security is on every table and is tested.

---

## What exists outside the repository

The Time curriculum is written. It is in Google Drive as `Folder 01 Time Curriculum`, Version 1, August 28, 2026.

It contains the twelve Time questions. Each question has ten written Start options and ten written Target options, and a table stating what the agent does at each Start band and how often the agent asks.

| No. | Question | What it measures |
| --- | --- | --- |
| 1 | Sleep | When you sleep and for how long |
| 2 | Getting ready | The time between waking and leaving |
| 3 | Travel | Time spent moving between places |
| 4 | Paid work | Hours you are paid for |
| 5 | Unpaid work time | Prep, staying late, and recovery after |
| 6 | Household time | Cooking, cleaning, errands, and admin |
| 7 | Caring for people | Time given to the people who rely on you |
| 8 | Appointments | Scheduled obligations you have to attend |
| 9 | Time with people | Social time you chose |
| 10 | Rest and leisure | Time spent on yourself |
| 11 | Time on what you are building | Your own work, projects, and goals |
| 12 | Control over your week | How much of the week you can move |

This is the progression list for Time. Each question is one piece the agent is trying to place, and the ten options are the places it can go.

The other eleven Agency Assessment folders have no curriculum. A search of Drive found one for Time only.

---

## What the first complete interaction needs

Listed in the order the work depends on.

1. **A place for the conversation.** Messages, each with who sent it: the resident, the agent, or software.
2. **The questions as data.** The twelve Time questions and their options, taken from the curriculum word for word.
3. **A place for selections.** Start, Target, the date of each, and which message produced each.
4. **Folder tags on statements.** One statement, more than one folder.
5. **Coverage.** For each question: placed, partly known, or missing. The progression list is this, read in order.
6. **A way for software to propose.** A server side path that can file a proposal marked as written by software.
7. **The question picker.** Given coverage and the last message, it names the one missing piece the next question is for. A reply that names no missing piece is not sent.
8. **The resident screen.** The conversation, with a choice of written options when a question is ready to be placed.
9. **The agent console panel.** The progression list, the statements behind each placement, and the next question with its purpose.

---

## Decisions this work is waiting on

- **Who the resident sees as the sender.** `LANGUAGE_STANDARD.md` clause 3.11 says the agent is a person and software is never called the agent. The examples label the conversation "Your agent." If software writes the replies, that label breaks the clause.
- **What finishes Enrollment.** OQ-025 is open. With one curriculum written, the choice is between finishing on Time alone and writing the other eleven first.
- **Payment timing.** OQ-026 is open and decides whether Enrollment sits before or after payment.
