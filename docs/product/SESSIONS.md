# Sessions

**Status:** WORKING CONCEPT

Sessions are inspired by the organizational strength of YAPTAIN's session/file model, not by its production-studio UI.

---

## Core distinction

### File

The permanent organized record of what Universe City currently maintains.

### Session

A bounded record of work that explains how the File was reviewed, tested, discussed, or changed.

Working line:

> **The File is what we know now. A Session is how we got there.**

---

## Why Sessions may matter

Without a session layer, meaningful work can disappear into:

- one endless chat thread
- isolated database events
- unexplained current values
- revision history that is technically correct but hard for humans to understand

Sessions could provide human-readable continuity.

Example:

```
My File
└── I · Agency Assessment
    └── Time
        ├── Current
        ├── Schedule
        ├── Sessions
        │   ├── Oct 09 · Weekly Time Review
        │   ├── Oct 08 · Daily Close
        │   └── Oct 03 · Schedule Change
        └── History
```

Exact folder names are not locked.

---

## A Session is not necessarily an appointment

Possible Session triggers:

- resident opens a meaningful piece of work
- resident reports a material life change
- Agent initiates a review
- scheduled weekly/monthly review
- a test/challenge concludes
- a human specialist reviews the case
- a group of proposed File changes needs one coherent record

The system may create/manage Sessions without forcing the resident to click "New Session" constantly.

---

## Possible Session contents

Not locked:

- Overview
- Conversation
- Evidence
- Questions
- Decisions
- Changes
- Follow-up

A Session should be understandable later without requiring someone to reread an entire raw conversation.

---

## Example

Resident says:

> I don't work Tuesdays anymore.

Possible Session:

```
OCT 09 · SCHEDULE CHANGE

Resident statement
"I don't work Tuesdays anymore."

Prior record
Tuesday · 8:30–5:00 work

Proposed changes
- I · 01 Time — remove recurring Tuesday work block
- III · 02 Schedule — update work schedule

Resident confirmation
Confirmed

Outcome
Filed
```

This preserves:

- what changed
- why
- prior state
- affected systems
- approval
- resulting state

---

## Cross-folder Sessions

Likely needed.

One life event can affect multiple systems.

Examples:

New job may affect:

- Employment
- Salary
- Schedule
- Time
- Transportation
- Finance

A Session may need:

- one primary context
- linked folders
- handoffs
- multiple proposed changes

Exact data model remains open.

---

## YAPTAIN organizational lessons

What is valuable:

- one main container
- stable folder hierarchy
- clear nested work
- path/breadcrumb
- meaningful metadata
- status/progress
- versions/history
- everything has a predictable place

What is not being copied:

- production/broadcast language
- takes/renders as literal resident terminology
- floating studio windows
- .exe metaphors
- production taskbar

Universe City should borrow the organizational clarity and adapt it to a resident File.

---

## Relationship to Dashboard

Sessions should not clutter the main dashboard.

The dashboard can surface:

- an active review
- an open decision
- a current challenge
- something that needs resident confirmation

But the detailed work/history belongs in the File/session structure.

---

## Relationship to Agent

The Agent can:

- work within the context of an active Session
- open/create a Session when a bounded piece of work warrants one
- summarize what changed
- surface proposed File updates

The resident should not need to manually route each message into a Session.

---

## Open questions

- Session creation threshold
- daily close: one Session per day, grouped weekly, or not always a Session?
- naming rules
- universal sections
- cross-folder linking
- session states/statuses
- what resident sees vs internal operational detail
- retention/history presentation
