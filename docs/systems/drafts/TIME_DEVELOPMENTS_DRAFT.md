# Folder 01 Time Developments

> **Draft. This file is not in force.** It is Version 2 of Folder 01 Time Developments, filed on October 11, 2026 beside the document it would revise. The document in force is `docs/systems/TIME_DEVELOPMENTS.md`, Version 1. The founder has not approved it. `README.md` in this folder states how the drafts are read.

Department I, Agency Assessment. Log. Version 2, October 11, 2026. The dated log of changes, errors found, open issues, and ideas held for later, with the decision history, the state of the software, the dependencies, and the work register.

## 1. About this document

1.1 This is one of five documents for this folder. `docs/systems/TIME.md` states what the folder is. `docs/systems/TIME_OPERATIONS.md` states how the system runs. This document states how both came to say what they say.

1.2 No entry is removed. A closed item is marked closed and stays.

1.3 A version of this document was written on August 29, 2026. That version was never filed. This file is a new document. It does not reconstruct the August 29 version.

1.4 A change to `TIME.md`, to `TIME_OPERATIONS.md`, to the Curriculum, or to the Research is entered here with the date and the reason.

1.5 Version 2 is dated October 11, 2026. Sections 6 to 12 were added. No entry of sections 2 to 5 was removed or reworded. Each new entry in those sections follows the last entry that was there. Three earlier entries received a dated note at their end: 4.2, 4.8, and 4.10.

1.6 Sections 2 to 5 are the log. Sections 6 to 12 are registers. A register sorts what the log holds and points back to it. Where a register and the log differ, the log is the record.

1.7 A status is stated in this document only where it was checked. The code was read at commit `0dbbeac` on October 11, 2026. The four migration files were run in a local test database, and the behavior of the tables was tested there. The Universe City database was read for its list of tables and its row counts. No test was run on it.

1.8 A proposal is never entered here as a decision. Section 6.4 lists each proposal that needs a ruling, with who decides it. `TIME_OPERATIONS.md` 20.3 lists every open point.

1.9 The repository holds the authoritative copy of each document. Six revised drafts of October 11, 2026 are in no repository yet. Entry 4.29. Where this document cites a clause that exists only in a draft, the clause is not in force until the draft is filed.

## 2. Changes

### August 28, 2026

2.1 Version 3 of Folder 01 Time. Time was defined as building a schedule from conversation. It measured how much of a client's time was accounted for. It held a four stage arc and five completion conditions.

### October 9, 2026

2.2 Decisions D-010 to D-014 in `docs/DECISIONS.md`. The daily Plan became the core of Time. A Plan is reviewed by the commitments on it. Success is not the number of commitments. The agent uses the Plan as the reason for contact. The agent does not follow up on every commitment.

### October 10, 2026

2.3 `LANGUAGE_STANDARD.md` Version 4. The arc was set at three stages. The standard ruled that the agent is a person. The person is named a client in agent documents and a resident in text the person reads.

2.4 Decisions D-015 to D-017. Entry runs Application, Enrollment, Orientation, then Time. Daily Close is placed on the Plan. The first Plan includes a check of how realistic it feels.

2.5 The conditions of a commitment were set: Timing, Completion, Consequences, and Standards. Follow through was added as the fifth. A commitment, a follow up, and ongoing work were defined as three separate entries.

### October 11, 2026

2.6 Version 4 of Folder 01 Time. Time was redefined as planning, execution, review, and follow through. The schedule stayed as the system. Reason: the August 28 definition measured accounted hours, and the decisions of October 9 and 10 moved the folder to what happens after a Plan is made.

2.7 Four departures from the revision plan, each required by `LANGUAGE_STANDARD.md`. The arc has three stages. The schedule is the system and Time is the folder. The daily check is named Daily Close, since Review names the meeting. The section once named Completion is named Operational conditions.

2.8 Six corrections after the first review of Version 4.

| Section | Correction |
| :-- | :-- |
| 3.3 | One state label was replaced by four separate outcome fields: Execution, Timing, Consequences, and Alternative |
| 5.5 and 5.6 | A change to the client's file keeps the existing approval rules. Action permissions were assigned to Operations |
| 5.9 | The Version 3 rules for order and frequency are held until the Curriculum is rewritten |
| 7 | A day with no entry gets a question only where an open requirement depends on it |
| 10 | The condition that required a follow up was removed |
| 11.6 | Partial execution and an agreed alternative each stay on file as their own information |

2.9 The fourteen items that the first draft of Version 4 listed as open. Twelve are closed. Item 15.1 stays open. Item 15.14 is closed by the creation of this file and of `TIME_OPERATIONS.md`.

| First draft item | Subject | Resolution | Now in `TIME.md` |
| :-- | :-- | :-- | :-- |
| 15.1 | The twelve questions | Open | 15.1 |
| 15.2 | The question for Time | Closed. Both questions are kept. One belongs to Daily Close and one to the schedule | 2.8 |
| 15.3 | Time and Integrity | Closed. Integrity covers every commitment and reads Time. It holds no second copy | 4.4.7, 4.4.8, 13.10 |
| 15.4 | A purchase amount | Closed. Filed in Finance | 4.4.6, 13.9 |
| 15.5 | Partial execution, alternatives, timing | Closed. Execution is measured against the Completion condition. A changed time with no harm on file is successful. Corrected the same day. See 2.16 | 3.3.7, 11.6 |
| 15.6 | Fields before a Plan | Closed. The action, the client's authorization, and a date or time | 3.3.4 |
| 15.7 | What opens the Resident Portal home | Closed. The first seven day schedule and the first confirmed Plan | 9.3 |
| 15.8 | Action with no further approval | Closed in principle. The full list of permissions is assigned to Operations | 5.6 |
| 15.9 | When the agent stops asking | Closed in principle. No fixed count. The criteria are assigned to Operations | 7.16, 7.17 |
| 15.10 | Morning contact | Closed. Three points of contact in the day. The client chooses how much | 5.4 |
| 15.11 | The sender of a message | Closed. An automated message is shown as automated. The label is assigned to Operations | 5.4.12 |
| 15.12 | Operational conditions | Closed. Three conditions. The two figures are produced by the schedule and are not conditions | 10 |
| 15.13 | The free first day | Closed. Retired | 9.2 |
| 15.14 | Operations and Developments | Closed. Both files were created in the repository on October 11, 2026 | 1.3 |

2.10 Three further corrections. Consequences now tells none confirmed apart from not established. Authorization now separates preparation, authorized execution, and approval of a permanent change. Follow through that a standing permission covers runs with no question to the client.

2.11 Three rulings by the founder on October 11, 2026.

2.11.1 The repository holds the authoritative specification. `TIME.md` is the finished specification. Operations holds the mechanics. Developments holds how the thinking changed. A Word file is an export.

2.11.2 Integrity covers every commitment the client made. It is not limited to work. Integrity reads the commitments on file in Time and creates no second schedule and no second copy.

2.11.3 Software can carry out an action a standing permission covers, with no person releasing it. The rule that the agent is a person concerns identity and responsibility. A person is required in the four cases in `TIME.md` 5.6.6.

2.12 Dates and vocabulary were set to United States English under `LANGUAGE_STANDARD.md` 5.9. Dates are written month, day, year.

2.13 `TIME.md` was replaced. Until October 11, 2026 the file held a working product model. It now holds the specification. The parts of the working model that the specification does not carry are listed in section 5.

2.14 `TIME_OPERATIONS.md` Version 1 and this document Version 1 were created.

2.15 The four items left open in `TIME.md` section 15 were reviewed. The Curriculum stays open and is the next step. The Research stays open and follows the Curriculum. The block statuses moved to `TIME_OPERATIONS.md` 2.1.4. The Version 3 rule of lowest position first was retired, with the rule that set frequency by the twelve answers. `TIME.md` 5.9 now states four factors for the next question.

2.16 Successful execution was split in two. Executed means the Completion condition is met. Confirmed successful means executed with Consequences none confirmed. Reason: the earlier wording counted a commitment with no information about consequences as successful. `TIME.md` 11.6.

2.17 The sender rule in `TIME.md` 5.4.12 was reviewed and kept. A message from the agent and an automated Universe City message stay distinct.

2.18 `LANGUAGE_STANDARD.md` 3.20 was changed to match `TIME.md` 5.9. Position now informs the assessment and identifies where work exists. Clauses 3.20.1 to 3.20.3 were added. Clauses 3.12 and 12.7 and the change record of the standard carry the date. Start, Target, Position, Report, and Grade keep their definitions. `TIME.md` was not changed. Ruled by the founder.

2.19 Folder 01 Time Curriculum, Version 2. Twelve new questions replaced the twelve kinds of time: Commitments, Taking on a commitment, The plan, Time a commitment takes, Starting, Completing, Changes, Review, Consequences, Remaining work, Recurring responsibilities, and Using support. The twelve kinds of time moved to the Schedule intake. Six lessons became fourteen. Reason: Version 4 measures planning, execution, review, and follow through, and the Version 1 questions measured accounted hours.

2.20 Five rulings by the founder on the scales of the Curriculum.

2.20.1 Each scale measures one ability and states its progression.

2.20.2 No option requires a condition that another person or an institution sets for the client.

2.20.3 Help from the agent, from the guide, or from authorized software never lowers an option.

2.20.4 Option 10 describes the subject handled under the client's own conditions. It does not describe perfection.

2.20.5 Start and Target describe the same level at each number.

2.21 A ruling by the founder on Enrollment. The Start and the Target selected at Enrollment are the client's own report. The words about half and most stay in the options. Once Time is operating, the outcomes on file are used to assess what is happening. The Enrollment Start is kept and is never replaced.

2.22 Folder 01 Time Research. Two entries were added. The first holds the evidence for the Version 4 definition and corrects the entry of August 28, 2026. The second reports the check of ten sources. Daily Close is recorded as a design that follows from research on monitoring progress. No study tested it.

2.23 Guided Life. The working ideas were received in `docs/product/RESIDENT_ENGAGEMENT_WORKING_IDEAS.md`, sections 15 to 19. Ten rulings by the founder followed.

2.23.1 The step. A step is a named part of the Completion condition of one commitment. It is no fifth kind of entry and no separate commitment. Reported steps establish execution only where the client stated that the steps are the whole of the Completion condition.

