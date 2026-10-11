# Universe City — Founder Test Log

**Started:** October 11, 2026  
**Scope:** Founder-only agent prototype / Claude build, currently viewed in a Netlify Deploy Preview.  
**Status:** Active testing. This is a working observation log, not an approved specification or instruction to deploy fixes.  
**Authority:** Existing repository standards and approved specifications remain in force. Proposed changes require founder approval.

## Purpose

Document what the founder actually sees, what happens during testing, what does not work, what remains unverified, and what the founder wants revised. Preserve observations separately from interpretations and decisions. Findings should guide Claude's implementation without quietly changing project requirements.

### Entry format

Each screenshot/test gets a stable **FT-###** identifier and records:

- **Surface / state:** Where the tester was and what action preceded the screen.
- **Evidence:** Visible UI and exact behavior observed. A screenshot supplied in conversation is described here unless the image itself is separately committed to GitHub.
- **Finding:** Verified issue, usability concern, question, or candidate improvement. Explicitly distinguish observation from inference.
- **Founder direction:** Exact requested change, if given. Otherwise **Awaiting founder direction**.
- **Verification needed:** The smallest test that confirms or disproves the concern.
- **Status:** Observed → Triaged → Approved for change → In progress → Ready for retest → Verified / Closed. Use **Not reproduced** when appropriate.
- **Implementation link:** GitHub issue/PR/commit, when one exists.

No entry is a defect just because the prototype is unfinished. Do not report unseen pages or untested behavior as failures. Never enter resident secrets, real credentials, private life facts, raw transcripts, or screenshots containing personal data into this public repository.

## Test inventory

| ID | Surface | Finding / topic | Classification | Status |
| --- | --- | --- | --- | --- |
| FT-001 | Founder Test — first screen | Introduction explains test storage, access, model handling, and controls before conversation starts | Observed UI + candidate UX review | Observed; awaiting founder direction |
| FT-002 | Conversation — empty state | The guide does not initiate the conversation; an empty state directs the founder to write first | Observed UI + onboarding question | Observed; awaiting founder direction |
| FT-003 | Conversation — scheduling uncertainty | Tentative time triggers explicit confirmation; on approval, the guide resumes questioning | Positive finding + follow-up retest | Partially retested; deferral still untested |
| FT-004 | Conversation — filing feedback | Long status blurbs and a repeated approval that claims an unchanged value was changed | Founder-requested UX + confirmed duplicate-action feedback | Cleanup required; see #23, #24 |
| FT-005 | Conversation — next question | The guide asks the founder to choose the next task instead of continuing the original schedule request | Founder-identified continuity issue | Cleanup required; see #22 |

---

## FT-001 — Founder Test first screen

**Date observed:** October 11, 2026  
**Evidence:** Screenshot supplied by founder in the ChatGPT conversation. The image has **not** been uploaded to this repository.  
**Environment:** Claude's Founder Test mock-up in a Netlify Deploy Preview (exact preview URL, branch, and commit not yet recorded).  
**Surface / state:** Initial screen before selecting **Start the conversation**.  
**Status:** Observed; awaiting founder direction.

### What is visible (confirmed from screenshot)

- Dark left navigation with the Universe City wordmark, **FOUNDER TEST** label, tabs **Conversation**, **File**, and **Activity**, and a logged-in founder account area with **Log out of the test**.
- Main panel titled **What this test keeps**.
- Main panel describes word-for-word storage of messages, entries filed from conversations and their revisions, and a list of software actions and refused actions.
- It includes explanatory text about data access, Anthropic/Netlify processing, filtering of certain sensitive identifiers, retaining test data, clearing/exporting data from Activity, and the distinction between a software guide and a human agent.
- The sole primary action shown is **Start the conversation**.
- Netlify's **Deploy Preview** overlay is visible.

### Findings and questions

**FT-001-A — Entrance experience (candidate review; not an approved change).** The introductory view foregrounds technical data-handling and system disclosures. Review whether a founder-only test needs a separate short welcome/entry explanation while keeping full, accurate data and privacy information accessible. This is an assistant-suggested UX question, **not a founder instruction**.

**FT-001-B — Claims require verification (not yet tested).** Storage behavior, provenance, revision history, action audit, export/clear controls, software-versus-human boundary, and access protections are *described* on this page. The screenshot does not demonstrate those features work. Verify each through subsequent Conversation, File, and Activity tests. Do not mark them functional based on introductory copy.

