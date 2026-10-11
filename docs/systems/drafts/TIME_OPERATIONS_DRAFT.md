# Folder 01 Time Operations

> **Draft. This file is not in force.** It is Version 2 of Folder 01 Time Operations, filed on October 11, 2026 beside the document it would revise. The document in force is `docs/systems/TIME_OPERATIONS.md`, Version 1. The founder has not approved it. `README.md` in this folder states how the drafts are read.

Department I, Agency Assessment. Systems operations. Version 2, October 11, 2026. How the Time system runs: data, states, views, queries, permissions, contact, workflows, tests, and build status.

## 1. About this document

1.1 This is one of five documents for this folder. `docs/systems/TIME.md` states what the folder is. This document states how the system runs. It is read by a developer.

1.2 A version of this document was written on August 29, 2026. That version was never filed. This file is a new document. It does not reconstruct the August 29 version.

1.3 Each part below carries one of four marks. Version 1 used two marks, Defined and To define. Version 2 replaces To define with Proposed and Open, so that each undecided part states what is needed to decide it.

| Mark | Meaning | What a developer can do with it |
| :-- | :-- | :-- |
| Built | The repository holds it. It was checked against the code on October 11, 2026 | Rely on it. Section 20 names the file |
| Defined | `TIME.md` or a different governing document states it | Build it as stated |
| Proposed | A technical proposal made by this document. It rests on a governing rule that is named. It is approved by no one yet | Review it. Build it only after the approval named in the part |
| Open | A decision is missing. The part names who decides and what the decision needs. Where the governing documents support one, it gives a recommendation and the reason | Wait for the decision |

1.4 No implementation shall assume an answer to a part marked Open. No migration shall be applied from a part marked Proposed until it is approved.

1.5 Where this document and `TIME.md` disagree, `TIME.md` governs. `LANGUAGE_STANDARD.md` governs the wording of both.

1.6 A change to this document is entered in `docs/systems/TIME_DEVELOPMENTS.md` with the date and the reason.

1.7 Sections 10 to 15 were added on October 11, 2026. They cover the step, recommendations, the guide, and Guided Life. No part of them is built.

1.8 Version 2 is dated October 11, 2026. It develops Version 1 in place. Each clause of Version 1 keeps its number. Sections 16 to 20 and the two appendixes are new.

1.9 What Built means here. The code was read at commit `0dbbeac`. The four migration files were run in a local test database, and the behavior of the tables was tested there. The Universe City database was read for its list of tables and its row counts. It holds no block and no Time entry on October 11, 2026.

1.10 What Proposed means here. Appendix A holds the proposed tables as a migration. It was applied on top of the four migrations in the local test database. Fifty seven rule checks and thirty three query checks ran against it and passed. Section 19 lists each one. Appendix A has been applied to no Universe City database. Five fields in it carry a recommendation that is still open, so that the whole could be tested. Clause A.4 lists them.

1.11 Section 20 lists the parts that block building. Three are foundational: the table that holds a commitment, the stored form of a Plan, and the stored form of the schedule. No code for a commitment, a Plan outcome, Daily Close, or Guided Life can be written before they are approved.

1.12 This document says client. The database stores the word `resident`. Both name one person. `LANGUAGE_STANDARD.md` rules which word a reader sees.

1.13 This document specifies how Time uses the File. The File, the session, identity, memory, and permissions of the platform belong to their own documents. Section 15 lists what Time needs from each one.

## 2. Fields

### 2.1 The block. Defined and built.

2.1.1 The `blocks` table holds one row for each block. Migration `0001_init.sql` created it.

| Field | Type | Required | Default | Permitted values and rule |
| :-- | :-- | :-- | :-- | :-- |
| `id` | uuid | Yes | Generated | The identifier of the block. It is never shown to a client |
| `user_id` | uuid | Yes | None | The client the block belongs to |
| `date` | date | Yes | None | The day the block starts on, in the client's timezone |
| `starts_at` | text, hours and minutes | Yes | None | Kept as local time in the client's timezone |
| `ends_at` | text, hours and minutes | No | Empty | A value past midnight belongs to the day the block started on. Empty means the end is not established |
| `label` | text | Yes | None | The client's own words for the period |
| `kind` | text | Yes | None | One of eleven kinds. Listed in 2.1.2 |
| `status` | `uc_block_status` | Yes | estimated | One of five statuses. Listed in 2.1.3 |
| `paid` | `uc_paid` | Yes | none | paid, unpaid, none. `TIME.md` 3.2.3 |
| `cost_of` | uuid of a block | No | Empty | `TIME.md` 3.2.4. Clause 2.1.15 |
| `source` | `uc_source` | Yes | resident | Who wrote the row: resident, agent, ai. The database forces it for a client. Clause 2.1.17 |
| `note` | text | No | Empty | The first Plan keeps its answers here. Clause 2.1.14 |
| `created_at`, `updated_at` | timestamp | Yes | The current moment | Set by the database |

2.1.2 The eleven kinds in the code: sleep, getting ready, travel, paid work, unpaid work time, household time, caring for people, appointments, time with people, rest and leisure, and time on what you are building.

| Stored code | Label in `lib/domain/time.ts` | Class | Department color |
| :-- | :-- | :-- | :-- |
| `sleep` | Sleep | necessary | I |
| `getting_ready` | Getting ready | necessary | I |
| `travel` | Travel | necessary | II |
| `paid_work` | Paid work | committed | III |
| `unpaid_work` | Unpaid work time | committed | III |
| `household` | Household time | committed | II |
| `caring` | Caring for people | committed | IV |
| `appointment` | Appointments | committed | I |
| `people` | Time with people | free | IV |
| `rest` | Rest and leisure | free | IV |
| `building` | Time on what you are building | free | IV |

2.1.3 The five statuses in the code: observed, required, planned, suggested, and estimated. `TIME.md` section 3.2 holds two pairs of values: observed or estimated, and planned or done.

2.1.4 Proposed: one set of block statuses for the specification and the code. `TIME.md` 3.6.1 files every future period as estimated. The code holds required, planned, and suggested for a future block. The reconciliation was assigned to this document on October 11, 2026. Neither set changes until it is decided.

2.1.4.1 The two pairs of `TIME.md` 3.2 produce three cases. `TIME.md` 3.6.1 rules out the fourth: a planned block is never observed. `TIME.md` 3.6.7 names the same three: planned, estimated, and observed.

| `TIME.md` 3.2.5 | `TIME.md` 3.2.2 | Stored status | Meaning |
| :-- | :-- | :-- | :-- |
| Planned | Estimated, by 3.6.1 | `planned` | The period has not taken place |
| Done | Estimated | `estimated` | The period took place, or takes place in a usual week, and the time is a guess or a usual amount |
| Done | Observed | `observed` | The period took place and the client stated the time |
| Planned | Observed | Never stored | `TIME.md` 3.6.1 |

2.1.4.2 The two further statuses in the code each hold a fact that belongs to a different field.

| Status in the code | What it holds | Where the fact belongs |
| :-- | :-- | :-- |
| `required` | A planned block that another party fixed | Status `planned`. The Timing condition of the commitment holds that the time cannot move. Clause 2.2.7 |
| `suggested` | A block that software placed and the client has not adopted | No block. Software files a recommendation under section 11 or a proposal under 3.5. `ARCHITECTURE.md` rule 1 |

2.1.4.3 The enumerated type keeps its five values. No value is removed from the database. The code stops writing `required` and `suggested`. The table holds no row today, so no row is converted.

2.1.4.4 Approval: the founder. On approval the ruling is entered in `TIME.md` 3.2 and 14.5.1, and the comment and the map in `lib/domain/time.ts` are changed to match.

2.1.5 Defined. Guided Life adds no block status. A duration that software measured is filed as estimated, with software as its source. It becomes observed only when the client confirms it. `TIME.md` 3.6.9. No status named reported exists. A reported entry is an entry that rests on the client's statement. Clause 2.2.14 states where a measured time is held.

2.1.6 Validation. Built: the database checks no format. The test database accepted a start of `9am`, an end of `25:99`, and a kind that does not exist. Proposed: three checks. The start matches hours 00 to 23 and minutes 00 to 59. The end matches hours 00 to 47 and is later than the start. The kind is one of the eleven. Appendix A, part 3.

2.1.7 An empty end. Built. The database lets a block have no end. A block with no end counts for zero hours in every figure, and the week view draws it one hour wide. `TIME.md` 3.2.1 gives a block a start, an end, and a label. Open: whether a block can be filed with no end. Recommendation: it can. An empty end means the end is not established, as `ARCHITECTURE.md` rule 4 reads an empty value. The block counts for no hours, each figure states how many such blocks it left out, and the agent asks for the end. Clause 5.4.5. Decided by: the founder, entered in `TIME.md` 3.2.1.

2.1.8 Past midnight. Built. A block that runs from 11:00 PM to 7:00 AM is stored with an end of `31:00` on the day it started. `ARCHITECTURE.md`, section on timezone. Each calculation in section 5 keeps that block whole.

2.1.9 Overlap. Built: two blocks can cover the same minutes, and `figures()` adds both. Proposed: a calculation counts a minute once. Clause 5.4.4. The schedule keeps both blocks, since two commitments can compete for one time until the client decides. `TIME.md` 7.7.

2.1.10 Who creates a block.

| Writer | What is built | Rule |
| :-- | :-- | :-- |
| The client | The first Plan writes blocks with the status planned. No further screen writes a block | `TIME.md` 2.9 and 5.8.1 |
| The agent | The database permits an agent to add and change a block. No screen exists | The agent files what the client stated. Clause 2.1.13 |
| Software | The service role can write a block with the source `ai`. No code does | Only under 6.2, from a schedule item or a standing permission |

2.1.11 Correction. Built. A change to a block writes the earlier version and the later version to `block_revisions`, with who made it and whether that writer was the client, the agent, or software. The row cannot be edited or deleted. Built gap: the column `reason` exists and the database never fills it. The test database confirmed an empty reason on each revision. Proposed: the trigger fills the reason, and the table gains five fields that the trigger also fills: the basis, its reference, the statement, the session, and which software wrote the change. Appendix A, part 3. Test T-BLK-09. Section 15, requirement SR-2.

2.1.12 Removal. Built, and out of step with `TIME.md` 5.8.1. The access matrix in `ARCHITECTURE.md` lets a client delete the client's own block. `TIME.md` 5.8.1 keeps every change on file. The test database showed three behaviors.

| What the client does | What the database does today | What is lost |
| :-- | :-- | :-- |
| Deletes a block that was never changed | The row is deleted | The block. No history of it remains |
| Deletes a block that was changed once | The delete fails with an error about history | Nothing. The client cannot remove the block |
| Deletes a shift that has a travel block | Both rows are deleted | Both blocks |

2.1.12.1 Proposed: a block is taken off the schedule and stays on file. Two fields are added: `removed_at` and `removed_reason`. A removed block appears in no view of the schedule and counts in no figure. It stays readable in the history. The policy that lets a client delete a block is withdrawn. Approval: `ARCHITECTURE.md`, requirement SR-3, since the access matrix is its own and the same question applies to every table the client owns.

2.1.13 Observed. Defined in `TIME.md` 3.6.1 and 3.6.2. Built gap: the test database let a client mark a block on a future date as observed. Proposed: the database refuses the status observed on a block that has not started, by the client's own date and clock. An agent and software mark a block observed only with the client's statement of what happened. The statement the block was first filed with does not serve. Appendix A, part 3. Tests T-BLK-03, T-BLK-07, and T-BLK-08.

2.1.14 The `note` field. Built. The first Plan stores its answers as text in the note of each block it writes: `plan`, `confidence`, `followup`, `progress`, and, on the Daily Close block, `universe_city`. Proposed: the answers move to the Plan in 2.5 and to the settings in 7.6. The note returns to plain text.

2.1.15 Cost of. Built: `cost_of` points from one block to a second block. `TIME.md` 3.2.4 states that the cost belongs to a commitment. Proposed: the field stays. A cost block points to the block its commitment is planned in, and the commitment is reached through 2.2.6. Where that block holds more than one commitment, the cost is reported once, for the block.

2.1.16 Proposed: five fields are added to the block. `schedule_item_id` names the recurring item the block was made from. `occurs_on` holds the day of the occurrence the block was made for, and a move does not change it. `statement_id` names the client's statement the block rests on. `removed_at` is described in 2.1.12.1. `driving` holds that the client stated the period is spent driving. `TIME.md` 5.12.8.

2.1.17 Who wrote the row. Built for a client alone. A client's write is stored as `resident` whatever it names. An agent can name `agent` or `resident` and is refused `ai`. A write that names no source is stored as `resident`, for an agent and for the service role. The test database confirmed both. `ARCHITECTURE.md` states that only the service role records `ai`. It does not state that an agent's write is always stored as `agent`. Proposed: the database sets the source from the writer, for every writer. A client's write reads `resident`, an agent's reads `agent`, and the service role's reads `ai`. No writer can name a different one. Tests T-SRC-01 and T-SRC-02. The same rule is needed for every File table. Requirement SR-16.

### 2.2 The commitment. Defined, with a proposed table. Not built.

2.2.1 `TIME.md` 3.3 states the fields: a label, the block the commitment is planned in, the five conditions, and the four outcome fields.

| Outcome field | Permitted values |
| :-- | :-- |
| Execution | planned, executed, partly executed, did not happen |
| Timing | as planned, changed, not established |
| Consequences | reported, none confirmed, not established |
| Alternative | used or not used, and which alternative |

2.2.2 Proposed: the table that holds a commitment, the form each of the five conditions is stored in, and the link from a commitment to its block. This part is the first foundational blocker. Section 20, B1.

2.2.2.1 One table, `commitments`, holds one row for each commitment. One commitment is one intended execution. A commitment that recurs has one row for each occurrence.

2.2.2.2 The five conditions are stored in two forms. A condition with one value is a field on the row. A condition with more than one value is a row in a table of its own, since each value has its own source and its own history.

| Condition | Stored as | Clause |
| :-- | :-- | :-- |
| Timing | Nine fields on the commitment | 2.2.7 |
| Completion | Two fields on the commitment, and one row for each step in `commitment_steps` | 2.2.8 and 2.2.3 |
| Consequences | One row for each consequence in `commitment_consequences` | 2.2.9 |
| Standards | One field on the commitment, and one row for each minimum in `commitment_standards` | 2.2.10 |
| Follow through | One row for each action in `commitment_follow_through` | 2.2.11 |

2.2.2.3 The link to the block is the field `block_id`. It is empty while the commitment has no time. `TIME.md` 4.3. One block can hold more than one commitment. `TIME.md` 5.11.6.

2.2.2.4 The block holds where the commitment is placed. The Timing condition holds what the client requires. The two are separate facts. Groceries that have to happen by Friday can be placed on Wednesday at 5:00 PM.

2.2.2.5 Approval: the founder, after the review of this proposal against `ARCHITECTURE.md`. On approval Appendix A, parts 5 and 6, becomes a migration file, and this clause is marked Defined.

2.2.3 The step. Defined and not built. `TIME.md` 3.3.13 to 3.3.21 state it. A step is a named part of the Completion condition. It is not a fifth kind of entry.

| Step field | Type | Required | Default | Permitted values and rule |
| :-- | :-- | :-- | :-- | :-- |
| `label` | text | Yes | None | The name of the step |
| `position` | whole number | Yes | None | The order among the steps of one commitment. Two live steps never share a position |
| `state` | `uc_step_state` | Yes | open | open, reported done, not needed. The client sets it |
| `state_at` | timestamp | When the state is not open | Empty | The moment the report was received. It is not the time the step was done |
| `state_statement_id` | uuid | When an agent or software files the report | Empty | The statement the report rests on. The statement the step was named in is held apart, in `statement_id` |
| `suggested` | yes or no | Yes | No | A suggested step counts for no outcome until the client accepts it |
| `suggested_by` | text | No | Empty | The folder that proposed it, or the guide |
| `accepted_at` | timestamp | No | Empty | The moment the client accepted a suggested step |
| `planned_minutes` | whole number | No | Empty | Open. Clause 10.8 |
| `removed_at` | timestamp | No | Empty | The step was taken off the commitment. The row stays |

2.2.4 Defined. One further fact is held for each commitment that has steps: whether the client stated that the steps are the whole of the Completion condition. The field is `steps_are_whole`. Empty means the client has not stated it.

2.2.5 Proposed: how the steps are stored with the Completion condition, and what is kept when a step is reported, changed, or removed. Each step is one row in `commitment_steps`, linked to its commitment.

| Event | What is written | What is kept |
| :-- | :-- | :-- |
| The client reports a step done | `state` and `state_at` on the step | The earlier row, in the revision history |
| The client marks a step not needed | `state` and `state_at` on the step | The earlier row |
| A label or a position is changed | The field on the step | The earlier row |
| The client accepts a suggested step | `accepted_at` | The earlier row |
| A step is removed | `removed_at` | The whole step. It leaves every count |

2.2.5.1 Proposed rule held by the database. Where `steps_are_whole` is yes and no live step is open, the commitment is filed as executed in the same transaction. `TIME.md` 3.3.16. Timing is filed as not established, since the client reported no time. The rule runs in the database, so it holds on a screen, in typed conversation, and in voice. It runs when a step changes, and when the client states that the steps are the whole after the steps were reported. Tests T-STP-02 and T-STP-05.

2.2.5.2 A suggested step that the client has not accepted cannot be reported and is left out of the count. Tests T-STP-03 and T-STP-04.

2.2.5.3 The client sets the state of a step. `TIME.md` 3.3.14. An agent and software file the client's report only with the statement of that report. The statement the step was named in does not serve. The same holds when an agent or software files that the steps are the whole. Tests T-STP-06 and T-STP-07.

2.2.6 Proposed. Identity and links of a commitment.

| Field | Type | Required | Default | Rule |
| :-- | :-- | :-- | :-- | :-- |
| `id` | uuid | Yes | Generated | The identifier. Never shown to a client |
| `user_id` | uuid | Yes | None | The client |
| `label` | text | Yes | None | The action, in the client's words. Not empty |
| `block_id` | uuid of a block | No | Empty | The block the commitment is planned in |
| `schedule_item_id` | uuid | No | Empty | The recurring item that produced this occurrence |
| `occurs_on` | date | With a recurring item | Empty | The day of this occurrence. One commitment for one recurring item on one day |
| `ongoing_work_id` | uuid | No | Empty | The ongoing work it belongs to |
| `continues_id` | uuid of a commitment | No | Empty | The earlier commitment whose remaining work this one carries. Clause 3.3 |
| `origin_folder` | text | No | Empty | The folder that produced the action. Empty means Time. `TIME.md` 4.4.1 |
| `basis` | `uc_basis` | Yes | resident decision | The authorization that `TIME.md` 3.3.4 requires: the client's decision, a standing permission, an alternative agreed in advance, or a recurrence the client stated |
| `basis_ref` | uuid | No | Empty | The permission, the alternative, or the schedule item |
| `source` | `uc_source` | Yes | Set from the writer | Who wrote the row. Clause 2.1.17 |
| `statement_id` | uuid | When an agent or software files a commitment the client decided | Empty | The client's statement the commitment came from. Requirement SR-1. Test T-COM-02 |

2.2.7 Proposed. The Timing condition. Each field is empty until the client states it. An empty field means not established.

| Field | Type | Meaning |
| :-- | :-- | :-- |
| `required_date` | date | The date the commitment has to happen on |
| `required_start` | text, hours and minutes | The time it has to start |
| `deadline_date`, `deadline_time` | date, text | The latest moment it can be finished |
| `duration_minutes` | whole number above zero | How long the client says it takes |
| `movable` | yes, no, or empty | No means the time cannot move. This field replaces the block status `required` |
| `latest_date`, `latest_time` | date, text | How far the client says it can move |
| `travel_needed` | yes, no, or empty | No means the client stated that no travel is needed. `TIME.md` 7.9 |

2.2.8 Proposed. The Completion condition. `completion_said` holds what the client says must happen, in the client's words. `steps_are_whole` is described in 2.2.4. The steps are described in 2.2.3.

2.2.9 Proposed. The Consequences condition. Each consequence is one row in `commitment_consequences`.

| Field | Type | Rule |
| :-- | :-- | :-- |
| `kind` | text | `expected` or `reported`. The two never share a row. `TIME.md` 3.6.5 |
| `said` | text | What the client said would be affected, or was affected |
| `affects_commitment_id` | uuid | The commitment that is affected, where the client named one |
| `affects_standard_id` | uuid | The minimum that is affected, where the client named one |
| `source`, `statement_id` | | Who wrote the row, and the statement it rests on |

2.2.9.1 An expected consequence changes no outcome field. A reported consequence sets the outcome field Consequences to reported. The database holds both rules. Test T-CON-01. A consequence the client reports after the outcome was filed is accepted with no correction. `TIME.md` 3.3.2. Test T-CON-02.

2.2.10 Proposed. The Standards condition. `standards_apply` has three values. Empty means not established. No means the client stated that no minimum applies. Yes means `commitment_standards` lists each minimum, as a link to the `standards` table. Time holds the link. Time never holds the wording of a minimum. `TIME.md` 4.4.4.

2.2.11 Proposed. The Follow through condition. Each required action is one row in `commitment_follow_through`.

| Field | Type | Rule |
| :-- | :-- | :-- |
| `action` | text | The action required after the commitment is executed |
| `owner` | `uc_role` | resident or agent |
| `due_said`, `due_date` | text, date | The timing as the client stated it, and the date where one is established |
| `ongoing_work_id` | uuid | The ongoing work the action belongs to |
| `result_commitment_id` | uuid | The commitment that was made from this action, once it is on the schedule |
| `result_follow_up_id` | uuid | The follow up that was opened for this action |

2.2.11.1 A row with no result is remaining work that has not been handled. Query 5.7 reads it.

2.2.12 Proposed. Four contact fields on a commitment. `important` and `accountability` hold two of the seven conditions in `TIME.md` 7.15. `reminder_minutes` holds a reminder for this commitment alone. Empty means the client's usual setting applies. `speak_label` set to no means the label is never spoken. `TIME.md` 5.12.12.

2.2.13 Proposed. The four outcome fields, as stored.

| Field | Type | Default | Rule |
| :-- | :-- | :-- | :-- |
| `execution` | `uc_execution` | planned | planned, executed, partly executed, did not happen |
| `timing_outcome` | `uc_timing_outcome` | Empty | Empty while Execution is planned and when the commitment did not happen. Otherwise as planned, changed, or not established |
| `actual_date`, `actual_start`, `actual_end` | date, text, text | Empty | The time the client reported. Never later than the client's current date |
| `consequences` | `uc_consequences` | not established | reported, none confirmed, not established. Never empty |
| `alternative_id` | uuid | Empty | The agreed alternative the client used. Empty means none was used |
| `outcome_basis` | text | Empty | `resident_report` or `evidence`. Required once Execution leaves planned. `TIME.md` 3.6.6 |
| `outcome_at` | timestamp | Empty | The moment the outcome was filed |
| `outcome_statement_id` | uuid | Empty | The statement the outcome rests on. Required when an agent or software files the client's report |
| `outcome_evidence_table`, `outcome_evidence_id` | text, uuid | Empty | The entry that proves the outcome. Required with the basis `evidence`. The same form `proposals` uses for its target, until requirement SR-6 is decided |

2.2.14 Proposed. A time that software measured. `measured_start` and `measured_end` hold the moment a guided session started on the commitment and the moment the last step was reported. Both are estimated by rule. Neither is copied to the actual time or to the block until the client confirms it. `TIME.md` 3.6.9.

2.2.15 Open. A commitment the client takes off the Plan before any outcome. `TIME.md` 5.10.2 lets a commitment be taken off the day's Plan. `TIME.md` 3.3.6 gives Execution four values, and none of them fits. Did not happen would be read by Integrity as a commitment the client did not keep. Recommendation: no fifth value. The commitment keeps Execution planned and carries two fields, `withdrawn_at` and `withdrawn_basis`. A withdrawn commitment takes no outcome and is left out of every outcome count. Reason: a decision made in advance is a change. It is separate from an outcome. Decided by: the founder, entered in `TIME.md` 3.3. Appendix A carries the two fields so that the rule could be tested. They change if the ruling differs.

2.2.16 Proposed. An alternative agreed in advance is one row in `commitment_alternatives`, with what the client said the alternative is. Software never writes one. `TIME.md` 3.3.10 and 5.13.3.

2.2.17 Proposed. The rules the database holds for a commitment. Each one holds in every form of the system.

| Rule | Source | Test |
| :-- | :-- | :-- |
| A new commitment has Execution planned and Consequences not established | `TIME.md` 3.3.6, 3.3.8 | T-COM-01 |
| An agent and software file a commitment the client decided only with the statement | `TIME.md` 3.6.4 | T-COM-02 |
| An outcome needs its basis, the moment it was filed, and a Timing value | `TIME.md` 3.6.6 | T-OUT-01 |
| No outcome carries a date after the client's current date | `TIME.md` 3.6.1 | T-OUT-02 |
| Execution on file changes only as a correction that states its reason | Clause 3.3. Clause 3.19 | T-OUT-03, T-OUT-04 |
| Did not happen carries no Timing value | `TIME.md` 11.6.8 | T-OUT-05 |
| As planned needs a planned block | `TIME.md` 3.3.7 | T-OUT-06 |
| Evidence names the entry that proves the outcome | `TIME.md` 3.6.6, 8.9 | T-OUT-07 |
| A time or a consequence the client states later is filed with no correction. Taking one back is a correction | `TIME.md` 3.3.2, 3.3.8. Clause 3.11.2 | T-OUT-08, T-CON-02 |
| An agent and software file what the client said later only with its statement. A write that changes no outcome field is not held to this | Clause 3.11.2 | T-CON-03 |
| A withdrawn commitment takes no outcome | Clause 2.2.15 | T-WDR-01 |
| An agent and software file the client's report of an outcome only with the statement it rests on | `TIME.md` 3.6.4, 3.6.10 | T-SW-01, T-SW-02 |
| One commitment for one recurring item on one day | Clause 2.6.4 | T-SCH-03 |
| No row is deleted | Proposed. It extends `ARCHITECTURE.md` rule 6 | T-DEL-01 |

### 2.3 The follow up. Defined, with a proposed table. Not built.

2.3.1 `TIME.md` 3.4 states the four fields: the owner, the next action, the conversation or commitment the follow up came from, and a status of open or closed.

2.3.2 Proposed: the table that holds a follow up. One table, `follow_ups`, holds one row for each follow up.

| Field | Type | Required | Default | Rule |
| :-- | :-- | :-- | :-- | :-- |
| `owner` | `uc_role` | Yes | None | resident or agent. `TIME.md` 3.4.2 |
| `need` | text | Yes | None | One of the four kinds in `TIME.md` 3.4.1: information, confirmation, resident action, agent action |
| `next_action` | text | Yes | None | The action, in one sentence. Not empty |
| `from_commitment_id` | uuid | One of three | Empty | The commitment it came from |
| `from_statement_id` | uuid | One of three | Empty | The statement in the conversation it came from |
| `from_session_id` | uuid | One of three | Empty | The session it came from. Requirement SR-4 |
| `ongoing_work_id` | uuid | No | Empty | The ongoing work it belongs to |
| `folder` | text | No | Empty | The folder the follow up concerns |
| `person_reason` | text | No | Empty | Which of the four cases in `TIME.md` 5.6.6 brought a person in |
| `due_date` | date | No | Empty | The date the action is needed by, where one is established |
| `status` | text | Yes | open | open or closed |
| `closed_at`, `closed_basis` | timestamp, text | Both, when closed | Empty | When the requirement was met, and what met it. Test T-FUP-03 |
| `asked_at` | timestamp | No | Empty | The last time the client was asked. Clause 2.3.5 |

2.3.3 A follow up names where it came from. The database refuses a follow up with no commitment, no statement, and no session. Test T-FUP-01.

2.3.4 Proposed. A client can close a follow up the client owns. A client cannot close a follow up the agent owns, and cannot change who owns one. Tests T-FUP-01 and T-FUP-02.

2.3.5 Proposed. The agent asks about an open follow up once at each contact where it is due. `asked_at` holds the last time. The same question is not sent twice inside one contact. `docs/product/AGENT_OPERATING_ARCHITECTURE.md`, agent execution rules.

### 2.4 Ongoing work. Defined, with a proposed table. Not built.

2.4.1 `TIME.md` 3.5 states the fields: a label, the recurrence the client stated, and a link to each commitment and follow up inside it.

2.4.2 Proposed: the table that holds ongoing work, and the form a recurrence is stored in. One table, `ongoing_work`, holds one row for each continuing responsibility.

| Field | Type | Required | Rule |
| :-- | :-- | :-- | :-- |
| `label` | text | Yes | The name of the responsibility |
| `recurrence_said` | text | No | The recurrence in the client's words. Empty means not stated |
| `folder` | text | No | The folder that owns the subject. Empty means Time alone |
| `ended_at` | timestamp | No | Empty means active |

2.4.2.1 The links run from the commitment and from the follow up to the ongoing work. Each carries `ongoing_work_id`.

2.4.2.2 The recurrence is stored in two forms that are never mixed. `recurrence_said` on the ongoing work keeps the client's words. The rule that software runs is held once, on the schedule item in 2.6. One place holds the rule, so two copies can never disagree.

### 2.5 The Plan. Defined, built in part, with a proposed table.

2.5.1 `TIME.md` 5.3.1 defines the Plan. The first Plan is built. It saves each planned commitment as a block with the status planned.

2.5.2 Proposed: a Plan is stored as its own entry, and a confirmed Plan is told apart from an unconfirmed one by one field. This part is the second foundational blocker. Section 20, B2.

2.5.2.1 One table, `plans`, holds one row for one client on one day. A second table, `plan_items`, holds one row for each commitment on that Plan.

2.5.2.2 A Plan is confirmed when `confirmed_at` holds a moment. An empty `confirmed_at` means the client has not confirmed it. `TIME.md` 5.3.1 and 10.3.

2.5.2.3 The database sets who confirmed. A client confirms directly. An agent and software can file a confirmation only with the client's statement attached. A confirmation on file is never overwritten. Tests T-PLN-01 and T-PLN-02.

2.5.2.4 Reason for two tables. A commitment can sit on Monday's Plan, be moved, and sit on Tuesday's Plan. The Plan of each day has to stay readable as it was. Question 12.3 asks what was planned and what happened. A single date on the commitment would lose Monday.

2.5.2.5 Approval: the founder, with 2.2.2. Appendix A, part 7.

2.5.3 Proposed. The fields of a Plan.

| Field | Type | Required | Rule |
| :-- | :-- | :-- | :-- |
| `date` | date | Yes | The day. One Plan for one client on one day. Test T-PLN-03 |
| `prepared_at` | timestamp | Yes | The moment the row was written |
| `confirmed_at` | timestamp | No | Clause 2.5.2.2 |
| `confirmed_source` | `uc_source` | With a confirmation | Set by the database |
| `confirmed_statement_id` | uuid | When an agent or software files it | The client's statement |
| `realism` | text | No | very, mostly, ambitious, unlikely. The four values the first Plan already offers. `TIME.md` 5.3.3 |
| `daily_close_at` | text, hours and minutes | No | The time of Daily Close on this day. `TIME.md` 5.3.4. It starts as the client's usual time in 7.6 and can differ on one day |
| `closed_at` | timestamp | No | The moment Daily Close for this day was completed. `TIME.md` 10.5 |
| `went_as_planned` | yes, no, or empty | No | The client's answer to the first question of Daily Close. Clause 9.5 |
| `closed_statement_id` | uuid | No | The statement that answer rests on |

2.5.4 Proposed. The fields of an item on a Plan.

| Field | Type | Required | Rule |
| :-- | :-- | :-- | :-- |
| `plan_id`, `commitment_id` | uuid | Yes | One row for one commitment on one Plan |
| `position` | whole number | No | The order. Empty means the Plan holds no order for it |
| `planned_start`, `planned_end` | text | No | The planned time when the item joined the Plan. It stays after the block moves |
| `state` | text | Yes | on, moved, taken off. Default on |
| `state_at`, `basis`, `basis_ref` | | When the state is not on | The moment, and which of the three cases in `TIME.md` 5.10.5 the change rests on. Test T-PLN-04 |
| `moved_to` | uuid of a plan item | No | The item on the later Plan |

2.5.5 Built today, and what the proposal changes. The first Plan writes blocks alone. It writes no Plan row and no commitment. The client presses a button labeled This is the Plan, and that press is the client's confirmation. Proposed: the same press writes one `plans` row with `confirmed_at`, one commitment for each item, and one plan item for each commitment.

2.5.6 Proposed. Changes after confirmation. A confirmation is made once. A commitment added later carries its own moment, and query 5.5 marks it as added after confirmation. A change during the day carries its own basis under `TIME.md` 5.10.5. No second confirmation is requested.

2.5.7 Realism. Built: when the client calls the first Plan a little ambitious or unlikely, the screen shows a note and saves the Plan. `TIME.md` 5.3.3 requires that an unlikely Plan is simplified or moved before it is saved. Proposed: with the answer unlikely, the save button is replaced by one question that asks which commitment moves or comes off. After the change the realism question is asked again.

