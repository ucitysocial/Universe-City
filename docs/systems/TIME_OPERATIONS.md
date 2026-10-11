# Folder 01 Time Operations

Department I, Agency Assessment. Systems operations. Version 1, October 11, 2026. How the Time system runs: fields, states, views, queries, permissions, and contact.

## 1. About this document

1.1 This is one of five documents for this folder. `docs/systems/TIME.md` states what the folder is. This document states how the system runs. It is read by a developer.

1.2 A version of this document was written on August 29, 2026. That version was never filed. This file is a new document. It does not reconstruct the August 29 version.

1.3 Each part below carries one of two marks. Defined means `TIME.md` states it or the repository already holds it. To define means no decision is on file.

1.4 No implementation shall assume an answer to a part marked To define.

1.5 Where this document and `TIME.md` disagree, `TIME.md` governs. `LANGUAGE_STANDARD.md` governs the wording of both.

1.6 A change to this document is entered in `docs/systems/TIME_DEVELOPMENTS.md` with the date and the reason.

## 2. Fields

### 2.1 The block. Defined and built.

2.1.1 The `blocks` table holds one row for each block. Migration `0001_init.sql` created it.

| Field | Permitted values | Rule |
| :-- | :-- | :-- |
| `date` | A calendar date | The day the block starts on |
| `starts_at` | A local time, as hours and minutes | Kept as local time in the client's timezone |
| `ends_at` | A local time, or empty | A value past midnight belongs to the day the block started on |
| `label` | Text | Required |
| `kind` | One of eleven kinds | Listed in 2.1.2 |
| `status` | One of five statuses | Listed in 2.1.3 |
| `paid` | paid, unpaid, none | `TIME.md` 3.2.3 |
| `cost_of` | Another block, or empty | `TIME.md` 3.2.4 |
| `source` | resident, agent, ai | Who wrote the row. The database sets it. The writer cannot choose it |
| `note` | Text, or empty | The first Plan keeps its answers here |

2.1.2 The eleven kinds in the code: sleep, getting ready, travel, paid work, unpaid work time, household time, caring for people, appointments, time with people, rest and leisure, and time on what you are building.

2.1.3 The five statuses in the code: observed, required, planned, suggested, and estimated. `TIME.md` section 3.2 holds two pairs of values. `TIME.md` item 15.3 is open on which set holds. This document changes neither set until that item is decided.

### 2.2 The commitment. Defined and not built.

2.2.1 `TIME.md` 3.3 states the fields: a label, the block the commitment is planned in, the five conditions, and the four outcome fields.

| Outcome field | Permitted values |
| :-- | :-- |
| Execution | planned, executed, partly executed, did not happen |
| Timing | as planned, changed, not established |
| Consequences | reported, none confirmed, not established |
| Alternative | used or not used, and which alternative |

2.2.2 To define: the table that holds a commitment, the form each of the five conditions is stored in, and the link from a commitment to its block.

### 2.3 The follow up. Defined and not built.

2.3.1 `TIME.md` 3.4 states the four fields: the owner, the next action, the conversation or commitment the follow up came from, and a status of open or closed.

2.3.2 To define: the table that holds a follow up.

### 2.4 Ongoing work. Defined and not built.

2.4.1 `TIME.md` 3.5 states the fields: a label, the recurrence the client stated, and a link to each commitment and follow up inside it.

2.4.2 To define: the table that holds ongoing work, and the form a recurrence is stored in.

### 2.5 The Plan. Defined and built in part.

2.5.1 `TIME.md` 5.3.1 defines the Plan. The first Plan is built. It saves each planned commitment as a block with the status planned.

2.5.2 To define: whether a Plan is stored as its own entry, and how a confirmed Plan is told apart from an unconfirmed one.

## 3. States and transitions

3.1 Block correction. Defined and built. A change to a block writes the earlier version to `block_revisions`. A row in `block_revisions` cannot be edited or deleted.

3.2 Execution. Defined in `TIME.md` 3.3.6 and 3.6.6. A commitment starts as planned. It moves to executed, partly executed, or did not happen when the client reports the outcome or evidence on file proves it.