**FT-001-C — Human-agent behavior (open question).** The screen states that no person reads the conversation unless requested. Test how that prototype condition relates to the wider Universe City human-agent model, including the planned regular agent check-ins; do not assume that founder-test disclosure describes the eventual resident product.

### Founder direction

**Awaiting founder direction.** The founder supplied the screenshot and requested that discoveries and proposed updates be documented as testing continues. No specific wording or UI changes for FT-001 have been approved.

### Next verification

Select **Start the conversation**; capture the first conversation screen and its initial guide behavior. Test the File and Activity surfaces after the conversation produces information, and compare those results against the first-screen claims.

---

## FT-002 — Conversation screen, first entry

**Date observed:** October 11, 2026  
**Evidence:** Second screenshot supplied by founder in the ChatGPT conversation. Image not uploaded to the GitHub repository.  
**Environment:** Same Claude Founder Test Netlify Deploy Preview as FT-001; exact preview URL, branch, and commit remain unrecorded.  
**Surface / state:** Screen shown after pressing **Start the conversation** on FT-001. No message has been sent yet.  
**Status:** Observed; awaiting founder direction.

### What is visible (confirmed from screenshot)

- The left sidebar still has **Conversation**, **File**, and **Activity**; **Conversation** is selected.
- The main area has the title **Conversation** and a short distinction: **"You are talking with the guide. The guide is Universe City software. Your agent is a person."**
- The transcript area is empty. It reads: **"No message is here yet. Write about any part of your day or your life. The guide answers, and each entry it files is listed under its reply."**
- At the bottom is an input with placeholder **"Write to the guide"** and a **"Send message"** button that appears disabled in the empty state.
- The page shows no guide-initiated greeting, introductory question, visible Time intake step, or example conversation on this initial state.

### Findings and questions

**FT-002-A — Blank conversation entry (candidate UX review; no confirmed defect).** The founder is invited to write first, with a broad instruction to write about their day or life. This may leave a new resident uncertain where to begin. Compare this approach with the approved resident experience of a natural, guided conversation that avoids an unnecessary intake questionnaire. Determine whether the guide should open with a useful, human-readable first question rather than wait for an unsolicited first message. **This is a proposed test question, not founder-approved wording or behavior.**

**FT-002-B — Guide response and filing are untested.** The screen promises that entries filed by the guide will appear under its replies. No replies, entries, or File view are visible in this screenshot. Test message handling, response relevance, filing attribution to actual statements, pending proposals versus approved entries, and the presentation of filed items. Do not treat the stated behavior as verified.

**FT-002-C — Composer behaviors are untested.** The input and send button exist, but sending, loading, errors, multiline input, and message persistence are not demonstrated by this screenshot.

**FT-002-D — Software/human distinction (observed wording).** The header explicitly distinguishes software guide from human agent. Compare future system responses against the claim; do not assume a human actually participates in the prototype.

### Founder direction

**Awaiting founder direction.** The founder supplied the first Conversation screenshot as part of an ongoing test. No changes to the layout, opening message, or filing presentation have been specifically requested or approved.

### Next verification

Send one short **fictional test message** with a specific commitment or scheduling fact (no real sensitive data), then capture the resulting guide reply and any entry shown underneath it. Inspect the **File** view for source attribution and approval state, and compare it to what the guide says was filed.

---

## FT-003 — Tentative arrival and pending confirmation

**Date observed:** October 11, 2026  
**Evidence:** Third screenshot supplied in ChatGPT; underlying transcript is not yet provided. Screenshot itself is not uploaded to the public repository.  
**Environment:** Claude Founder Test, Conversation view.  
**Surface / state:** Several scheduling facts have been discussed; a one-day shift is on file and the guide asks the founder to clarify an uncertain arrival time.  
**Status:** Observed; clarification pending. No approved change yet.

### Founder feedback (expressly reported)

- The founder reports that the guide is **handling a complicated, variable bar schedule well** and navigating follow-up questions effectively.
- The founder specifically values the guide noticing that an answer prefaced with **"probably"** was uncertain, rather than silently making it a confirmed start time.
- Concern raised: after presenting a confirmation/edit request, **the guide says nothing further**. The founder notices the conversation appears to stall at the proposed change.
- The full conversation transcript may be supplied later; do not claim these screenshots cover the complete history.