2.5.8 Daily Close on the Plan. Built: the first Plan writes Daily Close as a block of the kind `building`, labeled with the name of the program. Its hours count as the client's own time once observed. Open: the kind of block for time with Universe City. Recommendation: one further kind, `universe_city`, in the class committed. Reason: `TIME.md` 5.3.4 places time with Universe City on the Plan, and the eleven kinds hold no kind for it. Approval: the founder, entered in `TIME.md` 3.2 and in the Schedule intake of the Curriculum.

### 2.6 The schedule. Defined, with a proposed table. Not built.

2.6.1 `TIME.md` 5.3.2 defines the schedule as the recurring structure of the client's week. Built: no table holds a recurring structure. A block has one date. The week view shows the blocks of the current week. This part is the third foundational blocker. Section 20, B3.

2.6.2 Proposed: one table, `schedule_items`, holds one row for each recurring item of the client's week.

| Field | Type | Required | Rule |
| :-- | :-- | :-- | :-- |
| `label`, `kind`, `paid` | text, text, `uc_paid` | Yes | The same three facts a block holds |
| `starts_at`, `ends_at` | text | No | Empty for recurring work that has no set time. `TIME.md` 4.3 |
| `recurrence` | text | Yes | The rule software runs. Clause 2.6.3 |
| `recurrence_said` | text | No | The recurrence in the client's words |
| `is_commitment` | yes or no | Yes | No for a cost, and for hours that carry no commitment |
| `movable` | yes, no, or empty | No | Copied to the Timing condition of each occurrence. Curriculum 18.5.2 |
| `driving` | yes, no, or empty | No | Copied to each block. `TIME.md` 5.12.8 |
| `times_known_ahead_said` | text | No | How far ahead the client learns the times. Curriculum 18.8.3 asked for this field |
| `cost_of` | uuid of a schedule item | No | The recurring commitment this item is a cost of |
| `ongoing_work_id` | uuid | No | The ongoing work it belongs to |
| `effective_from`, `effective_to` | date | From is required | The period the item applies to. A change to the week closes one item and opens the next |

2.6.3 Proposed: the form of a recurrence. The rule is text in the recurrence format of the calendar standard RFC 5545, limited to five parts: a frequency of daily, weekly, or monthly, an interval, days of the week, a day of the month, and an end date. The database refuses text outside that subset. Test T-SCH-01. Reason: the format is the one calendar software already reads, it is compact, and published libraries turn it into dates and into words. A prototype has to confirm one library before approval. Section 20, B3.

2.6.4 Proposed: how a day is made from the schedule. A schedule item is always estimated, since it describes a usual week. `TIME.md` 3.2.2.

| Moment | What software does | What is written |
| :-- | :-- | :-- |
| A day with no Plan is displayed | Reads the schedule items that fall on that day | Nothing. The view is derived, as `ARCHITECTURE.md` rule 3 requires for a brief |
| The Plan of a day is confirmed, or a day comes due for an item the client stated | Writes one block for each item that has a time. Writes one commitment and one Plan item where the item is a commitment. An item with no time gives a commitment with no block. `TIME.md` 4.3 | Each row carries the basis recurrence, with the schedule item as its reference, and the day in `occurs_on`. Where the client's confirmation wrote the rows, they are written in the same transaction under the client's session and read `resident`. Where software wrote them when the day came due, they read `ai` |
| The same day is made twice | The database refuses the second block and the second commitment | Nothing. Tests T-SCH-02 and T-SCH-03 |
| The client took a block of that day off, and the day is made again | The database refuses the block | Nothing. A block that was taken off still holds its place. Test T-SCH-02 |
| The client moved a block to the next day, and either day is made again | The database refuses the occurrence that was moved, and writes the next day's own occurrence | The moved block keeps the day it was made for, in `occurs_on`. Test T-SCH-04 |

2.6.5 Proposed. The recurrence the client stated is the authorization for each occurrence. `TIME.md` 3.3.4 and 7.6. No further permission is requested.

2.6.6 A change to the week. The client says the shift no longer falls on Tuesday. The item for the old week receives an `effective_to` date. A new item is written with an `effective_from` date. Both stay on file. A question about a past week reads the item that applied then.

2.6.7 A stated schedule does not override repeated outcomes. `TIME.md` 5.3.2. Where the outcomes of an item differ from it in the way 8.2 defines, software prepares a change to the item for the agent. The client decides. `TIME.md` 9.4.

### 2.7 Rules for every Time table

2.7.1 Each rule below is built for `blocks` and proposed for each new table.

| Subject | Rule | Status |
| :-- | :-- | :-- |
| Identifier | A generated uuid. It carries no meaning and is never shown to a client | Built pattern |
| Owner | `user_id` names the client. A client reads only the client's own rows. An agent reads every client | Built pattern. Test T-ACC-01 |
| Who wrote it | `source` is set by the database from the writer. A client's write is `resident`. An agent's write is `agent`. The service role's write is `ai` | Built for a client alone. Proposed for every writer. Clause 2.1.17 |
| The statement it rests on | `statement_id` names the client's statement | Proposed. Requirement SR-1 |
| A moment | A timestamp with its timezone | Built pattern |
| A planned time | A local date and a local time as text, in the client's timezone | Built. `ARCHITECTURE.md` |
| Unknown | An empty field means not established. Zero and no are confirmed values | Built rule. `ARCHITECTURE.md` rule 4 |
| Change | Each change writes the earlier and the later row to an immutable history | Built for blocks. Proposed for each Time table that can change. A lesson delivery is written once and never changes. Requirement SR-2 |
| Removal | No row is deleted. A row is ended, withdrawn, or taken off | Proposed. Requirement SR-3 |

2.7.2 Proposed. How nine conditions of information stay apart. No single field carries two of them.

| Condition of the information | How it is stored | One case |
| :-- | :-- | :-- |
| Unknown | The field is empty | `movable` is empty: no one has stated whether the time can move |
| Stated by the client | The value, with the source `resident` or with the client's statement attached | `completion_said` holds the client's words |
| Estimated | Block status `estimated`, or a measured time on the commitment | Getting ready, usually one hour |
| Observed or confirmed | Block status `observed`. An outcome with its basis. A Plan with `confirmed_at` | The shift ended at 5:40 PM |
| Proposed | A row in `proposals` with the state proposed. No entry has changed | Software read a statement as a new recurring shift |
| Recommended | A row in `recommendations` with no answer. No entry has changed | Move the groceries to tomorrow at 10:00 AM |
| Declined | The recommendation with the answer declined, or the proposal with the state rejected | The client declined the move |
| Partly completed | Execution `partly_executed`. It never becomes executed | The shopping was started and was not finished |
| Withdrawn | `withdrawn_at` on the commitment, and the plan item taken off | The client took the gym off the Plan |

### 2.8 Stored codes and the words a reader sees

2.8.1 Built pattern. `lib/domain/time.ts` holds one map from each stored code to its words: `STATUSES` and `KINDS`. The week view prints no stored code. The agent's pages print three stored codes as they are: the origin of a proposal, the kind of a proposal, and the residency state.

2.8.2 Proposed: one map for each new code, in the same file, read by every view, by every message, and by the guide. No view prints a stored code. One place holds the words, so a screen and a spoken sentence cannot differ.

2.8.3 The words a client reads are client copy. Client copy is approved in `TIME.md` and exists nowhere else. `TIME.md` 1.6. The column for the client below holds the words of the questions in `TIME.md` 6.5 where they exist. Each word marked new waits for approval. Developments, work register.

| Field | Stored code | Words for the agent | Words for the client |
| :-- | :-- | :-- | :-- |
| Execution | `planned` | Planned | Planned |
| Execution | `executed` | Executed | Happened |
| Execution | `partly_executed` | Partly executed | Partly happened. New |
| Execution | `did_not_happen` | Did not happen | Did not happen |
| Timing | `as_planned` | As planned | At the planned time. New |
| Timing | `changed` | Changed | At a different time. New |
| Timing | `not_established` | Not established | Time not on file. New |
| Consequences | `reported` | Reported | The client's own words for the consequence |
| Consequences | `none_confirmed` | None confirmed | No other commitment affected. New |
| Consequences | `not_established` | Not established | Nothing is shown |
| Step | `open`, `reported_done`, `not_needed` | Open, reported done, not needed | Open, done, not needed. New |
| Follow up | `open`, `closed` | Open, closed | Open, closed |
| Block status | `planned`, `estimated`, `observed` | Planned, estimated, observed | Planned, estimated, observed |
| Source | `resident`, `agent`, `ai` | Client, agent, software | You, your agent, automated |

2.8.4 The map `STATUSES` in the code holds five sentences for the five block statuses. Two of them speak as we. They are replaced when 2.1.4 is approved.

## 3. States and transitions

3.1 Block correction. Defined and built. A change to a block writes the earlier version to `block_revisions`. A row in `block_revisions` cannot be edited or deleted.

3.2 Execution. Defined in `TIME.md` 3.3.6 and 3.6.6. A commitment starts as planned. It moves to executed, partly executed, or did not happen when the client reports the outcome or evidence on file proves it.

3.3 Proposed: a partly executed commitment does not later move to executed. `TIME.md` 11.6.6 states that a partly executed commitment stays on file as partly executed and is never filed as executed. This document reads that clause to cover a later finish as well. The remaining part is a new commitment whose `continues_id` names the first one. Where the client states that the earlier report was wrong, the outcome is corrected under 3.19, with the reason, and both values stay in the history. Tests T-OUT-03 and T-OUT-04. Decided by: the founder, entered in `TIME.md` 11.6.6, since the clause can also be read to allow the same commitment to be finished later.

3.4 Follow up. Defined in `TIME.md` 5.7.6. A follow up is open until its requirement is met. Then it is closed.

3.5 Proposal. Defined and built. A proposal holds one of five states: proposed, confirmed, rejected, superseded, or edited. `ARCHITECTURE.md` states who can move a proposal from one state to the next.

3.6 The path by which software files a proposal. Built in the database: the service role can write a row to `proposals`, and the row carries the origin `ai`. The test database confirmed it. A client cannot write a proposal. Only an agent can decide one. Not built: no server code writes a proposal, no code applies a confirmed proposal to its target, and the agent console shows the words Approve, Edit, Reject as text with no action behind them. Section 15, requirement SR-7.

3.7 Step. Defined in `TIME.md` 3.3.14. A step starts as open. The client moves it to reported done or to not needed. An open step is never moved to missed.

3.8 Execution during a guided session. Defined in `TIME.md` 3.3.20. Execution stays planned while the commitment is carried out. No value named in progress exists.

3.9 Proposed. The transitions of a block status, under 2.1.4.

| From | To | What causes it | Who can file it | What is kept |
| :-- | :-- | :-- | :-- | :-- |
| New | planned | A period that has not taken place is placed | The client. The agent. Software, from a schedule item or under a permission | The row, with its source |
| New | estimated | The client describes a past period as usual or as a guess. `TIME.md` 6.11 | The client. The agent, with the statement | The row |
| New | observed | The client states what happened | The client. The agent and software, with the statement | The row |
| planned | observed | The client reports the time the period took place | The same three | A revision with the planned time |
| planned | estimated | The client reports that it happened and gives no time | The same three | A revision |
| estimated | observed | The client states the actual figure. `TIME.md` 7.12 | The same three | A revision |
| planned, estimated, observed | Taken off | The client takes the block off. Its only commitment did not happen or was withdrawn. Clause 3.9.1 | The client. The agent and software, with a basis | `removed_at`, and a revision |
| observed | planned or estimated | A correction: the earlier entry was wrong | The client. The agent, with the statement | A revision with the reason |
| Each status | observed, on a future date | Never | No one | Refused. Test T-BLK-03 |

3.9.1 A move changes the date and the times of the same block. One block keeps one history. The client can take a block off at any time. Software takes a block off in two cases: the one commitment in it did not happen, or the one commitment in it was withdrawn. A block that holds a second live commitment stays. A cost block follows its commitment under `update_schedule`. Clause 6.5.

3.10 Proposed. The transitions of Execution.

| From | To | What causes it | Evidence required | What else is filed |
| :-- | :-- | :-- | :-- | :-- |
| planned | executed | The client reports it, on a screen, in typed conversation, or in voice | The client's own write, or the statement | Timing, the actual time where reported, and each consequence reported |
| planned | executed | Each live step is reported done or not needed, and the steps were stated as the whole | The step reports | Timing not established |
| planned | executed | Evidence on file proves it. `TIME.md` 3.6.6 | The entry that proves it, in `outcome_evidence_table` and `outcome_evidence_id`. Requirement SR-6 | The basis `evidence`. Test T-OUT-07 |
| planned | partly executed | The client reports that a part happened | The same | The agent asks whether the remaining part is still required. `TIME.md` 7.4 |
| planned | did not happen | The client reports it | The same | No Timing value. The block is taken off under 3.9.1. The agent asks whether the work is still required, and the client decides. `TIME.md` 7.4 |
| planned | planned, withdrawn | The client takes it off the Plan. Clause 2.2.15 | One of the three cases in `TIME.md` 5.10.5 | The plan item is taken off |
| executed, partly executed, did not happen | A different value | A correction alone | The reason, and the statement | A revision with both values |
| planned | Any outcome | Silence, elapsed time, a timer, a call, a session | None of these is evidence. `TIME.md` 8.9 | Nothing changes |

3.11 Proposed. How Timing and Consequences are set when Execution leaves planned.

| Field | Value | When |
| :-- | :-- | :-- |
| Timing | as planned | The client states that it happened at the planned time, or reports a start equal to the planned start |
| Timing | changed | The client reports a time that differs from the planned start. The actual time is filed |
| Timing | not established | The client reports the outcome and gives no time |
| Consequences | reported | The client says what was affected. One row for each consequence |
| Consequences | none confirmed | The client says that no commitment and no condition was affected |
| Consequences | not established | Every other case. It is never read as none confirmed. `TIME.md` 3.3.9 |

3.11.1 A changed time carries no judgment. Two minutes of difference is filed as changed. `TIME.md` 11.6.5.

3.11.2 A time or a consequence the client states after the outcome was filed. `TIME.md` 3.3.2 and 11.6.11. Timing moves from not established to as planned or to changed with no correction. Consequences moves from not established to either value, and from none confirmed to reported, with no correction. Every other change to the two fields is a correction under 3.19. Tests T-OUT-08 and T-CON-02.

3.12 Proposed. The transitions of a step.

| From | To | Who | Rule |
| :-- | :-- | :-- | :-- |
| open | reported done | The client | Files the moment of the report |
| open | not needed | The client | Counts as closed for 2.2.5.1 |
| reported done, not needed | open | The client | A correction. The revision keeps the earlier state |
| suggested and waiting for the client | accepted | The client | Only then can it be reported |
| Each state | removed | The client. The agent, with the client's decision | The row stays |
| open | missed | No one | The state does not exist. `TIME.md` 3.3.19 |

3.13 Proposed. The transitions of a follow up.

| From | To | Who | Rule |
| :-- | :-- | :-- | :-- |
| New | open | The client, the agent, software in step four of `TIME.md` 5.5 | It names where it came from |
| open | closed | The owner. The agent can close each one | `closed_basis` states what met the requirement |
| closed | open | The agent, as a correction | A revision keeps the closing |

3.14 Proposed. The transitions of a Plan and of an item on it.

| Entry | From | To | Who | Rule |
| :-- | :-- | :-- | :-- | :-- |
| Plan | Absent | Prepared | The client or the agent by hand. Software for a recurrence the client stated | No confirmation yet |
| Plan | Prepared | Confirmed | The client. The agent or software with the client's statement | Made once. Never overwritten |
| Plan | Confirmed | Closed | Daily Close for that day is completed | `closed_at` is filed. The Plan stays confirmed |
| Plan item | on | moved | One of the three cases in `TIME.md` 5.10.5 | The basis is required. `moved_to` names the item on the later Plan |
| Plan item | on | taken off | The same three cases | The commitment is withdrawn under 2.2.15 |
| Plan item | moved, taken off | on | A correction | A revision |

3.15 Built. The transitions of a proposal, as the database holds them.

| From | To | Who | Rule |
| :-- | :-- | :-- | :-- |
| New | proposed | An agent. The service role | A client's write is refused |
| proposed | confirmed, edited, rejected, superseded | An agent alone | The database files who decided and when |

3.16 Proposed. A standing permission has two states: in force, and withdrawn. The client grants it and the client withdraws it. Software never grants one. An agent files one only with the client's statement. Tests T-PRM-01 and T-PRM-02. A withdrawal takes effect at once. An action already carried out stays on file with the permission that covered it.

3.17 Proposed. A recommendation has four states: made, accepted, changed, declined. The client moves it out of made. A recommendation in each state has changed no entry. Test T-REC-03. An accepted recommendation is carried out as the client's decision, by a separate write. A recommendation the client declined is not made again in the same conversation. The database refuses it. Test T-REC-02.

3.18 The states of a guided session are in 10.14.

3.19 Proposed. Change and correction are two acts.

| Act | Meaning | What it requires | Where it shows |
| :-- | :-- | :-- | :-- |
| Change | The fact was true and is now different. The gym moved to Thursday | A basis under `TIME.md` 5.10.5 | In the history, and in the answer to question 12.21 |
| Correction | The entry was wrong. The shift ended at 5:40 PM, and 5:00 PM was filed | The reason, and the client's statement | In the history, marked as a correction |

3.19.1 Both keep the earlier value. Neither deletes.

3.20 Proposed. The transitions of a schedule item.

| From | To | What causes it | Who | What is kept |
| :-- | :-- | :-- | :-- | :-- |
| None | In effect | The client states what comes back each week | The client. The agent and software, with the statement | The item, with the client's words for the recurrence |
| In effect | Changed | The client corrects a fact of the item: the time, the kind, paid or unpaid | The same | A revision |
| In effect | Ended | The week changes. The item receives an end date | The same | The item. A new item starts where the week now holds a different one. Clause 2.6.6 |
| In effect | A change put to the client | Outcomes differ from the item in the way 8.2 defines | Software prepares the comparison for the agent. The agent asks the client. The client decides. `TIME.md` 9.4 | A follow up owned by the agent, until the client answers. The item is unchanged until then. The client's answer is filed as a statement, and the item changes under the row above |

3.21 Proposed. The transitions of ongoing work.

| From | To | What causes it | Who | What is kept |
| :-- | :-- | :-- | :-- | :-- |
| None | Active | The client names a continuing responsibility, or a second folder produces one | The client. The agent and software, with the statement | The row |
| Active | Ended | The client states that the responsibility is over | The same | `ended_at`. Its commitments and follow ups stay |
| Active | Active | One commitment inside it is executed | No one changes the ongoing work | It stays active while a commitment or a follow up inside it is open. `TIME.md` 3.5.3 |

## 4. Views

4.1 The week view. Defined and built. It shows one row for each day and four figures: observed hours, estimated hours, unaccounted hours, and the hours that were the client's.

4.1.1 Built in `app/(resident)/portal/time/page.tsx`. The week runs Sunday to Saturday in the client's timezone. Each row is one day from midnight to midnight, with one colored bar for each block. The current day is outlined. A client with no block is sent to the first Plan.

4.1.2 How the four figures are calculated today, in `figures()`.

| Figure on the screen | What the code adds | Out of step with |
| :-- | :-- | :-- |
| Observed | Blocks with the status observed or required | `TIME.md` 3.6.1. A required block on a future date is counted as observed |
| Estimated | Blocks with the status planned, suggested, or estimated | Nothing |
| Unaccounted | 168, less the two figures above | Clause 2.1.9. Two blocks that overlap are added twice |
| Yours | Observed blocks of the kinds time with people, rest and leisure, and time on what you are building | Nothing. `TIME.md` 3.6.3 |

4.1.3 Built detail. The text that appears when the pointer rests on a bar prints a time as `9am`. `LANGUAGE_STANDARD.md` 6.15.1 requires `9:00 AM`. Developments, section 8.

4.2 The first Plan. Defined and built. It asks five questions in order. `TIME.md` 14.2.5 lists them.

4.2.1 Built in `components/FirstPlan.tsx`. The Plan is made for the day after the current day. It writes one block for each item, and one further block for Daily Close. Each block has the status planned. The kind paid work sets paid. The answers are stored in the note of each block. Clause 2.1.14.

4.2.2 Built detail. The home of the Resident Portal opens as soon as one block is on file. `TIME.md` 9.3 opens it when the first seven day schedule is on file and the first Plan is confirmed. The code checks for a block alone. Developments, section 8.

4.3 The day view, the month view, editing a block by hand, the Plan with the outcome of each commitment, and the list of open follow ups. Defined in `TIME.md` 5.8.1 and 14.3. Not built. Clause 4.7 states what each one displays.

4.4 The agent console view of commitments, follow ups, ongoing work, and proposals for one client. Proposed in 4.8. Built in part: the agent sees a brief for one client.

4.5 The opened block, with the commitments in it, their steps, and the entries from other folders linked to them. The view of one step. The summary at the end of a guided session. Proposed in 4.7. Not built.

4.6 The layout of the Resident Portal belongs to `docs/product/RESIDENT_INTERFACE.md`. This document specifies what a Time view displays. Section 15 lists the concern.

4.7 Proposed. What each view of the client displays.

| View | Displays | Reads | Status |
| :-- | :-- | :-- | :-- |
| Week | One row for each day. The four figures | `blocks` for seven days | Built |
| First Plan | Five questions. One save | Writes `blocks` | Built |
| Day | The blocks of one day in order of time. A day with no Plan shows the schedule items for that weekday, marked estimated. The Plan of that day beside it | `blocks`, `schedule_items`, `plans`, `plan_items` | Not built. `docs/product/RESIDENT_INTERFACE.md` names no day view yet |
| Month | One cell for each day, with the count of commitments and each appointment that cannot move | `plans`, `plan_items`, `commitments` | Not built |
| Editing by hand | Add, drag, resize, edit, and take off a block. Each change is filed with the client as its source | Writes `blocks`. Each change writes a revision | Not built |
| Plan with outcomes | Each commitment on the Plan, its planned time, and its four outcome fields in words. A commitment with no outcome shows no outcome on file | Query 5.5 | Not built |
| Open follow ups | Two lists: the client's and the agent's. Each with its next action and the commitment it came from | Query 5.10 | Not built |
| Opened block | The commitments in the block, the steps of each, the count of reported steps, and each linked entry from a different folder | `commitments`, `commitment_steps`, the links in section 14 | Not built |
| One step | One step, the commitment it belongs to, and four actions: done, more time, skip, not needed. The Plan returns when the client asks | Query 5.21 | Not built |
| Session summary | Five lists. Each line opens the entry it names. Clause 10.11 | The stored summary | Not built |
| Settings | Each contact setting, each Guided Life setting, and each standing permission in force with the date it was granted | `time_settings`, `standing_permissions` | Not built |
| History | Each change to the schedule, with what it was, what it became, who made it, and the reason | Query 5.24. Requirement SR-8 | Not built |

4.8 What the agent console displays for one client.

| Panel | Displays | Status |
| :-- | :-- | :-- |
| Clients and reviews | Each client with a case number and a residency state. Each review that is scheduled or open | Built. `app/(agent)/agent/page.tsx` |
| Brief | The changes since the last review. Five figures: observed, required, planned, estimated, unaccounted. Each estimated block that needs confirmation. Each changed block with its earlier and later time. Possible conflicts with a minimum. Each statement the client raised. Each open proposal. The last review | Built. `lib/brief.ts` builds it from the tables each time. `ARCHITECTURE.md` rule 3 |
| Proposals | Each open proposal with three actions | Built as text. The three actions do nothing. Requirement SR-7 |
| Commitments | The Plan of each day with the four outcome fields. Each commitment with an empty condition that 6.1 of `TIME.md` would ask for | Proposed |
| Follow ups | The agent's open follow ups for each client, by due date. Each one that brought a person in under `TIME.md` 5.6.6, with its reason | Proposed |
| Ongoing work | Each active responsibility with its recurrence in the client's words and its open commitments | Proposed |
| Permissions and automatic actions | Each standing permission in force. Each action software carried out, with the permission that covered it. Each action that failed | Proposed |
| Guide Mode | Section 12 | Proposed |

4.9 Proposed. Rules for every Time view.

4.9.1 Planned, estimated, and observed entries look different in every view. `TIME.md` 3.6.7.

4.9.2 Each time is printed with AM or PM. No view prints twenty four hour time. `TIME.md` 6.14.6. The stored form `31:00` is never printed.

4.9.3 Each entry that software wrote is marked as automated. Each change shows who made it. `TIME.md` 3.6.8.

4.9.4 A proposed change is shown as proposed. It is never drawn on the schedule as if it were filed. `TIME.md` 5.14.4.

4.9.5 The Resident Portal shows no internal classification, no confidence of extraction, and no checklist of facts taken from the conversation. The agent console holds those. `docs/product/RESIDENT_INTERFACE.md`.

## 5. Queries

5.1 `TIME.md` section 12 lists twenty questions, in clauses 12.2 to 12.21. Each question needs one query. `LANGUAGE_STANDARD.md` 8.4.4 requires the two lists to match. Version 1 of this document stated twenty one. The count was wrong. Developments, section 3.

5.2 The week view already calculates the figures behind `TIME.md` 12.10 and 12.16. No query answers a question in plain language yet.

5.3 Proposed: the data each of the twenty queries reads. Clauses 5.5 to 5.24 define them. Question 12.21 reads the history of the File, which this folder does not own. Requirement SR-2 and SR-8.

### 5.4 Rules for every query

5.4.1 Each answer is calculated from the tables. Software that words the answer supplies no figure, no time, and no entry. A transcript is never the source of a figure.

5.4.2 A day and a week are counted in the client's timezone. A week runs Sunday to Saturday. Built in `lib/domain/dates.ts`.

5.4.3 A block that was taken off is left out of every query except 5.24.

5.4.4 A minute that two blocks cover is counted once.

5.4.5 A block with no end is left out of each sum. The answer states how many blocks were left out.

5.4.6 Where a fact is not on file, the answer states that it is not on file. No query fills a gap with a usual value. `TIME.md` 8.6. An empty field is never read as zero. `ARCHITECTURE.md` rule 4.

5.4.7 A withdrawn commitment is listed as taken off the Plan. It is left out of every count of outcomes.

5.4.8 Each figure is given with its status: planned, estimated, or observed. Two statuses are never added into one figure. `TIME.md` 3.6.3.

5.4.9 The result of a query is a set of rows with stored codes. The words come from the map in 2.8. Each time is printed with AM or PM.

5.4.9.1 A day is read with the schedule. Where a recurring item falls on a day and no block is written for its occurrence yet, the item counts as an estimated period of that day. An item is read at the interval its rule holds, counted from the day it took effect. Queries 5.8, 5.15, and 5.16 read a day this way. Test Q-12.13c.

5.4.10 A client asks about the client's own file. The agent asks about each client. The guide asks within the level of speech the client selected. `TIME.md` 5.12.12.

5.4.11 Each query below was written as a reference query against the proposed tables and run in the local test database on one seeded week. Appendix B holds the reference queries. Section 19.9 holds the seeded week and each expected result. The repository calculates its week figures in TypeScript. The language of the final code is open, and the expected results stay the same in either language.

### 5.5 Did today go as planned? `TIME.md` 12.2

| Part | Definition |
| :-- | :-- |
| Reads | The `plans` row for the day. Its `plan_items`. Each `commitments` row. The live steps of each commitment |
| Calculation | One row for each item: the label, the planned time, the state on the Plan, Execution, Timing, Consequences, whether an alternative was used, the count of steps reported done, the count of steps not needed, the count of live steps, and whether the item was added after the Plan was confirmed. Then one count for each value of Execution |
| Answer | Yes only when each item on the Plan is executed with Timing as planned. In every other case the answer lists each item that differs, with its fields |
| Left out | A withdrawn commitment is listed apart, as taken off |
| Missing data | No Plan row: no Plan is on file for the day. A Plan with no confirmation: the Plan was not confirmed. A commitment with Execution planned: no outcome is on file. It is never worded as missed. `TIME.md` 8.9 |
| Status | Not built |
| Tests | Q-12.2a, Q-12.2b |

### 5.6 What did I plan this week, and what happened to each commitment? `TIME.md` 12.3

| Part | Definition |
| :-- | :-- |
| Reads | The same tables as 5.5, for seven days |
| Calculation | The rows of 5.5, grouped by day. One count for each pair of Execution and state on the Plan |
| Left out | Nothing. A moved item appears on the day it was planned, marked moved, and on the day it moved to |
| Missing data | A day with no Plan row is listed as a day with no Plan |
| Status | Not built |
| Tests | Q-12.3 |

### 5.7 What is still open from the commitments I already executed? `TIME.md` 12.4

| Part | Definition |
| :-- | :-- |
| Reads | `commitments` with Execution executed. `follow_ups`. `commitment_follow_through`. Commitments in the same ongoing work |
| Calculation | Three lists for each executed commitment: each open follow up that came from it, each Follow through action with no result, and each planned commitment in the same ongoing work |
| Left out | A closed follow up. A withdrawn commitment |
| Missing data | An executed commitment with no row in each of the three lists has no open work on file. The answer states that no open work is on file. It does not state that the work is finished |
| Status | Not built |
| Tests | Q-12.4 |

### 5.8 What is coming up, and what does each commitment need from me? `TIME.md` 12.5

| Part | Definition |
| :-- | :-- |
| Reads | `plans` and `plan_items` from the current day forward. `commitments`. `schedule_items`. Cost blocks of the kind travel. Open follow ups owned by the client |
| Calculation | Three lists in order of day and time. Each planned commitment on a Plan. Each dated commitment on a day with no Plan. Each recurring commitment of the schedule on a day with no Plan, marked estimated. Each one carries what it needs from the client: a time, where none is set. How the client is getting there, where no travel block exists and the client has not stated that none is needed. Each open follow up owned by the client. A Plan for that day, or its confirmation |
| Period | Proposed: the current day and the seven days after it. The client can name a different period |
| Left out | An executed commitment. A withdrawn commitment |
| Missing data | A day with no Plan is stated as a day with no Plan on file |
| Status | Not built |
| Tests | Q-12.5 |

### 5.9 What does it affect if I move this commitment? `TIME.md` 12.6

| Part | Definition |
| :-- | :-- |
| Reads | The commitment. Its expected consequences. The commitments those consequences name. Its cost blocks. Its linked minimums. Its Follow through actions. Where the client names a new time, query 5.15 for that time |
| Calculation | One list: whether the time can move and how far, the deadline, each expected consequence in the client's words, each commitment it affects, each cost block that moves with it, each minimum that applies, and each Follow through action |
| Left out | A reported consequence. It describes what happened on an earlier day |
| Missing data | Where no consequence is on file, the answer states that no consequence is on file for the commitment. It never states that moving it affects nothing. `TIME.md` 3.3.9 |
| Status | Not built |
| Tests | Q-12.6a, Q-12.6b |

### 5.10 Which follow ups are mine, and which are my agent's? `TIME.md` 12.7

| Part | Definition |
| :-- | :-- |
| Reads | `follow_ups` with the status open. The commitment each one came from |
| Calculation | Two lists by owner, each in order of due date, with the next action |
| Left out | A closed follow up |
| Missing data | A follow up with no due date is listed last |
| Status | Not built |
| Tests | Q-12.7 |

### 5.11 What do my other folders have on my schedule this week? `TIME.md` 12.8

| Part | Definition |
| :-- | :-- |
| Reads | `commitments` with a folder in `origin_folder`, with the Plan item or the block that gives each one a date |
| Calculation | Each such commitment in the week, grouped by folder, with its planned time and Execution |
| Left out | A withdrawn commitment. A commitment with no date |
| Missing data | A folder that is not operational has no row. The answer names only the folders that have a row |
| Status | Not built |
| Tests | Q-12.8 |

### 5.12 Which commitments keep changing, and what changed them? `TIME.md` 12.9

| Part | Definition |
| :-- | :-- |
| Reads | `plan_items`, `commitments`, `schedule_items`, `ongoing_work`, and the history of each |
| Calculation | Occurrences are grouped by the recurring item, then by the ongoing work, then by the commitment. An occurrence differed when its Plan item was moved or taken off, when Timing is changed, or when Execution is did not happen or partly executed. A group is listed when it differed more than once in the period. `TIME.md` 7.15 |
| What changed them | One row for each occurrence that differed: the day, what differed, the basis, and the reason in the history. Each reported consequence of that occurrence is read from 2.2.9 |
| Period | Proposed: the period defined in 8.2 |
| Left out | A group that differed once |
| Missing data | Where the history holds no reason, the answer states that the reason is not on file. The block history holds no reason today. Clause 2.1.11 |
| Status | Not built |
| Tests | Q-12.9a, Q-12.9b |

### 5.13 How many hours do I control this week, and where do they sit? `TIME.md` 12.10

| Part | Definition |
| :-- | :-- |
| Reads | `blocks` for seven days |
| Calculation | The minutes covered by observed blocks of the three free kinds, with each minute counted once. Then the same figure for each day |
| Left out | A planned block. An estimated block. `TIME.md` 3.6.3 |
| Missing data | The figure is given beside the observed hours and the unaccounted hours of the same week. Clause 9.6 |
| Status | Built in `figures()`, with overlapping blocks added twice. `figures()` was run on the blocks of the seeded week. It gives 14.0 hours, and the definition here gives 13.5 hours |
| Tests | Q-12.10 |

### 5.14 What is my longest unbroken block, and which day is it on? `TIME.md` 12.11