3.3 To define: whether a partly executed commitment can later move to executed, and what is filed when it does.

3.4 Follow up. Defined in `TIME.md` 5.7.6. A follow up is open until its requirement is met. Then it is closed.

3.5 Proposal. Defined and built. A proposal holds one of five states: proposed, confirmed, rejected, superseded, or edited. `ARCHITECTURE.md` states who can move a proposal from one state to the next.

3.6 To define: the path by which software files a proposal. Today only an agent can create one.

## 4. Views

4.1 The week view. Defined and built. It shows one row for each day and four figures: observed hours, estimated hours, unaccounted hours, and the hours that were the client's.

4.2 The first Plan. Defined and built. It asks five questions in order. `TIME.md` 14.2.5 lists them.

4.3 To define: the day view, the month view, editing a block by hand, the Plan with the outcome of each commitment, and the list of open follow ups.

4.4 To define: the agent console view of commitments, follow ups, ongoing work, and proposals for one client.

## 5. Queries

5.1 `TIME.md` section 12 lists seventeen questions. Each question needs one query. `LANGUAGE_STANDARD.md` 8.4.4 requires the two lists to match.

5.2 The week view already calculates the figures behind `TIME.md` 12.10 and 12.16. No query answers a question in plain language yet.

5.3 To define: the data each of the seventeen queries reads.

## 6. Action permissions

6.1 Defined in `TIME.md` 5.6. Three acts are kept separate: preparation, authorized execution, and approval of a permanent change to the client's file.

6.2 Defined. Software can carry out an action a standing permission covers, with no person releasing it. The action is filed with who carried it out and which permission covered it.

6.3 Defined. A person is required in the four cases in `TIME.md` 5.6.6. The client's decision is required in the six cases in `TIME.md` 5.6.7.

6.4 Four routine actions were named when the rule was set on October 11, 2026: keeping a recurrence the client agreed to, placing established work on the schedule in available time, updating the schedule when a commitment changes, and notifying the client.

6.5 To define: the full list of standing permissions and the actions each one covers.

6.6 To define: the words the client reads when granting a standing permission, and how the client withdraws one.

6.7 To define: what counts as available time when work is placed on the schedule.

6.8 To define: how a person is brought in for the four cases in `TIME.md` 5.6.6, and what the client sees while that person decides.

6.9 To define: retry rules for an automatic action that fails, and what is filed when it fails.

## 7. Contact

7.1 Defined in `TIME.md` 5.4. Contact has three origins: client requested, permitted automatic, and agent initiated.

7.2 Defined. Contact takes place at three points in the day: the Morning Plan, during the day, and Daily Close. Four kinds of message are sent during the day.

7.3 Defined. The client chooses how much contact they receive and when. Five factors govern each contact. `TIME.md` 5.4.10 lists them.

7.4 Defined. A message that software sent under a standing permission is shown as an automated Universe City message. Software never signs as the agent.

7.5 Built in part. The first Plan asks how the agent follows up and offers four choices: none, before, after, and both. It also asks what time Daily Close goes on the Plan. Both answers are saved with the blocks of that Plan.

7.6 To define: the full set of contact settings and the setting a new client starts with.

7.7 To define: the delivery methods. No Time message is built today.

7.8 To define: the timing rules for the Morning Plan and for a reminder before a commitment.

7.9 To define: the hours in which no message is sent.

7.10 To define: the exact label the client sees on an automated message.

## 8. Asking less

8.1 Defined in `TIME.md` 7.15 to 7.17. A planned commitment gets a question when one of seven conditions is true. The seven rest on five factors. No fixed count of matching outcomes applies.

8.2 To define: the criteria by which a commitment is treated as established.

8.3 To define: what returns an established commitment to regular questions.

## 9. Further items to define

9.1 What is filed when a client reports a purchase amount while Finance is not operational.

9.2 How Integrity reads commitments and outcomes from Time. `TIME.md` 4.4.7 rules that Integrity holds no second copy.

9.3 The rule for two commitments that compete for the same time, after the client has decided which one holds.

9.4 The fields of a Morning Plan message.

Governed by `LANGUAGE_STANDARD.md`, section 8.4, for composition.