### What the screenshot demonstrates

- Earlier messages produce **FILED** indicators for multiple Time-related facts. A one-day shift is then represented with a date and with an unspecified start/end time.
- The guide asks for the intended arrival time instead of treating the establishment's opening time as the person's work start time.
- After a tentative arrival answer, the guide says it **has not filed** that time, seeks explicit permission to set the start, and leaves the end open.
- A **WAITING FOR YOU** line shows a proposed change from an unspecified start to a specific start; this is presented separately from **FILED** entries.
- The composer is visible. **The screenshot does not prove the composer is disabled or that further messages are blocked.** It proves the last displayed guide response ends at a confirmation question.

### Findings

**FT-003-A — Positive: uncertainty and precision preserved (observed and founder-endorsed).** The guide distinguishes a tentative arrival estimate from a definite shift start; the next File update is shown as pending rather than silently confirmed. It separately preserves unknown end time. Retain this behavior during future iterations; verify it across different phrasings in the transcript or follow-up tests.

**FT-003-B — Positive: contextual scheduling (founder-reported, partially visible).** The guide reportedly follows a variable working schedule well. The visible exchange distinguishes location opening time, personal arrival time, and unknown end time. More of the dialogue must be inspected before judging overall reliability.

**FT-003-C — Potential conversational dead end (candidate review, not proven blocking defect).** The latest guide reply asks to approve a File change and does not offer another conversational step. Verify whether the founder can continue discussing other scheduling details or topics with a proposed File change pending. Decide with the founder whether confirmation should be a nonblocking workflow and whether the guide should continue naturally while maintaining an explicit pending state. Do not equate an unanswered question with a technically blocked interface.

**FT-003-D — Proposal semantics (to verify).** Determine whether accepting the proposed time means the founder has explicitly upgraded a tentative estimate into a firm start time, or whether the File supports an estimated/provisional start distinct from a confirmed obligation. The current screenshot demonstrates the request for confirmation but not the outcome. An approval must not erase the original tentative language or source message.

**FT-003-E — Data correctness following confirmation (untested).** Test yes, no, correction, deferral, and a new-topic response while **WAITING FOR YOU** is present. Inspect the File and Activity log for exact source linkage, revision history, pending-state resolution, and accurate date/time.

### Follow-up result: founder confirmed the tentative time (same test, later screenshot)

The founder replied **"just confirm 3PM"**. The guide then said the shift was on file starting at 3:00 PM, with the end left open, and asked: **"Do you want to plan that day, or is there something else to sort out first?"**

**Updated assessment of FT-003-C:** The interface accepted a confirmation and resumed the conversation. The earlier screenshot showed an unanswered confirmation prompt, **not a proven conversation-blocking defect**. The behavior with a declined or deferred confirmation remains untested. The subsequent **FILED** notice is documented separately in **FT-004** because the apparent before/after state conflicts with the earlier pending confirmation.

### Founder direction

Founder has **positively endorsed uncertainty recognition and follow-up quality** and flagged that the dialogue ends after the confirmation request. A particular replacement prompt, nonblocking flow, or UI update **has not yet been explicitly approved**.

### Next verification

First test whether a natural response such as deferring the arrival estimate and continuing with another scheduling detail works while the proposed change remains pending. Then test approving or correcting that one change and inspect whether the conversation resumes and the File preserves the evidence. Review the complete transcript when provided.

---

## FT-004 — Filing summary clarity and possible no-op confirmation

**Date observed:** October 11, 2026  
**Evidence:** Fourth screenshot supplied by the founder in ChatGPT (continuation of FT-003). Screenshot itself is not added to the public repository. Full transcript pending.  
**Surface / state:** The founder accepts the guide's proposed shift start time and sees the guide's reply with an automatic **FILED** line.  
**Status:** Founder-requested UX change to track; implementation not authorized or completed. Data-state discrepancy to investigate.

### Exact behavior observed