| Part | Definition |
| :-- | :-- |
| Reads | `blocks` for seven days |
| Calculation | Proposed: observed blocks of the three free kinds are joined where one ends at the minute the next starts or later. The longest joined run is the answer, with the day it starts on and its start time. A run can pass midnight |
| Left out | A planned block. An estimated block |
| Missing data | No observed free block: the answer states that no observed time of the client's own is on file for the week |
| Open point | `TIME.md` 2.4.5 names the figure and does not define it. The definition here reads it as the client's own time, as Version 3 did. Approval: the founder, entered in `TIME.md` 11.5 |
| Status | Not built. `TIME.md` 14.4.7 |
| Tests | Q-12.11 |

### 5.15 Can I take this shift and still keep the next day's commitments? `TIME.md` 12.12

| Part | Definition |
| :-- | :-- |
| Input | The date, the start, and the end of the shift. The travel each way, from a cost block of the same workplace or from the client's answer |
| Reads | Each period of that day and of the next day, read with the schedule under 5.4.9.1, and a block or an item of the day before that passes midnight. The commitment in each block and whether its time can move |
| Calculation | Each period that the shift and its travel overlap, with whether its time can move. Then the estimate of clause 9.7 before and after, once that clause is decided |
| Answer | The overlaps, and the two figures where 9.7 is decided. Software gives no yes and no no. The decision is the client's. The agent can recommend under section 11 |
| Left out | A block that was taken off |
| Missing data | Travel that is not on file is asked for. Hours of the two days with no block are stated as not on file. They are never treated as open. `TIME.md` 8.6 |
| Status | Not built |
| Tests | Q-12.12 |

### 5.16 When can I put this appointment? `TIME.md` 12.13

| Part | Definition |
| :-- | :-- |
| Input | The length of the appointment with its travel. The days and the hours the client or the other party allows |
| Reads | Each period of each day in the range, read with the schedule under 5.4.9.1, and a block or an item of the day before that passes midnight |
| Calculation | Each period inside the allowed hours that no block and no recurring item covers, and that is at least the required length |
| Answer | Each such period, worded as nothing is on file for that period. Where the client asks to use time a movable commitment holds, query 5.9 states what moving it affects |
| Left out | A period shorter than the required length |
| Missing data | A day with no block and no schedule item is stated as a day with nothing on file |
| Status | Not built |
| Tests | Q-12.13a, Q-12.13b, Q-12.13c |

### 5.17 What did that commitment really cost me once travel and recovery are counted? `TIME.md` 12.14

| Part | Definition |
| :-- | :-- |
| Reads | The block of the commitment. Each block whose `cost_of` names it |
| Calculation | The minutes of the commitment and the minutes of each cost, each with its kind, its status, and paid, unpaid, or neither. One total for each status |
| Left out | A cost block that was taken off |
| Missing data | A commitment with no cost block: no cost is on file. The answer does not state that the cost was zero |
| Limit | No hourly rate is calculated. `TIME.md` 8.5. Salary reads this result |
| Status | Not built |
| Tests | Q-12.14 |

### 5.18 Which day of mine is the most overloaded? `TIME.md` 12.15

| Part | Definition |
| :-- | :-- |
| Reads | `blocks` for seven days. The count of items on each Plan |
| Calculation | Open. `TIME.md` defines no measure for overloaded. Recommendation: for each day, the minutes in blocks of the class committed and in blocks of the kinds travel and getting ready, with a minute counted once. Three figures for each day, one for each status, and the count of commitments on the Plan. The three are never added. `TIME.md` 3.6.3 |
| Answer | The figures for each day. For a week that has passed, the day with the most observed minutes is named first. For a week to come, the day with the most planned minutes. The answer uses no word of judgment about a day. `TIME.md` 8.3 |
| Missing data | Days with the same figure are all named |
| Decided by | The founder, entered in `TIME.md` 12.15 |
| Status | Not built |
| Tests | Q-12.15 |

### 5.19 How many hours of last week are still unaccounted for? `TIME.md` 12.16

| Part | Definition |
| :-- | :-- |
| Reads | `blocks` for the seven days of the earlier week |
| Calculation | The minutes of the week, less the minutes that a block of any status covers, with each minute counted once. The minutes of the week are read from the client's timezone, so a week in which the clock changes holds 167 or 169 hours. A block is counted by its clock times |
| Left out | A block with no end. The count of such blocks is stated |
| Missing data | An hour with no block is unaccounted. It is never counted as the client's own. `TIME.md` 8.6 |
| Status | Built in `figures()` as 168 less the sum of every block. Two differences: overlapping blocks are added twice, and a week in which the clock changes is still counted as 168 hours. `figures()` was run on the blocks of the seeded week. It gives 91.0 hours, and the definition here gives 91.5 hours |
| Tests | Q-12.16a, Q-12.16b |

### 5.20 How long does getting ready actually take me, as opposed to what I assume? `TIME.md` 12.17

| Part | Definition |
| :-- | :-- |
| Reads | The schedule item of that kind. Each block of that kind in the period. The measured times of the commitments |
| Calculation | The assumed length from the schedule item. Each observed length. With three or more observed lengths: the shortest, the middle value, and the longest. The count and the middle value of the lengths software measured, stated apart |
| Left out | A planned block. An estimated block is counted apart. A time software measured is stated apart, as estimated |
| Missing data | No observed block: no observed time is on file for getting ready |
| Period | The four weeks before the current day, unless the client names a period |
| Scope | The query works for each kind of block and for each recurring item. Getting ready is the case `TIME.md` names |
| Status | Not built |
| Tests | Q-12.17 |

### 5.21 What is my next step? `TIME.md` 12.18

| Part | Definition |
| :-- | :-- |
| Reads | The Plan of the current day. Each planned commitment on it. The open live steps of each. The steps the client skipped in the current session |
| Calculation | The commitment is selected in this order: the one planned for the current time, then the next one by planned time, then one with no time set. Among commitments with no time set, the one with the earliest deadline comes first, then one with an expected consequence on file. The step is the first open step of that commitment by position. A suggested step the client has not accepted is passed over. A step the client skipped in the session is passed over and stays open |
| Answer | The step, the commitment, and the basis of the selection. Where the commitment has no step, the commitment alone |
| Left out | A commitment whose planned end has passed with no outcome on file. In a guided session on a commitment, that commitment stays the current one until the client reports it or leaves it |
| Missing data | No Plan for the day, or no planned commitment left: the answer states it and asks. `TIME.md` 5.10.7 |
| Status | Not built |
| Tests | Q-12.18a, Q-12.18b, Q-12.18c |

### 5.22 How much time do I have before I need to leave? `TIME.md` 12.19

| Part | Definition |
| :-- | :-- |
| Reads | The Plan of the current day. The next planned commitment whose time cannot move. Each cost block of that commitment that ends at or before its start |
| Calculation | The start of that commitment, less the minutes of those cost blocks, is the time to leave by. That time less the current time is the time left |
| Answer | The commitment, its start, the cost minutes with their status, the time to leave by, and the minutes left. `TIME.md` 5.12.6 |
| Missing data | No travel block and no statement that travel is not needed: the answer gives the time until the start, states that the travel time is not on file, and the question in `TIME.md` 7.9 is asked once. No later commitment that cannot move: the answer states that none is on file for the day |
| Status | Not built |
| Behind | Clause 10.7 compares the minutes left with the open work the Plan places before the time to leave |
| Tests | Q-12.19a, Q-12.19b, Q-12.19c, Q-12.19d, Q-12.19e |

### 5.23 What still fits before my next commitment? `TIME.md` 12.20

| Part | Definition |
| :-- | :-- |
| Reads | The result of 5.22. Each planned commitment of the day |
| Calculation | The free minutes are the minutes left, less the open work the Plan already places before the time to leave. Clause 10.7.1 defines that open work. A candidate is an open commitment with no time set, or one planned for later in the day whose time is not fixed. A candidate fits when its length is no more than the free minutes |
| Answer | The free minutes, and three lists: the candidates that fit, the ones that are longer, and the ones with no length on file |
| Left out | A cost block. The commitment that cannot move. A commitment the Plan places before the time to leave, since its time is already counted |
| Missing data | A candidate with no length is never placed in the list that fits. Where an open commitment before the time to leave has no length, the free minutes are not established |
| Status | Not built |
| Tests | Q-12.20a, Q-12.20b |

### 5.24 What changed on my schedule this week? `TIME.md` 12.21

| Part | Definition |
| :-- | :-- |
| Reads | `block_revisions`. The history of commitments, Plan items, schedule items, and Plans. Blocks added in the period |
| Calculation | One row for each field that changed: the entry, what it was, what it became, the moment, who made the change, the basis, and the reason |
| Left out | A change to a field that sets no time and no place on the schedule |
| Missing data | A change to a block carries no reason in the built database. The answer states that the reason is not on file. With the change proposed in 2.1.11, the reason is on file |
| Depends on | Requirement SR-2 for the history of the new tables. Requirement SR-8 for a history the client can read |
| Status | Built in part. The brief for the agent lists each changed block with its earlier and later time. No view for the client exists |
| Tests | Q-12.21 |

## 6. Action permissions

6.1 Defined in `TIME.md` 5.6. Three acts are kept separate: preparation, authorized execution, and approval of a permanent change to the client's file.

6.2 Defined. Software can carry out an action a standing permission covers, with no person releasing it. The action is filed with who carried it out and which permission covered it.

6.3 Defined. A person is required in the four cases in `TIME.md` 5.6.6. The client's decision is required in the six cases in `TIME.md` 5.6.7.

6.4 Four routine actions were named when the rule was set on October 11, 2026: keeping a recurrence the client agreed to, placing established work on the schedule in available time, updating the schedule when a commitment changes, and notifying the client.

6.5 Proposed: the list of standing permissions and the actions each one covers. The four routine actions in 6.4 are held in four places.

| Routine action in 6.4 | Held as | What it covers | What it never covers |
| :-- | :-- | :-- | :-- |
| Keeping a recurrence | The schedule item the client stated. Clause 2.6.5 | Writing each occurrence of that item | An item the client did not state |
| Placing established work | Standing permission `place_work` | Placing remaining work whose time is already on file. `TIME.md` 6.7 holds the question the client answers | Work with no time on file. A time that a live block already holds |
| Updating the schedule | Standing permission `update_schedule` | Moving or taking off the cost blocks of a commitment the client changed or reported | The time of a second commitment |
| Notifying the client | The contact settings in 7.6 | Sending a notice the client turned on | A message that asks for a reply |

6.5.1 A third standing permission, `behind_schedule`, holds a decision the client made ahead for a day on which the client is behind. Clause 6.11. It covers the order in which open work moves under `TIME.md` 5.13.2. It never covers two commitments that compete for the same time. `TIME.md` 5.6.7.

6.5.1.1 Each permission holds its limits in the field `scope`.

| Permission | What its scope holds |
| :-- | :-- |
| `place_work` | The ongoing work or the kinds of work it applies to. Each period the client named as available: a day of the week, a start, and an end |
| `update_schedule` | Nothing. It applies to the cost blocks of every commitment |
| `behind_schedule` | Two lists: what is protected, and what moves first, in order. Each entry names a recurring item, ongoing work, or a kind of block |

6.5.2 No standing permission covers the six cases in `TIME.md` 5.6.7, a proposal, a record to be voided, a message sent on the client's behalf, or a change the client cannot reverse. `TIME.md` 5.6.5 and 8.8.

6.5.3 A further kind of standing permission is added only by a ruling entered in `TIME.md` 5.6. The database refuses a kind outside the list.

6.5.4 Decided by: the founder. `TIME.md` 5.6.8 assigns this list to this document. On approval this clause is marked Defined.

6.6 The words the client reads when granting a standing permission, and how the client withdraws one.

6.6.1 Open, as client copy. `TIME.md` 6.7 holds one question, for `place_work`. Two questions are missing, for `update_schedule` and for `behind_schedule`. Each one names the action, names what it never covers, and states that the client can withdraw it at any time. Approval: the founder, entered in `TIME.md` 6.7. Developments, work register.

6.6.2 Proposed. Each grant stores which approved wording the client read, in `wording_version`. A later change to the wording does not change what an earlier grant covers.

6.6.3 Proposed. The client withdraws a permission in two ways: by saying so in any form, and in the settings view. The withdrawal is filed with its moment and with the statement.

6.7 Proposed: what counts as available time when work is placed on the schedule. A period is available when three facts hold. The time of the work is on file, or the client named the period in the scope of the permission. No live block covers a minute of it, counting a block that started the day before. The period ends at or before the deadline of the work. An hour with no block is not available by that fact alone. `TIME.md` 8.6. Where the three facts do not hold, software places no block and opens a follow up. Decided by: the founder. On approval this clause is marked Defined.

6.8 Proposed: how a person is brought in for the four cases in `TIME.md` 5.6.6, and what the client sees while that person decides.

| Step | What happens |
| :-- | :-- |
| One | Software stops the action. No entry changes |
| Two | A follow up owned by the agent is opened. `person_reason` holds which of the four cases applied. It names the commitment or the statement it came from |
| Three | The client is told that the agent has it, in one sentence. The words are client copy and are not written yet |
| Four | The agent decides, asks the client, or files a proposal. The follow up closes with what met it |

6.9 Proposed: retry rules for an automatic action that fails, and what is filed when it fails.

6.9.1 Each automatic action is one transaction. It either files every row or files none. A failed action leaves the file as it was.

6.9.2 Each automatic action carries a key made from the permission, the target entry, and the date. A second run with the same key writes nothing. The database already holds this pattern for payment events in `stripe_events`, with a status, a count of attempts, and the last error.

6.9.3 A failed action is tried three times in all. After the third failure a follow up owned by the agent is opened with the error. The client is sent no message about the failure.

