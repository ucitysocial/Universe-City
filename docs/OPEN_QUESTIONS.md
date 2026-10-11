# Open Product Questions

These are unresolved decisions worth protecting from accidental implementation.

---

## Time / Plan

### OQ-001 — What exactly is a Plan item?

**Answered in part October 11, 2026.** `systems/TIME.md` 3.3 states the fields of a commitment and the three facts needed before it goes on a Plan. Storage is marked To define in `systems/TIME_OPERATIONS.md` 2.2.

Need to define:

- required fields
- planned time vs time range vs "sometime"
- location/context
- importance
- whether follow-up is desired
- whether it is fixed, flexible, optional, or protected
- relationship to recurring Schedule items

### OQ-002 — What are the Plan outcomes?

**Resolved October 11, 2026.** `systems/TIME.md` 3.3.5 to 3.3.12 holds the outcome in four separate fields: Execution, Timing, Consequences, and Alternative. Section 11.6 states what counts as successful execution.

Current candidates:

- As planned
- Changed
- Didn't happen

Questions:

- Is "mostly" a day-level summary or item-level state?
- Can a fallback count as "as planned"?
- How should partial completion work?
- When is timing drift meaningful versus close enough?

### OQ-003 — Evening vs morning cadence

**Resolved October 11, 2026.** `systems/TIME.md` 5.4 sets three points of contact in the day: the Morning Plan, during the day, and Daily Close. The resident chooses how much contact they receive.

Strong current idea:

**Evening:** review today + establish/confirm tomorrow.

Possible morning behavior:

- no touchpoint unless needed
- lightweight "still the plan?"
- only message when important information changed

Need to test burden vs usefulness.

### OQ-004 — How does Schedule emerge from Plans?

Need rules for when repeated planned/actual behavior becomes:

- established recurring structure
- estimate
- observed pattern
- candidate schedule update

The system should not overfit one unusual week.

### OQ-005 — How many progress moves should a day contain?

Need coaching logic that promotes meaningful progress without turning every day into optimization homework.

Potential principle: smallest meaningful move that yields evidence.

Need validation.

### OQ-006 — What planning taxonomy should be resident-facing?

Research/synthesis candidate:

- Fixed
- Maintain
- Move
- Protect

May be useful internally without being shown as labels.

---

## Agent

### OQ-007 — What triggers proactive Agent outreach?

**Resolved in principle October 11, 2026.** `systems/TIME.md` 5.4.10 and section 7 state the factors and the triggers. The exact criteria are marked To define in `systems/TIME_OPERATIONS.md` sections 7 and 8.

Need explicit decision logic for:

- before-plan check
- during-plan check
- after-plan review
- deadline/attention
- repeated mismatch
- current challenge/test
- resident-requested accountability

### OQ-008 — How do residents control follow-up style?

**Resolved in principle October 11, 2026.** `systems/TIME.md` 5.4.9 lets the resident turn each kind of contact on separately. The settings are marked To define in `systems/TIME_OPERATIONS.md` section 7.

Need preference model for:

- quiet vs active
- do-not-contact windows
- domains where accountability is wanted
- tone/intensity
- preferred channel/timing
- human vs AI involvement

### OQ-009 — What does the static Agent pane show when nothing is active?

Possibilities:

- current contextual prompt
- last conversation
- "nothing needed from you"
- today's plan status
- current agent/team identity
- quick composer

Need avoid making the right rail noisy.

### OQ-010 — How are AI and humans represented?

**Resolved for Time October 11, 2026.** `systems/TIME.md` 5.2 and 5.4.12. The agent is the accountable person. Software carries out permitted work and is shown as automated. The on screen label is marked To define in `systems/TIME_OPERATIONS.md` 7.10.

Need to preserve transparency:

- AI-assisted
- human-backed
- no false human identity
- clear when a human actually reviewed or entered something
- clear escalation behavior

---

## Dashboard / interface

### OQ-011 — What belongs on the default Dashboard?

Candidates:

- Today
- current/next schedule
- Needs You
- Money / obligations
- Coming Up
- active tests/challenges
- current system work

Need determine primary hierarchy and what is resident-configurable.

### OQ-012 — How configurable is the Dashboard?

Possible controls:

- show/hide
- reorder
- pin
- size priority

Avoid turning customization into setup labor.

### OQ-013 — Mobile layout

Desktop direction is static left / center / right.

Need a mobile model that preserves:

- dashboard
- File navigation
- Agent continuity
- context/path

without shrinking three columns into an unusable view.

### OQ-014 — Exact visual treatment of department color

Need a restrained semantic grammar:

- selected tree item?
- rule/stripe?
- folder marker?
- breadcrumb accent?
- status indicator?

Avoid giant fills.

---

## File / Sessions

### OQ-015 — What lives directly inside every folder?

Need determine universal vs system-specific structure.

Potential universal concepts:

- Current
- Plan/configuration
- Sessions
- History
- Evidence
- open questions

But every folder should not be forced into an identical fake structure.

### OQ-016 — What creates a Session?

Possible triggers:

- resident initiates meaningful work
- Agent initiates review
- scheduled review
- challenge/test closes
- human specialist works File
- material File update

Need avoid generating meaningless tiny sessions.

### OQ-017 — What is inside a Session?

Working possibilities:

- Overview
- Conversation
- Evidence
- Questions
- Decisions
- Changes
- Follow-up

Need define what is universal vs optional.

### OQ-018 — Can one Session affect multiple folders?

Likely yes.

Need define:

- primary folder
- linked folders
- audit trail
- cross-department handoff

### OQ-019 — Session naming

Need resident-friendly naming that is understandable without exposing internal IDs.

---

## 48 Desk model

### OQ-020 — What is the minimum Desk Charter?

Potential fields:

- mandate
- scope
- responsibilities
- boundaries
- outcomes
- evidence
- questions
- tests/challenges
- maintenance
- handoffs
- escalation
- expertise

### OQ-021 — When should a folder's AI "desk" contact the resident?

Need contact/stay-quiet rules.

### OQ-022 — How does the future human specialist layer map onto AI desks?

Need caseload / queue / escalation / review model that can eventually support physical Social Clubs.

---

## Foundation progression

### OQ-023 — How do Time, Inventory, Salary, Standards interact during onboarding?

Current model treats these as foundations, but exact sequencing and overlap need review.

### OQ-024 — When is a system "configured/current"?

**Resolved for Time October 11, 2026.** `systems/TIME.md` section 10 states three operational conditions.

Need an operational definition that is better than "resident completed setup."

---

## Application and Enrollment

### OQ-025 — What takes place during Enrollment?

**Sequencing resolved October 10, 2026.** Application precedes Enrollment. The initial Agency Assessment constitutes Enrollment. Orientation follows Enrollment, then initial Time work. Residency begins at Enrollment. Remaining question: which general information and Start and Target questions does an agent need to begin representing the resident?

### OQ-026 — When does payment take place?

Payment at Application or Enrollment remains unresolved under `LANGUAGE_STANDARD.md` clause 12.3. Do not require payment at a specific point in resident facing instructions until this is decided.

### OQ-027 — What is the first Time requirement?

**Resolved October 11, 2026.** Both. `systems/TIME.md` 9.3: the Resident Portal home opens when the first seven day schedule is on file and the resident has confirmed the first Plan. A completed week of activity is not required.

Initial Time work follows Orientation. Resolve whether the resident establishes a seven day schedule, a daily Plan, or both before the normal Resident Portal home becomes available.