- After a **WAITING FOR YOU** proposal to set the shift's start time, the founder replies: **"just confirm 3PM"**.
- The guide says the shift is filed, its end remains unspecified, and the dialogue continues with a question about planning the day or addressing something else.
- The same guide reply also says: **"The entry already showed 3:00 PM before this change, so nothing is different."**
- The **FILED** line reads, in part: **"Changed: Bar shift, starts 3:00 PM, end not established ... Before: Bar shift, starts 3:00 PM, end not established ... Your words: 'just confirm 3PM'"**.
- In the prior screenshot, the **WAITING FOR YOU** proposal said the *current* entry had **time not established**. This is inconsistent with the later **Before** snapshot showing a 3:00 PM start.

### Founder feedback and requested direction

The founder says the automatic blurbs underneath guide replies are unnecessarily wordy and difficult to understand. The founder asks for them to be **shorter or more summarized** and suggests an example along the lines of **"Uncertainty confirmed: bar shift start 3PM, Oct 16, 2026"**. Preserve that example as the founder's desired concise style, without treating those exact words as finalized product copy.

**Candidate compact presentation, for the founder to approve or adjust:**

- On approval: **"Confirmed: Bar shift starts at 3:00 PM on Friday, October 16. End time unknown."**
- For an unresolved estimate: **"Awaiting confirmation: Bar shift start estimated at 3:00 PM on Friday, October 16."**
- For an actual correction: **"Updated: Bar shift start changed from [old time] to [new time] on [date]."**
- If there was no actual change, do not label it **Changed**. Show an accurate confirmation result, with full event details in File or Activity.

These are suggested examples for design discussion, **not implemented UI copy**. Exact timestamps, source excerpts, and before/after revisions remain available through audit/history and should not be discarded just to simplify the inline feedback.

### Findings

**FT-004-A — Founder-requested UX improvement: readable filing feedback.** The current **FILED** and **WAITING FOR YOU** blurbs repeat long internal record descriptions and exact resident wording, making the conversation harder to read. The founder explicitly asks for shorter, clearer status summaries. Prefer a human-readable outcome, date, and any material unknown; keep detailed provenance and history in their proper views.

**FT-004-B — Potential data/proposal integrity defect: inconsistent state (high priority to investigate).** An earlier pending proposal described **Before** as unspecified time; after approval, the dialogue and audit text describe **Before** as already 3:00 PM. This may be stale state, premature writes, a no-op update, a presentation bug, or some combination. The screenshot alone cannot identify which. Verify in the File, revisions, Activity actions, and database source history before asserting a root cause.

**FT-004-C — Incorrect change semantics if before equals after (observed UI contradiction).** The displayed event says **Changed** while its stated before/after values are identical. If the underlying data truly did not change, the system should not present a modification; if a proposed change did occur, the old value needs to be displayed accurately. Retain an audit event for the confirmation action without fabricating a changed field.

**FT-004-D — Guide continuation (positive retest).** After approval, the guide asks how to proceed with the day rather than ending the conversation. FT-003-C is therefore only an unanswered-prompt UX concern so far, not evidence of a locked conversation.

### Founder direction / approval scope

**Founder requested that these findings be recorded in GitHub and that filing blurbs be made easier to understand.** Treat the concise-summary goal as founder direction for a future code change. The specific wording and technical implementation remain to be decided. This log entry does **not** edit, deploy, or approve changes to the running prototype.

### Retest instructions for Claude / implementer

1. Establish a new dated entry with genuinely unknown start and end times, then submit a tentative start ("probably").
2. Check the File *before* confirmation: tentative or pending proposal must be distinguishable from confirmed start; original message remains intact.
3. Confirm the time once. Compare proposal before-state, accepted after-state, persisted data, revision/event history, and the inline **FILED** summary.
4. Confirm a second time and verify idempotence: no false "Changed" entry for an unchanged field.
5. Decline/defer another estimate and start a new topic. The conversation should remain usable; no unconfirmed schedule time should silently become confirmed.
6. Validate the one-line status copy and verify detailed evidence remains reachable through File/Activity.

---

## FT-005 — Guide should carry the stated purpose forward

**Observed October 11, 2026. Founder request:** Stop this session, review the exports, and fix the conversational sequence before deeper testing. The first substantive request was to organize an irregular schedule. At the end, the guide asked the founder whether to plan the dated shift or discuss another topic. The founder expects the guide to determine the next useful question from what was said at the beginning, and to keep organizing the schedule without requiring the founder to manage the conversation.