2.23.2 Recommendations. The agent may proactively recommend a practical next action. A recommendation is not a binding decision. The agent or software carries out a change only within a standing permission or an alternative approved in advance. A consequential decision outside those belongs to the client.

2.23.3 The guide. Guided Life has one recognizable, consistent automated guide, openly identified as software and separate from the agent. Its name and its personality are not chosen.

2.23.4 The names. Guided Life is the name the client reads. Guide Mode is the name in the agent console.

2.23.5 Communication. The personality adapts. The standards do not. Official communication, the agent's conversation, and the guide's communication are three separate layers. Acknowledgment and natural encouragement are permitted.

2.23.6 Guided Life is not limited to scheduled blocks. A client can start a guided session with no block.

2.23.7 Voice is one form of the experience. It holds no authority of its own. The audio interfaces of OpenAI are candidates for evaluation. No provider is selected.

2.23.8 Each session that produced a result ends with a summary for the client: what was filed, changed, proposed, reported, or left open. The summary stays in the history of the File and can be used in the Review. The agent can read an authorized transcript.

2.23.9 A call or a timer never proves that an activity was executed.

2.23.10 The schedule and the Plan are built before Guided Life.

2.24 Eight decisions were made by recommendation, under the founder's direction to follow the recommendation where it fits the governing documents.

| Subject | Decision | Now in |
| :-- | :-- | :-- |
| Execution during a guided session | Stays planned. Step progress is a count | `TIME.md` 3.3.20 |
| A duration that software measured | Estimated until the client confirms it | `TIME.md` 3.6.9 |
| A status named reported | Not added. Reported is an entry whose source is the client | `TIME_OPERATIONS.md` 2.1.5 |
| One step at a time | Shown when the client asks. Software infers no state of the client | `TIME.md` 5.13.4 to 5.13.6 |
| Voice and privacy | Off until turned on. Three levels of what is spoken | `TIME.md` 5.12.12 |
| A screen alone | Every function is on the screen. Voice adds no function | `TIME.md` 5.12.11 |
| Lessons from other folders | Only from the approved Curriculum of the owning folder | `TIME.md` 5.12.13 |
| Contact in a guided session | Client requested contact. Guidance is a fifth kind of message | `TIME.md` 5.4.1 and 5.4.4.1 |

2.25 `TIME.md` was changed to carry 2.23 and 2.24. Added: clauses 1.8, 2.4.6, 3.3.13 to 3.3.22, 3.6.9 to 3.6.12, 4.4.9, 5.2.1 to 5.2.7, 5.4.4.1, 5.4.14, 5.10 to 5.14, 6.15, 7.18 to 7.20, 8.12 to 8.16, 9.6, 10.9, 12.18 to 12.21, 13.11, 13.12, 14.4.9 to 14.4.13, 15.4, and 15.5. Changed: clauses 1.4, 5.1, 5.4.1, 5.4.12, 5.6.2, 5.9.2, 6.3, 6.6, 7.13, 8.2, 8.7, 8.9, 11.2, 15.1, and 15.2. The definition in 2.3 did not change.

2.26 `TIME_OPERATIONS.md` was changed. Added: parts 2.1.5, 2.2.3 to 2.2.5, 3.7, 3.8, 4.5, 4.6, 6.10, 6.11, 7.11, 7.12, and sections 10 to 15. Changed: parts 5.1, 5.3, 7.4, 8.4, and 8.5.

2.27 `LANGUAGE_STANDARD.md` was changed. Five layers replaced four. Adaptive delivery, recommendations, the guide, and permitted encouragement were added. Clauses 3.20.4, 8.3.2, 8.3.3, 9.6, and 9.8 were changed to match the rulings in 2.20 and 2.21. The change record of the standard lists each one.

2.28 Folder 01 Time Curriculum, Version 2, was changed on five points for guidance and communication: recommendations, acknowledgment and encouragement, adaptive delivery, teaching in a guided session, and Guided Life in the definition of support. The twelve questions, the 240 options, and the fourteen lessons did not change.

2.29 Folder 01 Time Research. A third entry was added. It lists the research Guided Life needs. It claims no support for the product.

2.30 `TIME_OPERATIONS.md` Version 2. Reason: Version 1 held fifty four parts with no decision, fifty marked To define and four under the heading of its section 9. No developer could build from it. Version 2 keeps each of the 114 clause numbers of Version 1. It holds 440 numbered clauses in its twenty sections and seven in its two appendixes.

2.30.1 The mark To define was replaced by two marks. Proposed carries a technical proposal that rests on a governing rule. Open carries a missing decision. It names who decides and what the decision needs, and it gives a recommendation where the governing documents support one. No proposal was entered as approved.

2.30.2 What was added, by section.

| Section of `TIME_OPERATIONS.md` | Clauses in Version 1 | Clauses added | New in Version 2 |
| :-- | :-- | :-- | :-- |
| 1. About this document | 7 | 6 | Clauses 1.8 to 1.13 |
| 2. Fields | 21 | 71 | Data definitions for each entry. Parts 2.6 to 2.8 |
| 3. States and transitions | 8 | 17 | Transition tables. Clauses 3.9 to 3.21 |
| 4. Views | 6 | 13 | What each view displays. Clauses 4.7 to 4.9 |
| 5. Queries | 3 | 33 | One definition for each of the twenty questions. Parts 5.4 to 5.24 |
| 6. Action permissions | 11 | 18 | Who starts, authorizes, approves, and carries out each act. Clauses 6.12 to 6.14 |
| 7. Contact | 12 | 9 | How each trigger is detected. Clauses 7.13 to 7.15 |
| 8. Asking less | 5 | 1 | The seven conditions as calculations |
| 9. Further items | 4 | 5 | Clauses 9.5 to 9.8 |
| 10. Guided Life | 12 | 24 | Fields, states, controls, and interruptions of a guided session. Clauses 10.13 to 10.21 |
| 11. Recommendations | 4 | 4 | Clauses 11.5 and 11.6 |
| 12. The guide and Guide Mode | 7 | 2 | Guide Mode |
| 13. Voice, transcripts, and devices | 8 | 3 | Clauses 13.9 to 13.11 |
| 14. Links to other folders | 4 | 2 | Clause 14.5 |
| 15. Concerns owned by other documents | 2 | 1 | Sixteen shared requirements. Clause 15.3 |
| 16. Storage and continuity | 0 | 48 | New section |
| 17. Workflows | 0 | 45 | New section. Twelve workflows |
| 18. Failure handling and recovery | 0 | 1 | New section |
| 19. Acceptance criteria and test cases | 0 | 16 | New section. 151 cases: 16 on the built database, 57 on the proposed rules, 33 on the reference queries, and 45 written |
| 20. Implementation status, blockers, and build order | 0 | 7 | New section |
| Appendixes A and B | 0 | 7 | The proposed tables. The reference queries |

2.30.3 What became of the fifty four parts.

| Result | Count | Clauses of `TIME_OPERATIONS.md` |
| :-- | :-- | :-- |
| Answered by the code | 1 | 3.6. The database already lets the service role file a proposal. No server code does |
| Defined in `TIME.md`, with its content proposed in a further clause | 1 | 4.3. `TIME.md` 5.8.1 and 14.3 define the views. Clause 4.7 proposes what each one displays |
| Proposed, with the rule each one rests on | 40 | 2.1.4, 2.2.2, 2.2.5, 2.3.2, 2.4.2, 2.5.2, 3.3, 4.4, 4.5, 5.3, 6.5, 6.7 to 6.9, 6.11, 7.6, 7.8 to 7.10, 8.2, 8.3, 8.5, 9.1 to 9.4, 10.3, 10.4, 10.7, 10.9 to 10.12, 11.2, 11.4, 12.3, 12.4, 13.4, 14.2, 14.4 |
| Open in part | 1 | 6.6. The stored form is proposed. Two questions of client copy are missing |
| Open, with who decides and what the decision needs | 11 | 7.7, 7.12, 10.8, 12.2, 12.5, 12.6, 13.3, 13.5 to 13.7, 14.3 |

2.30.4 Twelve further open points were found while the tables were drafted. `TIME_OPERATIONS.md` 2.1.7, 2.2.15, 2.5.8, 5.14, 5.18, 7.6.3, 9.5, 9.6, 9.7, 10.14.2, 17.1.2, and the row on timezone in 18.1.

2.31 The count of questions in `TIME_OPERATIONS.md` 5.1 and 5.3 was corrected from twenty one to twenty. See 3.10.

2.32 This document, Version 2. Sections 6 to 12 were added, with entries 1.5 to 1.9, 2.30 to 2.36, 3.10 to 3.33, 4.17 to 4.32, and 5.17 to 5.19.

2.33 Three foundational proposals were made in `TIME_OPERATIONS.md`: a table for the commitment, a stored form for the Plan, and a stored form for the recurring week. Appendix A holds sixteen tables in all: fifteen for Time, and one candidate history for every File table. None is approved. Section 6.4.

2.34 The repository and the database were checked against `TIME.md` Version 4, clause by clause, beyond the three checks of entries 3.1, 3.2, and 3.5. Nineteen differences were found. Entries 3.14 to 3.32 hold them, and section 8 sorts them.

2.35 A working list was written with this version: Shared Architectural Dependencies Found in Folder 01 Time. It states the sixteen shared requirements of `TIME_OPERATIONS.md` 15.3 by subject. It is not one of the five Time documents. It is in no repository.

2.36 The first draft of `TIME_OPERATIONS.md` Version 2 and of this document was reviewed twice by two readers who did not write them. Entry 3.33 holds the errors that were found and corrected.

## 3. Errors found

3.1 October 11, 2026. Version 3 listed five features as live that the repository does not hold: plain language collection, the day view by whole hours, the month view, direct editing by hand, and reminders. Corrected in `TIME.md` 14.3.

3.2 October 11, 2026. Version 3 item 15.2 asked for a field to be renamed. The code already names it `cost_of`. Closed.

3.3 October 11, 2026. The first draft of Version 4 held one label for execution, timing, and consequences. Corrected. See 2.8.

3.4 October 11, 2026. The first draft of Version 4 made a follow up a condition of the folder being operational. A client whose commitments produce no further work could never have met it. Corrected. See 2.8.