6.9.4 The record of automatic actions and their attempts belongs to the platform. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` lists safe retry as an open decision. Requirement SR-10.

6.10 Defined in `TIME.md` 5.10.5. A change to the schedule or to a Plan is carried out in three cases only: a standing permission covers it, the client approved the alternative in advance, or the client decided it.

6.11 Proposed: how a client files a decision made ahead for being behind, under `TIME.md` 5.13.3.

| The decision applies to | Stored as | The client changes it by |
| :-- | :-- | :-- |
| One commitment. If I am late, the gym comes off | A row in `commitment_alternatives` for that commitment | Stating a new alternative. The earlier one stays in the history |
| Every day. When I am behind, household work moves first and the pickup never moves | A standing permission of the kind `behind_schedule`. Its scope holds two lists: what is protected, and what moves first, in order | Withdrawing it and granting a new one |

6.12 Proposed. Who starts, authorizes, approves, and carries out each act. C is the client. A is the agent. S is software.

| Act | Who can start it | What authorizes it | Who approves a permanent change | Who carries it out |
| :-- | :-- | :-- | :-- | :-- |
| File a block from what the client stated | C, A, S | The client's statement | No approval. It is the client's statement | The one who started it |
| Mark a block observed | C, A, S | The client's statement of what happened | No approval | C. A and S with the statement attached |
| Correct, move, or take off a block | C, A, S | The client's decision, an agreed alternative, or `update_schedule` for a cost block | No approval | The one who started it |
| State or change a recurring item of the week | C, A, S | The client's statement | No approval. A reading that needed interpretation is a proposal | C. A and S with the statement attached |
| Name or end ongoing work | C, A, S | The client's statement | No approval | C. A and S with the statement attached |
| Add a commitment the client stated | C, A, S | The client's decision | No approval | C. A and S with the statement attached |
| Add a commitment from a recurrence | S | The schedule item the client stated | No approval | S |
| Add a commitment that a folder produced | A, S | The client's agreement. `TIME.md` 5.6.7 | The client decides | A, S |
| State a condition of a commitment | C, A, S | The client's statement | No approval. A reading that needed interpretation is a proposal | The one who started it |
| Add a step | C, A, S | The client's statement. A step from software or from a folder is suggested | The client accepts a suggested step | The one who started it |
| Report a step | C | The client's report | No approval | C. A and S with the statement attached |
| Confirm a Plan | C | The client's confirmation | No approval | C. A and S with the statement attached |
| Report an outcome | C | The client's report, or evidence on file | No approval | C. A and S with the statement attached |
| Correct an outcome | C, A | The client's statement that the entry was wrong | No approval | C, A |
| Move, shorten, or take a commitment off the Plan | C, A, S | One of the three cases in `TIME.md` 5.10.5 | The client, where none of the three holds | C. A and S within the three cases |
| Decide between two competing commitments | C | The client's decision. `TIME.md` 5.6.7 | The client | C |
| Place remaining work | S, A | `place_work`, and clause 6.7 | The client, where the permission does not cover it | S, A |
| Open a follow up | C, A, S | Step four of `TIME.md` 5.5 | No approval | The one who started it |
| Close a follow up | The owner. A | The requirement was met | No approval | The owner. A |
| Grant or withdraw a standing permission | C | The client | The client | C. A with the statement attached. Never S |
| Make a recommendation | A, S | It is preparation. `TIME.md` 5.6.2 | No approval. It changes no entry | A, S |
| Answer a recommendation | C | The client | The client | C |
| File a proposal | A, S | It is preparation | An agent decides it. `ARCHITECTURE.md` rule 1 | A, S |
| Send a message on the client's behalf | A | The client's confirmation of that message. `TIME.md` 8.8 | The client | A |
| Void a record | A | The client's confirmation. `TIME.md` 8.8 | The client | A |
| Change a contact setting | C | The client | No approval | C. A with the statement attached |
| Start, pause, or end a guided session | C | The client | No approval | C |

6.13 Proposed. The responsibilities of the agent and of software.

| The agent, a person | Software |
| :-- | :-- |
| Answers for the work, including the work software does. `TIME.md` 5.2 | Carries out defined work under a rule and a permission |
| Decides in the four cases of `TIME.md` 5.6.6 | Stops and opens a follow up in those four cases |
| Decides each proposal | Files a proposal. Never decides one |
| Selects the next question. `TIME.md` 5.9.2 | Orders the questions that are ready. Clause 8.5 |
| Runs Daily Close and the Review | Prepares the Plan, the brief, and the list of commitments 7.15 selects |
| Corrects the file where the client states an entry was wrong | Files a correction only with the client's statement attached |
| Reads each automatic action and each failure | Files each action with the permission that covered it |
| Writes and releases messages as the agent | Sends a message only as an automated message or as the guide. Never signs as the agent |

6.14 Proposed. One set of server functions carries out every act in 6.12. A screen, a typed conversation, a voice conversation, and the agent console all call the same functions. A function checks the permission, attaches the statement, and writes in one transaction. No form of the system writes to a table by a second path. `TIME.md` 5.11.4.

| Function | Act | Writes |
| :-- | :-- | :-- |
| `setScheduleItem`, `endScheduleItem` | A recurring item of the week is stated, changed, or ended | `schedule_items` |
| `setOngoingWork` | Ongoing work is named or ended | `ongoing_work` |
| `fileBlock`, `correctBlock`, `removeBlock` | A block is filed, changed, or taken off | `blocks` |
| `addCommitment`, `setCondition`, `addStep` | A commitment and its conditions | `commitments` and its five tables |
| `prepareDay` | A day is made from the schedule | `blocks`, `commitments`, `plans`, `plan_items` |
| `confirmPlan` | The client confirms a Plan | `plans` |
| `reportStep`, `reportOutcome`, `correctOutcome` | The client reports, or an entry is corrected | `commitment_steps`, `commitments`, `blocks` |
| `changePlanItem` | A commitment is moved, shortened, or taken off | `plan_items`, `commitments`, `blocks` |
| `followThrough` | The four steps of `TIME.md` 5.5 | `commitments`, `follow_ups`, `blocks` |
| `openFollowUp`, `closeFollowUp` | A follow up | `follow_ups` |
| `grantPermission`, `withdrawPermission` | A standing permission | `standing_permissions` |
| `setSetting` | A contact setting or a Guided Life setting | `time_settings` |
| `recommend`, `answerRecommendation` | A recommendation | `recommendations` |
| `fileLessonDelivery` | A lesson was delivered | `lesson_deliveries` |
| `dayContext` | Reads what a conversation needs for one day. Clause 16.11 | Nothing |
| The twenty queries | Section 5 | Nothing |

6.14.1 Two paths, by who made the act. A write the client makes by a direct act on a screen runs under the client's own session, and the database marks it `resident`. A write software makes from the client's typed or spoken words runs as the service role, is marked `ai`, and carries the statement it rests on. An agent's write is marked `agent` and carries the statement in the same way. The row then shows who wrote it, and the statement shows whose words it rests on.

6.14.1.1 What the database itself refuses from an agent or from software with no statement: a commitment filed as the client's decision, an outcome, a time or an answer about consequences stated later, a step report, that the steps are the whole, a block marked observed, the confirmation of a Plan, a standing permission, and a new schedule item, ongoing work, consequence, alternative, link to a minimum, or Follow through action. Tests T-COM-02, T-SW-01, T-CON-03, T-STP-06, T-STP-07, T-BLK-07, T-PLN-02, T-PRM-02, and T-STM-01. For every further change the function attaches the statement and the history keeps it. The database does not check it there.

6.14.2 The functions that start, pause, and end a session belong to the record of a session. Requirement SR-4.

## 7. Contact

7.1 Defined in `TIME.md` 5.4. Contact has three origins: client requested, permitted automatic, and agent initiated.

7.2 Defined. Contact takes place at three points in the day: the Morning Plan, during the day, and Daily Close. Four kinds of message are sent during the day.

7.3 Defined. The client chooses how much contact they receive and when. Five factors govern each contact. `TIME.md` 5.4.10 lists them.

7.4 Defined. A message that software sent under a standing permission is shown as an automated Universe City message. A message from the guide is shown and heard as from the guide. Software never signs as the agent.

7.5 Built in part. The first Plan asks how the agent follows up and offers four choices: none, before, after, and both. It also asks what time Daily Close goes on the Plan. Both answers are saved with the blocks of that Plan.

7.6 Proposed: the set of contact settings and the setting a new client starts with. One row for each client in `time_settings`.

| Setting | Type | A new client starts with | Rule |
| :-- | :-- | :-- | :-- |
| `morning_plan`, `morning_plan_at` | yes or no, and a time | Off | `TIME.md` 5.4.3. The client names the time when turning it on |
| `reminders`, `reminder_minutes` | yes or no, and minutes | Off | The client names how long before a commitment. No length is supplied for the client |
| `updates` | yes or no | Off | A message when a Plan or the schedule changes |
| `notices` | yes or no | Off | A message when an authorized action was carried out |
| `follow_up` | none, before, after, both | The answer given in the first Plan | Built as four choices. Today the answer is stored in a block note |
| `daily_close_at` | A time | The time given in the first Plan | The client's usual time of Daily Close. `TIME.md` 10.4. Each Plan holds its own copy, which can differ on one day. Clause 2.5.3 |
| `quiet_from`, `quiet_to` | Two times | Empty | Clause 7.9 |

7.6.1 Each optional contact starts off, since `TIME.md` 5.4.3 and 5.4.9 make each one optional and let the client turn each one on. Daily Close is the regular contact and starts at the time the client chose.

7.6.2 A setting for one commitment is held on the commitment. Clause 2.2.12.

7.6.3 Open: what the four choices of the first Plan do. The screen stores none, before, after, or both, and no message is built. The choices were written before `TIME.md` 5.4 named its kinds of contact. Recommendation: none leaves Daily Close as the only contact. Before turns reminders on, and the client then names how long before. After keeps the question at Daily Close, which is already the rule. Both does the two. Decided by: the founder, entered in `TIME.md` 5.4.

7.7 Open: the delivery methods. No Time message is built today. The repository holds thirteen templates for account email and no code that sends a message about Time. Recommendation: the first method is a message in the Resident Portal, in the agent's part of the screen. Reason: it needs no outside party and it keeps each message beside the file. It depends on requirement SR-1. One further method has to reach a client whose application is closed. `TIME.md` 14.4.8. That method is chosen after a prototype of the candidates. Approval: the founder. Requirement SR-13.

7.8 Proposed: the timing rules for the Morning Plan and for a reminder before a commitment.

| Message | Sent at | Not sent when |
| :-- | :-- | :-- |
| Morning Plan | The time in `morning_plan_at`, on each day | The setting is off |
| Reminder | The planned start of the commitment, less its own `reminder_minutes`, or less the client's usual `reminder_minutes` | Reminders are off. The commitment has no planned start. The commitment already has an outcome or was withdrawn. The moment has passed |
| Update | The moment the change is filed | Updates are off. The client made the change |
| Notice | The moment the action is filed | Notices are off |
| Follow up | The next contact at which it is due | The same question was already asked in that contact |

7.8.1 A reminder that could not be sent before the commitment starts is not sent late. It is filed as not sent.

7.9 Proposed: the hours in which no message is sent. No automated message is sent between `quiet_from` and `quiet_to`. Where the client set no such hours, no automated message is sent inside a block of the kind sleep. A message held by this rule is sent when the hours end, if it is still true. A message the client requested is always answered.

7.10 Proposed: the label the client sees on an automated message is Automated Universe City message, the words `TIME.md` 5.4.12 already uses. Approval: the founder, as client copy.

7.11 Defined in `TIME.md` 5.4.14. An invitation to start a guided session is contact the client turned on, at a time the client chose. A declined or unanswered invitation is not an outcome.

7.12 Open: how an invitation is delivered. It uses the method chosen in 7.7, so it is decided with 7.7. An invitation that looks like an incoming call needs an installed application and is future exploration. Clause 13.6.

7.13 Proposed. How each trigger in `TIME.md` section 7 is detected from the tables.

| `TIME.md` | Trigger | Detected when | Who acts | Result |
| :-- | :-- | :-- | :-- | :-- |
| 7.3 | A commitment is reported executed | Execution moves to executed | S | The four steps of `TIME.md` 5.5 |
| 7.4 | Did not happen, or partly executed | Execution moves to one of the two | A | One question: is the remaining part still required |
| 7.5 | Executed with open follow through | A Follow through row has no result | S, then A | Covered work is placed. A follow up for each missing piece |
| 7.6 | A recurring responsibility comes due | A schedule item falls on the day | S | The occurrence is written. No question |
| 7.7 | A commitment overlaps a block | The new block shares a minute with a live block | A | The conflict is stated. The client decides |
| 7.8 | A change affects a consequence or a minimum | The changed commitment has an expected consequence or a linked minimum | A | The effect is stated. The client decides |
| 7.9 | No travel attached | `travel_needed` is empty and no travel block names the commitment | A | One question |
| 7.10 | A block is edited by hand | A revision with the client as its origin | A | The agent can see it and can ask |
| 7.11 | A day with no entry | The day has a Plan item with no outcome, an open follow up due, or a missing schedule block | A | One question at the next contact |
| 7.12 | An estimate older than a week | A block with the status estimated, written more than seven days before | A | One question |
| 7.13 | Controlled hours below the target | Open. Clause 9.7 | A | The two figures. A recommendation is permitted |
| 7.14 | A claimed block is given away | A block of the kind time on what you are building was taken off or moved for a second commitment, more than once in the period of 8.2 | A | The count is stated |
| 7.15 | A question at Daily Close | Clause 8.2 | S prepares. A asks | The list of commitments to ask about |
| 7.18 | A step passes its planned time | Clause 10.8 | The guide | One question, or an offer of more time |
| 7.19 | Open work exceeds the time left | Clause 10.7.1 | A, or the guide in a guided session | The two figures and a recommendation. `TIME.md` 5.13.2 |
| 7.20 | The client asks for help | The client's statement, or the client selects the view of one step | A, or the guide in a guided session | One step is shown. `TIME.md` 5.13.4 |

7.13.1 `TIME.md` 7.2, 7.16, and 7.17 state rules and name no trigger. Clause 8.2 carries 7.16 and 7.17.

7.13.2 `TIME.md` section 7 gives each of these triggers to the agent. The guide acts on three of them, and only inside a guided session: 7.18, 7.19, and 7.20.

7.14 Proposed. What is kept for each message that is sent: who sent it, its origin among the three in 7.1, its kind, each entry it names, the moment, and whether it was delivered. The store of messages belongs to the platform. Requirement SR-1.

7.15 Built. The four follow up choices of the first Plan read as follows on the screen: Leave me alone, Before, After, and Both. Each is stored as `none`, `before`, `after`, or `both`.

## 8. Asking less

8.1 Defined in `TIME.md` 7.15 to 7.17. A planned commitment gets a question when one of seven conditions is true. The seven rest on five factors. No fixed count of matching outcomes applies.

8.2 Proposed: the criteria by which a commitment is treated as established. A commitment is established when none of the seven conditions in `TIME.md` 7.15 is true for it. Each condition is calculated from the tables.

| Condition in `TIME.md` 7.15 | True when |
| :-- | :-- |
| It is new | No earlier occurrence of the same recurring item or the same ongoing work has an outcome on file. A commitment that belongs to neither is new |
| The client marked it important | `important` is yes |
| Its timing is uncertain | It has no planned start, or `movable` is empty, or its block is estimated |
| It has differed from the Plan more than once | Query 5.12 lists its group for the period below |
| A second commitment depends on it | An expected consequence of it names a commitment, or it has a Follow through action, or a cost block names its block |
| The client asked for accountability on it | `accountability` is yes |
| It is a change from the usual week | It came from no schedule item, or its planned time differs from the schedule item |

8.2.1 The period. Proposed: the current Review period and the one before it, read from the `reviews` table. Where no Review is closed, every outcome on file. Reason: the Review is where the client and the agent decide a change to the schedule, and the table already holds each period. No count of outcomes is set. Approval: the founder, entered in `TIME.md` 7.17.

8.3 Proposed: what returns an established commitment to regular questions. The same seven conditions. A commitment gets a question again at the first Daily Close at which one of the seven is true.

8.4 Defined in `TIME.md` 5.9. The agent selects the next question by five factors: the information still missing, the commitments the client has established, the importance of the commitment to the client, the consequences on file, and the client's preferences. The Version 3 rule of lowest position first is retired.

8.5 Proposed: how the five factors are weighed when two questions are both ready. The agent selects. Software lists the ready questions for the agent in this order: a question about a commitment that is due first, then a question about a commitment with a consequence on file, then a question about a commitment the client marked important, then every other question. A subject or an hour the client's preferences exclude is left off the list. The order is a default for the list. It binds no agent. Approval: the founder, entered in `TIME.md` 5.9.

## 9. Further items

9.1 Proposed: what is filed when a client reports a purchase amount while Finance is not operational. `TIME.md` 4.4.6 files the amount in Finance. Time files no amount. Three rows are written. The client's statement is kept as stated. An entry for the folder Finance is written to the `entries` table, which is built and holds what a client said for each of the forty eight folders. A follow up owned by the agent is opened to enter the amount when Finance is operational. The client is asked for no receipt. `TIME.md` 5.5.7.

9.2 Proposed: how Integrity reads commitments and outcomes from Time. One read only view, `time_commitments_read`, gives each commitment with its label, its Plan date, its planned time, its state on the Plan, its four outcome fields, and whether it was withdrawn. Integrity reads the view. Integrity stores no copy. `TIME.md` 4.4.7. Test T-INT-01.

9.3 Proposed: the rule for two commitments that compete for the same time, after the client has decided which one holds. The commitment that holds keeps its block. The client decides whether the second one moves or comes off. `TIME.md` 7.4. The change to the second one is filed with the client's decision as its basis and with the first commitment as its reference. Query 5.12 then names what changed it. One decision settles one conflict. The same two commitments are asked about again the next time they compete, unless the client agreed an alternative in advance for that commitment. `TIME.md` 5.10.5. No standing permission settles two commitments that compete. `TIME.md` 5.6.7.

9.4 Proposed: the fields of a Morning Plan message.

| Field | Content |
| :-- | :-- |
| The day | The date, written month, day, year |
| The commitments | Each item on the Plan in order of time, with its planned start in AM or PM. A commitment with no time is listed last |
| What needs the client | Each open follow up the client owns that is due that day. The Plan, where it is not confirmed. Each pair of commitments that overlap |
| The sender | An automated Universe City message, or the agent where the agent wrote it |
| A reply | Requested only where the third field holds an item. `TIME.md` 5.4.11 |

9.5 Open: what a yes to the first question of Daily Close files. `TIME.md` 5.4.6 opens Daily Close with did today go as planned, and then asks about a commitment only where 7.15 applies. An established commitment is never asked about by name. Under `TIME.md` 3.6.6 it then never receives an outcome, and `TIME.md` 7.17 needs its outcomes to keep matching the Plan. Recommendation: a yes is the client's direct statement about that Plan. Each commitment on the confirmed Plan with no outcome is filed as executed, with Timing as planned, Consequences not established, and the client's answer as its statement. The summary lists each one, so the client can correct one line. A no files no outcome, and the agent asks by name. Reason: without this rule the history of an established commitment stays empty. Risk: a quick yes can file an outcome for a commitment that did not happen. Decided by: the founder, entered in `TIME.md` 5.4.6. Until it is decided, a yes is kept as the statement alone, in `went_as_planned`. Appendix A carries that field so that it could be tested.

9.6 Open: when the two figures of `TIME.md` 11.5 are given. The clause gives them once a week of observed time is on file and does not state how much observed time that is. Recommendation: both figures are given for every week, each beside the observed hours and the unaccounted hours of that week. No threshold is set. Reason: a threshold would be a number with no source. Decided by: the founder, entered in `TIME.md` 11.5.

9.7 Open: the trigger in `TIME.md` 7.13. The clause compares the controlled hours with the client's stated target, before and after a new commitment. Two parts are missing. No field holds that target. And the controlled hours are calculated from observed time alone, so a commitment that has not taken place cannot change them. Recommendation: one field for the target, stated by the client, in the settings. The figure before and after is an estimate: the minutes of the three free kinds in the schedule of that week, with and without the period the new commitment takes. It is stated as estimated. Where the client stated no target, the trigger does not fire. Decided by: the founder, entered in `TIME.md` 7.13. Appendix A carries the field so that it could be tested.

9.8 Proposed: how the three operational conditions of `TIME.md` section 10 are read from the tables.

| Condition | True when |
| :-- | :-- |
| A seven day schedule is on file. `TIME.md` 10.2 | `schedule_on_file_at` holds a moment. Clause 17.1.2, which is open |
| The client has confirmed at least one Plan. `TIME.md` 10.3 | One Plan of the client holds `confirmed_at` |
| The time of Daily Close is on the schedule. `TIME.md` 10.4 | `daily_close_at` in the settings holds a time |

9.8.1 The two further facts of `TIME.md` 10.5 are read the same way: one Plan with `closed_at` and an outcome on a commitment of that day, and one decision of the client that names the schedule as its basis. Neither is a condition.

## 10. Guided Life

10.1 Defined in `TIME.md` 5.11 to 5.14. No part is built. `TIME.md` 14.4.13 sets the order: the commitment, the follow up, and Daily Close are built first.

10.2 The guided session. Defined: one use of Guided Life, from the client starting it to the client ending it, started in one of three ways. `TIME.md` 5.12.1 and 5.12.2.

10.3 Proposed: the fields of a guided session, its states of started, paused, and ended, and its link to a block, to a commitment, or to neither. A guided session is one kind of session. The record of a session belongs to `docs/product/SESSIONS.md`, which holds no data model yet. Requirement SR-4. Clause 10.13 lists the fields Time needs that record to hold. Clause 10.14 lists the states. Time adds no session table of its own.

10.4 Proposed: what is filed when a connection is lost, and what happens when a second device opens the same session.

10.4.1 Each report is written at the moment the client makes it. No report waits for the end of the session. A report the server has answered is on file. A report that was still being sent when the connection was lost may not be on file. The screen shows it as not saved, and the client can make it again.

10.4.2 A lost connection changes no state. The session stays started or paused. No outcome is filed. `TIME.md` 5.14.1. When the client returns, the session is read from the server.

10.4.3 One client has one open guided session. A second device joins that session and shows the same state. A report is filed once, from whichever device made it. Reporting a step that is already reported changes nothing.

10.5 Defined. A guided session proves no outcome by taking place. `TIME.md` 5.14.1 and 8.9.

10.6 Time left. Defined: the time before the next commitment that cannot move, with the travel and the preparation on file counted. Each figure is stated as planned, estimated, or observed. A travel time that is not on file is asked for. `TIME.md` 5.12.6. Query 5.22 calculates it.

10.7 Proposed: the calculation where a duration is unknown, and how often the figure is refreshed.

10.7.1 The client is behind when the minutes left in query 5.22 are fewer than the planned minutes of the open work that the Plan places before the time to leave. `TIME.md` 5.13.2. The open work is each commitment with no outcome that is planned to start before that time. A cost block is left out. Three cases give its planned minutes. A commitment planned to start later than now counts its whole length. A commitment planned for the current time counts from now to its planned end. A commitment whose planned end has passed with no outcome on file is left out, since silence proves nothing. `TIME.md` 5.13.6 and 8.9. The answer states how many such commitments there are. Where the time to leave has itself passed, the answer states that. Tests Q-12.19c, Q-12.19d, and Q-12.19e.

10.7.2 Where one open commitment has no length on file, the comparison is not established. The guide states the minutes left and states how many open commitments have no length. It does not state that the client is behind and it does not state that the client is on time. An empty length is never read as zero.

10.7.3 The server calculates the time to leave by when the session starts and each time a Plan item, a block, or a step changes. The screen counts down from that time. The server is not asked each minute.

10.8 The check on a step. Defined: the guide asks once when a step passes its planned time. `TIME.md` 7.18. Open: `TIME.md` 3.3.14 gives a step three facts, a label, an order, and a state. It gives a step no time. `TIME.md` 7.18 cannot run as written. Recommendation: one optional field on the step, `planned_minutes`, filled only where the client states a length or a reviewed procedure holds one. A step with no length gets no check. The guide then asks once, at the planned end of the block. More time adds the length the client names. Where the client names none, the guide asks again only at the planned end of the block. No length is supplied for the client. A length on a step guides the check alone. It gives the step no block. A step that needs its own time still becomes a commitment under `TIME.md` 3.3.15. Decided by: the founder, entered in `TIME.md` 3.3.14. Appendix A carries the field so that it could be tested.

10.9 The view of one step. Defined in `TIME.md` 5.13.4 and 5.13.5. Proposed: the recommended step where the Plan holds no order is selected by query 5.21. The order is the commitment planned for the current time, then the next commitment by planned time, then a commitment with no time set, the earliest deadline first and then one with an expected consequence on file. Where the day holds no planned commitment, the guide asks. `TIME.md` 5.10.7.

10.10 Proposed: the settings of Guided Life. These join the contact settings in 7.6, in the same row for each client.

| Setting | Field | A new client starts with | Rule |
| :-- | :-- | :-- | :-- |
| Voice | `guided_voice` | Off | `TIME.md` 5.12.12 |
| The level of speech | `speech_level` | Empty until voice is turned on | times. times and labels. times, labels, and folder information |
| The folders that can be spoken | `speech_folders` | None | Only at the third level |
| The display of time | `time_display` | Off | `TIME.md` 5.12.10 |
| A label that is never spoken | `speak_label` on the commitment | Spoken | `TIME.md` 5.12.12 |
| The form | Chosen at the start of each session | The screen | text, live voice, narrated guidance, the screen |
| The amount of narration, the pace, the tone, and the periods with no speech | Not in this table | Not set | These are communication preferences. They apply in every folder. Clause 12.6 |

10.11 The summary of a session. Defined: five lists, each linked to the entries it names. `TIME.md` 5.14.3 to 5.14.5. Proposed: its stored form.

10.11.1 Each write made in a session carries the identifier of the session. The summary is assembled from those rows when the session ends.

| List in `TIME.md` 5.14.3 | Assembled from |
| :-- | :-- |
| What was filed | Each entry written in the session: blocks, commitments, reported steps, outcomes, and statements kept for a different folder |
| What was changed | Each revision made in the session, with its basis |
| What is proposed and has not taken effect | Each proposal filed in the session that is still proposed. Each recommendation with no answer |
| What the client reported with no established outcome | Each statement of the session that changed no outcome field. `TIME.md` 3.6.11 |
| What is still open | Each follow up opened in the session that is open. Each commitment of the session that is still planned |

10.11.2 The summary is stored once, as a list of references: the table, the entry, and the state of that entry when the session ended. It stores no sentence. The words are produced from the entries and from the map in 2.8 each time it is read.

10.11.3 Where an entry was corrected after the session, the summary shows the entry as it stood at the end of the session and marks that it was later corrected. The history supplies both.

10.11.4 The summary replaces no source. The conversation, the transcript, and the entries all stay. Clause 16.2.

10.11.5 Where the summary is kept belongs to the record of a session. Requirement SR-4. The `reviews` table already holds a summary column for a Review. That column is the built precedent.

10.12 Proposed: what is counted to judge Guided Life.

| Count | Calculated from |
| :-- | :-- |
| Commitments executed or adjusted in a session | Outcomes and Plan item changes that carry a session identifier |
| A client who resumed after asking for one step | A session in which the view of one step was opened and a step was reported after it |
| Questions the client no longer has to answer | Commitments that 8.2 selected for Daily Close and that already had an outcome from a session |

10.12.1 Listening time, the length of a session, and the count of sessions are never the measure.

10.13 Proposed. The fields Time needs the record of a guided session to hold.

| Field | Content | Rule |
| :-- | :-- | :-- |
| The session | An identifier, the client, and the kind guided | Requirement SR-4 |
| How it started | On a block or a commitment, by an invitation, or with no block | `TIME.md` 5.12.2 |
| The block and the commitment | Each can be empty | A session with neither changes no existing block and no existing commitment unless the client reports that change. `TIME.md` 5.12.4 |
| The state | started, paused, or ended | Clause 10.14 |
| The moments | Started, each pause, each return, ended | Software's own times. Estimated by rule. `TIME.md` 3.6.9 |
| Who ended it | The client, or software under 10.14.2 | |
| The forms used | Each of the four forms the session used | `TIME.md` 5.11.4 |
| The settings in force | The level of speech when the session started | So a later reader knows what was spoken |
| The steps skipped | Each step the client skipped in the session | A skipped step stays open. Query 5.21 passes over it until the session ends |
| The summary | Clause 10.11 | |
| The transcript | A reference, where one exists | Requirement SR-5 |

10.14 Proposed. The states of a guided session.

| From | To | Who | What is filed |
| :-- | :-- | :-- | :-- |
| None | started | The client | The session, and how it started |
| started | paused | The client. The guide, when the client asks for the agent or 5.12.15 of `TIME.md` applies | The moment |
| paused | started | The client | The moment |
| started, paused | ended | The client | The moment, and the summary where 5.14.3 of `TIME.md` requires one |

10.14.1 No time limit ends a session. `TIME.md` 5.12.9. No state named lost, expired, or abandoned exists.

10.14.2 Open: what closes a session the client left open. `TIME.md` 5.12.1 ends a session when the client ends it, and 5.14.3 gives the summary at the end. A session the client never ends would have no summary. Recommendation: software closes an open session in two cases, when the client starts a new session and when Daily Close for that day is completed. The record states that software closed it. The closing files no outcome. Decided by: the founder, entered in `TIME.md` 5.12.

10.15 Proposed. Interruptions in a guided session.

| What happens | What is kept | What happens next |
| :-- | :-- | :-- |
| The connection is lost | Each report already made | The session keeps its state. Clause 10.4.2 |
| The application is closed or the device is locked | The same | The same |
| A second device opens the session | One session | Clause 10.4.3 |
| A spoken report is unclear | Nothing is filed | The guide asks once. `TIME.md` 6.14.3 |
| A write fails | The file as it was | The guide states that the report was not saved. The client can report again. Clause 6.9 |
| The client asks for the agent | The session is paused. A follow up owned by the agent is opened | The guide states that it was opened. `TIME.md` 5.2.6 |
| The client indicates danger | The session stops | `LANGUAGE_STANDARD.md` 10.5 applies. `TIME.md` 5.12.15 |
| The block holds `driving` as yes | Each report the client makes | The guide asks no question and delivers no lesson. `TIME.md` 5.12.8. The client states that a period is spent driving. Software infers it from no label |
| A step passes its planned time | Nothing | One question. Clause 10.8 |
| The planned block ends with steps open | The open steps stay open | No outcome is filed. No step is filed as missed. `TIME.md` 3.3.19 |

10.16 Proposed. What a report inside a session files.

| The client reports | Function | Result |
| :-- | :-- | :-- |
| A step done, or not needed | `reportStep` | The step. The commitment too, where 2.2.5.1 applies |
| The commitment finished | `reportOutcome` | The four outcome fields. Then the four steps of `TIME.md` 5.5 |
| A part happened, and the rest did not | `reportOutcome` | Partly executed. One question about the remaining part |
| A time | `reportOutcome` or `correctBlock` | The actual time, and the block as observed |
| An event that belongs to no commitment in the session | `fileBlock`, or the statement alone | A block as reported. No outcome field of an existing commitment changes. `TIME.md` 3.6.11 and 3.6.12 |
| A fact that needs interpretation | No function writes an entry | A proposal. `TIME.md` 5.6.5 |

10.17 Proposed. A session with no block. `TIME.md` 5.12.3. The session can read the file through the queries in section 5 and through `dayContext`. It writes only what the client reports and what the client decides. It adds a commitment only when the client decides to add one. A session that produced no statement, no change, no proposal, and no follow up ends with no summary and leaves only its own record.

10.18 Proposed. How adaptive delivery is kept from changing a fact. A message from the guide is built in two passes. The first pass takes each fact from a function or a query: the label, the time, the status, the figure. The second pass sets the wording, the pace, and the amount, under `LANGUAGE_STANDARD.md` section 4 and the client's preferences. The second pass receives the facts as fixed values and can add no figure. A test compares the facts in the message with the result of the first pass. Section 19, W-27.

10.19 Proposed. Information from a different folder in a session. The guide reads it only where three facts hold: the folder is operational, the client turned that folder on for the session, and for speech, the level of speech reaches it. A lesson is delivered only from an approved Curriculum, and the delivery is filed under 14.2. Where a folder is not operational, clause 14.4 applies.

10.20 Oversight by the agent is in section 12.

10.20.1 Proposed. The controls of `TIME.md` 5.12.5 and 5.12.9, and what each one files.

| Control | What happens | What is filed |
| :-- | :-- | :-- |
| Done, not needed | Clause 10.16 | The step |
| More time | The check of 10.8 moves by the length the client names | Nothing |
| Skip | The step stays open. The next open step is shown. The skipped step returns when the client asks for it or the session ends | The step is added to the skipped steps of the session |
| Repeat | The guide gives the last message again | Nothing |
| Pause, and return | Clause 10.14 | The moment |
| Mute | Speech stops. The screen keeps every function. `TIME.md` 5.12.11 | The form the session used |
| Change the amount of guidance | The guide says more or less for the rest of the session | Nothing, unless the client asks to keep it. Then clause 12.6 |
| Extend | The session keeps going past the planned end of the block. No time limit ends it | Nothing |
| Turn the guide off, or stop | The session ends. The Plan, the schedule, and the agent stay | The moment, and the summary where one is due |

10.21 Proposed. What has to exist before each part of Guided Life is built. No date is attached to an order.

| Part of Guided Life | Needs first |
| :-- | :-- |
| A session on a commitment, on the screen | Commitments, steps, Plans, outcomes, and the follow through of `TIME.md` 5.5. Requirement SR-4 |
| The statement of time left | The Timing condition, cost blocks, and query 5.22 |
| The view of one step | Steps, and query 5.21 |
| The summary | Requirement SR-2 and requirement SR-4 |
| Recommendations by the guide | Section 11, and a standing permission or the client's decision to carry one out |
| A session with no block | The store of statements. Requirement SR-1 |
| Voice | A provider selected under 13.3. Requirement SR-5 |
| A lesson from a different folder | An approved Curriculum for that folder. Requirement SR-15 |

## 11. Recommendations

11.1 Defined in `TIME.md` 5.10. A recommendation is preparation. It changes no entry on file.

11.2 Proposed: the stored form of a recommendation. It holds the action, the fact on file it rested on, who made it, and whether the client accepted it, changed it, or declined it. One table, `recommendations`.

| Field | Type | Required | Rule |
| :-- | :-- | :-- | :-- |
| `made_by` | `uc_source` | Yes | agent or ai. Never the client |
| `agent_id`, `session_id` | uuid | No | The agent who made it. The session it was made in |
| `conversation_key` | text | Yes | Clause 11.4 |
| `action` | text | Yes | do next, move, shorten, take off. The four actions of `TIME.md` 5.10.2 |
| `commitment_id`, `step_id` | uuid | One of the two | What the action is about |
| `to_date`, `to_start`, `to_minutes` | date, text, number | No | The new time or the new length, for a move or a shortening |
| `rests_on` | text | Yes. Not empty | The fact on file, in one sentence. `TIME.md` 5.10.2 |
| `rests_on_table`, `rests_on_id` | text, uuid | No | The entry that holds that fact |
| `response` | text | No | accepted, changed, declined. Empty means no answer yet |
| `responded_at`, `response_statement_id` | timestamp, uuid | With a response | The moment, and the client's statement |

11.2.1 The client can write the three answer fields and no other field. Test T-REC-01.

11.2.2 A recommendation with no basis cannot be stored. Where the file gives no basis, the agent or the guide asks. `TIME.md` 5.10.7.

11.3 Defined. The agent can see each recommendation the guide made. `TIME.md` 5.10.10.

11.4 Proposed: how a declined recommendation is kept from being made again in the same conversation. The conversation key is the identifier of the session. With no session, it is the client's local date and the thread. The database refuses a recommendation where a declined one exists with the same key, the same action, and the same commitment or step. The same recommendation can be made in a later conversation. Test T-REC-02. Who made a recommendation is set by the database from the writer. Test T-REC-04.

11.5 Proposed. An accepted recommendation is carried out by a separate write, through `changePlanItem`, with the client's decision as its basis. The recommendation itself never holds the change. Test T-REC-03.

11.6 Proposed. A changed recommendation. The client names a different time or a different commitment. The answer is filed as changed, and the client's own version is carried out as the client's decision.

## 12. The guide and Guide Mode

12.1 Defined in `TIME.md` 5.2.1 to 5.2.7. The guide is software. It is identified as software. It is one guide with one name and one voice. It is separate from the agent.

12.2 Open: the name of the guide, its voice, and the words that identify it at the start of a guided session. `LANGUAGE_STANDARD.md` 12.12. `TIME.md` 15.4. Decided by: the founder. This document gives no recommendation, since the choice is hers. No part of this document depends on the name.

12.3 Proposed: Guide Mode. What the agent sees of a guided session, how the agent corrects a recommendation or a change the guide made, and when the agent is brought in under `TIME.md` 5.6.6.

| Guide Mode displays | Read from |
| :-- | :-- |
| Each guided session of the client, with how it started, its state, and its summary | The record of a session. Requirement SR-4 |
| Each recommendation, with what it rested on and the client's answer | `recommendations` |
| Each change software made, with the permission or the decision it rests on | The history. Requirement SR-2 |
| Each open follow up that a session opened for the agent | `follow_ups` |
| The transcript, where the client authorized it | Requirement SR-5 |

12.3.1 The agent corrects an entry the guide wrote through the same functions as every other correction. The correction is filed with the agent as its origin and with the reason. The entry the guide wrote stays in the history.

12.3.2 The agent is brought in under 6.8.

12.4 Proposed: what happens when the client asks for the agent. `TIME.md` 5.2.6 requires a follow up owned by the agent. The session is paused. One follow up is opened with the owner agent, the need agent action, and the reason that the client asked for a person. The guide states that it was opened. The words are client copy and are not written yet.

12.5 Open: the review of what the guide says. The source and the version of each script, and the list of lessons a client has received. The lessons a client received are held in 14.2. The scripts of software belong to AI Casework Training, which `LANGUAGE_STANDARD.md` 12.11 lists as out of step. Time needs two facts from it: each script has a source and a version, and a change to a script is approved before it is spoken. Decided by: whoever the founder names to revise AI Casework Training. The decision needs the list of each kind of sentence the guide speaks.

12.6 Open: where a communication preference is kept, how the client sees it, and how the client corrects it. `LANGUAGE_STANDARD.md` 4.5 and 12.14. Recommendation: one settings record for each client that every folder reads, shown in the settings view, changed by the client at any time, with each change kept in the history. Reason: a preference for tone or pace applies to the agent and to the guide in every folder. A Time table would be the wrong owner. Decided by: the founder, entered in `LANGUAGE_STANDARD.md` 12.14 and in `ARCHITECTURE.md`. Requirement SR-11.

12.7 Defined. A communication preference is a setting. It is never filed as a trait of the client. `LANGUAGE_STANDARD.md` 4.9.2.

## 13. Voice, transcripts, and devices

13.1 Defined. Voice is one form of Guided Life. It uses the same File, the same permissions, and the same history as text and the screen. `TIME.md` 5.11.4.

13.2 Defined. Voice is off until the client turns it on. The client selects one of three levels of what is spoken. `TIME.md` 5.12.12.

13.3 Open: the technical basis for voice. The audio and realtime interfaces of OpenAI are candidates for evaluation. No provider is selected. Clause 13.9 lists what a candidate has to do. Decided by: the founder, after a prototype. Developments, section 11.

13.4 Proposed: when a session uses live two way voice and when it uses narrated guidance. Narrated guidance is speech in one direction. It speaks content that was already built from the file: the Morning Plan, a step, the time left. It needs no microphone. Live voice opens the microphone for one session, when the client selected voice for that session. A session starts on the screen unless the client selects a different form.

13.5 Open: whether a session is recorded, the client's consent, how long a transcript is kept, and who can read it. `TIME.md` 5.14.7 lets the agent read a transcript where the client authorized it. This document sets no retention period and gives no recommendation for one. Decided by: the founder, through the data policy of requirement SR-12 and the session record of requirement SR-5. The decision needs three facts first: what the law requires where clients live, what a voice provider keeps, and whether the agent needs the audio or the text alone.

13.6 Open: what a browser supports and what needs an installed application. A wake alarm, audio on a locked screen, and an invitation that looks like an incoming call are future exploration. Decided by: the founder, after the prototype in Developments 11.2 shows what a browser can do on the devices clients use. No part of stages 0 to 7 in 20.5 waits for it.

13.7 Open: whether a session can stay open through a whole day. No microphone stays on by default. Decided by: the founder. The decision needs the result of 10.14.2 and a measure of what an open session costs a device in battery. Until it is decided, a session is opened for one activity.

13.8 Future exploration, with no specification: sharing a screen with the guide, and a restriction on a device. Neither one is a condition for taking part. `TIME.md` 8.14.

13.9 Proposed. What a voice provider has to do before it is selected.

| Requirement | Reason |
| :-- | :-- |
| The voice model acts only by calling the functions in 6.14 | Voice then holds the same permissions as text. `TIME.md` 5.11.4 |
| The voice model reads the file only through `dayContext` and the queries | It has no access to a table |
| The functions for a grant of permission and for a decision on a proposal are not given to the voice model | `TIME.md` 5.6.5. Software never approves |
| Each spoken turn is returned as text with its speaker and its moment | It is kept as the statement an entry rests on. Requirement SR-1 |
| The guide can be identified as software in the first spoken sentence | `TIME.md` 5.2.4 |
| The level of speech can be enforced before a sentence is spoken | `TIME.md` 8.13 |
| The provider's terms for keeping audio and text are known and written down | Requirement SR-12 |
| The delay between the client's speech and the reply, and the cost of one session, are measured | Both are unknown today |

13.10 Proposed. Five kinds of material come out of one voice conversation. Each has its own keeping and its own reader. No one of them replaces a second one.

| Material | What it is | Can it be rebuilt from the rest | Owner of the rule |
| :-- | :-- | :-- | :-- |
| The audio | The recording, where one is made | No | Requirement SR-5 |
| The transcript | Each turn as text, with its speaker and its moment | From the audio only | Requirement SR-5 |
| The statements | The client's turns that an entry rests on | They are part of the transcript | Requirement SR-1 |
| The entries | Blocks, steps, outcomes, follow ups, proposals | No. Each one names its statement | This document |
| The summary | Five lists of references | Yes, from the entries and the history | Clause 10.11 |

13.11 Proposed. A spoken report that was heard wrongly. The report is filed with the turn it came from as its statement. The summary lists it. The client corrects it under 16.9, and the turn stays as the record of what was heard. How often a spoken report is filed wrongly is not known. It is measured in the prototype before voice is approved.

## 14. Links to other folders

14.1 Defined. Time holds a link to a lesson and the date it was delivered. Time holds a link from a commitment to a procedure. Time holds no copy of either. `TIME.md` 4.4.9.

14.2 Proposed: the form of a link to a lesson, the version of the lesson, and what is kept when it is delivered. One table, `lesson_deliveries`.

| Field | Content |
| :-- | :-- |
| `folder` | The folder that owns the lesson |
| `lesson_key` | The number of the lesson in that folder's Curriculum |
| `lesson_version` | The version of that Curriculum |
| `form` | text, voice, narration, or screen |
| `session_id`, `commitment_id` | The session and the commitment it was delivered in |
| `delivered_at` | The moment |

14.2.1 Time needs each Curriculum to give each lesson a number that does not change. Requirement SR-15.

14.3 Open: the form of a link from a commitment to a procedure. The procedure itself is specified by the folder that owns the subject. No folder holds a procedure today. Time needs four facts in the link: the folder, the procedure, the version the client reviewed, and the date of that review. The link uses the form of requirement SR-6. Decided by: the first folder that holds a procedure, with `ARCHITECTURE.md` for the form of the link. It waits for that folder.

14.4 Proposed: what a guided session files when the activity belongs to a folder that is not operational. The client's statement is kept as stated. One row is written to the `entries` table for that folder, with the client's words. No lesson is delivered. `TIME.md` 5.12.13. No entry in a table of that folder is written, since none exists. A follow up owned by the agent is opened only where an action is required.

14.5 Proposed. What Time reads from and writes to each folder `TIME.md` section 13 names.

| Folder | Time holds | The folder holds | Built today |
| :-- | :-- | :-- | :-- |
| Standards | A link from a commitment to each minimum that applies | The wording of each minimum | The `standards` table is built. The link is proposed |
| Career Development, Schedule | The hours worked, as blocks | The planned shift | No table for a shift |
| Finance | Nothing | The purchase amount | No table. Clause 9.1 |
| Inventory | A link from the commitment to the change it produced | The items | The `inventory_items` table is built. The link is requirement SR-6 |
| Salary | Nothing. Salary reads query 5.17 | The hourly rate | The `salary` table is built |
| Integrity | Nothing | Its own reading of the commitments | The view in 9.2 is proposed |
| Discernment | Nothing. Discernment reads the commitments that took the controlled hours below the target. `TIME.md` 13.6 | What it raises with the client | Not built. Clause 9.7 is open |
| Equilibrium | Nothing. Equilibrium reads where the hours go, from query 5.13 and the blocks. `TIME.md` 13.7 | The comparison with what the client said matters | Not built |
| Every folder with a dated action | The commitment, with `origin_folder` | The subject | Proposed |
| Every folder with a Curriculum | The delivery of a lesson | The lesson | Proposed. One Curriculum is revised, for Time |

## 15. Concerns owned by other documents

15.1 Guided Life needs six parts that this folder does not own. Each is specified in its owning document. This document does not specify them.

| Concern | Owning document | What Time needs from it |
| :-- | :-- | :-- |
| The history of the File that a client can read, with corrections | `ARCHITECTURE.md` | A place where the summary of a session stays available, linked to the entries it names |
| The record of a session and its transcript | `docs/product/SESSIONS.md` | What a session is on file, consent to record, retention, and who can read a transcript |
| The layout of the Resident Portal | `docs/product/RESIDENT_INTERFACE.md` | A day view that opens first, the opened block, and the screen of a guided session |
| Guide Mode in the agent console | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` and `docs/product/AGENT_MODEL.md` | The agent's view of each guided session, each recommendation, and each change |
| The Review | No document specifies the Review yet | How a client brings the changes of a week into the Review |
| Lessons and procedures of other folders | The Curriculum of each folder. None is written for Career Development | An approved lesson or a reviewed procedure to link to |

15.2 The conduct rules for adaptive delivery belong to Agent Operations and to AI Casework Training. `LANGUAGE_STANDARD.md` 12.11 lists both as out of step.

15.3 The core of Time needs shared parts as well. The table below states each shared requirement once. A requirement is marked blocking where no commitment, no Plan, and no outcome can be built without it.

| Number | Shared requirement | Owning document | What exists today | What Time depends on it for | Blocking |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-1 | A store of each message of a conversation, in order, with the speaker, the moment, the exact words, the form, and the session. Each message has an identifier an entry can name. A message is never edited or deleted | `ARCHITECTURE.md`. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` states the rule and lists it as the first build increment | The `statements` table: what a client raised, with one folder. It holds no speaker and no session. No code writes it. A client can edit and delete a row. An agent can write a row in the client's name | The statement behind each condition, each outcome, each confirmation, and each permission | Yes |
| SR-2 | A history for every File table: the earlier and the later row, who changed it, which software, the reason, the basis, the statement, and the session. It cannot be edited | `ARCHITECTURE.md`. Its rule 2 states the pattern for a block. Whether each File table follows it is the decision | `block_revisions`, for blocks alone. Its reason is never filled | Corrections, question 12.9, question 12.21, the summary of a session | Yes |
| SR-3 | Removal that keeps the row, for every table a client owns | `ARCHITECTURE.md`. Its rule 6 deletes no entry because it changed. Its access matrix lets a client delete the client's own block | A client can delete a block. Clause 2.1.12 | `TIME.md` 5.8.1 | Yes |
| SR-4 | The record of a session: its kind, its states, the entries it touched, its summary | `docs/product/SESSIONS.md`. A working concept with no data model | Nothing | Guided sessions, Daily Close as a session, the summary | For Guided Life |
| SR-5 | Recording, transcript, and the client's consent to each | `docs/product/SESSIONS.md` and requirement SR-12 | The `reviews` table holds a reference to a transcript. Nothing is recorded | `TIME.md` 5.14.7 | For voice |
| SR-6 | A link from an entry in one folder to an entry in a second folder, with no copy | `ARCHITECTURE.md` | `proposals` names a target table and a target row. No general link exists | Evidence for an outcome, Finance, Inventory, procedures | No |
| SR-7 | The path of a proposal: software files it, the client's answer is kept, an agent decides it, and the decision is applied to its target | `ARCHITECTURE.md`, rule 1 | The table and its access rules. The service role can file one. No code files, decides, or applies one. The client's answer has no field | `TIME.md` 5.6.5. Every reading that needed interpretation | Yes |
| SR-8 | A history of the File the client can read | `ARCHITECTURE.md` and `docs/product/RESIDENT_INTERFACE.md` | The agent's brief lists changed blocks. The client has no view | `TIME.md` 5.14.6 and question 12.21 | No |
| SR-9 | How software finds an earlier fact without reading a whole history | `ARCHITECTURE.md`. No document states it | Reads by client and date | Clause 16.11 | No |
| SR-10 | A record of each automatic action, its attempts, and its failures | `docs/product/AGENT_OPERATING_ARCHITECTURE.md`. Listed there as open | `stripe_events` holds the pattern for payment events | Clause 6.9 | For standing permissions |
| SR-11 | One settings record for preferences that apply in every folder | `LANGUAGE_STANDARD.md` 12.14 and `ARCHITECTURE.md` | Nothing | Clause 12.6 | No |
| SR-12 | Decisions on consent, access, the client's right to a correction, retention, deletion, backup, and recovery | `ARCHITECTURE.md`, and a data policy that is not written | The access matrix. Clause 16.14 | Every table in this document | Before the first client's entries are stored |
| SR-13 | Delivery of a message to a client whose application is closed | No document | Account email templates | Clause 7.7. `TIME.md` 14.4.8 | For reminders |
| SR-14 | The Review: what it is on file and how a week is brought into it | No document. The `reviews` table is built | The table, and the brief | Clause 8.2.1. `TIME.md` 5.14.6 | No |
| SR-15 | A number for each lesson that does not change, and a version for each Curriculum | Each Curriculum | Folder 01 Time Curriculum numbers its lessons in its section 19 | Clause 14.2 | For lessons |
| SR-16 | Who wrote a row is set from the writer, for every writer | `ARCHITECTURE.md`, the section on provenance | Forced for a client alone. An agent's or the service role's write that names no source is stored as `resident`. Clause 2.1.17 | Each entry software or an agent writes. The rule that a reported entry rests on the client's statement | Yes |

## 16. Storage and continuity

16.1 Universe City keeps a lifelong memory of each client in the File. Time adds no memory of its own. Time adds tables for its own kinds of entry: the block, the schedule item, the commitment, the follow up, ongoing work, and the Plan. The conversation, the history, the session, the transcript, and the link between folders are shared parts. Section 15 lists each one with its owning document.

16.1.1 Each clause in this section is Proposed, unless it is marked Built. Where a clause states a rule for a shared part, the rule is what Time needs from the owning document. It is in force only when that document holds it.

### 16.2 Six kinds of stored material

16.2.1 Six kinds of material are kept. Each has its own purpose, its own reader, and its own rule for keeping.

| Material | What it is | Held today | Can it be rebuilt from the rest | Rule |
| :-- | :-- | :-- | :-- | :-- |
| The original source | A recording. A document or an image the client supplied | Nothing | No | Requirement SR-5 and requirement SR-12 |
| The conversation as stated | Each message in order, with the speaker, the moment, and the exact words | `statements`, in part. No code writes it. A client can edit and delete a row today | No | Requirement SR-1. Time needs a statement to stay as it was made |
| The structured entries | Blocks, commitments, steps, outcomes, follow ups, Plans, permissions | `blocks`. The rest is proposed | No. Each one names the statement it rests on | Sections 2 and 3 |
| The history of each entry | The earlier and the later value of each change | `block_revisions` | No | Requirement SR-2. Never edited |
| Derived material | A brief, a summary of a session, a figure, the context of one day | `reviews.brief`, built again from the tables each time | Yes, always | `ARCHITECTURE.md` rule 3. It is never the source of a fact |
| Codes and their words | The stored codes and the map to words | `lib/domain/time.ts` | It is code | Clause 2.8 |

16.2.2 A summary never replaces the conversation it came from. A derived item is never read as the source of a fact. Shortening applies to what is loaded into one conversation. It never applies to what is kept.

16.2.3 Where a derived item and an entry differ, the entry is right and the derived item is built again.

### 16.3 Compact records and identifiers

16.3.1 Each entry has one generated identifier. A link holds the identifier. A link holds no copy of a label, a time, or an amount.

16.3.2 A fact with a fixed set of values is stored as a code. The words are held once, in the map of 2.8.

16.3.3 A fact is stored in one table. The label of a commitment is on the commitment. A Plan item holds the planned time and no label. A cost block holds a link to the block it is a cost of.

16.3.4 The client's own words are stored as text where the specification requires the words: the label, what counts as done, a consequence, a recurrence as stated. Software never rewrites them.

16.3.5 Measured in the seeded test data: a block is about 140 bytes, a commitment about 150 bytes, a Plan item about 130 bytes. Each is a planning figure from sixteen commitments. It is no measure of a real client.

### 16.4 Event history and immutable revisions

16.4.1 Built for blocks. A trigger in the database writes the history, so no screen and no function can skip it. A row of history cannot be edited or deleted.

16.4.2 Time needs the same for each proposed table that can change. Requirement SR-2. Appendix A, part 1, holds one candidate: a single history table for every File table, written by one trigger. `ARCHITECTURE.md` decides the form. The candidate exists so that the rules in this document could be tested. The block keeps its own built history, with the fields of 2.1.11 added.

16.4.3 Four facts the built history lacks, and the candidate carries: the reason, the basis, the statement, and the session. A fifth names which software wrote the change: the guide, the scheduler, or intake.

16.4.4 Cost. A row of history holds two whole copies of the entry. In the seeded data a row of history is about 1,100 to 1,500 bytes, eight to ten times the entry. History grows with the number of changes. Whether the history keeps whole rows or changed fields alone is a decision for `ARCHITECTURE.md`. This document sets no format.

### 16.5 Source references

16.5.1 Each entry that rests on what the client said names the statement. Each statement names its session. Each session names its transcript, where one exists. A reader can walk from a figure on a screen to the entry, to the statement, to the words.

16.5.2 Until requirement SR-1 is decided, the field `statement_id` points at the built `statements` table. If `ARCHITECTURE.md` names a different store, the field points there. The field and its rules do not change.

### 16.6 Statements, interpretations, and outcomes

| Kind | What it is | How it is stored | Who can change it |
| :-- | :-- | :-- | :-- |
| A statement | What the client said, as said | A message. Requirement SR-1 | No one. A correction is a new statement |
| An entry from a direct statement | The fact the client stated | The entry, with the statement attached. `TIME.md` 5.6.5 | The client. The agent, with the statement |
| An interpretation | What software or the agent read into a statement | A proposal. No entry changes until an agent decides it | An agent decides it. `ARCHITECTURE.md` rule 1 |
| An outcome | What happened to a commitment | Four fields, with a basis of the client's report or evidence | Clause 3.10 |
| A recommendation | An action software or the agent suggests | A recommendation. No entry changes | The client answers it |
| A figure | A calculation | Not stored. Section 5 | No one. It is calculated again |

### 16.7 A fact that has changed

16.7.1 The current value is on the entry. Each earlier value is in the history, with the moment it was replaced. The value on a past date is the last value written before that date.

16.7.2 Four kinds of earlier fact are kept on entries of their own, so that a common question needs no history read.

| Earlier fact | Kept on |
| :-- | :-- |
| The time a commitment was planned for, after it moved | `planned_start` and `planned_end` on the Plan item |
| The week as it was, after the week changed | The schedule item with its `effective_to` date |
| The first outcome of a commitment whose remaining work continued | The first commitment. The new one names it in `continues_id` |
| A commitment that was taken off | The commitment, with `withdrawn_at` |

16.7.3 The Start a client selected at Enrollment is kept and is never replaced. Developments 2.21. It belongs to the Curriculum and is held outside this document.

### 16.8 Relationships across folders

16.8.1 A fact lives in the folder that owns its subject. Time holds the hours, the commitment, and a link. Clause 14.5 lists each case.

16.8.2 Time copies no amount, no item, no minimum, no lesson, and no procedure. Where a second folder needs a Time fact, it reads Time. Integrity reads one view. Salary reads one query.

16.8.3 The form of a link between folders is requirement SR-6.

### 16.9 Corrections

16.9.1 The client can open each entry, report a mistake, and ask for a correction. `TIME.md` 5.14.5.

16.9.2 A correction changes the entry and keeps the earlier value in the history, with the reason and the client's statement. Clause 3.19.

16.9.3 Time needs a statement to stay as it was made. The correction is a new statement, and the entry then rests on the new one. Requirement SR-1. The built `statements` table lets a client edit and delete a row.

16.9.4 Each figure is calculated from the tables, so a correction changes each figure the next time it is read. No figure is stored.

16.9.5 A derived item that was built before the correction is built again. A summary of a session keeps the entry as it stood and marks it as corrected later. Clause 10.11.3.

### 16.10 From conversation to structured data

| Step | What happens | Rule |
| :-- | :-- | :-- |
| One | The message is stored as stated | Requirement SR-1 |
| Two | The message is linked to each folder it concerns. The link changes no word of it | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` |
| Three | A direct statement of a fact is filed by a function, with the message as its statement | `TIME.md` 5.6.5 and 6.14.3. No reading back |
| Four | A reading that needed interpretation is filed as a proposal | `ARCHITECTURE.md` rule 1 |
| Five | A fact the client did not state stays empty | `TIME.md` 3.6.4 |
| Six | Work that the conversation leaves unfinished becomes a commitment or a follow up | `ARCHITECTURE.md`: conversation is not the home of unfinished work |

