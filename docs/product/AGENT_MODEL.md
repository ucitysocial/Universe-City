# Agent Model

**Status:** WORKING PRODUCT MODEL

The Agent should become the easiest way for a resident to maintain the systems without having to manually edit every record or navigate every folder.

---

## Core role

The Agent:

- knows relevant context from the resident's maintained File
- can see the resident's current Plan
- can ask the smallest useful question
- can help the resident update a Plan conversationally
- can surface possible mismatches/patterns
- can propose changes to the File
- does not silently turn interpretations into canonical record
- can involve a human when appropriate

The Agent should not be generic chat support.

---

## Plan creates natural engagement

A Plan gives the Agent legitimate, contextual reasons to communicate.

### Before

Examples:

> You have a lot planned after work. Still on track for all of it?

> You wanted to leave by 5 today. Still the plan?

Purpose:

- prevent predictable overload
- allow adjustment before failure
- protect important intentions

### During

Use sparingly.

Appropriate when:

- active challenge/test
- time-sensitive important event
- resident explicitly requested accountability
- something material changed

Do not monitor every routine event.

### After

Examples:

> Did you finish that project at work today?

> Did you make it to the gym?

> Groceries were planned after work. Did that happen?

The Agent should use the actual Plan item as the follow-up rather than asking the resident to recall the entire day.

---

## Selective contact

**LOCKED principle**

Do not message about everything.

A planned item is more likely to deserve follow-up when it is:

- new
- meaningful to the resident
- uncertain
- frequently missed/changed
- part of an active system question
- linked to another important commitment
- specifically marked for accountability
- a current test/challenge

Stable routine behavior should gradually require less contact.

Universe City should get quieter as it understands the resident better.

---

## Conversational maintenance

The Agent should let the resident maintain life with normal language.

Example:

Resident:

> I'm not going to the gym. I forgot I promised my sister I'd help her move.

Possible response:

> Want me to replace the gym block with helping your sister and put gym back on tomorrow?

Resident approves.

Then the Plan can be updated.

The resident should not need to open Time and drag calendar blocks for every life change.

---

## Conversation vs File

Existing repository rules apply.

A message is not automatically a permanent record.

Possible flow:

1. Resident says something.
2. Agent understands context.
3. If canonical File data should change, Agent proposes the specific change.
4. Resident confirms/corrects where required.
5. Change is filed with provenance/revision history.

Simple transient Plan changes may eventually have different confirmation rules than durable interpreted File facts; that remains open.

---

## Agent pane

Current interface direction:

**Static right-side Agent pane on desktop.**

The Agent remains visible/available while the center workspace changes between:

- Dashboard
- Time
- Finance
- Session
- another folder

This enables contextual conversation without making chat the entire product.

Questions still open:

- what pane shows when there is nothing active
- thread organization
- historical conversation access
- human identity/presence
- mobile treatment

---

## Context awareness

The Agent can know what the resident is currently viewing.

Example:

Resident is in:

`My File / Housing Stability / Inventory`

Resident says:

> I bought detergent already.

The Agent can understand that in Inventory context without requiring:

> Please specify which department and folder you want to update.

The resident should not have to understand internal routing.

---

## Follow-up preferences

Future resident controls may include:

- proactive vs quiet
- no-contact windows
- domains where accountability is desired
- preferred check-in timing
- which items deserve follow-up
- tone/intensity preferences
- human review preference where available

Do not reduce this to one global notification toggle.

---

## AI / human transparency

Universe City may be AI-assisted and human-backed.

Rules:

- AI must not falsely claim to be a human specialist.
- If a human entered/reviewed something, say so accurately.
- If AI drafted a proposal, say so accurately where provenance matters.
- Escalation can be explicit.

Example:

> This one is worth a human look before we change your system. I'm flagging it for the team.

The final human operating model remains open.

---

## Agent success

The Agent is successful when the resident feels:

> I tell you what's going on.  
> You pay attention.  
> You keep track.  
> You help me see things.  
> You update the system around me.

Not:

> I have another inbox I need to manage.