3.5 October 11, 2026. A comment in `lib/domain/time.ts` states twelve kinds of time. The code holds eleven. Open.

3.6 October 11, 2026. `TIME.md` 11.6 counted an executed commitment as successful while its consequences were not established. Corrected. See 2.16.

3.7 October 11, 2026. `TIME.md` 5.9.2 and `TIME_OPERATIONS.md` 8.4 listed four factors for the next question. `LANGUAGE_STANDARD.md` 3.20.2 lists five. Both were corrected to five.

3.8 October 11, 2026. Version 1 of the Curriculum held three statements with no source: that an eight hour shift is a ten or eleven hour commitment, that the gap between an estimate and an outcome is almost always larger than expected, and that total free hours is close to useless as a figure. Each was withdrawn in Version 2.

3.9 October 11, 2026. The first draft of the Version 2 scales held options that measured a second ability, options that assumed the client controls their hours, and one option that required a month with no exception. Corrected. See 2.20.

3.10 October 11, 2026. `TIME_OPERATIONS.md` stated one question more than `TIME.md` section 12 lists. The filed Version 1 states seventeen where the filed `TIME.md` lists sixteen, in clauses 12.2 to 12.17. The revised draft stated twenty one where the revised `TIME.md` lists twenty, in clauses 12.2 to 12.21. The count was one too high from the first version. Corrected in `TIME_OPERATIONS.md` 5.1 and 5.3.

3.11 October 11, 2026. `TIME.md` 7.18 has the guide ask when a step passes its planned time. `TIME.md` 3.3.14 gives a step a label, an order, and a state, and no time. `TIME.md` 7.18 cannot run as written. Open. `TIME_OPERATIONS.md` 10.8 holds the recommendation.

3.12 October 11, 2026. `TIME.md` 5.10.2 lets a commitment be taken off the day's Plan. `TIME.md` 3.3.6 gives Execution four values, and none describes a commitment the client took off before it was due. Open. `TIME_OPERATIONS.md` 2.2.15.

3.13 October 11, 2026. `TIME.md` 5.4.6 has the agent ask about a commitment at Daily Close only where 7.15 applies. `TIME.md` 3.6.6 files an outcome only on a report or on evidence. `TIME.md` 7.17 has the agent ask less as outcomes keep matching the Plan. Together the three leave an established commitment with no outcome on file. Open. `TIME_OPERATIONS.md` 9.5.

3.14 October 11, 2026. `TIME.md` 3.2.4 states that a cost block belongs to a commitment. The code links a cost block to a second block, in the field `cost_of`. Open. `TIME_OPERATIONS.md` 2.1.15 proposes that the field stays.

3.15 October 11, 2026. `figures()` in `lib/domain/time.ts` adds a block with the status required to the observed hours. A required block can sit on a future date. `TIME.md` 3.6.1 files a future period as estimated. Open.

3.16 October 11, 2026. `figures()` adds two blocks that overlap as two full blocks. `figures()` was run on the blocks of a seeded test week. The controlled hours read 14.0 and the unaccounted hours read 91.0, where a count of each minute once gives 13.5 and 91.5. Open. `TIME_OPERATIONS.md` 5.13 and 5.19.

3.17 October 11, 2026. A client can delete a block. A block that was never changed is deleted with no history. A block that was changed once cannot be deleted, since its history refuses the delete. Deleting a shift deletes its travel block. `TIME.md` 5.8.1 keeps every change on file. The access matrix in `ARCHITECTURE.md` lets a client delete the client's own block. Found in the local test database. Open. `TIME_OPERATIONS.md` 2.1.12.

3.18 October 11, 2026. An account with one row of block history cannot be deleted. The deletion reaches the history, and the history refuses it. Found in the local test database. `ARCHITECTURE.md` keeps the record when a residency is canceled. No decision exists on deletion at a client's request. Open. `TIME_OPERATIONS.md` 16.14.

3.19 October 11, 2026. The database lets a client set a block on a future date to observed. `TIME.md` 3.6.1. Found in the local test database. Open. `TIME_OPERATIONS.md` 2.1.13.

3.20 October 11, 2026. The database checks no format of a time and no kind of block. It accepted a start of `9am` and a kind that does not exist. Found in the local test database. Open. `TIME_OPERATIONS.md` 2.1.6.

3.21 October 11, 2026. `block_revisions` holds a column for the reason of a change. The trigger never fills it. No correction on file states why it was made. Open. `TIME_OPERATIONS.md` 2.1.11.

3.22 October 11, 2026. `components/FirstPlan.tsx` saves a first Plan the client called unlikely, after showing a note. `TIME.md` 5.3.3 requires that it is simplified or moved before it is saved. Decision D-017 gives the same direction and allows a third course, that the Plan is deliberately supported. Open. `TIME_OPERATIONS.md` 2.5.7.

3.23 October 11, 2026. The home of the Resident Portal opens when one block is on file. `TIME.md` 9.3 opens it when the first seven day schedule is on file and the first Plan is confirmed. Open. `TIME_OPERATIONS.md` 4.2.2 and 17.1.2.

3.24 October 11, 2026. The first Plan writes Daily Close as a block of the kind time on what you are building. Once observed, its hours count as the client's own time. Open. `TIME_OPERATIONS.md` 2.5.8.

3.25 October 11, 2026. The week view prints a time as `9am`, in the text that appears when the pointer rests on a bar. `LANGUAGE_STANDARD.md` 6.15.1 requires twelve hour format with AM or PM, as in 7:00 AM. Open.

3.26 October 11, 2026. `supabase/tests/0002_security.sql` cannot run clean. Test 4 expects an error when a client edits a row of history. The database changes no row and raises no error, so the test reports a failure while the history is intact. Test 8 names a variable outside the block that declares it. Found in the local test database. Whether the file runs clean on the hosted database was not checked. Open.

3.27 October 11, 2026. Two screens of Time hold sentences that `LANGUAGE_STANDARD.md` 6.11.2 prohibits, and `scripts/language-check.py` does not read them. `app/(resident)/portal/time/page.tsx` holds two sentences of the fifth construction in that clause. `components/FirstPlan.tsx` holds one of the fourth construction, and one that states what Universe City is not doing. The check reports a total of 0 for both files. Open.

3.28 October 11, 2026. The first Plan asks five questions in words that differ from the standard wording in `TIME.md` 6.4. `TIME.md` 1.6 keeps client copy in `TIME.md` alone. The words on the screen are in no governing document. One of the five was reworded by the founder on October 11, 2026, in commit `a5b6b0e`. Open.

3.29 October 11, 2026. The database sets who wrote a row for a client alone. An agent's write and the service role's write are stored as `resident` when they name no source. `ARCHITECTURE.md` states that only the service role records `ai`. Found in the local test database. Open. `TIME_OPERATIONS.md` 2.1.17.

3.30 October 11, 2026. A client can edit and delete a row of the `statements` table. The table holds no speaker, and an agent can write a row in the client's name. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` requires that the original wording of a message is kept with its speaker. Found in the local test database. Open. `TIME_OPERATIONS.md` requirement SR-1.

3.31 October 11, 2026. The database lets a block have no end. `TIME.md` 3.2.1 gives a block a start, an end, and a label. Open. `TIME_OPERATIONS.md` 2.1.7.

3.32 October 11, 2026. `TIME.md` 7.13 compares the controlled hours with the client's stated target when a commitment is added. No field holds that target. The controlled hours are calculated from observed time alone, so a commitment that has not taken place cannot change them. Open. `TIME_OPERATIONS.md` 9.7.

3.33 October 11, 2026. Errors in the drafts of `TIME_OPERATIONS.md` Version 2 and of this document, found in two reviews and corrected before either was delivered.

| Where | Error in the first draft | Correction |
| :-- | :-- | :-- |
| Operations 2.1.1, 2.7.1 | Stated that the database sets who wrote a row for every writer | Entry 3.29. A rule for every writer is now proposed |
| Appendix A, the outcome rule | Refused a consequence or a time that the client states after the outcome | Both are accepted with no correction. `TIME.md` 3.3.2 |
| Operations 17.1 to 17.4 | Gave the guide the questions of intake, of the Plan, and of a permission | The agent asks them. `TIME.md` 5.1 and 5.2.1 |
| Appendix A, the steps rule | Did not run when the client stated that the steps are the whole after reporting them | It runs then as well |
| Appendix A, evidence | Held no field for the entry that proves an outcome | Two fields, and a check |
| Appendix A, a day made from the schedule | Could write a second commitment, and could write a block again after the client took it off | One commitment for one item on one day. A block that was taken off keeps its place |
| Appendix B, three queries | Read blocks alone and left out the recurring items of the day | A day is read with the schedule |
| Appendix B, what fits | Counted a commitment the client was carrying out on time as work that did not fit, so a client on the Plan read as behind | The open work before the time to leave is counted by what remains |
| Appendix B, two queries | Added three statuses into one figure, and counted every week as 168 hours | One figure for each status. The week is read from the timezone |
| Operations 3.3 | Marked a reading of `TIME.md` 11.6.6 as Defined | Marked Proposed, with the founder to decide |
| Operations 9.3, 17.6 | Let a standing permission settle two commitments that compete | Only an alternative the client agreed in advance does |
| Operations 20.2 | Stated that rule 2 of `ARCHITECTURE.md` forbids a table with no history | Rule 2 states the pattern for a block |
| This document, 6.2 | Named the founder as the one who decided where the log names no one, and gave reasons the log does not hold | Both columns now state what the log and the founder's instructions hold |
| This document, section 12 | Dependencies between rows were wrong, and outstanding work that the two documents name had no row | The register was rewritten |
| This document, 2.30, 3.10, 4.27, 10.1 | A wrong count of test cases. A wrong cause for the count of questions. A statement that the first Plan followed decisions that were entered a day after it. A heading that read as if no ruling stood behind Guided Life | Each was corrected |
| This document, 6.2 | Cited two clauses of the standard about lessons for the Enrollment ruling | The row cites the Curriculum |
| Appendix A, second review | Refused each write by the agent to a commitment whose outcome the client had filed on a screen | The rule applies only to the write that files or changes an outcome |
| Appendix A, second review | Accepted the statement a step or a block was first filed with as the statement of a later report | The report names its own statement |
| Appendix A and B, second review | Lost the place of a block the client moved to a different day. Left out a recurring item with an interval above one | A block keeps the day of its occurrence. The interval is read |
| Operations 10.7, second review | Counted an earlier commitment with no report as open work, so silence could read as behind | It is left out, and the answer states how many there are |
| Operations 17.6, 17.9, 17.12, second review | Still gave the guide acts outside a guided session | The guide acts inside a guided session alone |