### 16.11 Reading without loading a history

16.11.1 Proposed. A conversation about one day receives one bounded read, `dayContext`. It holds what the agent or the guide needs to talk about that day and no more.

| In the context of one day | Read from |
| :-- | :-- |
| The Plan of the day, and whether it is confirmed | `plans` |
| Each commitment on it, with its planned time, its Execution, whether its time can move, its length, its deadline, its steps, and its expected consequences | `plan_items`, `commitments`, and their tables |
| The blocks of the day, with status and kind | `blocks` |
| Each open follow up | `follow_ups` |
| Each standing permission in force, and the contact settings | `standing_permissions`, `time_settings` |

16.11.2 Measured on the seeded data: the context of a day with six commitments and six blocks is about 1,900 characters. Its size follows the number of entries in one day. It does not grow with the length of the residency.

16.11.3 Left out of the context unless a question asks for it: every other day, the history, each earlier statement, and each transcript. A question about an earlier fact runs one query from section 5, or one read of the history for one entry.

16.11.4 Each read uses an index on the client and the date. Appendix A lists each index.

16.11.5 How software finds an earlier fact that no query in section 5 covers is not specified by any document. Requirement SR-9. This document proposes no search of its own.

### 16.12 Codes into words

16.12.1 Clause 2.8 holds the rule. A stored code is never shown and never spoken. A time is stored as `17:00` and printed as 5:00 PM.

### 16.13 Use of storage, of retrieval, and of a model's context

| Concern | What this document does | What has to be measured |
| :-- | :-- | :-- |
| Size of an entry | Codes, identifiers, and no copied label | The real size, on real use |
| Size of the history | Left to `ARCHITECTURE.md`. Clause 16.4.4 | Changes for each entry in a month |
| Rows written for a recurring week | A day is written only when its Plan is confirmed or comes due. A future week is displayed from the schedule items | Rows for each client in a month |
| Derived material | Built from the tables when read. Never the source | The time to build the brief and the context |
| What a model receives | The context of one day, and the result of one query | Characters in each conversation |
| What a model writes | Nothing directly. It calls a function | Calls refused by a rule |

### 16.14 Consent, access, correction, retention, deletion, backup, and recovery

16.14.1 Each of these is an architectural concern. Lifelong memory needs each one decided. This document decides none of them. It states what is built, what Time needs, and who decides. Requirement SR-12.

| Concern | Built today | Not decided | Decided by |
| :-- | :-- | :-- | :-- |
| Access | A client reads the client's own rows. Every agent account reads every client. The database holds both rules, so they apply on every screen | Whether an agent reads only the clients assigned to that agent. Who reads a transcript | `ARCHITECTURE.md` |
| Consent | No record of a consent exists | Consent to a recording, to a transcript the agent reads, to speech of file information, and to each standing permission as its own record | A data policy. `docs/product/SESSIONS.md` for a session |
| The client's right to a correction | A client can change the client's own block, with history | The same right for each proposed table, and for an entry in a folder the client cannot edit | `ARCHITECTURE.md`. Clause 16.9 states what Time needs |
| Retention | Nothing is removed by time. A canceled residency keeps its record. `ARCHITECTURE.md`, account lifecycle | How long a recording, a transcript, a statement, and a row of history are kept | A governing decision. This document sets no period |
| Deletion | `ARCHITECTURE.md` keeps the record when a residency is canceled. Deleting an account removes the client's rows in each table. In the test database the deletion failed once a block had a row of history, since history refuses a delete. The proposal in Appendix A does not change that | What a client can have deleted, what has to be kept, and how the two rules meet | A governing decision, then `ARCHITECTURE.md` |
| Backup | No document states the backup of the database. The settings of the hosting service were not checked for this document | What is backed up, how often, and for how long | `ARCHITECTURE.md`, after a check of the hosting service |
| Recovery | No procedure is written | How a lost entry is restored, and how a restore meets the history | `ARCHITECTURE.md` |

16.14.2 No part of this document guarantees that no data is lost. That statement needs a decision and a test of a restore.

## 17. Workflows

17.0.1 Each workflow states where it starts, what comes in, what authorizes each write, what is filed, what the agent does, and what the client sees. C is the client. A is the agent. S is software. G is the guide.

17.0.2 No workflow below is built, except the first Plan in 17.2. Each rests on the proposed tables.

17.0.3 `TIME.md` 5.1 has the agent run the folder, and 5.2.1 limits the guide to Guided Life. In workflows 17.1 to 17.7 the agent asks each question. Software prepares the question, the list, and the entry for the agent. The guide acts only inside a guided session: in 17.8, and in 17.6.3, 17.9, and 17.12 where the event takes place in one. Whether software can ask a question of intake in the agent's place is not decided by `TIME.md`. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` lists how an agent hands work to software as an open decision.

### 17.1 Establishing a seven day schedule through conversation

17.1.1 Starts from: Enrollment and Orientation are complete. No schedule item is on file. Comes in: what the client says. Authorizes: the client's own statements. `TIME.md` 2.4.1 and 9.3. Curriculum, section 18.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | A | Reads the application, the Enrollment answers, and each earlier conversation. Curriculum 18.6.1 | Nothing |
| 2 | A | Asks one question that names its purpose. `TIME.md` 6.1 | The message |
| 3 | C | States what comes back each week | The statement. One schedule item for each recurring commitment, with the client's words for the recurrence |
| 4 | A | Establishes the five facts of Curriculum 18.5.2, one at a time, and only where the fact is missing | The days and the time. One cost item for each trip and for preparation. Whether the time can move. Paid, unpaid, or neither |
| 5 | C | Describes one past day as what happened | Blocks with the status observed. `TIME.md` 6.11 |
| 6 | S | Compares the items with the eleven kinds, as a check for the agent. Curriculum 18.7.2 | Nothing. The agent console lists the kinds with no item |
| 7 | A | Asks about one named gap, where an open requirement depends on it. `TIME.md` 6.12 | The answer, or nothing. A gap is never filled. `TIME.md` 8.6 |
| 8 | A | Files that the first schedule is assembled | Clause 17.1.2 |

17.1.2 Open: what proves that the first seven day schedule is on file. `TIME.md` 9.3 opens the home of the Resident Portal on that fact, and 10.2 makes it an operational condition. No kind of time is required, so no count of items can prove it. Curriculum 18.6.2. Recommendation: the agent files one moment for the client, after the client has stated that no further commitment comes back each week. Reason: the fact is a judgment about what the client said, and the agent is the person who answers for it. Decided by: the founder, entered in `TIME.md` 10.2. Appendix A carries the field so that it could be tested. A client cannot write it. Tests T-SET-01 and T-SET-03.

17.1.3 The client sees one question at a time, and the day view filling with items marked estimated. The agent sees each schedule item, each empty fact, the kinds with no item, and the unaccounted hours.

17.1.4 A recurrence stated in plain words becomes a rule under 2.6.3. Every Saturday is a direct statement. Most weekends needs interpretation and is filed as a proposal.

### 17.2 Creating and confirming a daily Plan

17.2.1 Starts from: schedule items on file. Comes in: the day, and what the client says is different. Authorizes: the client's confirmation. `TIME.md` 5.3.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | S | Shows the day from the schedule items, with each commitment already dated for it | Nothing. The view is derived |
| 2 | A | Asks what is different from usual. `TIME.md` 6.4 | The message |
| 3 | C | Adds, moves, or takes off a commitment | Each change, with the client's decision as its basis |
| 4 | A | States each pair of commitments that overlap, and asks which one holds. `TIME.md` 7.7 | The client's decision |
| 5 | A | For the first Plan alone: asks how realistic the Plan feels. An unlikely Plan is simplified or moved before it is saved. `TIME.md` 5.3.3 | `realism` |
| 6 | A | For the first Plan alone: asks what time Daily Close belongs in the day. `TIME.md` 5.3.4 | `daily_close_at` in the settings, as the client's usual time, and on the Plan |
| 7 | C | Confirms | The Plan with `confirmed_at`. For each recurring item of the day: one block where the item has a time, and one commitment and one Plan item where the item is a commitment |

17.2.2 The client sees the Plan as a list in order of time, and one action that confirms it. The agent sees whether each day has a Plan and whether it is confirmed.

17.2.3 Built: the first Plan, for the day after the current day, as one screen with five questions. It writes blocks alone. Steps 1, 4, and 7 are not built. A later Plan cannot be made.

### 17.3 Adding and editing a commitment

17.3.1 Starts from: a file with or without a Plan for the day. Comes in: a statement, or a change made by hand. Authorizes: the client's decision. `TIME.md` 3.3.4 and 8.7.

| Event | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| The client states a commitment | C, then A or S | The action, and each condition the same sentence held, are filed at once. `TIME.md` 3.3.3 | The commitment. A block, where a time was stated. A Plan item, where that day has a Plan |
| The client adds a block by hand on a future date | C | The block is a commitment unless the client marks it as a cost | The block and the commitment, with the client as source |
| The new block overlaps a live block | S detects. A states it | The client decides which one holds. Both stay until then | The decision. Clause 9.3 |
| No travel is attached | S detects. A asks once | The client answers | A cost block, or `travel_needed` set to no |
| The controlled hours fall below the client's target | S calculates, once 9.7 is decided. A states the two figures | The agent can recommend. The client decides. `TIME.md` 7.13 | The decision, or nothing |
| The client changes the time | C, or A or S with the statement | The block changes. The Plan item keeps the planned time | A revision. An update message, where the client turned updates on and did not make the change |
| The change affects a consequence or a minimum on file | S detects. A states the effect | The client decides. `TIME.md` 7.8 | The decision |
| The client takes it off | C | The commitment is withdrawn | Clause 2.2.15 |

17.3.2 The client is asked for a condition only when it is relevant to the next decision. A commitment can go on a Plan with three facts. `TIME.md` 3.3.4.

### 17.4 Applying a standing permission

17.4.1 Starts from: no permission. Comes in: the client's answer to an approved question. Authorizes: the client alone. `TIME.md` 5.6.3.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | A | Asks the approved question. `TIME.md` 6.7 | The message |
| 2 | C | Says yes | One standing permission, with the version of the wording and the statement |
| 3 | S | An event the permission covers takes place | Nothing yet |
| 4 | S | Checks that the permission is in force, that it covers this action, and that 6.7 holds | Nothing yet |
| 5 | S | Carries out the action in one transaction | The entry, with the source `ai`, the basis standing permission, and the permission as its reference |
| 6 | S | Sends a notice, where notices are on | The message, as an automated Universe City message |
| 7 | S | Where step 4 fails, stops | A follow up owned by the agent. Clause 6.8 |
| 8 | C | Withdraws the permission, in any form | The moment and the statement. Each earlier action stays |

17.4.2 The client sees each permission in force in the settings view, and each action carried out under it. The agent sees the same, with each failure.

### 17.5 Filing a partial or a completed execution

17.5.1 Starts from: a commitment with Execution planned. Comes in: the client's report, in any form. Authorizes: the report. `TIME.md` 3.6.6.

| The client reports | What is filed | What follows |
| :-- | :-- | :-- |
| It happened | Executed. Timing as the client stated it. Consequences not established | The four steps of `TIME.md` 5.5 |
| It happened at a different time, and no other commitment was affected | Executed. Changed. None confirmed. The block at the actual time, observed | The same. The result reads as confirmed successful. `TIME.md` 11.6.3 |
| It happened late, and an appointment was missed | Executed. Changed. Reported, with one consequence row | The agent raises the consequence at the next Review. `TIME.md` 11.6.9 |
| A part happened | Partly executed | One question: is the remaining part still required. Where yes, a new commitment that continues the first |
| It did not happen | Did not happen. The block is taken off where it holds no second commitment. Clause 3.9.1 | The same question. The client decides whether the work is kept, moved, or removed. `TIME.md` 7.4 |
| The last step is done, and the steps were stated as the whole | Executed, by the rule in 2.2.5.1 | The four steps of `TIME.md` 5.5 |
| Nothing | Nothing. Execution stays planned | Clause 8.2 decides whether a question is asked at Daily Close |

17.5.2 The agent asks about consequences in two cases only: the client stated a consequence in advance, or the new time overlaps a second commitment. `TIME.md` 11.6.11.

### 17.6 A change, and two commitments that compete

17.6.1 Starts from: a confirmed Plan. Comes in: a new fact during the day. Authorizes: one of the three cases in `TIME.md` 5.10.5.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | C, or a second folder | A change arrives: a new commitment, a later end, a cancellation | The statement |
| 2 | S | Finds each block the change overlaps, each consequence on file, and each minimum that applies | Nothing |
| 3 | S | Where the client agreed an alternative in advance for that commitment, carries it out. `TIME.md` 5.10.5 | The change, with that basis |
| 4 | A | In every other case states the conflict and what is on file about each side. Can recommend under section 11. `TIME.md` 7.7. In a guided session the guide opens a follow up for the agent under 6.8 | A recommendation, where one is made |
| 5 | C | Decides which commitment holds, and whether the second one moves or comes off | The Plan item as moved or taken off, with the client's decision and the first commitment as its reference |
| 6 | S | Moves the cost blocks of each changed commitment, where `update_schedule` is in force | The revisions, with the permission |

17.6.2 The client sees the two commitments, the figures on file, and one question. The client never sees a change that software decided between two commitments. `TIME.md` 5.6.7.

17.6.3 Being behind is a separate case. No two commitments hold the same time. The open work is longer than the time left. Clause 10.7.1. There a `behind_schedule` permission, where the client granted one, moves the open work in the order the client set. `TIME.md` 5.13.2 and 5.13.3. With no such permission, the agent or the guide states the two figures and recommends, and the client decides.

### 17.7 Daily Close and follow through

17.7.1 Starts from: a confirmed Plan for the day, and the time of Daily Close on it. Comes in: the client's answers. Authorizes: the client's reports, and each standing permission in force. `TIME.md` 5.4.5 and 5.5.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | S | Prepares the list: each commitment that already has an outcome from the day, and each one 8.2 selects for a question | Nothing |
| 2 | A | Asks did today go as planned | The answer, in `went_as_planned`. Clause 9.5 |
| 3 | A | Asks about each selected commitment by name. Asks nothing about a commitment the client already reported. `TIME.md` 5.11.9 | Each outcome |
| 4 | S | For each executed commitment, runs the four steps of `TIME.md` 5.5 | Covered work is placed. Each further piece is prepared for the agent. A follow up for each missing piece |
| 5 | A | Asks about each open follow up the client owns that is due | The answer. The follow up closes where its requirement is met |
| 6 | A | Presents the next day and asks what is different | Workflow 17.2 |
| 7 | S | Marks Daily Close complete | `closed_at` on the Plan |

17.7.2 The client is asked for four kinds of input only. `TIME.md` 5.5.6. The client is never asked to recall the whole day. `TIME.md` 5.4.7.

17.7.3 Whether one Daily Close is one session is an open question in `docs/product/SESSIONS.md`. Requirement SR-4.

### 17.8 A guided session the client starts with no block

17.8.1 Starts from: a file. No block for the activity. Comes in: the client opens Guided Life. Authorizes: the client's reports and decisions. `TIME.md` 5.12.3.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | C | Starts a session with no block | The session, with how it started |
| 2 | G | States that it is software. Reads the context of the day | Nothing |
| 3 | C | Says what the client is doing, or asks a question | The statement |
| 4 | G | Answers from a query in section 5. Reads a folder only under 10.19 | Nothing |
| 5 | C | Reports an event | A block as reported. No existing block and no existing commitment changes. `TIME.md` 3.6.11 |
| 6 | C | Decides to add a commitment | The commitment, with the client's decision |
| 7 | C | Ends the session | The moment. The summary, where the session produced a result |

17.8.2 One case. The client reports a stop at a store during a break in a shift. The stop is filed as a reported block. The shift stays planned. No purchase is on file. `TIME.md` 3.6.12.

### 17.9 A conversation that produces a proposed change

17.9.1 Starts from: a statement that needs interpretation. Comes in: typed or spoken words. Authorizes: nothing. A proposal is preparation. `TIME.md` 5.6.5.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | C | Says most weekends I help my sister | The statement |
| 2 | S | Finds that no direct fact can be filed: which days, and which weeks, are not stated | Nothing |
| 3 | A, or G in a guided session | Asks one question, where the client can answer now. `TIME.md` 6.14.3 | The answer. A direct answer is filed as a fact, and the workflow ends |
| 4 | S | Where it cannot ask, files a proposal with the reading, the reason, and the statement | A row in `proposals`, state proposed, origin `ai` |
| 5 | C | Sees the proposal, marked as proposed and not in effect | The client's answer. Requirement SR-7 |
| 6 | A | Decides: confirmed, edited, or rejected | The decision. On confirmed or edited, the entry is written with the proposal as its reference |

17.9.2 Typed and spoken words follow the same six steps. The form of the conversation changes no step.

### 17.10 The client corrects an entry

17.10.1 Starts from: an entry on file. Comes in: the client states that it is wrong. Authorizes: the client's statement. `TIME.md` 5.14.5.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | C | Opens the entry and reports the mistake, or says it in conversation | The statement |
| 2 | S | Finds the entry. Where more than one entry fits, asks which one | Nothing |
| 3 | C, A, or S | The entry is changed through the correction function | The entry. One row of history with both values, the reason, and the statement |
| 4 | S | Each figure and each derived item is calculated again the next time it is read | Nothing |
| 5 | S | Where the entry was named in a summary, the summary marks it as corrected later | Nothing new |
| 6 | A | Sees the correction in the history of the client | Nothing |

17.10.2 The original statement stays. The entry the client corrected stays in the history. Nothing is deleted.

17.10.3 A correction to an entry in a folder the client cannot edit is filed as a follow up owned by the agent.

### 17.11 The summary of a session, and reading an earlier fact

17.11.1 Starts from: a session that ended. Comes in: the rows that carry its identifier. Authorizes: nothing. A summary is derived. `TIME.md` 5.14.3.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | S | Assembles the five lists from the rows of the session. Clause 10.11.1 | The summary, as references |
| 2 | C | Reads it. Each line opens its entry | Nothing |
| 3 | C | Brings it into the Review | Requirement SR-14 |
| 4 | C or A | Later asks what a past entry was | Nothing |
| 5 | S | Reads the Plan item, the schedule item, or one row of history. Clause 16.7 | Nothing |

17.11.2 A proposed change is never listed as filed. `TIME.md` 5.14.4.

### 17.12 Oversight by the agent, and bringing a person in

17.12.1 Starts from: software at work for a client. Comes in: one of the four cases in `TIME.md` 5.6.6. Authorizes: the agent's judgment, inside the client's authority.

| Step | Who | What happens | What is filed |
| :-- | :-- | :-- | :-- |
| 1 | S | Meets one of the four cases: not clearly covered, judgment needed, interpretation needed, or the client asked for a person | Nothing has changed |
| 2 | S | Opens a follow up for the agent, with the case and what it came from | The follow up |
| 3 | S, or G in a guided session | Tells the client that the agent has it | The message |
| 4 | A | Reads the commitment, the statement, and the permission | Nothing |
| 5 | A | Carries out the work, asks the client, or files and decides a proposal | The entry, with the agent as source |
| 6 | A | Closes the follow up with what met it | The closing |
| 7 | A | In Guide Mode, reads each session, each recommendation, and each automatic action, and corrects where needed | A correction, with the reason |

17.12.2 The client's decision is still required in the six cases of `TIME.md` 5.6.7. The agent recommends. The agent does not decide them.

## 18. Failure handling and recovery

18.1 Proposed. Each failure below states what is kept and what happens next.

| Failure | What is kept | What happens next | Who is told |
| :-- | :-- | :-- | :-- |
| A write fails part way | Nothing of that write. One transaction for one act | The act can be tried again | The one who made it |
| An automatic action fails | The file as it was | Tried three times in all, then a follow up for the agent. Clause 6.9 | The agent |
| The same automatic action runs twice | One result | The second run writes nothing | No one |
| A day is made from the schedule twice | One block for one item | The database refuses the second | No one |
| A message cannot be delivered | The message, marked not delivered | Tried again. A reminder is never sent after its commitment starts | The agent, in the console |
| The connection is lost in a session | Each report already made | Clause 10.4 | No one |
| A spoken report was heard wrongly | The report as filed, and the turn it came from | The client corrects it. Workflow 17.10 | The agent sees the correction |
| Software filed a wrong entry under a permission | The entry and its permission | The agent or the client corrects it. The permission can be withdrawn | The agent |
| The client and software change one entry at the same moment | Both changes, in order, in the history | The later write stands. The client's write is not overwritten by software: a function reads the entry again before an automatic write | The agent, where the automatic write was dropped |
| A proposal waits with no decision | The proposal, as proposed | It stays proposed. It never takes effect by waiting | The agent, in the console |
| A follow up stays open | The follow up | It is asked once at each contact where it is due. Clause 2.3.5 | The owner |
| The client's device has the wrong clock | The server's moment on each write | A planned time is local text and does not depend on the device | No one |
| The clock changes for the season | Local times as stored | Each calculation uses the client's timezone. A week can hold 167 or 169 hours | No one |
| The client changes timezone | Local times as stored | Open. No document states what a planned time means after a move. Decided by: `ARCHITECTURE.md`, in its section on timezone | The agent |
| An entry is lost from the database | Unknown | No procedure is written. Clause 16.14 | Not decided |
| An account is to be deleted | Every row. The built database refuses the deletion once a block has history | No procedure is written. Clause 16.14 | Not decided |

## 19. Acceptance criteria and test cases

19.1 Each case states the rule it tests, in the form given, when, then. Each case has one of three statuses.

| Status | Meaning |
| :-- | :-- |
| Built | The case was run in the local test database on the four migration files. It shows how the database behaves today |
| Proposal | The case was run in the local test database with Appendix A applied. It passed. It shows that the proposed rule works. It is no test of code in the repository |
| Written | The case is written. It needs functions or screens that do not exist |

19.1.1 No case was run on the Universe City database. No application test exists in the repository. The file `package.json` holds no test command.

19.1.2 The repository holds one test file, `supabase/tests/0002_security.sql`, with eight tests. It was run in the local test database. Tests 1, 2, and 3 passed. The file stopped at test 4. Test 4 expects an error when a client edits a row of history. The database changes no row and raises no error, so the test reports a failure while the history is intact. Test 8 names a variable outside the block that declares it and cannot run. With test 4 changed to count the rows that were edited, tests 4 to 7 passed. Test 8 was left as written. Whether the file runs clean on the hosted database was not checked. Developments, section 8.

19.1.3 Sixteen cases show the built database. Fifty seven cases ran on the proposed rules. Thirty three cases ran on the reference queries. Forty five cases are written and wait for code.

19.1.4 With Appendix A applied, repository test 4 has to change in one more way. It writes an observed block for 2:00 PM on the current day. Before 2:00 PM the proposed rule of 2.1.13 refuses that block.

### 19.2 How the built database behaves

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| B-01 | `ARCHITECTURE.md`, provenance | A client | The client writes a block and names the source as software | The block is stored with the source resident | Built. Repository test 5 |
| B-02 | `ARCHITECTURE.md` rule 2 | A block ending at 10:00 PM | The client changes the end to 10:45 PM | One row of history holds both times. One block exists. The row of history cannot be changed | Built. Repository test 4 |
| B-03 | Provenance | An agent | The agent writes a block with the source `ai` | Refused | Built |
| B-04 | Access matrix | An agent | The agent deletes a client's block | No row is deleted | Built |
| B-05 | `ARCHITECTURE.md` rule 1 | The service role | It writes a proposal | Stored, origin `ai`, state proposed | Built |
| B-06 | `ARCHITECTURE.md` rule 1 | A client | The client writes a proposal, then tries to confirm one | Both refused | Built. Repository test 6 |
| B-07 | `TIME.md` 5.8.1 | A block that was never changed | The client deletes it | The row is gone and no history exists. Out of step. Clause 2.1.12 | Built |
| B-08 | `TIME.md` 5.8.1 | A block that was changed once | The client deletes it | The delete fails. Out of step | Built |
| B-09 | `TIME.md` 5.8.1 | A shift with a travel block | The client deletes the shift | Both rows are gone. Out of step | Built |
| B-10 | Clause 16.14 | A client with one row of block history | The account is deleted | The deletion fails | Built |
| B-11 | `TIME.md` 3.6.1 | A planned block on the next day | The client sets its status to observed | Accepted. Out of step. Clause 2.1.13 | Built |
| B-12 | Clause 2.1.6 | A client | The client writes a block that starts at `9am` with an unknown kind | Accepted. Out of step | Built |
| B-13 | Clause 2.1.11 | A block | It is changed | The row of history has no reason | Built |
| B-14 | Clause 2.1.17 | An agent, then the service role | Each writes a block and names no source | Both blocks are stored with the source resident. Out of step | Built |
| B-15 | Requirement SR-1 | A statement of the client | The client edits it, then deletes it | Both accepted | Built |
| B-16 | Requirement SR-1 | An agent | The agent writes a statement for the client | Accepted. The row holds no speaker | Built |

### 19.3 Blocks, the schedule, and who wrote a row, on the proposal

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| T-BLK-03 | `TIME.md` 3.6.1 | A client | A block on the next day is written as observed | Refused | Proposal |
| T-BLK-04 | Clause 2.1.6 | A client | A block is written with a start of `9am`, and one with an unknown kind | Both refused | Proposal |
| T-BLK-05 | `ARCHITECTURE.md`, timezone | A client | A sleep block is written from 10:00 PM to 6:00 AM, stored as ending at `30:00` | Accepted, on the day it started | Proposal |
| T-BLK-06 | `TIME.md` 5.8.1 | A planned block | The client deletes it, then takes it off | The delete changes no row. Taking it off keeps the row and writes one row of history | Proposal |
| T-BLK-07 | `TIME.md` 3.6.2 | Two estimated blocks on a past day. One was filed with a statement | The agent sets the first to observed with no statement. The agent sets the second to observed on the statement it was filed with. The agent sets the first to observed with the client's statement of what happened | Refused. Refused. Accepted | Proposal |
| T-BLK-08 | `TIME.md` 3.6.1 | A client, before 11:58 PM | A block that starts at 11:58 PM on the current day is written as observed | Refused | Proposal |
| T-BLK-09 | Clause 2.1.11 | A block | It is corrected with a reason | The row of block history holds the reason | Proposal |
| T-SCH-01 | Clause 2.6.3 | A client | A schedule item is written with a recurrence in free words | Refused | Proposal |
| T-SCH-02 | Clause 2.6.4 | One schedule item | Software writes the block for one day twice. The client takes the block off. Software writes it a third time | The first is stored with the source `ai`. The second and the third are refused | Proposal |
| T-SCH-03 | Clause 2.6.4 | The same item | The commitment for one day is written twice | The second is refused | Proposal |
| T-SCH-04 | Clause 2.6.4 | A block made for one day | The client moves it to the next day. Software writes the next day's occurrence, then the moved occurrence again | Accepted, then refused | Proposal |
| T-STM-01 | Clause 6.14.1.1 | The service role | It writes a schedule item with no statement | Refused | Proposal |
| T-SRC-01 | Clause 2.1.17 | The service role | It writes a commitment and names the source resident | The row reads `ai` | Proposal |
| T-SRC-02 | Clause 2.1.17 | An agent | The agent writes a commitment the client decided, with no statement. Then with the statement, naming the source resident | Refused. Then accepted, and the row reads `agent` | Proposal |