**Status:** Confirmed founder feedback; **P0** implementation issue [#22](https://github.com/ucitysocial/Universe-City/issues/22).

**Governing rules already exist:** `docs/systems/TIME.md` 5.9 and 6.1–6.2; `LANGUAGE_STANDARD.md` 3.20.2; `docs/product/AGENT_OPERATING_ARCHITECTURE.md`. These require purposeful follow-up based on missing information, established commitments, importance, consequences, and preferences. This is a prototype implementation problem rather than a request to change the rules.

**Acceptance:** After resolving a dated shift's time, ask one relevant unanswered question advancing the resident's original request. Do not offer generic choices about whether to continue planning. Preserve uncertainty, existing context, and the resident's right to change topics. Do not force a predetermined questionnaire.

**Next session:** Retest after #22, #23, and #24 have been addressed. The text and JSON exports from this session are retained outside the public repository.

---

## Export review — Session 01 stopping point

**Export received:** Two files, text and JSON, timestamped 5:45 PM Denver on October 11. They cover **7 exchanges, 14 messages, 8 actions, 4 filed statements, 1 dated commitment, 0 weekly schedule entries, 0 Plans, 1 later-confirmed pending item, and 2 database changes**. These counts do not establish completion of the Time system. Raw exports are not committed because this repository is public.

**FT-004 root-cause clarification from action chronology:**
1. A dated commitment was added with unknown start/end.
2. The tentative start created a pending approval, with the stored start still unknown.
3. A **screen confirmation at 5:41:17 PM** changed the stored start from null to 900 minutes (3 PM) and marked the pending item confirmed.
4. A **typed confirmation at 5:42:55 PM** repeated the same approval. The tool was invoked again at 5:42:58 PM and reported **Changed** with identical Before/After times.
5. The export records **no third database change** for the redundant typed approval. The earlier claim that the first approval may have filed the time prematurely is therefore unsupported. This is confirmed duplicate-action handling and misleading UI feedback; see [#23](https://github.com/ucitysocial/Universe-City/issues/23). The long inline result remains a separate founder-requested presentation change; see [#24](https://github.com/ucitysocial/Universe-City/issues/24).

**Positive findings retained:** The guide maintained a variable shift pattern, distinguished business opening time from actual arrival, left end times unknown, and sought confirmation for a tentative start. When the confirmation succeeded it could respond; its next question did not advance the original purpose.

**Session status:** Testing paused for cleanup. No software changes or fixes have been deployed by the review. The active cleanup issues are [#22](https://github.com/ucitysocial/Universe-City/issues/22), [#23](https://github.com/ucitysocial/Universe-City/issues/23), and [#24](https://github.com/ucitysocial/Universe-City/issues/24).

---

## Findings and implementation tracking

- **Confirmed duplicate-action issue:** FT-004-C and exported JSON: a screen action already confirmed and saved the new start; a later typed confirmation invoked an additional no-op action and was labeled Changed.
- **Source of earlier inconsistency established:** FT-004-B: the first screen confirmation had already changed the stored start before the repeated chat confirmation. No premature write was established.
- **Founder-requested improvements:** FT-004-A: concise inline filing and confirmation summaries; FT-005: continue the original schedule purpose and choose the next relevant question.
- **Potential improvements / review questions:** FT-001-A, FT-001-C, FT-002-A, FT-002-D, FT-003-D; FT-003-C is partially retested (approval works; deferral untested).
- **Observed positive behavior:** FT-003-A, founder-reported FT-003-B, and FT-004-D (conversation continues after confirmation).
- **Unverified functional claims:** FT-001-B; FT-002-B and FT-002-C partially observed; FT-003-E and FT-004-B require File/Activity/history inspection.
- **Approved direction for future improvement:** Shorten and clarify the feedback beneath guide responses (FT-004-A); final copy and implementation not yet approved.
- **Code fixes deployed:** None through this founder-testing log. Session 01 paused for cleanup; priority issues #22, #23, #24.
- **Pending retests:** FT-005 next question after a confirmation; FT-004 repeated confirmation by both screen and chat; FT-004 concise feedback; FT-003 deferred proposal.

### Maintenance rules

Append each new finding below the existing entries, update the test inventory, and preserve past observations rather than rewriting what was seen. Keep the founder's requested edits quoted or clearly attributed. When implementation occurs, link the actual issue, PR, and commit; record its retest outcome separately. Screenshots shared only in chat remain conversational evidence and are not automatically stored as GitHub assets.