## 4. Open issues

4.1 `TIME.md` section 15 holds four open items: the Curriculum, the Research, the block statuses, and the Version 3 rules for order and frequency. Closed in part on October 11, 2026. See 2.15. Two items remain open: the Curriculum and the Research.

4.2 `TIME_OPERATIONS.md` marks each undecided mechanic as To define. Changed October 11, 2026. Version 2 of `TIME_OPERATIONS.md` replaced the mark To define with Proposed and Open. See 2.30.

4.3 The Curriculum and the Research are not in the repository. Both still describe Version 3. Neither has been revised. Closed in part on October 11, 2026. Both were revised. See 2.19, 2.22, 2.28, and 2.29. Each is a Word file under review. Neither is in the repository.

4.4 Decisions D-010 to D-017 call the person a resident. `TIME.md` calls the person a client, as `LANGUAGE_STANDARD.md` requires for an agent document. The two words name one person.

4.5 `LANGUAGE_STANDARD.md` 3.20 states that order of work is determined by position. `TIME.md` 5.9 retires that rule for Time. `LANGUAGE_STANDARD.md` 12.7 lists clause 3.20 as kept from Version 3 without review. The standard governs until its clause is changed. Closed October 11, 2026. See 2.18.

4.6 `LANGUAGE_STANDARD.md` 3.20 keeps a third output, engagement level, which sets how much the agent asks for. `TIME.md` 5.9.3 retires the Version 3 rule that set how often the agent asks by the twelve answers. The two overlap. The standard lists the engagement level output as kept without review. Open. Closed October 11, 2026. `LANGUAGE_STANDARD.md` 3.20.4 rules that engagement level never sets how often the client is contacted.

4.7 The Curriculum of August 28, 2026 holds a table for each question that states what the agent does at each start band. Those tables rest on the retired rules. They are part of the Curriculum revision in `TIME.md` 15.1. Open. Closed October 11, 2026. Version 2 of the Curriculum holds a table for each question with no column for frequency. See 2.19.

4.8 The order of building. `TIME.md` 14.4.2 to 14.4.4 list the commitment, the follow up, ongoing work, and Daily Close as to build. A step is a part of a commitment. No part of Guided Life can be built before them. Open. Noted October 11, 2026. `TIME_OPERATIONS.md` 20.5 now holds the order as nine stages. The issue stays open until stage 0 is decided.

4.9 The guide has no name and no chosen personality. `TIME.md` 15.4. `LANGUAGE_STANDARD.md` 12.12. Open.

4.10 Guided Life needs six parts that other documents own. `TIME_OPERATIONS.md` 15.1 lists each one with its owning document. None of the six is specified. Open. Noted October 11, 2026. `TIME_OPERATIONS.md` 15.3 adds sixteen shared requirements that the core of Time needs. See section 9.

4.11 The research Guided Life needs has not been read. The third entry of October 11, 2026 in Folder 01 Time Research lists it. Open.

4.12 Two points of adaptive delivery are not decided: whether a client can ask for profanity or slang, and where a communication preference is kept. `LANGUAGE_STANDARD.md` 12.13 and 12.14. Open.

4.13 Two pieces of client copy wait for approval. The folder description in `TIME.md` 2.11 does not mention Guided Life. The six definitions in Folder 01 Time Curriculum, 5.4, are new. Open.

4.14 `docs/product/RESIDENT_ENGAGEMENT_WORKING_IDEAS.md` stays a working file. Its section 16 uses the earlier label Guided Mode. Where that file and a governing document differ, the governing document applies. Open.

4.15 `docs/DECISIONS.md` holds no entry for the rulings in 2.20, 2.21, and 2.23. Open.

4.16 Agent Operations and AI Casework Training do not state the conduct rules for adaptive delivery. `LANGUAGE_STANDARD.md` 12.11. Open.

4.17 Three foundational parts of Time have no stored form: the commitment, the Plan, and the recurring week. `TIME_OPERATIONS.md` 2.2.2, 2.5.2, and 2.6 propose one for each. No code for an outcome, for Daily Close, or for a later Plan can be written before they are approved. Open.

4.18 History is built for blocks alone. Rule 2 of `ARCHITECTURE.md` states the pattern for a block. Whether each File table follows it is not decided. Each proposed Time table is drafted with a history. `TIME_OPERATIONS.md` requirement SR-2. Open.

4.19 No store of the conversation exists. The agent's part of the screen is static text. No entry can name the statement it rests on. `TIME_OPERATIONS.md` requirement SR-1. Open.

4.20 No code files, answers, decides, or applies a proposal. The agent console shows three actions as text. `TIME_OPERATIONS.md` requirement SR-7. Open.

4.21 `ARCHITECTURE.md` keeps the record when a residency is canceled. No decision exists on how long a recording, a transcript, a statement, or a row of history is kept, on deletion at a client's request, on consent to a recording, or on backup and recovery. Every agent account reads every client. `TIME_OPERATIONS.md` 16.14 and requirement SR-12. Open.

4.22 Ten decisions wait for the founder before a table can be final: the one set of block statuses, what Execution reads for a commitment taken off the Plan, whether a partly executed commitment can later be finished as the same commitment, what a yes at Daily Close files, what proves that the first seven day schedule is on file, whether a block can be filed with no end, the kind of block for time with Universe City, the client's target for controlled hours, whether a step holds a length, and what closes a session the client left open. `TIME_OPERATIONS.md` 20.3. Open.

4.23 Three figures have no definition in `TIME.md`: the longest unbroken block, the most overloaded day, and the amount of observed time that `TIME.md` 11.5 requires. `TIME_OPERATIONS.md` 5.14, 5.18, and 9.6. Open.

4.24 Client copy is missing or not approved for six uses: two questions that grant a standing permission, the sentence that tells a client the agent has it, the sentence the guide says when a follow up for the agent is opened, the label of an automated message, and the words a client reads for each stored code. `TIME.md` 1.6 keeps client copy in `TIME.md`. Open.

4.25 No delivery method for a message is chosen. `TIME_OPERATIONS.md` 7.7. Open.

4.26 `TIME.md` Version 4 does not carry the points that `TIME_OPERATIONS.md` Version 2 raised. Seventeen clauses of `TIME.md` are named there as the place where a ruling is entered: 3.2, 3.2.1, 3.3, 3.3.14, 5.4, 5.4.6, 5.6, 5.9, 5.12, 6.7, 7.13, 7.17, 10.2, 11.5, 11.6.6, 12.15, and 14.5.1. `TIME.md` was not changed in this stage. Open.

4.27 No commit changed what a Time function calculates or stores after `TIME.md` Version 4 was written. The repository received the Time code on September 15, 2026, as an import of code written earlier. The first Plan was added on October 9, 2026. Decisions D-015 to D-017, which describe it, were entered in `docs/DECISIONS.md` on October 10, 2026. The commits of October 11, 2026 renamed the stored value for the person and changed wording, the questions of the first Plan among it. Each difference in section 8 is therefore between code of October 9, 2026 or earlier and the specification of October 11, 2026, except the wording in 3.28. Open.

4.28 Two points of wording wait for the founder's confirmation. Her ruling on recommendations names the agent. The revised drafts apply the same rules to the guide, in `TIME.md` 5.10.10 and `LANGUAGE_STANDARD.md` 10.11.9. The revised `TIME.md` 7.13 reads that the agent can recommend where a new commitment fits and that the decision to take it is the client's. She was asked on October 11, 2026. No answer is on file. Open.

4.29 Six revised drafts of October 11, 2026 are in no repository: `LANGUAGE_STANDARD.md`, `TIME.md`, the first revision of `TIME_OPERATIONS.md` and of this document, Folder 01 Time Curriculum, and Folder 01 Time Research. `TIME_OPERATIONS.md` Version 2 and this version are built on them and are in no repository either. The repository copy of `TIME.md` holds sixteen questions and no clause on the step, on recommendations, on the guide, or on Guided Life. Decision D-019 makes the repository copy authoritative. Each ruling of entries 2.20, 2.21, and 2.23 is therefore in force as a ruling and is not yet in an authoritative document. Open.

4.30 `docs/DECISIONS.md` is out of step on three points. D-019 and D-022 still describe Operations as marking each undecided part To define. D-024 lists four factors for the next question, where `TIME.md` 5.9.2 and `LANGUAGE_STANDARD.md` 3.20.2 list five. Entry 4.15 already records that it holds no entry for the rulings of 2.20, 2.21, and 2.23. Open.

4.31 No document states what a planned time means after a client moves to a different timezone. `ARCHITECTURE.md` stores a planned time as local text. `TIME_OPERATIONS.md` 18.1. Open.

4.32 No document decides whether software can ask a question of intake or of the Plan in the agent's place. `TIME.md` 5.1 has the agent run the folder and 5.2.1 limits the guide to Guided Life. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` lists how an agent hands work to software as an open decision. `TIME_OPERATIONS.md` 17.0.3 gives each such question to the agent until it is decided. Open.

## 5. Ideas held for later

5.1 Each idea below was in the working product model that `TIME.md` held until October 11, 2026. None is in the specification. None is decided.

5.2 A question about what makes a commitment hard, asked for a commitment the client wants to change. Then a question about what to do if that happens.

5.3 Four planning categories for the agent's own use: fixed, maintain, move, and protect. The working model did not approve them for text a resident reads.

5.4 Suggestions built from the client's own outcomes. The working model required five parts in a suggestion: a priority the client stated, evidence from the client's own outcomes, open time that exists, one specific commitment, and the client's choice. Decided in part on October 11, 2026. Recommendations are permitted under `TIME.md` 5.10. The five part form was not adopted.

5.5 A statement of fact when a client does what they said they would do. `LANGUAGE_STANDARD.md` 10.6.2 prohibits praise for a result. The wording needs a ruling before it is used. Decided October 11, 2026. Clause 10.6.2 now permits acknowledgment and natural encouragement that refer to an outcome on file or an outcome the client just reported.