### 19.4 Commitments and steps, on the proposal

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| T-COM-01 | `TIME.md` 3.3.6, 3.3.8 | A client | A commitment is written with a label and a block | Execution planned. Consequences not established. Source resident | Proposal |
| T-COM-02 | `TIME.md` 3.6.4 | The service role | It writes a commitment as the client's decision, with no statement | Refused | Proposal |
| T-STP-01 | `TIME.md` 3.3.17 | Four steps. The client never stated that they are the whole | All four are reported done | Execution stays planned | Proposal |
| T-STP-02 | `TIME.md` 3.3.16 | Four steps, stated as the whole | Two are reported. Then one is marked not needed and the last is reported | Planned after two. Executed after the last, with Timing not established and Consequences not established | Proposal |
| T-STP-03 | `TIME.md` 3.3.18 | One step, and one suggested step the client has not accepted. Stated as the whole | The first step is reported | Executed. The suggested step counted for nothing | Proposal |
| T-STP-04 | `TIME.md` 3.3.18 | The same suggested step | It is reported done | Refused | Proposal |
| T-STP-05 | `TIME.md` 3.3.16 | Two steps, both reported. The client has not stated that they are the whole | The client states that they are the whole | Planned before the statement. Executed after it | Proposal |
| T-STP-06 | `TIME.md` 3.3.14 | An open step that was named in a statement | The agent reports it with no statement of the report, then with one | Refused, then accepted | Proposal |
| T-STP-07 | Clause 2.2.5.3 | A commitment | The agent files that the steps are the whole with no statement, then with one | Refused, then accepted | Proposal |

### 19.5 Outcomes, on the proposal

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| T-OUT-01 | `TIME.md` 3.6.6 | A planned commitment | Execution is set to executed with no basis and no Timing | Refused | Proposal |
| T-OUT-02 | `TIME.md` 3.6.1 | A planned commitment | An outcome is filed with an actual date of the next day | Refused | Proposal |
| T-OUT-03 | Clause 3.3 | A partly executed commitment | Execution is set to executed | Refused | Proposal |
| T-OUT-04 | Clause 3.19 | The same commitment | The same change is made as a correction with a reason | Accepted. The history holds planned, partly executed, and executed, with the reason and the client as origin | Proposal |
| T-OUT-05 | `TIME.md` 11.6.8 | A planned commitment | It is filed as did not happen with Timing changed, then with no Timing | Refused, then accepted | Proposal |
| T-OUT-06 | `TIME.md` 3.3.7 | A commitment with no block | It is filed as executed, as planned | Refused. No planned time exists to match | Proposal |
| T-OUT-07 | `TIME.md` 3.6.6 | A planned commitment | It is filed as executed on evidence, with no entry named | Refused | Proposal |
| T-OUT-08 | Clause 3.11.2 | An executed commitment with Timing not established | The client states the time. Then Timing is set from changed to as planned with no reason | Accepted. Then refused | Proposal |
| T-CON-01 | `TIME.md` 3.6.5 | A planned commitment | An expected consequence is written, then a reported one | Consequences stays not established, then becomes reported | Proposal |
| T-CON-02 | `TIME.md` 3.3.2 | An executed commitment | The client says none was affected. Later the client reports a consequence. Then Consequences is set back to none confirmed with no reason | Accepted. Accepted, and Consequences reads reported. Then refused | Proposal |
| T-CON-03 | Clause 3.11.2 | A commitment the client marked executed on a screen | The agent marks it important. The agent files none confirmed with no statement. The agent files a reported consequence with no statement, then with one. The agent files the time with its statement | Accepted. Refused. Refused, then accepted. Accepted | Proposal |
| T-WDR-01 | Clause 2.2.15 | A withdrawn commitment | An outcome is filed | Refused | Proposal |
| T-SW-01 | `TIME.md` 3.6.4 | A commitment | Software files an outcome as the client's report with no statement | Refused | Proposal |
| T-SW-02 | `TIME.md` 3.6.10 | The same commitment, and a statement by the client | Software files the outcome with the statement | Accepted | Proposal |

### 19.6 Plans, follow ups, permissions, recommendations, settings, and access, on the proposal

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| T-PLN-01 | Clause 2.5.2 | A Plan the client wrote | The client confirms it | `confirmed_at` is filled. The database files the client as the one who confirmed | Proposal |
| T-PLN-02 | Clause 2.5.2.3 | A Plan software prepared | Software confirms it with no statement, then with the client's statement | Refused, then accepted | Proposal |
| T-PLN-03 | Clause 2.5.3 | A Plan for one day | A second Plan is written for the same day | Refused | Proposal |
| T-PLN-04 | `TIME.md` 5.10.5 | An item on a Plan | Its state is set to moved with no basis | Refused | Proposal |
| T-FUP-01 | `TIME.md` 3.4.2 | An agent | A follow up is written with no origin. Then the client tries to close a follow up the agent owns | Both refused | Proposal |
| T-FUP-02 | Clause 2.3.4 | A follow up the agent owns | The client sets its owner to the client | Refused | Proposal |
| T-FUP-03 | Clause 2.3.2 | The same follow up | The agent closes it with no statement of what met it, then with one | Refused, then accepted | Proposal |
| T-PRM-01 | `TIME.md` 5.6.3 | The service role | It writes a standing permission, naming itself. Then naming no source, with a statement | Both refused | Proposal |
| T-PRM-02 | Clause 3.16 | An agent | The agent writes a permission with no statement, then with the client's statement | Refused. Then accepted, and the row reads `agent` | Proposal |
| T-REC-01 | Clause 11.2.1 | A recommendation by the guide | The client rewrites what it rests on. Then the client declines it | Refused, then accepted | Proposal |
| T-REC-02 | `TIME.md` 5.10.8 | A declined recommendation | The same recommendation is made in the same conversation, then in a later one | Refused, then accepted | Proposal |
| T-REC-03 | `TIME.md` 5.10.3 | A commitment and a Plan | A recommendation is made and declined | No commitment and no Plan item changed, and no row was added to their history | Proposal |
| T-REC-04 | Clause 11.4 | The service role | It writes a recommendation and names the agent as its maker | The row reads `ai` | Proposal |
| T-SET-01 | Clause 17.1.2 | A client | The client files that the first schedule is assembled, at the first write and at a later one | Both refused | Proposal |
| T-SET-02 | Clause 2.7.1 | A client's settings | The client turns reminders on | One row of history | Proposal |
| T-SET-03 | Clause 17.1.2 | An agent | The agent files that the first schedule is assembled | Accepted | Proposal |
| T-HIS-01 | `ARCHITECTURE.md` rule 2 | A row of history | It is edited | Refused | Proposal |
| T-DEL-01 | Clause 2.7.1 | An agent | The agent deletes a client's commitments | No row is deleted | Proposal |
| T-ACC-01 | Access matrix | A second client | That client reads commitments, Plans, and history | No row of the first client is returned | Proposal |
| T-INT-01 | `TIME.md` 4.4.7 | A commitment on a Plan | The client reads the view for Integrity | One row, with the label, the Plan date, and Execution | Proposal |

### 19.7 Workflows

| Case | Rule | Given | When | Then | Status |
| :-- | :-- | :-- | :-- | :-- | :-- |
| W-01 | `TIME.md` 2.4.1 | No schedule item | The client says I work Monday to Friday, nine to five | One schedule item with those days, those times, and the client's words. Marked estimated. The statement attached | Written |
| W-02 | `TIME.md` 6.11 | The same client | The client says what usually happens, then what happened yesterday | A schedule item for the first. An observed block for the second | Written |
| W-03 | `TIME.md` 8.6 | A week with forty hours on file | The schedule is displayed | The remaining hours read as unaccounted. No block was written for them | Written |
| W-04 | `TIME.md` 9.3 | One block on file. No schedule filed as assembled | The client opens the Resident Portal | The home does not open yet. Today it opens | Written. Fails on the built code |
| W-05 | `TIME.md` 5.3.3 | A first Plan the client calls unlikely | The client tries to save it | It is not saved until one commitment moves or comes off. Today it is saved | Written. Fails on the built code |
| W-06 | Clause 2.6.4 | Three recurring items fall on Monday | The client confirms Monday's Plan, twice | One Plan. Three blocks, three Plan items. No second copy | Written |
| W-07 | `TIME.md` 3.3.3 | A client | The client says groceries at 5:00 PM, and they have to be done before dinner at 7:00 PM | A commitment, a block, and a deadline from one sentence. No second question about the time | Written |
| W-08 | `TIME.md` 7.7 | An appointment at 5:00 PM | Groceries are added at 5:00 PM | Both stay. The conflict is stated once. The client decides | Written |
| W-09 | `TIME.md` 7.9 | A commitment with no travel | It is added. The client answers that no travel is needed | One question. It is never asked again for that commitment | Written |
| W-10 | `TIME.md` 5.5.4 | `place_work` in force. Washing has a Follow through action with a time on file | The client reports the washing done | The drying is placed, with the source `ai` and the permission. No question is asked | Written |
| W-11 | Clause 6.7 | The same, and the time already holds a block | The client reports the washing done | Nothing is placed. A follow up for the agent states that the action was not covered | Written |
| W-12 | Clause 3.16 | The permission was withdrawn | The same event takes place | Nothing is placed. Each earlier placement is still on file | Written |
| W-13 | `TIME.md` 11.6.8 | Groceries planned for 5:00 PM | The client says they happened at 7:00 PM and nothing else was affected | Executed, changed, none confirmed. The block reads 7:00 PM, observed. The Plan item still reads 5:00 PM | Written |
| W-14 | `TIME.md` 11.6.11 | Groceries planned for 5:00 PM and an appointment at 7:00 PM | The client says the groceries happened at 7:00 PM | One question about the appointment. With no overlap and no consequence stated in advance, no question | Written |
| W-15 | `TIME.md` 11.6.6 | A planned commitment | The client says a part happened, and the rest is still required | Partly executed, kept. One new commitment that names the first | Written |
| W-16 | `TIME.md` 8.9 | A commitment on the Plan. The day ends with no report | Daily Close does not take place | Execution stays planned. No view and no message reads missed | Written |
| W-17 | `TIME.md` 5.4.6 | A Plan with one new commitment and one established commitment | Daily Close runs | The first question, then one question by name about the new commitment. None about the established one | Written |
| W-18 | `TIME.md` 5.11.9 | The client reported a commitment at 2:00 PM in a guided session | Daily Close runs | That commitment is not asked about | Written |
| W-19 | `TIME.md` 5.7 | Groceries with a purchase amount stated. Finance not operational | The client reports the shopping | Executed. The statement kept. One entry for Finance. One follow up for the agent. The shopping stays executed | Written |
| W-20 | `TIME.md` 7.6 | A weekly schedule item | Its day comes due | The occurrence is on the schedule. No question was asked | Written |
| W-21 | Clause 7.8 | Reminders on, thirty minutes. A commitment at 5:00 PM | 4:30 PM arrives. In a second run the commitment already has an outcome. In a third the moment passed during quiet hours | Sent. Not sent. Not sent late | Written |
| W-22 | `TIME.md` 5.4.12 | A notice sent under a permission | The client reads it | It reads as an automated Universe City message. No message from software carries the agent's name | Written |
| W-23 | `TIME.md` 3.6.12 | A shift planned from 9:00 AM to 5:00 PM | In a session with no block, the client reports a stop at a store at noon | One reported block. The shift is still planned. No purchase is on file | Written |
| W-24 | `TIME.md` 5.14.4 | A session with one filed step, one change, one proposal, and one open follow up | The session ends | A summary with those four, each in its own list. The proposal is in the list of what has not taken effect | Written |
| W-25 | `TIME.md` 5.11.4 | Two copies of one file | One client reports a step on the screen. One reports it by voice | The same rows in both, apart from the form of the statement | Written |
| W-26 | `TIME.md` 5.6.5 | A voice session | The client says yes, always do that, and approve the change | A permission is granted only through the approved question. No proposal is decided by software | Written |
| W-27 | Clause 10.18 | A client who asked for a warmer style | The guide states an update to the schedule | Each time, label, and status in the message equals the result of the first pass | Written |
| W-28 | `TIME.md` 5.2.6 | A guided session | The client asks for the agent | The session is paused. One follow up for the agent. The guide states that it was opened | Written |
| W-29 | Clause 10.4 | A session with two reported steps | The connection is lost and returns | Two reported steps. The same state. No outcome was filed | Written |
| W-30 | `TIME.md` 5.12.6 | A fixed commitment at 9:00 AM with no travel on file | The client asks how much time is left | The time until 9:00 AM, a statement that the travel time is not on file, and one question. No travel time is supplied | Written |
| W-31 | Clause 10.7.2 | Two open commitments. One has no length | The time left is calculated | The minutes left, and one commitment with no length. No statement that the client is behind | Written |
| W-32 | `TIME.md` 5.14.5 | A shift filed as ending at 5:00 PM | The client says it ended at 5:40 PM | The block reads 5:40 PM. The history holds both, with the reason. The earlier statement is unchanged. The week figures change on the next read | Written |
| W-33 | Clause 13.11 | A step filed from a spoken report | The client says the step was not done | The step is open again. The history holds the report and the correction. The spoken turn is unchanged | Written |
| W-34 | `TIME.md` 5.6.5 | A statement that needs interpretation | Software reads it | A proposal. No entry changed. The client sees it as proposed. An agent decides it | Written |
| W-35 | Clause 16.7 | Tuesday's shift moved from 9:00 AM to 11:00 AM | The client asks what time it was first planned for | 9:00 AM, read from the Plan item | Written |
| W-36 | `TIME.md` 5.6.6 | Software meets each of the four cases | Each takes place | No entry changes. One follow up for the agent with that case. The client is told | Written |
| W-37 | `TIME.md` 5.14.8 | An entry the guide wrote | The agent corrects it | The history holds both, with the agent as the origin of the second | Written |
| W-38 | Clause 6.9 | An automatic action that fails | It is tried | Three attempts. Then one follow up for the agent. The file is unchanged. No message to the client | Written |
| W-39 | `TIME.md` 5.12.12 | Voice on, at the level times. One commitment marked never spoken | The guide states the next commitment | The time is spoken. No label is spoken at that level. The marked label is spoken at no level | Written |
| W-40 | `TIME.md` 5.12.8 | A block labeled driving | The session is active in it | No question. No lesson | Written |
| W-41 | `TIME.md` 5.10.5, 5.10.8 | A recommendation to move the groceries | The client declines. Later in the same conversation the same case arises. In a second run the client accepts | Not made again. On acceptance, the move is filed as the client's decision | Written |
| W-42 | `TIME.md` 5.12.13 | A folder with no approved Curriculum | A session touches its subject | No lesson. For a Time lesson: one delivery with the folder, the number, and the version | Written |
| W-43 | Clause 8.3 | An established commitment | It differs from the Plan twice inside the period | It gets a question at the next Daily Close | Written |
| W-44 | Clause 2.6.6 | A shift on Monday to Friday | The client says the shift no longer falls on Tuesday | The earlier item ends. A new item starts. Last Tuesday still reads as a shift | Written |
| W-45 | Clause 17.6.3 | A `behind_schedule` permission that moves household work first and protects the pickup. The open work is longer than the time left | The time left is calculated | The household work moves, with the permission as its basis. The pickup stays. Two commitments that hold the same time are still put to the client | Written |

### 19.8 What each case needs before it can run

| Cases | Need |
| :-- | :-- |
| B-01 to B-13 | Nothing. They run today |
| T cases | Approval of Appendix A. They then become tests in the repository |
| W-01 to W-03, W-07, W-34 | Requirement SR-1, and the functions of 6.14 |
| W-04, W-05 | A change to two built files. Clause 20.4 |
| W-10 to W-12, W-38, W-45 | Standing permissions, and requirement SR-10 |
| W-21, W-22 | A delivery method. Clause 7.7 |
| W-23 to W-31, W-33, W-39, W-40 | Guided Life. W-25, W-26, W-33, and W-39 need voice |
| W-35, W-37 | Requirement SR-2 |

### 19.9 The seeded week, and the twenty queries

19.9.1 One client in the timezone of Denver. Four recurring items. A shift on Monday to Friday from 9:00 AM to 5:00 PM that cannot move. Travel to the shift from 8:30 AM, as a cost of it. Getting ready on the same days from 7:30 AM, assumed to take one hour. A gym item on Tuesday and Thursday from 9:15 PM.

19.9.2 The week of October 4 to October 10, 2026.

| Day | On file |
| :-- | :-- |
| Sunday | Rest for one hour, estimated. Sleep from 11:00 PM, estimated |
| Monday | Getting ready, 45 minutes, observed. The shift and both trips, observed, with the trip home taking 40 minutes. Groceries planned for 6:00 PM and reported at 7:00 PM to 7:50 PM with no other commitment affected. Rest for two hours, observed. Sleep, observed |
| Tuesday | Getting ready, 55 minutes, observed. The shift and both trips, observed. Three hours on the client's project, observed. The gym, taken off the Plan by the client before it was due. Sleep, observed |
| Wednesday | Getting ready, 50 minutes, observed. The shift, estimated. Dinner with a friend from 6:30 PM to 8:00 PM and rest from 7:30 PM to 9:00 PM, both observed, overlapping by thirty minutes |
| Thursday | The shift, planned, with no outcome. A clinic appointment from the Health folder, did not happen. The gym, did not happen |
| Friday | Nothing |
| Saturday | The project from 10:00 AM to 2:00 PM and rest from 2:00 PM to 4:00 PM, observed. Washing the clothes, executed, in the ongoing work laundry. Drying the clothes, planned. One block with no end |

19.9.3 Monday, October 12, 2026, at 7:50 AM. Sleep from 11:00 PM on October 11 and on October 12, estimated. A confirmed Plan: getting ready from 7:30 AM to 8:30 AM with four steps, two reported, stated as the whole. Travel at 8:30 AM. The shift at 9:00 AM. Paying the phone bill, fifteen minutes, with no time, a deadline of October 13, and one expected consequence. Calling the clinic, added after the Plan was confirmed, with no time and no length. Groceries at 6:00 PM that can move until 10:00 AM the next day, with the expected consequence that dinner is late. Cooking dinner at 7:30 PM for 45 minutes. On Tuesday, October 13, no Plan: a block for the shift, a class from 6:00 PM to 8:00 PM that cannot move, and sleep from 11:00 PM.

| Case | Question | Expected result | Status |
| :-- | :-- | :-- | :-- |
| Q-12.2a | 12.2, for Monday, October 5 | The shift: executed, as planned, consequences not established. Groceries: planned for 6:00 PM, executed, changed, none confirmed | Proposal |
| Q-12.2b | 12.2, for October 12 | Calling the clinic is marked as added after the Plan was confirmed. No other item is | Proposal |
| Q-12.3 | 12.3 | Four executed. Two did not happen. Two with no outcome. One taken off | Proposal |
| Q-12.4 | 12.4 | Groceries: one follow up for the agent, to enter the amount in Finance. Washing: drying the clothes is still planned | Proposal |
| Q-12.5 | 12.5, for October 12 and 13 | October 12, from the Plan: paying the phone bill needs a time. Calling the clinic needs a time and how the client is getting there. The four further commitments need nothing. October 13, with no Plan: getting ready, the shift, and the gym from the schedule, estimated. The class as a dated commitment, which needs how the client is getting there | Proposal |
| Q-12.6a | 12.6, for the groceries of October 12 | The time can move until October 13 at 10:00 AM. Dinner is late. It affects cooking dinner | Proposal |
| Q-12.6b | 12.6, for calling the clinic | Whether the time can move is not established. No further row | Proposal |
| Q-12.7 | 12.7 | The client: set a new time for the clinic appointment. The agent: enter the grocery amount in Finance | Proposal |
| Q-12.8 | 12.8, for two weeks | Health: the clinic appointment, did not happen. Education: the class, planned | Proposal |
| Q-12.9a | 12.9 | The gym: two occurrences, both differed. One taken off, one did not happen. Groceries differed once and is not listed | Proposal |
| Q-12.9b | 12.9, what changed them | October 6: taken off the Plan, by the client's decision, with the reason on file. October 8: did not happen, with no reason on file | Proposal |
| Q-12.10 | 12.10 | 810 minutes, 13.5 hours. Monday 120, Tuesday 180, Wednesday 150, Saturday 360. `figures()` gives 14.0 hours | Proposal |
| Q-12.11 | 12.11 | Saturday at 10:00 AM, 360 minutes | Proposal |
| Q-12.12 | 12.12, a shift on October 13 from 5:00 PM to 11:00 PM with thirty minutes of travel home | It overlaps the class, which cannot move. It overlaps the gym, from the schedule. It overlaps the sleep block | Proposal |
| Q-12.13a | 12.13, forty five minutes on October 13 between 7:00 AM and 10:00 PM | 5:00 PM to 6:00 PM. 8:00 PM to 9:15 PM. The morning is held by getting ready and travel, from the schedule | Proposal |
| Q-12.13b | 12.13, thirty minutes between 6:00 AM and 9:00 AM | 7:00 AM to 7:30 AM. The sleep that started the day before holds 6:00 AM to 7:00 AM | Proposal |
| Q-12.13c | A market item on every second Saturday from October 3, 2026 | It is read on October 17. It is not read on October 24 | Proposal |
| Q-12.14 | 12.14, for Monday's shift | 550 minutes: 480 paid, 70 unpaid travel | Proposal |
| Q-12.15 | 12.15 | Monday 645 observed. Tuesday 595 observed. Wednesday 50 observed and 480 estimated. Saturday 30 observed. Thursday 480 planned | Proposal |
| Q-12.16a | 12.16 | Observed 3,090 minutes. Estimated 1,020. Planned 480. Unaccounted 5,490, which is 91.5 hours. One block with no end. `figures()` gives 91.0 hours | Proposal |
| Q-12.16b | 12.16, for the week of November 1, 2026 | The week holds 10,140 minutes, which is 169 hours | Proposal |
| Q-12.17 | 12.17 | Assumed 60 minutes. Three observed: 45, 50, and 55. The middle value is 50. No measured length | Proposal |
| Q-12.18a | 12.18, at 7:50 AM | Eat breakfast, the third step of getting ready, the commitment planned for this time | Proposal |
| Q-12.18b | 12.18, after the client skips that step | Pack bag. Eat breakfast is still open | Proposal |
| Q-12.18c | 12.18, after getting ready is reported | The shift, the next commitment by planned time | Proposal |
| Q-12.19a | 12.19, at 7:50 AM | The shift at 9:00 AM. Thirty minutes of travel, planned. Leave by 8:30 AM. Forty minutes left | Proposal |
| Q-12.19b | 12.19, at 5:30 PM | No later commitment that cannot move is on file for the day | Proposal |
| Q-12.19c | Behind, at 7:50 AM | Forty minutes left. Forty minutes of open work. The client is on the Plan | Proposal |
| Q-12.19d | Behind, at 8:45 AM, with getting ready still open | Fifteen minutes past the time to leave. One earlier commitment has no outcome on file. No open work is counted for it | Proposal |
| Q-12.19e | Behind, at 7:50 AM, with one commitment from 6:45 AM to 7:15 AM that the client has not reported, after getting ready is reported | Forty minutes left. No open work. One earlier commitment has no outcome on file. The client is not stated as behind | Proposal |
| Q-12.20a | 12.20, at 7:50 AM | No free minutes, since getting ready holds the time. Paying the phone bill, cooking dinner, and groceries do not fit. Calling the clinic has no length on file | Proposal |
| Q-12.20b | 12.20, at 7:50 AM, after getting ready is reported | Forty free minutes. Paying the phone bill fits. Cooking dinner and groceries are longer | Proposal |
| Q-12.21 | 12.21 | The groceries block: start 6:00 PM to 7:00 PM, end 7:00 PM to 7:50 PM, planned to observed, by the client, with the reason. The gym: Plan item on to taken off, by the client, with the reason | Proposal |

## 20. Implementation status, blockers, and build order

20.1 Each row below was checked against the repository at commit `0dbbeac` on October 11, 2026.

| Part | Specified in | Database | Server code | Screen | Tests |
| :-- | :-- | :-- | :-- | :-- | :-- |
| The block | `TIME.md` 3.2 | Built. `blocks`, in `0001_init.sql` | None. The first Plan writes from the browser | Built. The week view | Repository tests 4, 5, 8 |
| Block history | `ARCHITECTURE.md` rule 2 | Built. `block_revisions`, written by a trigger | `lib/brief.ts` reads it | The agent's brief | Repository test 4 |
| Week figures | `TIME.md` 12.10, 12.16 | None needed | Built. `figures()` in `lib/domain/time.ts` | The week view, the home, the brief | None |
| Day and week in the client's timezone | `ARCHITECTURE.md` | `profiles.timezone` | Built. `lib/domain/dates.ts` | Every Time screen | None |
| The first Plan | `TIME.md` 14.2.5 | Blocks alone | None | Built. `components/FirstPlan.tsx` | None |
| The agent's brief | `ARCHITECTURE.md` rule 3 | `reviews.brief`, a cache | Built. `lib/brief.ts` | Built. One page for one client | None |
| Proposals | `ARCHITECTURE.md` rule 1 | Built. Table and access rules | None | Text with no action | Repository test 6 |
| Reviews | `ARCHITECTURE.md` rule 5 | Built. Table | None | A list for the agent | None |
| What a client raised | `ARCHITECTURE.md` | Built. `statements` | Read by the brief. Nothing writes it | The brief | None |
| What a client said for a folder | `0001_init.sql` | Built. `entries` | Nothing reads or writes it | None | None |
| The conversation | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | Not built | Not built | The agent's part of the screen is static text | None |
| The schedule as a recurring week | `TIME.md` 5.3.2 | Not built. Proposed in 2.6 | Not built | Not built | Proposal |
| The commitment, its conditions, its steps, its outcome | `TIME.md` 3.3 | Not built. Proposed in 2.2 | Not built | Not built | Proposal |
| The Plan as an entry | `TIME.md` 5.3.1 | Not built. Proposed in 2.5 | Not built | Not built | Proposal |
| The follow up. Ongoing work | `TIME.md` 3.4, 3.5 | Not built. Proposed | Not built | Not built | Proposal |
| Daily Close | `TIME.md` 5.4.5 | A block the first Plan writes | Not built | Not built | Written |
| The Morning Plan, reminders, updates, notices | `TIME.md` 5.4 | Not built. Proposed in 7.6 | Not built | Not built | Written |
| Standing permissions. Automatic actions | `TIME.md` 5.6 | Not built. Proposed | Not built | Not built | Proposal, and written |
| Recommendations | `TIME.md` 5.10 | Not built. Proposed | Not built | Not built | Proposal |
| The twenty questions | `TIME.md` 12 | Reference queries in Appendix B | Two figures | Two figures | Proposal |
| The day view, the month view, editing by hand | `TIME.md` 5.8.1, 14.3 | Blocks | Not built | Not built | Written |
| Guided Life, the guide, voice | `TIME.md` 5.11 to 5.14 | Not built | Not built | Not built | Written |

20.2 The parts that block building. Each one has to be decided before the code that depends on it is written.

| Number | Blocker | What it blocks | Proposal | Decided by | Entered in |
| :-- | :-- | :-- | :-- | :-- | :-- |
| B1 | No table holds a commitment. Clause 2.2.2 | Every outcome, Daily Close, follow through, Integrity, Guided Life, and questions 12.2 to 12.9, 12.12, 12.14, and 12.18 to 12.20 | Clause 2.2. Appendix A, parts 5 and 6 | The founder, after the review against `ARCHITECTURE.md` | A migration file. `TIME_OPERATIONS.md` 2.2 |
| B2 | No stored form of a Plan, and no mark of confirmation. Clause 2.5.2 | Every Plan after the first, the operational condition in `TIME.md` 10.3, questions 12.2 and 12.3 | Clause 2.5. Appendix A, part 7 | The same | The same |
| B3 | No stored form of the recurring week. Clause 2.6 | The seven day schedule, `TIME.md` 7.6, the day view for a future day | Clause 2.6. Appendix A, part 4. One library for the recurrence format, confirmed in a prototype | The same | The same |
| B4 | History exists for blocks alone. Requirement SR-2 | Each proposed table. Each one is drafted with a history, on the pattern rule 2 of `ARCHITECTURE.md` sets for a block | Appendix A, part 1, as a candidate | `ARCHITECTURE.md` | `ARCHITECTURE.md` |
| B5 | No store of the conversation. Requirement SR-1 | The statement behind each entry. Schedule intake by conversation. Every message | None by this document | `ARCHITECTURE.md` | `ARCHITECTURE.md` |
| B6 | Two sets of block statuses. Clause 2.1.4 | Each figure, and each view that marks a block | Clause 2.1.4 | The founder | `TIME.md` 3.2 and 14.5.1 |
| B7 | A block can be deleted with no history, and a changed block cannot be removed. Requirement SR-3 | Editing by hand. `TIME.md` 5.8.1 | Clause 2.1.12.1 | `ARCHITECTURE.md` | `ARCHITECTURE.md` |
| B8 | No code files, answers, decides, or applies a proposal. Requirement SR-7 | Every reading that needs interpretation | None by this document | `ARCHITECTURE.md` | `ARCHITECTURE.md` |
| B9 | No decision on retention, deletion, consent, and backup. Requirement SR-12 | Storing the entries of a real client | None by this document | A governing decision | A data policy, then `ARCHITECTURE.md` |
| B10 | Who wrote a row is forced for a client alone. Requirement SR-16 | The rule that an entry software or an agent wrote is marked as such | Appendix A, part 1, as a candidate | `ARCHITECTURE.md` | `ARCHITECTURE.md` |

20.2.1 B1, B2, and B3 are Time's own. B4 to B10 are shared. The tables of B1 to B3 are drafted on two decisions that belong to `ARCHITECTURE.md`: each table has a history, and each value the client stated names a statement. If either is decided a different way, the tables change. They are therefore built after B4 and B5 are decided.

20.3 Decisions that are open, and what each one holds up.

| Clause | Decision | Holds up |
| :-- | :-- | :-- |
| 2.2.15 | What Execution reads for a commitment the client took off the Plan | The commitment table. Integrity |
| 3.3 | Whether a partly executed commitment can later be finished as the same commitment | The commitment table |
| 9.5 | What a yes to the first question of Daily Close files | Daily Close. Asking less |
| 17.1.2 | What proves that the first seven day schedule is on file | The opening of the Resident Portal home |
| 2.1.7 | Whether a block can be filed with no end | The block checks |
| 2.5.8 | The kind of block for time with Universe City | The controlled hours figure |
| 9.7 | The client's target for controlled hours, and the estimate that is compared with it | `TIME.md` 7.13 |
| 10.8 | Whether a step holds a length | `TIME.md` 7.18 |
| 10.14.2 | What closes a session the client left open | The summary of a session |
| 5.14, 5.18, 9.6 | Three definitions for figures | Three questions |
| 6.5, 6.7, 8.2.1, 8.5 | The list of standing permissions, available time, the period for asking less, the order of ready questions | Standing permissions. Daily Close |
| 7.6.3, 7.7, 7.12 | What the four follow up choices do. The delivery methods | Every message |
| 6.6.1, 6.8, 7.10, 12.4, 2.8.3 | Client copy that is not written or not approved | Permissions, bringing a person in, the label of an automated message, the words for each code |
| 12.2, 12.5, 12.6, 13.3, 13.5 | The guide's name, the review of scripts, where a preference is kept, the voice provider, recording | Guided Life and voice |
| 13.6, 13.7, 14.3 | What needs an installed application, a session through a whole day, the link to a procedure | Later parts of Guided Life |
| 18.1, the row on timezone | What a planned time means after a client moves to a different timezone | A client who moves |

20.4 Built files that are out of step with `TIME.md`. Each one can be corrected with no new table, except the second row.

| File | Out of step | Correction |
| :-- | :-- | :-- |
| `components/FirstPlan.tsx` | Saves a Plan the client called unlikely. `TIME.md` 5.3.3 | Clause 2.5.7 |
| `app/(resident)/portal/page.tsx` and `app/(resident)/portal/layout.tsx` | Open the home when one block exists. `TIME.md` 9.3 | Wait for 17.1.2 |
| `lib/domain/time.ts` | Counts a required block as observed. Adds overlapping blocks twice. A comment states twelve kinds | Clauses 4.1.2 and 5.19 |
| `app/(resident)/portal/time/page.tsx` | Prints a time as `9am` | Clause 4.9.2 |
| `supabase/tests/0002_security.sql` | Tests 4 and 8 cannot pass as written | Clause 19.1.2 |

20.5 The order of building. Each stage needs the one before it. No date is attached. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` lists seven build increments for the platform. The stages below are the Time part of its increments 1, 3, 4, and 5.

| Stage | What is built | Needs first |
| :-- | :-- | :-- |
| 0 | Decisions | B4 to B8 and B10 decided. Appendix A approved, with the open clauses of 20.3 that touch a table |
| 1 | The migration. The tests of sections 19.3 to 19.6 in the repository. The two repository tests repaired | Stage 0 |
| 2 | The functions for blocks, the schedule, commitments, and Plans. The first Plan rewritten on the new tables. The day view. Editing by hand | Stage 1 |
| 3 | Outcomes. Daily Close. The follow through of `TIME.md` 5.5. Follow ups. Questions 12.2 to 12.9 | Stage 2. Requirement SR-1 built |
| 4 | Contact settings. Messages in the Resident Portal. The Morning Plan. Reminders | Stage 3. Clause 7.7 decided |
| 5 | Standing permissions. Automatic actions. Recommendations | Stage 3. Requirement SR-10 |
| 6 | The remaining questions. The history the client can read | Stage 3. Requirement SR-8 |
| 7 | Guided Life on the screen | Stages 3 and 5. Requirement SR-4. `TIME.md` 14.4.13 |
| 8 | Voice | Stage 7. Clauses 13.3 and 13.5 decided |

20.6 Guided Life is stage 7. No stage before it depends on Guided Life. `TIME.md` 5.11.10 and 10.9.

## Appendix A. The proposed tables

A.1 Technical proposal. Approved by no one. Applied to no Universe City database. It is written to run after migrations `0001` to `0004`.

A.2 Part 1 is a candidate for requirements SR-2 and SR-16. `ARCHITECTURE.md` decides the form of both. Parts 2 to 10 are the Time tables and the rules the database holds for them.

A.3 It was applied in a local test database on October 11, 2026. Section 19 lists each check that ran against it.

A.4 Five fields carry a recommendation that is still open. Each is here so that the whole could be tested, and each changes if the ruling differs: `withdrawn_at` for 2.2.15, `planned_minutes` for 10.8, `went_as_planned` for 9.5, `schedule_on_file_at` for 17.1.2, and `controlled_minutes_target` for 9.7.

A.5 The proposal leaves one built behavior as it is. An account with a row of history cannot be deleted. Clause 16.14.

```sql
-- TECHNICAL PROPOSAL. Folder 01 Time Operations, Appendix A.
-- Not approved. Not applied to the Universe City database.
-- Written to run after migrations 0001 to 0004.
-- Part 1 is a candidate for two shared requirements. ARCHITECTURE.md decides both.
-- Parts 2 to 10 are the Time tables and the rules the database holds for them.
-- Five fields carry a recommendation that is still open, so that the whole could be tested:
-- withdrawn_at, planned_minutes, went_as_planned, schedule_on_file_at, controlled_minutes_target.

