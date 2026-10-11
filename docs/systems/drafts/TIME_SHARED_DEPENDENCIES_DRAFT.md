# Shared Architectural Dependencies Found in Folder 01 Time

> **Draft. This file is not in force.** It is a working list, filed on October 11, 2026. It revises no filed document. `ARCHITECTURE.md` and the documents in `docs/product/` are unchanged. The founder has not approved it. `README.md` in this folder states how the drafts are read.

Working list. October 11, 2026. What Time needs from the platform before its tables can be approved. This list is not one of the five Time documents. Folder 01 Time Operations, clause 15.3, holds the same requirements in full.

## 1. About this list

1.1 Time adds no memory of its own. Its entries rest on six shared parts: the conversation, the history of each entry, the session, the transcript, the link between folders, and the proposal. Each belongs to a document that Time does not own.

1.2 Each row states the requirement, the document that owns it, what exists today, and the question that document has to answer. What exists today was checked in the repository at commit `0dbbeac` and in a local test database built from the four migration files.

1.3 Time proposes no shared mechanism as approved. Two candidates are drafted, so that the Time rules could be tested: a history for every File table, and a rule that sets who wrote a row from the writer. Each is marked as a candidate.

1.4 Sixteen requirements are listed. Six of them have to be decided before a Time table is approved: SR-1, SR-2, SR-3, SR-7, SR-16, and, before a real client's entries are stored, SR-12.

## 2. The dependencies

### 2.1 File history

| Number | Requirement | Owner | Exists today | Question to answer | Waits on it |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-2 | A history for every File table: both values of each change, who made it, which software, the reason, the basis, the statement, and the session. It cannot be edited | `ARCHITECTURE.md`. Its rule 2 states the pattern for a block | `block_revisions`, for blocks alone. Its reason column is never filled | Whether each File table has a history. One history table for every table, or one for each. Whole rows, or changed fields alone | Every proposed Time table |
| SR-3 | Removal that keeps the row | `ARCHITECTURE.md`. Its rule 6 deletes no entry because it changed. Its access matrix lets a client delete the client's own block | A client can delete a block. A block that was never changed leaves no history. A block that was changed cannot be deleted. Deleting a shift deletes its travel block | Whether the access matrix changes, and what replaces delete for each table a client owns | Editing the schedule by hand |
| SR-8 | A history of the File that the client can read, with corrections | `ARCHITECTURE.md`. `docs/product/RESIDENT_INTERFACE.md` | The agent's brief lists changed blocks. The client has no view | What a client sees of each change, and where the summary of a session stays | Question 12.21. `TIME.md` 5.14.6 |

### 2.2 The conversation, sessions, and transcripts

| Number | Requirement | Owner | Exists today | Question to answer | Waits on it |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-1 | A store of each message in order, with the speaker, the moment, the exact words, the form, and the session. Each message has an identifier an entry can name. A message is never edited or deleted | `ARCHITECTURE.md`. `docs/product/AGENT_OPERATING_ARCHITECTURE.md` states the rule and lists it as build increment 1 | The `statements` table, with no speaker and no session. No code writes it. A client can edit and delete a row. An agent can write a row in the client's name. The agent's part of the screen is static text | Whether `statements` becomes that store, or a new table does | The statement behind each condition, outcome, confirmation, and permission |
| SR-4 | The record of a session: its kind, its states, the entries it touched, its summary | `docs/product/SESSIONS.md`, a working concept with no data model | Nothing | The data model. Whether one Daily Close is one session | Guided Life. The summary of a session |
| SR-5 | Recording, transcript, and consent to each | `docs/product/SESSIONS.md`, with SR-12 | `reviews` holds a reference to a transcript. Nothing is recorded | Whether a session is recorded. Who reads a transcript. How the audio, the transcript, the statements, the entries, and the summary are each kept | Voice |

### 2.3 Structured data across folders

| Number | Requirement | Owner | Exists today | Question to answer | Waits on it |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-6 | A link from an entry in one folder to an entry in a second folder, with no copy | `ARCHITECTURE.md` | `proposals` names a target table and a target row. No general link | The form of a link, and how it survives a change to either entry | Evidence for an outcome. Finance. Inventory. Procedures |
| SR-7 | The path of a proposal: software files it, the client's answer is kept, an agent decides it, the decision is applied | `ARCHITECTURE.md`, rule 1 | The table and its access rules. The service role can file one. No code files, decides, or applies one. The agent console shows three actions as text | Where the client's answer is kept. What applies a confirmed proposal to its target | Every reading that needs interpretation |
| SR-11 | One settings record for preferences that apply in every folder | `LANGUAGE_STANDARD.md` 12.14. `ARCHITECTURE.md` | Nothing | Where a communication preference is kept, and how the client corrects it | Adaptive delivery |
| SR-16 | Who wrote a row is set from the writer, for every writer | `ARCHITECTURE.md`, the section on provenance | Forced for a client alone. An agent's or the service role's write that names no source is stored as `resident` | Whether the database sets it for an agent and for software as well | Each entry an agent or software writes |

### 2.4 Retrieval

| Number | Requirement | Owner | Exists today | Question to answer | Waits on it |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-9 | How software finds an earlier fact without reading a whole history | `ARCHITECTURE.md`. No document states it | Reads by client and date | What a conversation receives by default, and how an older fact is found on request | Questions outside the twenty of `TIME.md` section 12 |

2.4.1 Time's own part is defined. A conversation about one day receives one bounded read of that day. On the seeded test data it is about 1,900 characters for six commitments and six blocks, and it does not grow with the length of the residency. Folder 01 Time Operations, clause 16.11.

### 2.5 Controls for a lifelong memory

| Number | Requirement | Owner | Exists today | Question to answer | Waits on it |
| :-- | :-- | :-- | :-- | :-- | :-- |
| SR-12 | Decisions on consent, access, the client's right to a correction, retention, deletion, backup, and recovery | A data policy that is not written. Then `ARCHITECTURE.md` | A client reads the client's own rows. Every agent account reads every client. No record of a consent. A canceled residency keeps its record, and no further retention rule exists. An account with one row of block history cannot be deleted. No document states the backup | Each of the seven | Storing the entries of a real client |

2.5.1 Time sets no retention period and guarantees no recovery. Both need a governing decision and a test of a restore.

### 2.6 Further shared parts

| Number | Requirement | Owner | Exists today | Waits on it |
| :-- | :-- | :-- | :-- | :-- |
| SR-10 | A record of each automatic action, its attempts, and its failures | `docs/product/AGENT_OPERATING_ARCHITECTURE.md`, listed there as open | `stripe_events` holds the pattern for payment events | Standing permissions |
| SR-13 | Delivery of a message to a client whose application is closed | No document | Account email templates | Reminders |
| SR-14 | The Review: what it is on file, and how a week is brought into it | No document | The `reviews` table | The period used for asking less |
| SR-15 | A number for each lesson that does not change, and a version for each Curriculum | Each Curriculum | Time's Curriculum numbers its lessons by clause | Lesson deliveries |

## 3. The order these decisions are needed in

3.1 Before a Time table is approved: SR-2, SR-1, SR-3, SR-7, and SR-16. Each proposed table is drafted with a history, each stated value names a statement, no row is deleted, each interpretation is a proposal, and each row shows who wrote it.

3.2 Before the entries of a real client are stored: SR-12.

3.3 Before Guided Life: SR-4. Before voice: SR-5.

3.4 Each remaining requirement is needed for one part and blocks no table.