5.6 A one line summary of the whole day at Daily Close.

5.7 A record of the patterns in a client's outcomes, kept for planning. The folder Instinct in Life Management may hold the same record.

5.8 Each idea below is from the working ideas on Guided Life, dated October 11, 2026. None is in the specification. None is decided.

5.9 An invitation to a guided session that looks like an incoming call, in an installed application.

5.10 A guided session that stays open through a whole day.

5.11 Sharing a screen with the guide, and a procedure drafted from a workflow the client showed.

5.12 A restriction on a device during a guided session, chosen by the client and reversible.

5.13 Universe City as the client's morning alarm.

5.14 A comparison of the planned time of a commitment with the time the client reported, shown to the client to correct the schedule.

5.15 A framework for scripts: a named source, a version, the steps that never change, and rules for when guidance gets shorter.

5.16 A safeguard for adaptive delivery: the facts of a message are fixed from the File first, and the style is applied second.

5.17 Each idea below came from the work on `TIME_OPERATIONS.md` Version 2. None is decided.

5.18 An agent reads only the clients assigned to that agent. Today every agent account reads every client. `TIME_OPERATIONS.md` 16.14.

5.19 One history table for every File table, in place of one history table for each. `TIME_OPERATIONS.md`, Appendix A, part 1. The decision belongs to `ARCHITECTURE.md`.

## 6. Decision history

6.1 Each row states what was decided, why, by whom, when, and where the requirement now resides. The last column names the entry of the log that holds the record.

6.1.1 The column for why holds a reason only where one is on file: in the log, in `docs/DECISIONS.md`, in a product document, or in the founder's written instruction of that day. The column for by whom names the founder only where the log names her. For an earlier decision the log names no one, and `docs/DECISIONS.md` marks it locked.

6.1.2 Where a row cites a clause of `TIME.md` or of `LANGUAGE_STANDARD.md` that was added on October 11, 2026, the clause is in the revised draft. Entry 4.29.

### 6.2 Rulings and locked decisions