begin;

-- ================================================================
-- 1. CANDIDATE FOR SHARED REQUIREMENT SR-2. Revision history for
--    every File table. Follows the block_revisions pattern.
-- ================================================================
create table file_revisions (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  row_id        uuid not null,
  user_id       uuid not null references profiles on delete cascade,
  before        jsonb not null,
  after         jsonb not null,
  changed_by    uuid references profiles,
  origin        uc_source not null,
  reason        text,                 -- why the change was made, in words
  basis         text,                 -- resident_decision | standing_permission | agreed_alternative | recurrence | correction
  basis_ref     uuid,                 -- the permission or the alternative
  statement_id  uuid references statements(id),
  session_id    uuid,                 -- the session the change was made in. SR-4
  actor         text,                 -- which software wrote it: guide, scheduler, or intake. NULL for a person
  at            timestamptz not null default now()
);
create index file_revisions_row on file_revisions (table_name, row_id, at desc);
create index file_revisions_user_at on file_revisions (user_id, at desc);
create index file_revisions_session on file_revisions (session_id) where session_id is not null;

alter table file_revisions enable row level security;
create policy file_revisions_read on file_revisions
  for select using (user_id = auth.uid() or uc_is_agent());
-- no insert, update or delete policy. The trigger is the only writer.

create trigger file_revisions_immutable before update or delete on file_revisions
  for each row execute function uc_revisions_immutable();

-- The caller states why. Each value is read from a setting that lasts one transaction.
create or replace function uc_setting(k text) returns text
language sql stable as $$ select nullif(current_setting(k, true), '') $$;

create or replace function uc_file_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor uuid := auth.uid();
declare who uc_source;
declare o jsonb := to_jsonb(old);
declare n jsonb;
begin
  new.updated_at := old.updated_at;
  n := to_jsonb(new);
  if o is distinct from n then
    if actor is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'resident';
    end if;
    insert into public.file_revisions
      (table_name, row_id, user_id, before, after, changed_by, origin,
       reason, basis, basis_ref, statement_id, session_id, actor)
    values
      (tg_table_name, coalesce(o->>'id', o->>'user_id')::uuid, (o->>'user_id')::uuid, o, n, actor, who,
       uc_setting('uc.reason'), uc_setting('uc.basis'), uc_setting('uc.basis_ref')::uuid,
       uc_setting('uc.statement_id')::uuid, uc_setting('uc.session_id')::uuid,
       case when actor is null then uc_setting('uc.actor') end);
  end if;
  new.updated_at := now();
  return new;
end $$;

-- CANDIDATE FOR SHARED REQUIREMENT SR-16. Who wrote a row is set from the actor, for every writer.
-- The built uc_force_source sets it for a client alone. An agent and the service role can name it.
create or replace function uc_set_source() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.source := old.source;          -- who first wrote a row never changes. The history holds each later writer
    return new;
  end if;
  if auth.uid() is null then new.source := 'ai';
  elsif uc_is_agent() then new.source := 'agent';
  else new.source := 'resident';
  end if;
  return new;
end $$;

-- The client's current date and current minute of the day, in the client's own timezone.
create or replace function uc_today(uid uuid) returns date
language sql stable security definer set search_path = public as $$
  select (now() at time zone coalesce((select timezone from profiles where id = uid), 'America/Denver'))::date
