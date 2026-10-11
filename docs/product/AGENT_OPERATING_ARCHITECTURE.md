# Agent Operating Architecture

**Status:** WORKING specification. October 10, 2026.

Governing documents: `LANGUAGE_STANDARD.md`, `ARCHITECTURE.md`, `docs/product/RESIDENT_INTERFACE.md`, `docs/product/AGENT_MODEL.md`, and `docs/systems/TIME.md`. The Language Standard governs terminology wherever these documents conflict.

## Purpose

The agent maintains the resident's systems by learning the resident's circumstances and intended conditions, arranging work, coordinating the affected folders, and completing authorized administrative actions. The resident reports their life, makes decisions that belong to them, and carries out actions that require their participation. The agent keeps related work active until its defined requirements are met.

## Entry sequence

1. Application.
2. Email confirmation.
3. Enrollment through the initial Agency Assessment.
4. Orientation in the Resident Portal.
5. Initial Time work and the seven day schedule.
6. Resident Portal home.

Enrollment establishes general information and initial Start and Target selections. It does not require a completed Time system. Exact Enrollment completion criteria remain open.

## Two coordinated views

**Resident Portal:** A natural conversation with one relevant question at a time. Structured selections are used when required to establish a specific answer. The interface does not expose extraction details, internal routing, or the agent's administrative progression.

**Agent console:** The resident's File, curriculum progression, unanswered questions, associated folders, active commitments, follow ups, ongoing work, proposed record changes, and action permissions. Human agent identity and automated software are distinguished; software never claims to be the human agent.

## Progression model

There are 48 folders in four departments. Enrollment starts with the twelve Agency Assessment folders, beginning with Time. Each curriculum question is an identifiable assessment requirement with permitted Start and Target options, selection dates, and missing states. The resident can volunteer information relevant to any folder in any order. That information should reduce the number of subsequent questions. The agent does not ask for information already on file. Folders remain subject to maintenance and correction; they are not permanently complete.

The August 28, 2026 Time Curriculum requires revision. Time measures the resident's ability to plan, execute, and review commitments under their own established conditions. Its new questions and options remain to be approved. The twelve older activity categories may inform schedule intake rather than serve as the new assessment scale.

## Record and conversation integrity

Store conversation messages in chronological order with speaker identity, timestamps, and original wording. A message may have associations with multiple folders and multiple curriculum requirements. Associations do not change the original statement. Keep an explicit link from each proposed fact to its source message. Unknown remains unknown. A resident's direct statement is preserved as stated. Interpreted permanent File updates follow the existing proposal and agent approval model. Revisions preserve prior records.

## Commitments: five conditions

Each commitment can have five condition groups, supplied only when relevant:

1. **Timing:** Required date, time, deadline, duration, permitted flexibility.
2. **Completion:** The resident's definition of a fulfilled commitment.
3. **Consequences:** Anticipated effects of delay, change, or omission and separately reported actual effects.
4. **Standards:** Applicable resident established minimums; missing Standards remain unknown.
5. **Follow through:** Required next actions, their owner, timing, and links to associated ongoing work.

A commitment has its own execution state separate from the status of any linked follow ups or ongoing work. Completion at a changed time may be successful if no established condition was adversely affected. The agent does not invent consequences or label unreported work complete.

## Three operational objects

**Commitment:** A planned action with its conditions and execution history.

**Follow up:** Information, confirmation, resident action, or agent action that remains unresolved, with owner and next action.

**Ongoing work:** A continuing responsibility with linked commitments and follow ups, including recurring responsibilities.

One commitment may generate multiple follow ups. One ongoing responsibility may contain multiple commitments. One action may affect several folders. Maintain links among these records and preserve state transitions.

## Agent execution rules

When a meaningful action is reported completed, the agent checks the originating commitment, its linked work, and the relevant folder requirements. The agent performs authorized administrative updates and schedules already agreed work when timing is established. If a choice changes a protected commitment, conflicts with Standards, or requires new authorization, the agent requests a resident decision. Resident statements, actual amounts, purchases, and completed actions may not be invented. Proposed permanent File changes must pass existing approval rules.

Do not create redundant work merely to make the resident interact. Do not require receipt scanning or itemized inventories when the relevant system does not need them. Keep necessary follow ups active without repeating the same question.

## Example: shopping

After the resident reports that grocery shopping happened, mark the shopping commitment executed. If a purchase amount or receipt is available and relevant, prepare the appropriate financial entry. If the items are known and Inventory maintains them, prepare corresponding updates. Schedule established remaining work if an authorized time is available. Keep missing relevant evidence or decisions as follow ups. The original shopping commitment remains executed even when linked work is still open.

## Example: laundry

Washing, drying, and putting away clothes can be separate commitments within ongoing laundry work. Completing washing does not complete putting away clothes. Maintain the resident's established recurrence. Schedule remaining work under authorized arrangements. Avoid asking the resident to manually construct the sequence.

## Build increments

1. Persist conversations and source to folder associations.
2. Model curricula, question progression, Start, Target, Position, and unresolved assessment requirements.
3. Model commitments, five condition groups, follow ups, ongoing work, and history.
4. Implement authorized action execution, proposals, scheduling, and cross folder updates.
5. Build one natural resident conversation flow paired with an agent progression view.
6. Test Enrollment through Time and a completed action that generates additional work.
7. Expand curricula and folder operations progressively.

## Open design decisions

- Revised Time Curriculum's twelve assessment questions and options.
- Minimum Agency Assessment coverage necessary to end Enrollment.
- Exact distinction between routine scheduling authorization and commitment changes requiring resident approval.
- How a real agent supervises and hands off automated preparation and execution.
- Recurring work rules, conflict resolution, and safe retry behavior.
- Actual database migration and interface implementation choices after code inspection.

Do not implement open items as decided behavior.