| Date | Decision | Why | By | Resides in | Log |
| :-- | :-- | :-- | :-- | :-- | :-- |
| August 28, 2026 | Time is a schedule built from conversation, measured by accounted hours | No reason is on file | The log names no one | Superseded. `TIME.md` 1.7 | 2.1 |
| October 9, 2026 | The daily Plan is the core of Time. A Plan is reviewed by its commitments. Success is not volume. The agent uses the Plan as the reason for contact and does not follow up on every commitment | Time was not to begin as a static calendar filled from a long intake. `docs/DECISIONS.md` D-010 | The log names no one. Locked in `docs/DECISIONS.md` | `docs/DECISIONS.md` D-010 to D-014. `TIME.md` 2.7, 5.3, 5.4, 7.15 | 2.2 |
| October 10, 2026 | The arc has three stages. The agent is a person. The person is a client in agent documents and a resident in text the person reads | No reason is on file in this log | The log names no one for the three points | `LANGUAGE_STANDARD.md` Version 4 | 2.3 |
| October 10, 2026 | Entry runs Application, Enrollment, Orientation, Time. Daily Close is placed on the Plan. The first Plan includes a check of how realistic it feels | The first Plan asks when Daily Close belongs in the day, where the earlier design assumed the client would remember to return. `docs/DECISIONS.md` D-016 | The log names no one. Locked in `docs/DECISIONS.md` | `docs/DECISIONS.md` D-015 to D-017. `TIME.md` 5.3.3, 5.3.4, 9.2 | 2.4 |
| October 10, 2026 | A commitment has five conditions. A commitment, a follow up, and ongoing work are three entries | Execution of a commitment and closure of related work are separate. A working direction in `docs/product/AGENT_MODEL.md` | The log names no one. `docs/product/AGENT_MODEL.md` locks four conditions. The fifth condition and the three entries are working directions there and in `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | `TIME.md` 3.3 to 3.5 | 2.5 |
| October 11, 2026 | Version 4. Time is planning, execution, review, and follow through. The schedule is the system | The October 9 and 10 decisions moved the folder to what happens after a Plan is made | The log names no one | `TIME.md` 2.3 | 2.6 |
| October 11, 2026 | The repository holds the authoritative specification. Operations holds the mechanics. Developments holds how the thinking changed | No reason is on file | The founder | `docs/DECISIONS.md` D-019. `TIME.md` 1.2 | 2.11.1 |
| October 11, 2026 | Integrity covers every commitment and reads Time. It holds no second copy | No reason is on file | The founder | `docs/DECISIONS.md` D-020. `TIME.md` 4.4.7 | 2.11.2 |
| October 11, 2026 | Software carries out an action a standing permission covers, with no person releasing it. A person is required in four cases | The rule that the agent is a person concerns identity and responsibility | The founder | `docs/DECISIONS.md` D-021. `TIME.md` 5.6 | 2.11.3 |
| October 11, 2026 | Contact has three origins and three points in the day. The client chooses how much | Daily Close is the regular contact and is not the only one. `docs/DECISIONS.md` D-022 | The log names no one. Locked in `docs/DECISIONS.md` | `docs/DECISIONS.md` D-022. `TIME.md` 5.4 | 2.9 |
| October 11, 2026 | A purchase amount is filed in Finance. The home opens on the first schedule and the first confirmed Plan. Three operational conditions. The free first day is retired | Each closed an item the first draft left open | The log names no one. Locked in `docs/DECISIONS.md` | `docs/DECISIONS.md` D-023. `TIME.md` 4.4.6, 9.3, 10 | 2.9 |
| October 11, 2026 | Lowest position first is retired for Time. Executed and confirmed successful are two results | The earlier wording counted a commitment with no information about consequences as successful | The founder, for the change to the standard | `docs/DECISIONS.md` D-024. `TIME.md` 5.9, 11.6. `LANGUAGE_STANDARD.md` 3.20 | 2.15, 2.16, 2.18 |
| October 11, 2026 | Five rules for the scales of the Curriculum: one ability, no condition set by others, help never lowers an option, option 10 does not describe perfection, Start and Target at the same level | The first scales mixed abilities and assumed the client controls their hours. Entry 3.9 | The founder | Folder 01 Time Curriculum, section 2. `LANGUAGE_STANDARD.md` 9.6, 9.8 | 2.20 |
| October 11, 2026 | The Start and the Target at Enrollment are the client's own report. Outcomes on file are used once Time operates. The Enrollment Start is never replaced | Her instruction: a client is not required to have weeks of outcomes on file before selecting | The founder | Folder 01 Time Curriculum 2.13 | 2.21 |
| October 11, 2026 | A step is a named part of the Completion condition. Reported steps establish execution only where the client stated the steps are the whole | Her instruction: steps belong inside the Completion condition of a commitment. No further reason is on file | The founder | `TIME.md` 3.3.13 to 3.3.22 | 2.23.1 |
| October 11, 2026 | The agent may recommend. A recommendation binds no one. A change is carried out only within a standing permission, an agreed alternative, or the client's decision | Her instruction: the agent recommends in particular when a client asks for help or is overwhelmed | The founder | `TIME.md` 5.10. `LANGUAGE_STANDARD.md` 10.11 | 2.23.2 |
| October 11, 2026 | One guide, openly software, separate from the agent. Guided Life for the client. Guide Mode for the agent | No reason is on file | The founder | `TIME.md` 5.2.1 to 5.2.7, 5.11 | 2.23.3, 2.23.4 |
| October 11, 2026 | The personality adapts. The standards do not. Three layers of communication | Her instruction: the program is no assistant that reads schedule entries in a clinical voice. Accuracy, privacy, permissions, and decision authority never change with style | The founder | `LANGUAGE_STANDARD.md` section 4 | 2.23.5 |
| October 11, 2026 | Guided Life is not limited to scheduled blocks. Voice is one form and holds no authority. A session that produced a result ends with a summary. A call or a timer proves no execution. The schedule and the Plan are built first | Her instruction: text, voice, narration, and the screen all use the same File, schedule, commitments, permission rules, and history | The founder | `TIME.md` 5.11 to 5.14, 8.9, 14.4.13 | 2.23.6 to 2.23.10 |

### 6.3 Decisions made by recommendation

6.3.1 Eight decisions were made on October 11, 2026 under the founder's direction to follow the recommendation where it fits the governing documents. Entry 2.24 lists each one with the clause it resides in. The founder can reverse each one.

6.3.2 Two points of wording wait for her confirmation. Entry 4.28.

### 6.4 Proposals that wait for a decision

6.4.1 No row below is a decision. Each is a proposal or a recommendation of `TIME_OPERATIONS.md` Version 2 that needs a ruling. A proposal that is approved with the tables as a whole is not listed on its own.

| Subject | Proposal or recommendation | Decided by | Entered in, on approval | Operations |
| :-- | :-- | :-- | :-- | :-- |
| The commitment | One table, with the conditions on the row and in five further tables | The founder, after the review against `ARCHITECTURE.md` | A migration. `TIME_OPERATIONS.md` 2.2 | 2.2.2 |
| The Plan | One row for one client on one day, with one row for each commitment. Confirmed when one field holds a moment | The same | The same | 2.5.2 |
| The recurring week | One row for each recurring item, with a recurrence in a subset of the calendar standard | The same, after a prototype of one library | The same | 2.6 |
| Block statuses | Three in use: planned, estimated, observed | The founder | `TIME.md` 3.2, 14.5.1 | 2.1.4 |
| A block with no end | It can be filed. It counts for no hours | The founder | `TIME.md` 3.2.1 | 2.1.7 |
| Removal | A block is taken off and stays on file | `ARCHITECTURE.md` | `ARCHITECTURE.md` | 2.1.12 |
| Who wrote a row | Set from the writer, for every writer | `ARCHITECTURE.md` | `ARCHITECTURE.md` | 2.1.17 |
| A commitment taken off the Plan | No fifth value of Execution. A separate fact, withdrawn | The founder | `TIME.md` 3.3 | 2.2.15 |
| A partly executed commitment | It is never finished as the same commitment. The remaining part is a new one | The founder | `TIME.md` 11.6.6 | 3.3 |
| A yes at Daily Close | It files each commitment on the confirmed Plan with no outcome as executed, as planned | The founder | `TIME.md` 5.4.6 | 9.5 |
| The first seven day schedule on file | The agent files one moment | The founder | `TIME.md` 10.2 | 17.1.2 |
| Time with Universe City | One further kind of block | The founder | `TIME.md` 3.2. The Schedule intake | 2.5.8 |
| The target for controlled hours | One field for the target. The figure compared with it is an estimate from the schedule | The founder | `TIME.md` 7.13 | 9.7 |
| The length of a step | One optional field | The founder | `TIME.md` 3.3.14 | 10.8 |
| A session left open | Software closes it in two cases and files no outcome | The founder | `TIME.md` 5.12 | 10.14.2 |
| Standing permissions | Three kinds. A recurrence the client stated needs none | The founder | `TIME_OPERATIONS.md` 6.5, since `TIME.md` 5.6.8 assigns the list to Operations | 6.5 |
| Available time | Three facts. An hour with no block is not available by that fact alone | The founder | `TIME_OPERATIONS.md` 6.7 | 6.7 |
| An established commitment | None of the seven conditions is true, over the current Review period and the one before | The founder | `TIME.md` 7.17 | 8.2 |
| The order of ready questions | A default order for the list. The agent selects | The founder | `TIME.md` 5.9 | 8.5 |
| Three figures | The longest unbroken block, the most overloaded day, when the two figures are given | The founder | `TIME.md` 11.5, 12.15 | 5.14, 5.18, 9.6 |
| The four follow up choices of the first Plan | None, before, after, both, mapped to the contact settings | The founder | `TIME.md` 5.4 | 7.6.3 |
| Delivery of messages | First in the Resident Portal. One further method after a prototype | The founder | `TIME_OPERATIONS.md` 7.7, since `TIME.md` 5.4.13 assigns delivery to Operations | 7.7 |
| The label of an automated message | Automated Universe City message | The founder, as client copy | `TIME.md` 5.4.12 | 7.10 |
| Where a preference is kept | One settings record that every folder reads | The founder | `LANGUAGE_STANDARD.md` 12.14. `ARCHITECTURE.md` | 12.6 |
| History for every File table | One candidate, in Appendix A | `ARCHITECTURE.md` | `ARCHITECTURE.md` | 16.4 |
| A planned time after a move to a different timezone | No recommendation | `ARCHITECTURE.md` | `ARCHITECTURE.md`, the section on timezone | 18.1 |
| Who asks a question of intake | The agent asks, until it is decided whether software can | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | The same document | 17.0.3 |

## 7. Technical development

7.1 What software exists for Time on October 11, 2026. Each row was read in the repository at commit `0dbbeac`.

| File | What it does | In the repository since | Last changed |
| :-- | :-- | :-- | :-- |
| `supabase/migrations/0001_init.sql` | Creates `blocks`, `block_revisions`, `standards`, `entries`, `statements`, `proposals`, `reviews`, and the trigger that writes block history | September 15, 2026 | September 15, 2026 |
| `supabase/migrations/0002_rls_corrections.sql` | Sets who can read and write each table. Forces the source of a client's write. Makes history immutable | September 15, 2026 | September 15, 2026 |
| `supabase/migrations/0004_resident_rename.sql` | Renames the stored value for the person to resident | October 11, 2026 | October 11, 2026 |
| `supabase/tests/0002_security.sql` | Eight tests of the access rules | September 15, 2026 | October 11, 2026, for the rename |
| `lib/domain/time.ts` | The five statuses, the eleven kinds, and `figures()` | September 15, 2026 | October 11, 2026, for the rename |
| `lib/domain/dates.ts` | The day and the week in the client's timezone | September 15, 2026 | October 11, 2026, for the rename |
| `lib/brief.ts` | Builds the agent's brief from the tables | September 15, 2026 | October 11, 2026, for the rename |
| `components/FirstPlan.tsx` | The first Plan: five questions, saved as blocks | October 9, 2026 | October 11, 2026, for wording |
| `app/(resident)/portal/time/page.tsx` | The week view | Moved to this path on October 11, 2026 | October 11, 2026 |
| `app/(resident)/portal/time/setup/page.tsx` | Opens the first Plan for a client with no block | Moved to this path on October 11, 2026 | October 11, 2026 |
| `app/(resident)/portal/page.tsx` and `layout.tsx` | The home of the Resident Portal. Both open it once one block is on file | Moved to this path on October 11, 2026 | October 11, 2026 |
| `app/(agent)/agent/clients/[id]/page.tsx` | The agent's brief for one client | September 15, 2026 | October 11, 2026, for the rename |

7.2 What has changed. The repository received the Time code on September 15, 2026, as an import of code written before that date. The first Plan was added on October 9, 2026. The commits of October 11, 2026 renamed the stored value for the person to resident and changed wording. No commit changed what a Time function calculates or stores after `TIME.md` Version 4 was written. Entry 4.27.

7.3 The database. The Universe City database holds the twelve tables of the four migrations. On October 11, 2026 it holds three profiles and no block, no revision, no statement, no entry, no proposal, and no review. The same database holds tables that belong to other projects. Their removal is a separate task.

7.4 What is not built. `TIME_OPERATIONS.md` 20.1 lists each part with its database, its server code, its screen, and its tests. In summary: no recurring week, no commitment, no Plan as an entry, no outcome, no follow up, no ongoing work, no Daily Close, no message, no standing permission, no recommendation, no conversation, no day view, no editing by hand, and no part of Guided Life.

7.5 What was produced on October 11, 2026 and is in no repository.

| Item | What it is | Checked how |
| :-- | :-- | :-- |
| Six revised drafts | `LANGUAGE_STANDARD.md`, `TIME.md`, the first revision of `TIME_OPERATIONS.md` and of this document, the Curriculum, and the Research | Entry 4.29. Under review by the founder |
| `TIME_OPERATIONS.md` Version 2, and this version | The two documents of this stage | Reviewed twice by two readers who did not write them. Entry 3.33 |
| The shared dependency list | Entry 2.35 | Compared with `TIME_OPERATIONS.md` 15.3 |
| Appendix A of `TIME_OPERATIONS.md` | A migration for sixteen tables, with the rules the database holds | Applied on top of the four migrations in a local test database |
| Appendix B of `TIME_OPERATIONS.md` | Reference queries for the twenty questions | Run on one seeded week, with each result compared to a figure worked by hand |
| Fifty seven rule checks | `TIME_OPERATIONS.md` 19.3 to 19.6 | All passed on the proposal |
| Thirty three query checks | `TIME_OPERATIONS.md` 19.9 | All passed on the proposal |
| Sixteen checks of built behavior | `TIME_OPERATIONS.md` 19.2 | Run on the four migrations. Ten show behavior the documents do not intend |

7.6 Tests in the repository. One file, with eight tests of the access rules. No test of a calculation, of a screen, or of a workflow exists. The file `package.json` holds no test command. See 3.26.

## 8. Differences between the documents and the code

8.1 Each row is a difference between a governing document and what the repository does. The first column names the entry of section 3 that holds it, or the clause of `TIME.md` that already records it.

| Entry | Where | The document states | The code does | Correction | State |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 3.5 | `lib/domain/time.ts` | The code holds eleven kinds | A comment in the same file states twelve | Correct the comment, or decide `TIME_OPERATIONS.md` 2.5.8 | Open |
| `TIME.md` 14.5.1 | `lib/domain/time.ts`, the database | Observed or estimated, and planned or done | Five statuses in one field | `TIME_OPERATIONS.md` 2.1.4 | Open |
| 3.14 | The database | A cost belongs to a commitment | A cost block links to a block | `TIME_OPERATIONS.md` 2.1.15 | Open |
| 3.15 | `figures()` | A future period is estimated | A required block counts as observed | `TIME_OPERATIONS.md` 4.1.2 | Open |
| 3.16 | `figures()` | Hours of a week | Overlapping blocks are added twice. Every week is 168 hours | `TIME_OPERATIONS.md` 5.19 | Open |
| 3.17 | The database | Every change is kept on file | A block can be deleted with no history. A changed block cannot be removed | `TIME_OPERATIONS.md` 2.1.12 | Open |
| 3.18 | The database | No decision on deletion at a client's request | An account with block history cannot be deleted | `TIME_OPERATIONS.md` 16.14 | Open |
| 3.19 | The database | No planned block is observed | A future block can be set to observed | `TIME_OPERATIONS.md` 2.1.13 | Open |
| 3.20 | The database | A time and a kind | No check of either | `TIME_OPERATIONS.md` 2.1.6 | Open |
| 3.21 | The database | A change is entered with its reason | The reason is never filled | `TIME_OPERATIONS.md` 2.1.11 | Open |
| 3.22 | `components/FirstPlan.tsx` | An unlikely Plan is simplified or moved before it is saved | It is saved | `TIME_OPERATIONS.md` 2.5.7 | Open |
| 3.23 | The portal home and layout | The home opens on the first schedule and the first confirmed Plan | It opens on one block | `TIME_OPERATIONS.md` 17.1.2 | Open |
| 3.24 | `components/FirstPlan.tsx` | Time with Universe City is on the Plan | Daily Close is a block of the client's own time | `TIME_OPERATIONS.md` 2.5.8 | Open |
| 3.25 | The week view | 9:00 AM | `9am` | One line of code | Open |
| 3.26 | `supabase/tests/0002_security.sql` | A clean run means every test passed | Tests 4 and 8 cannot pass as written | Repair both | Open |
| 3.27 | Two Time screens. `scripts/language-check.py` | No statement built on a contrast | Four such sentences. The check does not read them | Rewrite the four. Extend the check | Open |
| 3.28 | `components/FirstPlan.tsx` | The standard wording of `TIME.md` 6.4 | Five questions in different words | Approve the words in `TIME.md`, or change the screen | Open |
| 3.29 | The database | Only the service role records `ai` | An agent's and the service role's write is stored as resident when it names no source | `TIME_OPERATIONS.md` 2.1.17 | Open |
| 3.30 | The database | A message is kept in its original wording, with its speaker | A client can edit and delete a statement. No speaker is held | Requirement SR-1 | Open |
| 3.31 | The database | A block has an end | The end can be empty | `TIME_OPERATIONS.md` 2.1.7 | Open |
| 3.1 | `TIME.md` 14.3 | Version 3 listed five features as live | None of the five is in the repository | Each is to build | Closed in the document. Open in the code |

8.2 Four differences sit inside `TIME.md` itself, between two of its clauses or in a clause that cannot run. Entries 3.11, 3.12, 3.13, and 3.32. Entry 4.23 lists three figures that `TIME.md` names and does not define.

## 9. Dependencies

9.1 What Time requires from parts it does not own. `TIME_OPERATIONS.md` 15.3 states each requirement in full. This register adds the state and what it blocks.

| Requirement | Time requires | From | State | Blocks |
| :-- | :-- | :-- | :-- | :-- |
| SR-1 | A store of each message, with an identifier an entry can name. A message is never edited | `ARCHITECTURE.md`. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` states the rule | The rule is stated. No table is specified. `statements` exists and is written by no code | The statement behind each entry. Schedule intake |
| SR-2 | A history for every File table, with the reason and the basis | `ARCHITECTURE.md` | Built for blocks alone | Each proposed table |
| SR-3 | Removal that keeps the row | `ARCHITECTURE.md` | The access matrix lets a client delete a block. No rule for removal is specified | Editing by hand |
| SR-4 | The record of a session | `docs/product/SESSIONS.md` | A working concept. No data model | Guided Life. The summary |
| SR-5 | Recording, transcript, and consent | `docs/product/SESSIONS.md` | Not specified | Voice |
| SR-6 | A link between folders with no copy | `ARCHITECTURE.md` | Not specified | Evidence for an outcome. Finance. Inventory |
| SR-7 | The path of a proposal | `ARCHITECTURE.md` | The table is built. No code | Every interpretation |
| SR-8 | A history the client can read | `ARCHITECTURE.md`, `docs/product/RESIDENT_INTERFACE.md` | Not specified | Question 12.21 for the client |
| SR-9 | How software finds an earlier fact | `ARCHITECTURE.md` | No document | Questions outside the twenty |
| SR-10 | A record of automatic actions and retries | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | Listed there as open | Standing permissions |
| SR-11 | One settings record for every folder | `LANGUAGE_STANDARD.md` 12.14 and `ARCHITECTURE.md` | Open | Communication preferences |
| SR-12 | Consent, access, correction, retention, deletion, backup, recovery | A data policy. `ARCHITECTURE.md` | A canceled residency keeps its record. No further decision | Storing a real client's entries |
| SR-13 | Delivery to a closed application | No document | Not specified | Reminders |
| SR-14 | The Review | No document | A table is built | The period for asking less |
| SR-15 | A fixed number for each lesson | Each Curriculum | Time's Curriculum numbers its lessons by clause | Lesson deliveries |
| SR-16 | Who wrote a row is set from the writer, for every writer | `ARCHITECTURE.md` | Forced for a client alone | Each entry an agent or software writes |