$$;
create or replace function uc_now_minutes(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select (extract(hour from t) * 60 + extract(minute from t))::int
    from (select now() at time zone coalesce((select timezone from profiles where id = uid), 'America/Denver') as t) x
$$;

-- ================================================================
-- 2. Codes
-- ================================================================
create type uc_execution       as enum ('planned', 'executed', 'partly_executed', 'did_not_happen');
create type uc_timing_outcome  as enum ('as_planned', 'changed', 'not_established');
create type uc_consequences    as enum ('reported', 'none_confirmed', 'not_established');
create type uc_step_state      as enum ('open', 'reported_done', 'not_needed');
create type uc_basis           as enum ('resident_decision', 'standing_permission', 'agreed_alternative', 'recurrence');

-- ================================================================
-- 3. The block. Changes to the table that exists.
-- ================================================================
alter table blocks
  add column schedule_item_id uuid,                -- foreign key added in part 4
  add column occurs_on        date,                -- the day of the occurrence the block was made for. A move does not change it
  add column removed_at       timestamptz,         -- taken off the schedule. The row stays
  add column removed_reason   text,
  add column statement_id     uuid references statements(id),   -- the client statement the block rests on
  add column driving          boolean,                          -- the client stated that this period is spent driving. NULL not stated
  add constraint blocks_starts_clock check (starts_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  add constraint blocks_ends_clock   check (ends_at is null or ends_at ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  add constraint blocks_ends_after   check (ends_at is null or ends_at > starts_at),
  add constraint blocks_kind_known   check (kind in ('sleep', 'getting_ready', 'travel', 'paid_work', 'unpaid_work',
                                                     'household', 'caring', 'appointment', 'people', 'rest', 'building')),
  add constraint blocks_cost_not_self check (cost_of is null or cost_of <> id);

-- TIME.md 3.6.1. A block that has not started is never observed.
-- TIME.md 3.6.2. Only the client's statement makes a block observed.
create or replace function uc_block_not_future_observed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'observed' then
    if new.date > uc_today(new.user_id) then
      raise exception 'A block that has not started cannot be observed';
    end if;
    if new.date = uc_today(new.user_id) and new.starts_at ~ '^[0-2][0-9]:[0-5][0-9]$' then
      if split_part(new.starts_at, ':', 1)::int * 60 + split_part(new.starts_at, ':', 2)::int > uc_now_minutes(new.user_id) then
        raise exception 'A block that has not started cannot be observed';
      end if;
    end if;
    if auth.uid() is null or uc_is_agent() then
      if tg_op = 'INSERT' then
        if new.statement_id is null then
          raise exception 'A block is observed only on the statement of the client';
        end if;
      elsif new.status is distinct from old.status
            and (new.statement_id is null or new.statement_id is not distinct from old.statement_id) then
        -- the statement the block was first filed with does not prove what happened later
        raise exception 'A block is observed only on the statement of the client';
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger blocks_not_future_observed before insert or update on blocks
  for each row execute function uc_block_not_future_observed();

-- Depends on shared requirement SR-3. A block is taken off the schedule. It is not deleted.
drop policy if exists blocks_resident_delete on blocks;

-- Who wrote a block is set from the actor.
drop trigger if exists blocks_source on blocks;
create trigger blocks_source before insert or update on blocks
  for each row execute function uc_set_source();

-- The built block history gains the five facts it lacks. The trigger fills them.
alter table block_revisions
  add column basis        text,
  add column basis_ref    uuid,
  add column statement_id uuid references statements(id),
  add column session_id   uuid,
  add column actor        text;
create or replace function uc_block_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor_id uuid := auth.uid();
declare who uc_source;
begin
  if to_jsonb(old) is distinct from to_jsonb(new) then
    if actor_id is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'resident';
    end if;
    insert into public.block_revisions
      (block_id, user_id, before, after, changed_by, origin, reason, basis, basis_ref, statement_id, session_id, actor)
    values
      (old.id, old.user_id, to_jsonb(old), to_jsonb(new), actor_id, who,
       uc_setting('uc.reason'), uc_setting('uc.basis'), uc_setting('uc.basis_ref')::uuid,
       uc_setting('uc.statement_id')::uuid, uc_setting('uc.session_id')::uuid,
       case when actor_id is null then uc_setting('uc.actor') end);
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ================================================================
-- 4. Ongoing work and the schedule
-- ================================================================
create table ongoing_work (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  recurrence_said  text,                           -- the client's words. NULL means not stated
  folder           text,                           -- the folder that owns the subject. NULL means Time alone
  ended_at         timestamptz,                    -- NULL means active
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index ongoing_work_user on ongoing_work (user_id) where ended_at is null;

create table schedule_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  kind             text not null check (kind in ('sleep', 'getting_ready', 'travel', 'paid_work', 'unpaid_work',
                                                 'household', 'caring', 'appointment', 'people', 'rest', 'building')),
  paid             uc_paid not null default 'none',
  starts_at        text check (starts_at is null or starts_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  ends_at          text check (ends_at is null or ends_at ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  recurrence       text not null check (recurrence ~ '^FREQ=(DAILY|WEEKLY|MONTHLY)(;(INTERVAL|BYDAY|BYMONTHDAY|UNTIL)=[A-Z0-9,]+)*$'),
  recurrence_said  text,
  is_commitment    boolean not null default true,  -- false for a cost and for hours with no commitment
  movable          boolean,                        -- NULL not established. false cannot move
  driving          boolean,                        -- NULL not stated
  times_known_ahead_said text,                     -- how far ahead the client learns the times. Curriculum 18.8.3
  cost_of          uuid references schedule_items(id),
  ongoing_work_id  uuid references ongoing_work(id),
  effective_from   date not null default current_date,
  effective_to     date,
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (cost_of is null or not is_commitment),
  check (ends_at is null or starts_at is not null),
  check (effective_to is null or effective_to >= effective_from)
);
create index schedule_items_user on schedule_items (user_id, effective_from);

alter table blocks
  add constraint blocks_schedule_item_fk foreign key (schedule_item_id) references schedule_items(id);
-- One block for one recurring item on one day. Making a day from the schedule twice writes it once.
-- A block that was taken off, and a block that was moved to a different day, still hold the place of
-- their occurrence, so a later run does not write the occurrence again.
alter table blocks add constraint blocks_occurrence check (schedule_item_id is null or occurs_on is not null);
create unique index blocks_one_per_item_per_day on blocks (user_id, schedule_item_id, occurs_on)
  where schedule_item_id is not null;

-- ================================================================
-- 5. The commitment, its conditions, and its steps
-- ================================================================
create table commitments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  label              text not null check (length(trim(label)) > 0),
  block_id           uuid references blocks(id),            -- NULL while no time is set. TIME.md 4.3
  schedule_item_id   uuid references schedule_items(id),
  occurs_on          date,                                  -- the day of this occurrence of a recurring item
  ongoing_work_id    uuid references ongoing_work(id),
  continues_id       uuid references commitments(id),       -- the earlier commitment whose remaining work this one carries
  origin_folder      text,                                  -- the folder that produced the action. NULL means Time
  basis              uc_basis not null default 'resident_decision',   -- TIME.md 3.3.4
  basis_ref          uuid,

  -- Timing. Each value is NULL until the client states it.
  required_date      date,
  required_start     text check (required_start is null or required_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  deadline_date      date,
  deadline_time      text check (deadline_time is null or deadline_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  duration_minutes   int  check (duration_minutes is null or duration_minutes > 0),
  movable            boolean,
  latest_date        date,
  latest_time        text check (latest_time is null or latest_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  travel_needed      boolean,

  -- Completion
  completion_said    text,
  steps_are_whole    boolean,                               -- NULL means the client has not stated it

  -- Standards. NULL not established. false means the client stated that none applies.
  standards_apply    boolean,

  -- Contact for this commitment
  important          boolean not null default false,
  accountability     boolean not null default false,
  reminder_minutes   int check (reminder_minutes is null or reminder_minutes >= 0),
  speak_label        boolean not null default true,

  -- Outcome. Four separate fields. TIME.md 3.3.5 to 3.3.10
  execution          uc_execution not null default 'planned',
  timing_outcome     uc_timing_outcome,
  actual_date        date,
  actual_start       text check (actual_start is null or actual_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  actual_end         text check (actual_end is null or actual_end ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  consequences       uc_consequences not null default 'not_established',
  alternative_id     uuid,                                  -- foreign key added below
  outcome_basis      text check (outcome_basis is null or outcome_basis in ('resident_report', 'evidence')),
  outcome_at         timestamptz,
  outcome_statement_id uuid references statements(id),
  outcome_evidence_table text,                              -- the entry that proves it. The form `proposals` uses for its target
  outcome_evidence_id    uuid,

  -- A time that software measured. Estimated until the client confirms it. TIME.md 3.6.9
  measured_start     timestamptz,
  measured_end       timestamptz,

  -- Taken off the Plan by the client's decision before any outcome
  withdrawn_at       timestamptz,
  withdrawn_basis    uc_basis,

  source             uc_source not null default 'resident',
  statement_id       uuid references statements(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  check (execution <> 'planned' or (timing_outcome is null and outcome_at is null and outcome_basis is null)),
  check (execution =  'planned' or (outcome_at is not null and outcome_basis is not null)),
  check (execution not in ('executed', 'partly_executed') or timing_outcome is not null),
  check (execution <> 'did_not_happen' or timing_outcome is null),
  check (timing_outcome is distinct from 'as_planned' or block_id is not null),
  check (withdrawn_at is null or execution = 'planned'),
  check (continues_id is null or continues_id <> id),
  check (outcome_basis is distinct from 'evidence' or (outcome_evidence_table is not null and outcome_evidence_id is not null)),
  check (schedule_item_id is null or occurs_on is not null)
);
-- One commitment for one recurring item on one day.
create unique index commitments_one_per_item_per_day on commitments (user_id, schedule_item_id, occurs_on)
  where schedule_item_id is not null;
create index commitments_user_block on commitments (user_id, block_id);
create index commitments_user_open  on commitments (user_id, execution) where withdrawn_at is null;
create index commitments_item       on commitments (schedule_item_id, created_at desc);
create index commitments_work       on commitments (ongoing_work_id);

create table commitment_steps (
  id               uuid primary key default gen_random_uuid(),
  commitment_id    uuid not null references commitments(id),
  user_id          uuid not null references profiles on delete cascade,
  label            text not null check (length(trim(label)) > 0),
  position         int  not null check (position > 0),
  state            uc_step_state not null default 'open',
  state_at         timestamptz,
  state_statement_id uuid references statements(id),   -- the statement the report rests on. It is not the statement the step was named in
  suggested        boolean not null default false,
  suggested_by     text,                           -- a folder name, or guide
  accepted_at      timestamptz,
  planned_minutes  int check (planned_minutes is null or planned_minutes > 0),   -- open ruling. Operations 10.8
  removed_at       timestamptz,
  source           uc_source not null default 'resident',
  statement_id     uuid references statements(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (not suggested or accepted_at is not null or state = 'open'),
  check (state = 'open' or state_at is not null)
);
create unique index commitment_steps_order on commitment_steps (commitment_id, position) where removed_at is null;

create table commitment_consequences (
  id                    uuid primary key default gen_random_uuid(),
  commitment_id         uuid not null references commitments(id),
  user_id               uuid not null references profiles on delete cascade,
  kind                  text not null check (kind in ('expected', 'reported')),   -- TIME.md 3.6.5
  said                  text not null,
  affects_commitment_id uuid references commitments(id),
  affects_standard_id   uuid references standards(id),
  source                uc_source not null default 'resident',
  statement_id          uuid references statements(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index commitment_consequences_c on commitment_consequences (commitment_id, kind);
create index commitment_consequences_affects on commitment_consequences (affects_commitment_id);

create table commitment_standards (
  id             uuid primary key default gen_random_uuid(),
  commitment_id  uuid not null references commitments(id),
  standard_id    uuid not null references standards(id),
  user_id        uuid not null references profiles on delete cascade,
  removed_at     timestamptz,                    -- the client stated that the minimum no longer applies
  source         uc_source not null default 'resident',
  statement_id   uuid references statements(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (commitment_id, standard_id)
);

create table commitment_alternatives (
  id             uuid primary key default gen_random_uuid(),
  commitment_id  uuid not null references commitments(id),
  user_id        uuid not null references profiles on delete cascade,
  said           text not null,
  source         uc_source not null default 'resident' check (source <> 'ai'),
  statement_id   uuid references statements(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table commitments
  add constraint commitments_alternative_fk foreign key (alternative_id) references commitment_alternatives(id);

-- ================================================================
-- 6. The follow up, and the Follow through condition
-- ================================================================
create table follow_ups (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles on delete cascade,
  owner              uc_role not null,                       -- resident or agent
  need               text not null check (need in ('information', 'confirmation', 'resident_action', 'agent_action')),
  next_action        text not null check (length(trim(next_action)) > 0),
  from_commitment_id uuid references commitments(id),
  from_statement_id  uuid references statements(id),
  from_session_id    uuid,
  ongoing_work_id    uuid references ongoing_work(id),
  folder             text,
  person_reason      text check (person_reason is null or person_reason in
                       ('not_covered', 'judgment', 'interpretation', 'resident_asked')),   -- TIME.md 5.6.6
  due_date           date,
  status             text not null default 'open' check (status in ('open', 'closed')),
  closed_at          timestamptz,
  closed_basis       text,
  asked_at           timestamptz,                            -- the last time the client was asked
  source             uc_source not null default 'resident',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (from_commitment_id is not null or from_statement_id is not null or from_session_id is not null),
  check ((status = 'closed') = (closed_at is not null)),
  check (status = 'open' or closed_basis is not null)
);
create index follow_ups_open on follow_ups (user_id, owner, due_date) where status = 'open';

create table commitment_follow_through (
  id                   uuid primary key default gen_random_uuid(),
  commitment_id        uuid not null references commitments(id),
  user_id              uuid not null references profiles on delete cascade,
  action               text not null,
  owner                uc_role not null,
  due_said             text,
  due_date             date,
  ongoing_work_id      uuid references ongoing_work(id),
  position             int,
  result_commitment_id uuid references commitments(id),
  result_follow_up_id  uuid references follow_ups(id),
  source               uc_source not null default 'resident',
  statement_id         uuid references statements(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index commitment_follow_through_c on commitment_follow_through (commitment_id);

-- ================================================================
-- 7. The Plan
-- ================================================================
create table plans (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles on delete cascade,
  date                   date not null,
  prepared_at            timestamptz not null default now(),
  confirmed_at           timestamptz,                        -- NULL means the client has not confirmed it
  confirmed_source       uc_source,
  confirmed_statement_id uuid references statements(id),
  realism                text check (realism is null or realism in ('very', 'mostly', 'ambitious', 'unlikely')),
  daily_close_at         text check (daily_close_at is null or daily_close_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  closed_at              timestamptz,                        -- Daily Close for this day was completed
  went_as_planned        boolean,                            -- the answer to the first question of Daily Close. NULL not answered
  closed_statement_id    uuid references statements(id),
  source                 uc_source not null default 'resident',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id, date),
  check (confirmed_at is null or confirmed_source = 'resident' or confirmed_statement_id is not null),
  check (confirmed_at is null or confirmed_source is not null)
);

create table plan_items (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references plans(id),
  commitment_id  uuid not null references commitments(id),
  user_id        uuid not null references profiles on delete cascade,
  position       int,                                        -- NULL means the Plan holds no order for it
  planned_start  text check (planned_start is null or planned_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  planned_end    text check (planned_end is null or planned_end ~ '^([0-3][0-9]|4[0-7]):[0-5][0-9]$'),
  state          text not null default 'on' check (state in ('on', 'moved', 'taken_off')),
  state_at       timestamptz,
  basis          uc_basis,
  basis_ref      uuid,
  moved_to       uuid references plan_items(id),
  source         uc_source not null default 'resident',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (plan_id, commitment_id),
  check (state = 'on' or (state_at is not null and basis is not null))
);
create index plan_items_commitment on plan_items (commitment_id);

-- ================================================================
-- 8. Standing permissions, recommendations, settings, lessons
-- ================================================================
create table standing_permissions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles on delete cascade,
  kind                   text not null check (kind in ('place_work', 'update_schedule', 'behind_schedule')),
  scope                  jsonb not null default '{}'::jsonb,
  wording_version        text not null,                       -- which approved wording the client read
  granted_at             timestamptz not null default now(),
  granted_statement_id   uuid references statements(id),
  withdrawn_at           timestamptz,
  withdrawn_statement_id uuid references statements(id),
  source                 uc_source not null default 'resident' check (source <> 'ai'),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (source = 'resident' or granted_statement_id is not null)
);
create index standing_permissions_active on standing_permissions (user_id, kind) where withdrawn_at is null;

create table recommendations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles on delete cascade,
  made_by               uc_source not null default 'agent' check (made_by <> 'resident'),
  agent_id              uuid references profiles,
  session_id            uuid,
  conversation_key      text not null,
  action                text not null check (action in ('do_next', 'move', 'shorten', 'take_off')),
  commitment_id         uuid references commitments(id),
  step_id               uuid references commitment_steps(id),
  to_date               date,
  to_start              text,
  to_minutes            int,
  rests_on              text not null check (length(trim(rests_on)) > 0),
  rests_on_table        text,
  rests_on_id           uuid,
  response              text check (response is null or response in ('accepted', 'changed', 'declined')),
  responded_at          timestamptz,
  response_statement_id uuid references statements(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check ((response is null) = (responded_at is null)),
  check (commitment_id is not null or step_id is not null)
);
create index recommendations_user on recommendations (user_id, created_at desc);
create index recommendations_conversation on recommendations (user_id, conversation_key, action);

create table time_settings (
  user_id          uuid primary key references profiles on delete cascade,
  morning_plan     boolean not null default false,
  morning_plan_at  text check (morning_plan_at is null or morning_plan_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  reminders        boolean not null default false,
  reminder_minutes int check (reminder_minutes is null or reminder_minutes >= 0),
  updates          boolean not null default false,
  notices          boolean not null default false,
  follow_up        text check (follow_up is null or follow_up in ('none', 'before', 'after', 'both')),
  quiet_from       text check (quiet_from is null or quiet_from ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  quiet_to         text check (quiet_to is null or quiet_to ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  guided_voice     boolean not null default false,
  speech_level     text check (speech_level is null or speech_level in ('times', 'times_labels', 'times_labels_folders')),
  speech_folders   text[] not null default '{}',
  time_display     boolean not null default false,
  daily_close_at   text check (daily_close_at is null or daily_close_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),   -- the client's usual time of Daily Close. TIME.md 10.4
  controlled_minutes_target int check (controlled_minutes_target is null or controlled_minutes_target >= 0), -- open. Operations 9.7
  schedule_on_file_at timestamptz,                -- the first seven day schedule was filed as assembled. Operations 17.1
  source           uc_source not null default 'resident',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table lesson_deliveries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles on delete cascade,
  folder          text not null,
  lesson_key      text not null,
  lesson_version  text not null,
  form            text not null check (form in ('text', 'voice', 'narration', 'screen')),
  session_id      uuid,
  commitment_id   uuid references commitments(id),
  delivered_at    timestamptz not null default now()
);
create index lesson_deliveries_user on lesson_deliveries (user_id, folder, lesson_key);

-- ================================================================
-- 9. Rules that hold in every form: screen, text, and voice
-- ================================================================

-- What changes an outcome field once Execution has left planned.
--   Execution: a correction alone, with its reason.
--   Timing: from not established to as planned or changed, when the client later states the time. Every other change is a correction.
--   Consequences: from not established to either value, and from none confirmed to reported, when the client later reports. Every other change is a correction.
-- No outcome carries a time later than the client's current date.
-- An agent and software file what the client reported only with the statement it rests on:
--   the outcome itself, in outcome_statement_id, at the write that files it;
--   a later time or a later answer about consequences, in the setting uc.statement_id, which the history keeps,
--   or in the reported consequence itself.
-- A write that changes no outcome field is not held to this rule.
create or replace function uc_commitment_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare correction boolean := uc_setting('uc.reason') is not null;
declare for_client boolean := auth.uid() is null or uc_is_agent();
begin
  if tg_op = 'UPDATE' then
    if old.execution <> 'planned' and not correction then
      if new.execution is distinct from old.execution then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
      if new.timing_outcome is distinct from old.timing_outcome
         and old.timing_outcome is distinct from 'not_established' then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
      if new.consequences is distinct from old.consequences
         and not (old.consequences = 'not_established'
                  or (old.consequences = 'none_confirmed' and new.consequences = 'reported')) then
        raise exception 'An outcome on file changes only as a correction that states its reason';
      end if;
    end if;
    if for_client then
      if new.execution is distinct from old.execution and new.execution <> 'planned'
         and new.outcome_basis = 'resident_report'
         and (new.outcome_statement_id is null or new.outcome_statement_id is not distinct from old.statement_id) then
        raise exception 'An agent and software file an outcome only with the statement it rests on';
      end if;
      if old.execution <> 'planned' and uc_setting('uc.statement_id') is null
         and (new.timing_outcome is distinct from old.timing_outcome
              or (new.consequences is distinct from old.consequences
                  and not (new.consequences = 'reported' and exists
                           (select 1 from commitment_consequences q
                             where q.commitment_id = new.id and q.kind = 'reported' and q.statement_id is not null)))) then
        raise exception 'An agent and software file what the client said later only with the statement it rests on';
      end if;
      if new.steps_are_whole is distinct from old.steps_are_whole and uc_setting('uc.statement_id') is null then
        raise exception 'An agent and software file that the steps are the whole only with the statement it rests on';
      end if;
    end if;
  else
    if for_client and new.execution <> 'planned' and new.outcome_basis = 'resident_report' and new.outcome_statement_id is null then
      raise exception 'An agent and software file an outcome only with the statement it rests on';
    end if;
    if for_client and new.statement_id is null and new.basis = 'resident_decision' then
      raise exception 'An agent and software file a commitment the client decided only with the statement it rests on';
    end if;
  end if;
  if new.actual_date is not null and new.actual_date > uc_today(new.user_id) then
    raise exception 'An outcome cannot carry a future date';
  end if;
  return new;
end $$;
create trigger commitments_guard before insert or update on commitments
  for each row execute function uc_commitment_guard();

-- TIME.md 3.3.16. Where the client stated that the steps are the whole of the
-- Completion condition, the commitment is executed when no step is open.
-- The rule runs when a step changes and when the client states that the steps are the whole.
create or replace function uc_evaluate_steps(p_commitment uuid, p_statement uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c commitments%rowtype;
declare open_steps int;
declare live_steps int;
begin
  select * into c from commitments where id = p_commitment;
  if c.steps_are_whole is true and c.execution = 'planned' and c.withdrawn_at is null then
    select count(*) filter (where state = 'open'), count(*)
      into open_steps, live_steps
      from commitment_steps
     where commitment_id = p_commitment and removed_at is null
       and (not suggested or accepted_at is not null);
    if live_steps > 0 and open_steps = 0 then
      update commitments
         set execution = 'executed', timing_outcome = 'not_established',
             outcome_basis = 'resident_report', outcome_at = now(),
             outcome_statement_id = p_statement,
             measured_end = now()
       where id = c.id;
    end if;
  end if;
end $$;

create or replace function uc_steps_complete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform uc_evaluate_steps(new.commitment_id, new.state_statement_id);
  return null;
end $$;
create trigger commitment_steps_complete after insert or update of state, removed_at, accepted_at on commitment_steps
  for each row execute function uc_steps_complete();

create or replace function uc_steps_whole_stated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.steps_are_whole is true and old.steps_are_whole is distinct from true then
    perform uc_evaluate_steps(new.id, uc_setting('uc.statement_id')::uuid);
  end if;
  return null;
end $$;
create trigger commitments_steps_whole after update of steps_are_whole on commitments
  for each row execute function uc_steps_whole_stated();

-- TIME.md 3.3.14. The client sets the state of a step. An agent and software file the client's report with its statement.
create or replace function uc_step_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.state <> 'open' and (auth.uid() is null or uc_is_agent()) then
    if tg_op = 'INSERT' then
      if new.state_statement_id is null then
        raise exception 'An agent and software file a step report only with the statement it rests on';
      end if;
    elsif new.state is distinct from old.state
          and (new.state_statement_id is null or new.state_statement_id is not distinct from old.state_statement_id) then
      raise exception 'An agent and software file a step report only with the statement it rests on';
    end if;
  end if;
  return new;
end $$;
create trigger commitment_steps_guard before insert or update on commitment_steps
  for each row execute function uc_step_guard();

-- A reported consequence sets the outcome field. An expected one never does. TIME.md 3.6.5
create or replace function uc_consequence_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'reported' then
    update commitments set consequences = 'reported'
     where id = new.commitment_id and consequences <> 'reported';
  end if;
  return null;
end $$;
create trigger commitment_consequences_reported after insert on commitment_consequences
  for each row execute function uc_consequence_reported();

-- Who confirmed a Plan is set by the database. The writer cannot choose it.
create or replace function uc_plan_confirm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if old.confirmed_at is not null then
      -- a confirmation on file is kept as it was made
      new.confirmed_at := old.confirmed_at;
      new.confirmed_source := old.confirmed_source;
      new.confirmed_statement_id := old.confirmed_statement_id;
      return new;
    end if;
  end if;
  if new.confirmed_at is not null then
    if auth.uid() is null then new.confirmed_source := 'ai';
    elsif uc_is_agent() then new.confirmed_source := 'agent';
    else new.confirmed_source := 'resident';
    end if;
  end if;
  return new;
end $$;
create trigger plans_confirm before insert or update on plans
  for each row execute function uc_plan_confirm();

-- A client cannot close a follow up the agent owns, and cannot change who owns one.
create or replace function uc_follow_up_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if new.owner is distinct from old.owner then
      raise exception 'A client cannot change who owns a follow up';
    end if;
    if old.owner = 'agent' and new.status is distinct from old.status then
      raise exception 'This follow up belongs to the agent';
    end if;
  end if;
  return new;
end $$;
create trigger follow_ups_guard before update on follow_ups
  for each row execute function uc_follow_up_guard();

-- ================================================================
-- 10. Provenance, history, and access for every Time table
-- ================================================================
do $$
declare t text;
begin
  foreach t in array array['ongoing_work', 'schedule_items', 'commitments', 'commitment_steps',
                           'commitment_consequences', 'commitment_standards', 'commitment_alternatives',
                           'follow_ups', 'commitment_follow_through', 'plans', 'plan_items',
                           'standing_permissions', 'time_settings']
  loop
    execute format('alter table public.%1$s enable row level security', t);
    execute format($f$
      create policy %1$s_read on public.%1$s for select
        using (user_id = auth.uid() or uc_is_agent());
      create policy %1$s_resident_insert on public.%1$s for insert
        with check (user_id = auth.uid());
      create policy %1$s_resident_update on public.%1$s for update
        using (user_id = auth.uid()) with check (user_id = auth.uid());
      create policy %1$s_agent_insert on public.%1$s for insert
        with check (uc_is_agent());
      create policy %1$s_agent_update on public.%1$s for update
        using (uc_is_agent()) with check (uc_is_agent());
    $f$, t);
    -- no delete policy on any Time table
    execute format('create trigger %1$s_source before insert or update on public.%1$s
                      for each row execute function uc_set_source()', t);
    execute format('create trigger %1$s_revision before update on public.%1$s
                      for each row execute function uc_file_revision()', t);
  end loop;
end $$;

-- A row that holds what the client stated names the statement when an agent or software files it.
-- A commitment, a step report, an outcome, a block marked observed, and a permission have their own rule above.
create or replace function uc_statement_required() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.statement_id is null and (auth.uid() is null or uc_is_agent()) then
    raise exception 'An agent and software file what the client stated only with the statement it rests on';
  end if;
  return new;
end $$;
do $$
declare t text;
begin
  foreach t in array array['schedule_items', 'ongoing_work', 'commitment_consequences', 'commitment_alternatives',
                           'commitment_standards', 'commitment_follow_through']
  loop
    execute format('create trigger %1$s_statement before insert on public.%1$s
                      for each row execute function uc_statement_required()', t);
  end loop;
end $$;

-- Only the agent files that the first seven day schedule is assembled. Operations 17.1.2
create or replace function uc_time_settings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if tg_op = 'INSERT' then
      if new.schedule_on_file_at is not null then
        raise exception 'The agent files that the first schedule is assembled';
      end if;
    elsif new.schedule_on_file_at is distinct from old.schedule_on_file_at then
      raise exception 'The agent files that the first schedule is assembled';
    end if;
  end if;
  return new;
end $$;
create trigger time_settings_guard before insert or update on time_settings
  for each row execute function uc_time_settings_guard();

-- Recommendations and lesson deliveries are written by the agent and by software.
-- The client reads them. The client answers a recommendation through the two answer columns.
alter table recommendations   enable row level security;
alter table lesson_deliveries enable row level security;
create policy recommendations_read on recommendations
  for select using (user_id = auth.uid() or uc_is_agent());
create policy recommendations_agent_insert on recommendations
  for insert with check (uc_is_agent());
create policy recommendations_agent_update on recommendations
  for update using (uc_is_agent()) with check (uc_is_agent());
create policy recommendations_resident_answer on recommendations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy lesson_deliveries_read on lesson_deliveries
  for select using (user_id = auth.uid() or uc_is_agent());
-- A delivery is written once, by software, and is never changed. It has no update policy and needs no history.

-- Who made a recommendation is set from the actor. A declined recommendation is not made
-- again in the same conversation. TIME.md 5.10.8
create or replace function uc_recommendation_made() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then new.made_by := 'ai'; else new.made_by := 'agent'; end if;
  if exists (select 1 from recommendations r
              where r.user_id = new.user_id and r.conversation_key = new.conversation_key
                and r.action = new.action and r.response = 'declined'
                and coalesce(r.commitment_id, r.step_id) = coalesce(new.commitment_id, new.step_id)) then
    raise exception 'The client declined this recommendation in this conversation';
  end if;
  return new;
end $$;
create trigger recommendations_made before insert on recommendations
  for each row execute function uc_recommendation_made();
create trigger recommendations_revision before update on recommendations
  for each row execute function uc_file_revision();

create or replace function uc_recommendation_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not uc_is_agent() then
    if (to_jsonb(new) - 'response' - 'responded_at' - 'response_statement_id' - 'updated_at')
       is distinct from
       (to_jsonb(old) - 'response' - 'responded_at' - 'response_statement_id' - 'updated_at') then
      raise exception 'A client answers a recommendation. A client does not rewrite it';
    end if;
  end if;
  return new;
end $$;
create trigger recommendations_guard before update on recommendations
  for each row execute function uc_recommendation_guard();

-- What Integrity reads. One view. No second copy. TIME.md 4.4.7
create view time_commitments_read with (security_invoker = true) as
  select c.id, c.user_id, c.label, c.origin_folder, c.basis,
         p.date as plan_date, i.planned_start, i.planned_end, i.state as plan_state,
         c.execution, c.timing_outcome, c.consequences, c.alternative_id is not null as alternative_used,
         c.actual_date, c.actual_start, c.withdrawn_at, c.continues_id, c.outcome_at, c.occurs_on
    from commitments c
    left join plan_items i on i.commitment_id = c.id
    left join plans p on p.id = i.plan_id;

commit;
```

## Appendix B. Reference queries for the twenty questions

B.1 Technical proposal. Each query answers one question of `TIME.md` section 12 from the tables alone. Section 5 defines each one. Section 19.9 holds the expected results.

B.2 The repository calculates its week figures in TypeScript. The language of the final code is open.

```sql
-- TECHNICAL PROPOSAL. Folder 01 Time Operations, Appendix B.
-- Reference queries for the twenty questions in TIME.md section 12.
-- Not approved. Written to prove that each question is answered from the
-- structured File alone. The repository calculates its week figures in
-- TypeScript, in lib/domain/time.ts. The language of the final code is open.

create or replace function uc_min(t text) returns int
language sql immutable as $$ select split_part(t, ':', 1)::int * 60 + split_part(t, ':', 2)::int $$;

-- Whether a recurring item falls on one date, for the subset of rules the proposal permits.
-- An interval is counted from the day the item took effect: in days, in weeks that start on Sunday, or in months.
create or replace function uc_item_on(p_rule text, p_from date, p_to date, p_date date) returns boolean
language sql immutable as $$
  with r as (
    select coalesce(substring(p_rule from 'INTERVAL=([0-9]+)')::int, 1) as n,
           substring(p_rule from 'BYDAY=([A-Z,]+)') as byday,
           substring(p_rule from 'BYMONTHDAY=([0-9,]+)') as bymonthday,
           substring(p_rule from 'UNTIL=([0-9]{8})') as until
  )
  select case
    when p_date < p_from or (p_to is not null and p_date > p_to) then false
    when r.until is not null and p_date > to_date(r.until, 'YYYYMMDD') then false
    when p_rule ~ '^FREQ=DAILY' then (p_date - p_from) % r.n = 0
    when p_rule ~ '^FREQ=WEEKLY' then
      (((p_date - extract(dow from p_date)::int) - (p_from - extract(dow from p_from)::int)) / 7) % r.n = 0
      and case when r.byday is not null
               then (array['SU','MO','TU','WE','TH','FR','SA'])[extract(dow from p_date)::int + 1] = any (string_to_array(r.byday, ','))
               else extract(dow from p_date) = extract(dow from p_from) end
    when p_rule ~ '^FREQ=MONTHLY' then
      ((extract(year from p_date) * 12 + extract(month from p_date)) - (extract(year from p_from) * 12 + extract(month from p_from)))::int % r.n = 0
      and case when r.bymonthday is not null
               then extract(day from p_date)::int::text = any (string_to_array(r.bymonthday, ','))
               else extract(day from p_date) = extract(day from p_from) end
    else false end
    from r
$$;

-- Every live block of a client in a date range, with minutes from the start of its own day.
create or replace view time_block_minutes with (security_invoker = true) as
  select b.*, uc_min(b.starts_at) as s, case when b.ends_at is null then null else uc_min(b.ends_at) end as e,
         case when b.kind in ('people', 'rest', 'building') then 'free'
              when b.kind in ('sleep', 'getting_ready', 'travel') then 'necessary'
              else 'committed' end as klass
    from blocks b
   where b.removed_at is null;

-- Every period on file for one day, in minutes of that day: the blocks of the day, a block that started the day
-- before and passes midnight, and each recurring item that falls on the day and has no block written for it yet.
create or replace function tq_day_periods(p_user uuid, p_date date)
returns table (label text, s int, e int, status text, origin text, movable boolean, is_commitment boolean, kind text)
language sql stable as $$
  select b.label, b.s, b.e, b.status::text, 'block', c.movable, c.id is not null, b.kind
    from time_block_minutes b left join commitments c on c.block_id = b.id and c.withdrawn_at is null
   where b.user_id = p_user and b.date = p_date and b.e is not null
  union all
  select b.label, 0, b.e - 1440, b.status::text, 'block from the day before', null, false, b.kind
    from time_block_minutes b where b.user_id = p_user and b.date = p_date - 1 and b.e > 1440
  union all
  select i.label, uc_min(i.starts_at) - d.shift, uc_min(i.ends_at) - d.shift, 'estimated', 'schedule', i.movable, i.is_commitment, i.kind
    from schedule_items i
    cross join (values (p_date, 0), (p_date - 1, 1440)) d(day, shift)
   where i.user_id = p_user and i.starts_at is not null and i.ends_at is not null
     and uc_item_on(i.recurrence, i.effective_from, i.effective_to, d.day) is true
     and (d.shift = 0 or uc_min(i.ends_at) > 1440)
     and not exists (select 1 from blocks b where b.schedule_item_id = i.id and b.occurs_on = d.day)
$$;

-- Minutes covered by a set of blocks, with overlapping blocks counted once.
-- absolute minute = day number * 1440 + minute of the day, so a block that runs past midnight stays whole.
create or replace function tq_covered_minutes(p_user uuid, p_from date, p_to date, p_statuses text[],
                                              p_klass text default null, p_kinds text[] default null)
returns int language sql stable as $$
  with x as (
    select (date - p_from) * 1440 + s as a, (date - p_from) * 1440 + e as z
      from time_block_minutes
     where user_id = p_user and date between p_from and p_to and e is not null
       and status::text = any (p_statuses) and (p_klass is null or klass = p_klass)
       and (p_kinds is null or kind = any (p_kinds))
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  ), g as (
    select a, z, sum(case when prev_z is null or a > prev_z then 1 else 0 end) over (order by a, z) as grp from o
  )
  select coalesce(sum(len), 0)::int from (select max(z) - min(a) as len from g group by grp) t
$$;

-- 12.10 and 12.16. The week figures, in minutes. The length of the week is read from the client's timezone,
-- so a week in which the clock changes holds 167 or 169 hours. A block is counted by its clock times.
create or replace function tq_week_figures(p_user uuid, p_week_start date)
returns table (week_minutes int, observed int, estimated int, planned int, accounted int, unaccounted int,
               controlled int, blocks_with_no_end int)
language sql stable as $$
  select (extract(epoch from ((p_week_start + 7)::timestamp at time zone z.tz) - (p_week_start::timestamp at time zone z.tz)) / 60)::int,
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['estimated']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['planned', 'required', 'suggested']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed', 'estimated', 'planned', 'required', 'suggested']),
         (extract(epoch from ((p_week_start + 7)::timestamp at time zone z.tz) - (p_week_start::timestamp at time zone z.tz)) / 60)::int
           - tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed', 'estimated', 'planned', 'required', 'suggested']),
         tq_covered_minutes(p_user, p_week_start, p_week_start + 6, array['observed'], 'free'),
         (select count(*)::int from time_block_minutes where user_id = p_user
            and date between p_week_start and p_week_start + 6 and e is null)
    from (select coalesce((select timezone from profiles where id = p_user), 'America/Denver') as tz) z
$$;

-- 12.10. Where the controlled hours sit.
create or replace function tq_controlled_by_day(p_user uuid, p_week_start date)
returns table (day date, minutes int) language sql stable as $$
  select d::date, tq_covered_minutes(p_user, d::date, d::date, array['observed'], 'free')
    from generate_series(p_week_start, p_week_start + 6, interval '1 day') d order by 1
$$;

-- 12.11. The longest unbroken run of observed free time, and the day it starts on.
create or replace function tq_longest_unbroken(p_user uuid, p_week_start date)
returns table (day date, starts_at text, minutes int) language sql stable as $$
  with x as (
    select (date - p_week_start) * 1440 + s as a, (date - p_week_start) * 1440 + e as z
      from time_block_minutes
     where user_id = p_user and date between p_week_start and p_week_start + 6
       and e is not null and status = 'observed' and klass = 'free'
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  ), g as (
    select a, z, sum(case when prev_z is null or a > prev_z then 1 else 0 end) over (order by a, z) as grp from o
  ), r as (select min(a) as a, max(z) as z from g group by grp)
  select p_week_start + (a / 1440), lpad((a % 1440 / 60)::text, 2, '0') || ':' || lpad((a % 60)::text, 2, '0'), z - a
    from r order by z - a desc, a limit 1
$$;

-- 12.2 and 12.3. Each commitment on the Plans of a date range, with its four outcome fields.
create or replace function tq_plan_outcomes(p_user uuid, p_from date, p_to date)
returns table (plan_date date, confirmed boolean, label text, planned_start text, plan_state text,
               execution text, timing text, consequences text, alternative_used boolean,
               added_after_confirmation boolean, steps_reported int, steps_not_needed int, steps_live int)
language sql stable as $$
  select p.date, p.confirmed_at is not null, c.label, i.planned_start, i.state,
         c.execution::text, c.timing_outcome::text, c.consequences::text, c.alternative_id is not null,
         p.confirmed_at is not null and i.created_at > p.confirmed_at,
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null and s.state = 'reported_done'),
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null and s.state = 'not_needed'),
         (select count(*)::int from commitment_steps s where s.commitment_id = c.id and s.removed_at is null
            and (not s.suggested or s.accepted_at is not null))
    from plans p
    join plan_items i on i.plan_id = p.id
    join commitments c on c.id = i.commitment_id
   where p.user_id = p_user and p.date between p_from and p_to
   order by p.date, i.planned_start nulls last, i.position nulls last, c.created_at
$$;

-- 12.4. What is still open from commitments already executed.
create or replace function tq_open_after_executed(p_user uuid)
returns table (commitment text, open_kind text, what text, owner text) language sql stable as $$
  select c.label, 'follow up', f.next_action, f.owner::text
    from commitments c join follow_ups f on f.from_commitment_id = c.id
   where c.user_id = p_user and c.execution = 'executed' and f.status = 'open'
  union all
  select c.label, 'follow through with no result', t.action, t.owner::text
    from commitments c join commitment_follow_through t on t.commitment_id = c.id
   where c.user_id = p_user and c.execution = 'executed'
     and t.result_commitment_id is null and t.result_follow_up_id is null
  union all
  select c.label, 'commitment in the same ongoing work', c2.label, 'resident'
    from commitments c join commitments c2 on c2.ongoing_work_id = c.ongoing_work_id and c2.id <> c.id
   where c.user_id = p_user and c.execution = 'executed' and c2.execution = 'planned' and c2.withdrawn_at is null
   order by 1, 2
$$;

-- 12.5. What is coming up, and what each commitment needs from the client.
-- Three sources: a commitment on a Plan, a dated commitment on a day with no Plan, and a recurring
-- commitment of the schedule on a day for which no occurrence is written yet.
create or replace function tq_coming_up(p_user uuid, p_today date, p_days int default 7)
returns table (day date, label text, planned_start text, origin text, needs text[]) language sql stable as $$
  with needs as (
    select c.id,
           case when c.travel_needed is null and not exists
                  (select 1 from blocks b where b.cost_of = c.block_id and b.kind = 'travel' and b.removed_at is null)
                then 'how the client is getting there' end as travel,
           case when exists (select 1 from follow_ups f where f.from_commitment_id = c.id and f.status = 'open' and f.owner = 'resident')
                then 'an open follow up owned by the client' end as follow_up
      from commitments c where c.user_id = p_user and c.execution = 'planned' and c.withdrawn_at is null
  )
  select p.date, c.label, i.planned_start, 'the Plan',
         array_remove(array[case when i.planned_start is null then 'a time' end, n.travel, n.follow_up,
                            case when p.confirmed_at is null then 'the Plan for that day is not confirmed' end], null)
    from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
    join commitments c on c.id = i.commitment_id join needs n on n.id = c.id
   where p.user_id = p_user and p.date between p_today and p_today + p_days
  union all
  select b.date, c.label, b.starts_at, 'a dated commitment, with no Plan for the day',
         array_remove(array[n.travel, n.follow_up, 'no Plan is on file for that day'], null)
    from commitments c join blocks b on b.id = c.block_id and b.removed_at is null join needs n on n.id = c.id
   where c.user_id = p_user and b.date between p_today and p_today + p_days
     and not exists (select 1 from plan_items i where i.commitment_id = c.id)
  union all
  select d::date, s.label, s.starts_at, 'the schedule, estimated',
         array_remove(array[case when s.starts_at is null then 'a time' end, 'no Plan is on file for that day'], null)
    from schedule_items s cross join generate_series(p_today, p_today + p_days, interval '1 day') d
   where s.user_id = p_user and s.is_commitment
     and uc_item_on(s.recurrence, s.effective_from, s.effective_to, d::date) is true
     and not exists (select 1 from plans p where p.user_id = p_user and p.date = d::date)
     and not exists (select 1 from commitments c where c.schedule_item_id = s.id and c.occurs_on = d::date)
   order by 1, 3 nulls last, 2
$$;

-- 12.6. What is on file about moving one commitment.
create or replace function tq_move_effects(p_commitment uuid)
returns table (kind text, what text) language sql stable as $$
  select 'timing', case when c.movable is false then 'The client stated that the time cannot move'
                        when c.movable is true then 'The client stated that the time can move' ||
                             coalesce(', no later than ' || c.latest_date::text || coalesce(' ' || c.latest_time, ''), '')
                        else 'Whether the time can move is not established' end
    from commitments c where c.id = p_commitment
  union all
  select 'deadline', c.deadline_date::text || coalesce(' ' || c.deadline_time, '')
    from commitments c where c.id = p_commitment and c.deadline_date is not null
  union all
  select 'expected consequence', q.said from commitment_consequences q where q.commitment_id = p_commitment and q.kind = 'expected'
  union all
  select 'commitment it affects', c2.label from commitment_consequences q join commitments c2 on c2.id = q.affects_commitment_id
   where q.commitment_id = p_commitment and q.kind = 'expected'
  union all
  select 'cost block that moves with it', b.label || ' ' || b.starts_at
    from commitments c join blocks b on b.cost_of = c.block_id where c.id = p_commitment and b.removed_at is null
  union all
  select 'minimum that applies', s.wording from commitment_standards cs join standards s on s.id = cs.standard_id
   where cs.commitment_id = p_commitment
  union all
  select 'follow through', t.action from commitment_follow_through t where t.commitment_id = p_commitment
$$;

-- 12.7. Open follow ups, by owner.
create or replace function tq_follow_ups(p_user uuid)
returns table (owner text, next_action text, need text, due_date date, from_commitment text) language sql stable as $$
  select f.owner::text, f.next_action, f.need, f.due_date, c.label
    from follow_ups f left join commitments c on c.id = f.from_commitment_id
   where f.user_id = p_user and f.status = 'open'
   order by f.owner, f.due_date nulls last, f.created_at
$$;

-- 12.8. What other folders have on the schedule in a date range.
create or replace function tq_from_other_folders(p_user uuid, p_from date, p_to date)
returns table (folder text, plan_date date, label text, planned_start text, execution text) language sql stable as $$
  select c.origin_folder, coalesce(p.date, b.date), c.label, coalesce(i.planned_start, b.starts_at), c.execution::text
    from commitments c
    left join plan_items i on i.commitment_id = c.id and i.state = 'on'
    left join plans p on p.id = i.plan_id
    left join blocks b on b.id = c.block_id
   where c.user_id = p_user and c.origin_folder is not null and c.withdrawn_at is null
     and coalesce(p.date, b.date) between p_from and p_to
   order by 1, 2, 4
$$;

-- 12.9. Which commitments keep changing. Grouped by the recurring item, then the ongoing work, then the commitment.
create or replace function tq_changing(p_user uuid, p_from date, p_to date)
returns table (what text, occurrences int, differed int, moved int, taken_off int, timing_changed int,
               did_not_happen int, partly int) language sql stable as $$
  with x as (
    select coalesce(si.label, ow.label, c.label) as what,
           coalesce(c.schedule_item_id, c.ongoing_work_id, c.id) as grp,
           c.id, c.execution, c.timing_outcome, i.state
      from commitments c
      join plan_items i on i.commitment_id = c.id
      join plans p on p.id = i.plan_id
      left join schedule_items si on si.id = c.schedule_item_id
      left join ongoing_work ow on ow.id = c.ongoing_work_id
     where c.user_id = p_user and p.date between p_from and p_to
  )
  select what, count(distinct id)::int,
         count(*) filter (where state <> 'on' or timing_outcome = 'changed' or execution in ('did_not_happen', 'partly_executed'))::int,
         count(*) filter (where state = 'moved')::int, count(*) filter (where state = 'taken_off')::int,
         count(*) filter (where timing_outcome = 'changed')::int,
         count(*) filter (where execution = 'did_not_happen')::int,
         count(*) filter (where execution = 'partly_executed')::int
    from x group by grp, what
  having count(*) filter (where state <> 'on' or timing_outcome = 'changed' or execution in ('did_not_happen', 'partly_executed')) > 1
   order by 3 desc
$$;

-- 12.9, second half. What changed each occurrence that differed: what differed, the basis, and the reason on file.
create or replace function tq_changing_reasons(p_user uuid, p_from date, p_to date)
returns table (what text, day date, differed text, basis text, reason text) language sql stable as $$
  select coalesce(si.label, ow.label, c.label), p.date,
         case when i.state = 'moved' then 'moved' when i.state = 'taken_off' then 'taken off the Plan'
              when c.execution = 'did_not_happen' then 'did not happen' when c.execution = 'partly_executed' then 'partly executed'
              else 'time changed' end,
         i.basis::text,
         (select r.reason from file_revisions r
           where r.reason is not null
             and ((r.table_name = 'plan_items' and r.row_id = i.id) or (r.table_name = 'commitments' and r.row_id = c.id))
           order by r.at desc limit 1)
    from commitments c
    join plan_items i on i.commitment_id = c.id
    join plans p on p.id = i.plan_id
    left join schedule_items si on si.id = c.schedule_item_id
    left join ongoing_work ow on ow.id = c.ongoing_work_id
   where c.user_id = p_user and p.date between p_from and p_to
     and (i.state <> 'on' or c.timing_outcome = 'changed' or c.execution in ('did_not_happen', 'partly_executed'))
   order by 1, 2
$$;

-- 12.12 and 12.13. What is on file in one period of one day, the schedule included.
create or replace function tq_overlaps(p_user uuid, p_date date, p_start text, p_end text)
returns table (label text, starts_at text, status text, origin text, movable boolean, is_commitment boolean)
language sql stable as $$
  select d.label, lpad((greatest(d.s, 0) / 60)::text, 2, '0') || ':' || lpad((greatest(d.s, 0) % 60)::text, 2, '0'),
         d.status, d.origin, d.movable, d.is_commitment
    from tq_day_periods(p_user, p_date) d
   where d.s < uc_min(p_end) and d.e > uc_min(p_start)
   order by d.s
$$;

-- 12.13. Periods of one day that no block and no recurring item covers, at least p_minutes long, between two times.
create or replace function tq_open_periods(p_user uuid, p_date date, p_from text, p_to text, p_minutes int)
returns table (starts_at text, ends_at text, minutes int) language sql stable as $$
  with x as (
    select greatest(s, uc_min(p_from)) as a, least(e, uc_min(p_to)) as z from tq_day_periods(p_user, p_date)
     where s < uc_min(p_to) and e > uc_min(p_from)
    union all select uc_min(p_from), uc_min(p_from)
    union all select uc_min(p_to), uc_min(p_to)
  ), o as (
    select a, z, max(z) over (order by a, z rows between unbounded preceding and 1 preceding) as prev_z from x
  )
  select lpad((prev_z / 60)::text, 2, '0') || ':' || lpad((prev_z % 60)::text, 2, '0'),
         lpad((a / 60)::text, 2, '0') || ':' || lpad((a % 60)::text, 2, '0'), a - prev_z
    from o where prev_z is not null and a - prev_z >= p_minutes order by prev_z
$$;

-- 12.14. What one commitment cost, with the blocks that exist because of it.
create or replace function tq_real_cost(p_commitment uuid)
returns table (part text, kind text, paid text, status text, minutes int) language sql stable as $$
  select 'the commitment', b.kind, b.paid::text, b.status::text, b.e - b.s
    from commitments c join time_block_minutes b on b.id = c.block_id where c.id = p_commitment
  union all
  select 'cost', k.kind, k.paid::text, k.status::text, k.e - k.s
    from commitments c join time_block_minutes k on k.cost_of = c.block_id where c.id = p_commitment
$$;

-- 12.15. For each day of a week: the minutes in committed blocks and in travel and getting ready, one figure
-- for each status, with a minute counted once. The three figures are never added.
create or replace function tq_day_load(p_user uuid, p_week_start date)
returns table (day date, observed int, estimated int, planned int, commitments int) language sql stable as $$
  select d::date,
         tq_covered_minutes(p_user, d::date, d::date, array['observed'], null, k.kinds),
         tq_covered_minutes(p_user, d::date, d::date, array['estimated'], null, k.kinds),
         tq_covered_minutes(p_user, d::date, d::date, array['planned', 'required', 'suggested'], null, k.kinds),
         (select count(*)::int from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
           where p.user_id = p_user and p.date = d::date)
    from generate_series(p_week_start, p_week_start + 6, interval '1 day') d
    cross join (select array['paid_work', 'unpaid_work', 'household', 'caring', 'appointment', 'travel', 'getting_ready'] as kinds) k
   order by 2 desc, 3 desc, 4 desc, 1
$$;

-- 12.17. The assumed length of one kind of block, each observed length, and each length software measured.
create or replace function tq_assumed_and_observed(p_user uuid, p_kind text, p_from date, p_to date)
returns table (assumed_minutes int, observed_count int, observed_low int, observed_middle numeric, observed_high int,
               estimated_count int, measured_count int, measured_middle numeric) language sql stable as $$
  select (select uc_min(ends_at) - uc_min(starts_at) from schedule_items
           where user_id = p_user and kind = p_kind and starts_at is not null and ends_at is not null
             and effective_to is null order by effective_from desc limit 1),
         count(*) filter (where status = 'observed')::int,
         min(e - s) filter (where status = 'observed'),
         percentile_cont(0.5) within group (order by e - s) filter (where status = 'observed'),
         max(e - s) filter (where status = 'observed'),
         count(*) filter (where status <> 'observed')::int,
         (select count(*)::int from commitments c join blocks b on b.id = c.block_id
           where c.user_id = p_user and b.kind = p_kind and b.date between p_from and p_to
             and c.measured_start is not null and c.measured_end is not null),
         (select percentile_cont(0.5) within group (order by extract(epoch from (c.measured_end - c.measured_start)) / 60)
            from commitments c join blocks b on b.id = c.block_id
           where c.user_id = p_user and b.kind = p_kind and b.date between p_from and p_to
             and c.measured_start is not null and c.measured_end is not null)
    from time_block_minutes
   where user_id = p_user and kind = p_kind and date between p_from and p_to and e is not null
$$;

-- 12.18. The next step. The commitment is selected in this order: the one planned for the current time, the next
-- one by planned time, then one with no time set, by its deadline and then by whether a consequence is on file.
-- A step the client skipped in the session is passed over. It stays open.
create or replace function tq_next_step(p_user uuid, p_today date, p_now text, p_skipped uuid[] default '{}')
returns table (commitment text, step text, step_position int, basis text) language sql stable as $$
  with cur as (
    select c.id, c.label, i.planned_start, i.planned_end, i.position, c.deadline_date,
           exists (select 1 from commitment_consequences x where x.commitment_id = c.id and x.kind = 'expected') as has_consequence,
           case when i.planned_start is not null and uc_min(i.planned_start) <= uc_min(p_now)
                 and (i.planned_end is null or uc_min(i.planned_end) > uc_min(p_now)) then 0
                when i.planned_start is not null then 1 else 2 end as rank
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id
     where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
       and (i.planned_end is null or uc_min(i.planned_end) > uc_min(p_now))
  )
  select cur.label, s.label, s.position,
         case cur.rank when 0 then 'the commitment planned for this time'
              when 1 then 'the next commitment by planned time'
              else case when cur.deadline_date is not null then 'a commitment with no time set and a deadline'
                        when cur.has_consequence then 'a commitment with no time set and a consequence on file'
                        else 'a commitment with no time set' end end
    from cur
    left join lateral (
      select id, label, position from commitment_steps
       where commitment_id = cur.id and removed_at is null and state = 'open'
         and (not suggested or accepted_at is not null) and not (id = any (p_skipped))
       order by position limit 1) s on true
   order by cur.rank, cur.planned_start nulls last, cur.deadline_date nulls last, cur.has_consequence desc, cur.position nulls last
   limit 1
$$;

-- 12.19. Time left before the next commitment that cannot move, with its travel and preparation.
create or replace function tq_time_left(p_user uuid, p_today date, p_now text)
returns table (next_fixed text, starts_at text, cost_minutes int, cost_status text, leave_by text,
               minutes_left int, travel_on_file boolean) language sql stable as $$
  with f as (
    select c.id, c.label, c.block_id, c.travel_needed, i.planned_start
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id
     where p.user_id = p_user and p.date = p_today and c.movable is false and c.withdrawn_at is null
       and c.execution = 'planned' and i.planned_start is not null and uc_min(i.planned_start) > uc_min(p_now)
     order by uc_min(i.planned_start) limit 1
  ), k as (
    select coalesce(sum(b.e - b.s), 0)::int as m,
           case when count(*) = 0 then null
                when bool_and(b.status = 'observed') then 'observed'
                when bool_or(b.status = 'planned') then 'planned' else 'estimated' end as st,
           bool_or(b.kind = 'travel') as has_travel
      from f join time_block_minutes b on b.cost_of = f.block_id and b.date = p_today
     where b.e is not null and b.e <= uc_min(f.planned_start)
  )
  select f.label, f.planned_start, k.m, k.st,
         lpad(((uc_min(f.planned_start) - k.m) / 60)::text, 2, '0') || ':' || lpad(((uc_min(f.planned_start) - k.m) % 60)::text, 2, '0'),
         uc_min(f.planned_start) - k.m - uc_min(p_now),
         coalesce(k.has_travel, false) or f.travel_needed is false
    from f, k
$$;

-- The open work that the Plan places before the time to leave, with the planned minutes that remain.
--   Planned to start later than now: its whole planned length.
--   Planned for the current time: from now to its planned end.
--   Its planned end has passed and no outcome is on file: not counted. Silence proves nothing. TIME.md 8.9.
--   The count of such commitments is returned, so the answer can state it.
-- An empty length is never read as zero. The count of such commitments is returned beside the total.
create or replace function tq_open_work(p_user uuid, p_today date, p_now text)
returns table (minutes_left int, leave_by text, open_minutes int, open_with_no_length int, earlier_with_no_outcome int, behind boolean)
language sql stable as $$
  with t as (select * from tq_time_left(p_user, p_today, p_now)),
  w as (
    select c.id,
           i.planned_end is not null and uc_min(i.planned_end) <= uc_min(p_now) as earlier,
           case when i.planned_end is null and c.duration_minutes is null then null
                when uc_min(i.planned_start) <= uc_min(p_now) and i.planned_end is not null and uc_min(i.planned_end) > uc_min(p_now)
                  then uc_min(i.planned_end) - uc_min(p_now)
                else coalesce(c.duration_minutes, uc_min(i.planned_end) - uc_min(i.planned_start)) end as remaining
      from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
      join commitments c on c.id = i.commitment_id, t
     where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
       and i.planned_start is not null and uc_min(i.planned_start) < uc_min(t.leave_by)
       and not exists (select 1 from blocks b where b.id = c.block_id and b.cost_of is not null)
  )
  select t.minutes_left, t.leave_by,
         coalesce(sum(w.remaining) filter (where not w.earlier), 0)::int,
         count(*) filter (where w.id is not null and not w.earlier and w.remaining is null)::int,
         count(*) filter (where w.earlier)::int,
         case when count(*) filter (where w.id is not null and not w.earlier and w.remaining is null) > 0 then null
              else coalesce(sum(w.remaining) filter (where not w.earlier), 0) > t.minutes_left end
    from t left join w on true group by t.minutes_left, t.leave_by
$$;

-- 12.20. What still fits before the next commitment that cannot move. The free minutes are the minutes left,
-- less the open work the Plan already places before the time to leave. A candidate is an open commitment
-- with no time set, or one planned for later in the day whose time is not fixed.
create or replace function tq_what_fits(p_user uuid, p_today date, p_now text)
returns table (label text, minutes int, free_minutes int, fits boolean) language sql stable as $$
  with o as (select * from tq_open_work(p_user, p_today, p_now)),
  f as (select o.leave_by, case when o.open_with_no_length > 0 then null else greatest(o.minutes_left - o.open_minutes, 0) end as free from o)
  select c.label,
         coalesce(c.duration_minutes, case when i.planned_end is not null then uc_min(i.planned_end) - uc_min(i.planned_start) end),
         f.free,
         coalesce(c.duration_minutes, case when i.planned_end is not null then uc_min(i.planned_end) - uc_min(i.planned_start) end) <= f.free
    from plans p join plan_items i on i.plan_id = p.id and i.state = 'on'
    join commitments c on c.id = i.commitment_id, f
   where p.user_id = p_user and p.date = p_today and c.execution = 'planned' and c.withdrawn_at is null
     and c.movable is distinct from false
     and (i.planned_start is null or uc_min(i.planned_start) >= uc_min(f.leave_by))
     and not exists (select 1 from blocks b where b.id = c.block_id and b.cost_of is not null)
   order by 4 desc nulls last, 2 nulls last, 1
$$;

-- 12.21. What changed on the schedule in a period. Reads the two histories.
create or replace function tq_schedule_changes(p_user uuid, p_from timestamptz, p_to timestamptz)
returns table (at timestamptz, entry text, label text, changed text, was text, became text,
               who text, basis text, reason text) language sql stable as $$
  select r.at, 'block', r.after->>'label', k.key, r.before->>k.key, r.after->>k.key, r.origin::text, r.basis, r.reason
    from block_revisions r cross join lateral jsonb_object_keys(r.after) k(key)
   where r.user_id = p_user and r.at >= p_from and r.at < p_to
     and k.key not in ('updated_at') and r.before->k.key is distinct from r.after->k.key
  union all
  select r.at, r.table_name, coalesce(r.after->>'label', r.after->>'next_action', r.table_name), k.key,
         r.before->>k.key, r.after->>k.key, r.origin::text, r.basis, r.reason
    from file_revisions r cross join lateral jsonb_object_keys(r.after) k(key)
   where r.user_id = p_user and r.at >= p_from and r.at < p_to
     and r.table_name in ('commitments', 'plan_items', 'schedule_items', 'plans')
     and k.key in ('block_id', 'state', 'planned_start', 'planned_end', 'starts_at', 'ends_at', 'recurrence',
                   'withdrawn_at', 'required_date', 'required_start', 'effective_to', 'confirmed_at')
     and r.before->k.key is distinct from r.after->k.key
  union all
  select b.created_at, 'block', b.label, 'added', null, b.starts_at || coalesce(' to ' || b.ends_at, ''), b.source::text, null, null
    from blocks b where b.user_id = p_user and b.created_at >= p_from and b.created_at < p_to
   order by 1
$$;
```

Governed by `LANGUAGE_STANDARD.md`, section 8.4, for composition.
