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
| FT-003 | Conversation — scheduling uncertainty | Guide navigates variable schedule and treats a tentative arrival as unconfirmed, but pauses its dialogue at a confirmation request | Observed working behavior + interaction review | Observed; clarification pending |

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

### Founder direction

Founder has **positively endorsed uncertainty recognition and follow-up quality** and flagged that the dialogue ends after the confirmation request. A particular replacement prompt, nonblocking flow, or UI update **has not yet been explicitly approved**.

### Next verification

First test whether a natural response such as deferring the arrival estimate and continuing with another scheduling detail works while the proposed change remains pending. Then test approving or correcting that one change and inspect whether the conversation resumes and the File preserves the evidence. Review the complete transcript when provided.

---

## Findings and implementation tracking

- **Confirmed defects:** None yet established from the supplied screenshots. A pending confirmation may pause the dialogue; actual blocking is not established.
- **Potential improvements / review questions:** FT-001-A, FT-001-C, FT-002-A, FT-002-D, FT-003-C, FT-003-D.
- **Observed positive behavior:** FT-003-A and founder-reported FT-003-B. These are not yet full end-to-end verification.
- **Unverified functional claims:** FT-001-B; FT-002-B and FT-002-C are partially observed through FT-003; FT-003-E remains untested.
- **Approved fixes:** None yet.
- **Pending retests:** None yet.

### Maintenance rules

Append each new finding below the existing entries, update the test inventory, and preserve past observations rather than rewriting what was seen. Keep the founder's requested edits quoted or clearly attributed. When implementation occurs, link the actual issue, PR, and commit; record its retest outcome separately. Screenshots shared only in chat remain conversational evidence and are not automatically stored as GitHub assets.