9.2 What Time requires from other folders.

| Folder | Time requires | State |
| :-- | :-- | :-- |
| Standards | The minimums a commitment can link to | The `standards` table is built |
| Career Development, Schedule | The planned shift | No specification in the repository |
| Finance | A place for a purchase amount | Not operational. `TIME_OPERATIONS.md` 9.1 |
| Inventory | The items a purchase changes | The `inventory_items` table is built |
| Integrity | Nothing. Integrity reads Time | `TIME_OPERATIONS.md` 9.2 |
| Discernment, Equilibrium | Nothing. Each reads Time | `TIME_OPERATIONS.md` 14.5 |
| Every folder with a Curriculum | An approved lesson | One Curriculum is revised, for Time. It is under review |

9.3 What Time requires from the interface and from agent operations.

| Part | Time requires | Owning document | State |
| :-- | :-- | :-- | :-- |
| The Resident Portal | A day view that opens first. The opened block. The settings view. The screen of a guided session | `docs/product/RESIDENT_INTERFACE.md` | The shell is locked. No Time view beyond the week is specified |
| The agent's part of the screen | A place where a message is sent and kept | `docs/product/AGENT_MODEL.md` | Static text |
| The agent console | Panels for commitments, follow ups, permissions, automatic actions, and Guide Mode | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | One brief is built |
| Who asks a question of intake | Whether software can ask in the agent's place | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` | Listed there as open. `TIME_OPERATIONS.md` 17.0.3 |
| Conduct rules for adaptive delivery | What the agent and software can adapt | Agent Operations. AI Casework Training | Out of step. `LANGUAGE_STANDARD.md` 12.11 |

## 10. Future developments

10.1 Each row is a development that is not built. The last column tells a ruling from an idea. A row marked ruled rests on a founder's ruling in section 6 and is specified in the revised `TIME.md`. A row marked idea is recorded in the working ideas or in section 5 and is not decided. The order of building is `TIME_OPERATIONS.md` 20.5.

| Development | Where it is recorded | What it needs first | State |
| :-- | :-- | :-- | :-- |
| Guided Life on the screen | `TIME.md` 5.11 to 5.14 | The commitment, the Plan, outcomes, follow through. Requirement SR-4 | Ruled and specified. Not built. Stage 7 |
| Voice | `TIME.md` 5.11.4, 5.12.12 | A provider selected after a prototype. Recording and consent decided | Ruled as one form of Guided Life. The provider is not selected. Stage 8 |
| The guide's name and personality | `TIME.md` 15.4 | The founder's decision | Ruled that there is one guide. The name is open |
| Learning across folders in a session | `TIME.md` 5.12.13 | An approved Curriculum for each folder | Ruled and specified. Not built |
| Facts fixed first, style applied second | 5.16 | Nothing | Idea. Proposed in `TIME_OPERATIONS.md` 10.18 |
| An invitation that looks like an incoming call | 5.9 | An installed application | Idea |
| A session that stays open through a day | 5.10 | A decision on the microphone and on battery use | Idea |
| Sharing a screen, and a procedure drafted from a workflow | 5.11 | A legal review. A folder that holds procedures | Idea |
| Guidance at work, with lessons of Career Development | Working ideas, section 18 | A Curriculum for Career Development | Idea |
| A restriction on a device | 5.12 | Never a condition for taking part. `TIME.md` 8.14 | Idea |
| Universe City as the morning alarm | 5.13 | An installed application | Idea |
| The planned time compared with the reported time | 5.14 | Outcomes on file. Query 5.20 of `TIME_OPERATIONS.md` holds the calculation | Idea, with its calculation defined |
| A framework for scripts | 5.15 | AI Casework Training | Idea |
| Patterns in a client's outcomes | 5.7 | Outcomes on file. A decision between Time and Instinct | Idea |

## 11. Research and testing

11.1 Each row is a question that reading the documents cannot answer. It needs a prototype, research outside the program, or a test with clients.

### 11.2 Technical prototypes

| Question | What the prototype has to show | Needed before |
| :-- | :-- | :-- |
| Which library reads the recurrence format | One library turns each permitted rule into dates in the client's timezone, across a change of the clock, and into words | The schedule table is approved |
| One history table, or one for each table | The size and the read time of each form on a year of changes | `ARCHITECTURE.md` decides requirement SR-2 |
| The size of real use | Rows for each client in a month. Characters in the context of one day | A cost is stated for storage or for a model |
| Whether the repository's security tests pass on the hosted database | A clean run of the repaired file | The migration of Appendix A is applied |
| A voice provider | Each of the eight requirements in `TIME_OPERATIONS.md` 13.9. The audio and realtime interfaces of OpenAI are one candidate | Voice is approved |
| Spoken reports | How often a spoken report is filed wrongly | Voice is approved |
| Delivery to a closed application | Which method reaches a client, on which devices | Reminders are built |
| What a browser supports | Audio on a locked screen. A message while the application is closed | The decision on an installed application |
| A restore | A lost entry is restored and the history stays whole | A statement about lost data is made |

### 11.3 Research outside the program

| Question | State |
| :-- | :-- |
| The research Guided Life needs | Listed in the third entry of October 11, 2026 in Folder 01 Time Research. No source in that list has been read |
| What the law requires for a recording and a transcript of a session, and for sharing a screen | Not started. No document names the jurisdictions |
| What a provider keeps of audio and text | Not started. `TIME_OPERATIONS.md` 13.9 |

### 11.4 Tests with clients

| Question | What it settles |
| :-- | :-- |
| Does a client understand the words for each outcome | The client copy in `TIME_OPERATIONS.md` 2.8.3 |
| Does a quick yes at Daily Close file an outcome that did not happen | `TIME_OPERATIONS.md` 9.5 |
| Does a client grant a standing permission with a correct picture of what it covers | The two missing questions |
| How many questions does a client answer at Daily Close in week one and in week four | Whether asking less works as `TIME.md` 7.17 intends |
| Do the twelve questions of the Curriculum read as ten levels of one ability | Folder 01 Time Curriculum, its section of open items |
| Does the view of one step help a client who cannot start | `TIME.md` 5.13.4 |
| Does a client read the summary of a session, and correct from it | `TIME.md` 5.14.5 |

## 12. Work register

12.1 Each row is one deliverable that is outstanding. Priority A blocks building. Priority B is needed for the stage named. Priority C can wait for its stage. The stages are those of `TIME_OPERATIONS.md` 20.5. No date is attached. A state is given only where it was checked. A next action that names no person is taken by whoever the founder assigns.

| Number | Deliverable | Priority | Depends on | State | Next action | Authoritative destination |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | The six revised drafts of October 11, 2026 approved and filed. Entry 4.29 | A | Nothing | Drafted. In no repository | The founder reviews each draft and approves or returns it | `LANGUAGE_STANDARD.md`. `docs/systems` |
| 2 | `TIME_OPERATIONS.md` Version 2 and this version approved and filed. The shared dependency list handed to whoever keeps `ARCHITECTURE.md` | A | 1 | Drafted. In no repository | The founder reviews both and approves or returns them | `docs/systems` |
| 3 | Review of Appendix A against the architecture of the platform | A | Nothing | Not started | The founder names the reviewer. Compare each of the sixteen tables with `ARCHITECTURE.md` | `ARCHITECTURE.md`. `TIME_OPERATIONS.md` |
| 4 | Prototype: one history table, or one for each table | A | Nothing | Not started | Build both forms on the seeded week. Measure size and read time | `ARCHITECTURE.md` |
| 5 | Decision on history for every File table. SR-2 | A | 3, 4 | Not decided. One candidate exists | Enter the form in `ARCHITECTURE.md` | `ARCHITECTURE.md` |
| 6 | Decision on the store of the conversation. SR-1 | A | Nothing | The rule is stated. No table is specified | Specify the message, its speaker, and its identifier. Decide whether `statements` becomes that store | `ARCHITECTURE.md` |
| 7 | Decision on removal that keeps the row. SR-3 | A | Nothing | Not decided | Rule for every table a client owns, and change the access matrix to match | `ARCHITECTURE.md` |
| 8 | Decision on who wrote a row. SR-16 | A | Nothing | Not decided. One candidate exists | Rule for every writer | `ARCHITECTURE.md` |
| 9 | The path of a proposal. SR-7 | A | 6 | The table is built. No code | Specify where the client's answer is kept and what applies a decision | `ARCHITECTURE.md` |
| 10 | Ruling on the block statuses | A | Nothing | Proposed | The founder rules | `TIME.md` 3.2, 14.5.1 |
| 11 | Rulings on the nine further open points of the tables. Entry 4.22 | A | Nothing | Recommendations written | The founder rules on each | `TIME.md` |
| 12 | Rulings outside entry 4.22: the list of permissions, the four follow up choices, available time, the period for asking less, the order of ready questions, three figures | A for the first two, which Appendix A holds as fixed values. B, stage 3, for the rest | Nothing | Recommendations written | The founder rules on each | `TIME.md`. `TIME_OPERATIONS.md` |
| 13 | Prototype of one recurrence library | A | Nothing | Not started | Run each permitted form of rule through one library, across a change of the clock | `TIME_OPERATIONS.md` 2.6.3 |
| 14 | A restore tested | A, before a real client's entries are stored | Nothing | Not started. The backup settings of the hosting service were not checked | Check what the hosting service backs up. Restore a copy and compare it with the history | `ARCHITECTURE.md` |
| 15 | A decision on retention, deletion, consent, and backup. SR-12 | A, before a real client's entries are stored | 14 | A canceled residency keeps its record. No further decision | The founder names who writes the data policy | A data policy. `ARCHITECTURE.md` |
| 16 | Repair of repository tests 4 and 8 | B, stage 1 | Nothing | Both faults located | Change two blocks of the test file. Run the file on the hosted database | `supabase/tests` |
| 17 | The migration, with the proposal checks as tests | A | 2, 3, 5 to 13, 16 | Drafted as Appendix A. Applied in a test database alone | Turn the approved appendix into a migration file. Give repository test 4 a block in the past | `supabase/migrations`. `supabase/tests` |
| 18 | `TIME.md` revised for the rulings of rows 10 and 11 | B, stage 1 | 1, 10, 11 | Not started | Edit each clause those rulings name | `TIME.md` |
| 19 | Correction of `figures()` | B, stage 2 | 10 | Fault located. Expected figures exist | Count each minute once. Stop counting required as observed | `lib/domain/time.ts` |
| 20 | The functions of `TIME_OPERATIONS.md` 6.14 | B, stage 2 | 17 | Not started | Write `prepareDay`, `confirmPlan`, and the block functions first | `lib/domain` |
| 21 | The first Plan on the new tables, with the rule for an unlikely Plan | B, stage 2 | 17, 20 | Not started | Rewrite the save to call the functions | `components/FirstPlan.tsx` |
| 22 | The wording of the first Plan and of the week view | B, stage 2 | Nothing | Four sentences and five questions located | Approve the words in `TIME.md`. Change the two screens. Extend the language check to text that spans lines | `TIME.md` 6.4. The two screens. `scripts/language-check.py` |
| 23 | Three small corrections to built code. Entries 3.5, 3.23, 3.25 | B, stage 2 | 11 and 17, for the home alone | Each located | Print a time as 9:00 AM. Correct the comment on the kinds. Change what opens the home | `lib/domain/time.ts`. The week view. The portal home and layout |
| 24 | The day view, and editing by hand | B, stage 2 | 20 | Not started. No layout is specified | Specify the layout | `docs/product/RESIDENT_INTERFACE.md` |
| 25 | Decision on who asks a question of intake. Entry 4.32 | B, stage 3 | Nothing | Listed as open in its owning document | Decide whether software can ask in the agent's place, and how the message is marked | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` |
| 26 | The store of the conversation, built | B, stage 3 | 6 | Not started | Build the table and the place where a message is sent and kept | `supabase/migrations`. The Resident Portal |
| 27 | Outcomes, Daily Close, follow through | B, stage 3 | 12, 20, 26 | Not started | Write `reportOutcome` and `followThrough` | `lib/domain` |
| 28 | Questions 12.2 to 12.9 in code | B, stage 3 | 27 | Reference queries exist | Write each one to the expected results | `lib/domain` |
| 29 | Client copy: two permission questions, two sentences, the label of an automated message, the words for each code | B, stage 3 | Nothing | Not written | Draft each for the founder | `TIME.md` |
| 30 | `TIME.md` revised for the rulings of row 12 and the copy of row 29 | B, stage 3 | 12, 18, 29 | Not started | Edit each clause those rulings name | `TIME.md` |
| 31 | The delivery method. SR-13 | B, stage 4 | 26 | Not decided | Prototype the candidates. The founder decides | `TIME_OPERATIONS.md` 7.7 |
| 32 | Contact settings, the Morning Plan, reminders | B, stage 4 | 12, 27, 31 | Not started | Write `setSetting`, then the Morning Plan message | `lib/domain` |
| 33 | The record of automatic actions and retries. SR-10 | B, stage 5 | Nothing | Listed as open in its owning document | Specify the record and the number of attempts | `docs/product/AGENT_OPERATING_ARCHITECTURE.md` |
| 34 | Standing permissions and automatic actions | B, stage 5 | 12, 27, 29, 33 | Not started | Write `grantPermission`, then the placing of remaining work | `lib/domain` |
| 35 | Recommendations | B, stage 5 | 27 | Not started | Write `recommend` | `lib/domain` |
| 36 | The remaining questions, and the history a client can read. SR-8 | C, stage 6 | 5, 12, 28 | Reference queries exist | Specify the history view | `lib/domain`. `docs/product/RESIDENT_INTERFACE.md` |
| 37 | The record of a session. SR-4 | C, stage 7 | Nothing | A working concept | Specify a data model | `docs/product/SESSIONS.md` |
| 38 | Guided Life on the screen | C, stage 7 | 27, 34, 37 | Not started | Specify the screen of a guided session | `lib/domain`. The Resident Portal |
| 39 | The name and the personality of the guide | C, stage 7 | Nothing | Open | The founder decides | `TIME.md` 15.4. `LANGUAGE_STANDARD.md` 12.12 |
| 40 | The review of what the guide says. `TIME_OPERATIONS.md` 12.5 | C, stage 7 | Nothing | Open | The founder names who revises AI Casework Training. List each kind of sentence the guide speaks | AI Casework Training |
| 41 | Recording, transcript, and consent. SR-5 | C, stage 8 | 15 | Not specified | Establish the three facts of `TIME_OPERATIONS.md` 13.5. The founder decides | `docs/product/SESSIONS.md`. The data policy |
| 42 | Prototype: what a browser supports. Section 11.2 | C, stage 8 | Nothing | Not started | Test audio on a locked screen and a message to a closed application, on the devices clients use | `TIME_OPERATIONS.md` 13.6 |
| 43 | The voice prototype | C, stage 8 | 38, 41 | Not started | Test one candidate against the eight requirements | `TIME_OPERATIONS.md` 13.3 |
| 44 | A decision on a session through a whole day. `TIME_OPERATIONS.md` 13.7 | C | 38 | Open | Measure what an open session costs a device. The founder decides | `TIME.md` 5.12 |
| 45 | Five shared parts that block no stage: SR-6, SR-9, SR-11, SR-14, SR-15 | C | Nothing | None is specified | Specify each in its owning document, the link between folders first | `ARCHITECTURE.md`. Each Curriculum |
| 46 | `docs/DECISIONS.md` brought up to date. Entries 4.15 and 4.30 | C | 1 | Three rulings have no entry. Three entries are out of step | Write the three entries. Correct D-019, D-022, and D-024 | `docs/DECISIONS.md` |
| 47 | The two points of wording confirmed. Entry 4.28 | B, stage 1 | Nothing | Asked October 11, 2026. No answer on file | The founder confirms or changes each | `TIME.md` 5.10.10, 7.13. `LANGUAGE_STANDARD.md` 10.11.9 |
| 48 | Client copy that waits for approval. Entry 4.13 | B, stage 1 | 1 | Written | The founder approves the folder description and the six definitions | `TIME.md` 2.11. The Curriculum 5.4 |
| 49 | Adaptive delivery: the two open points of 4.12, and the conduct rules of 4.16 | C | Nothing | Open | The founder rules on the two points. Revise both documents | `LANGUAGE_STANDARD.md` 12.13, 12.14. Agent Operations. AI Casework Training |
| 50 | The research Guided Life needs | C | Nothing | Listed. Not read | Read the sources of the third Research entry | Folder 01 Time Research |
| 51 | A planned time after a move to a different timezone. Entry 4.31 | C | Nothing | Open | Rule in the section on timezone | `ARCHITECTURE.md` |
| 52 | The size of real use, measured | C | 27 | Not started | Count rows for each client in a month, and the characters in the context of one day | `ARCHITECTURE.md` |
| 53 | The tests with clients of 11.4 | C | 27 | Not started | Test the words for an outcome and the questions at Daily Close first. The tests of a permission, of one step, and of a summary wait for rows 34 and 38 | Folder 01 Time Research |

12.2 Twenty five rows depend on no other row and can start now: 1, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 22, 25, 29, 33, 37, 39, 40, 42, 45, 47, 49, 50, and 51. Rows 4, 13, 16, and 42 are prototypes or repairs that need code and no new table. Row 22 changes two screens once its words are approved. Each further row in that list is a decision, a review, a specification, a check, or writing.

Governed by `LANGUAGE_STANDARD.md`, section 8.1.6, for composition.
