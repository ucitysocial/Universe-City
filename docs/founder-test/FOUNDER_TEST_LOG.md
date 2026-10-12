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
| FT-006 | File — working interface | Current File reads like a static report and differs markedly from the established Universe City Window OS-style Resident Portal | Founder-directed primary visual redesign | Main visual priority; #25 |
| FT-007 | Conversation — mobile composer | Keep the approved conversation layout, with composer anchored to bottom on mobile as in a messaging app | Founder requirement; mobile behavior not yet verified | Implement and device-test; #26 |
| FT-008 | Public website — account state | No visible Log out and homepage appears anonymous after returning via logo on www.ucitysocial.com | Founder-reported issues; missing UI confirmed by code | Fix and verify session handling; #27 |
| FT-009 | Working shell — conversation location | Left File/conversation navigation, center active workspace, right decisions/context; not a permanent right-rail chat | New founder prototype direction; preview not yet verified | In progress with Claude; #30 |
| FT-010 | Time — visual schedule | Daily, weekly, and monthly visual calendar with time-positioned blocks is the Time system, not merely stored entries | Founder core product requirement; partial existing spec, missing views | In progress with Claude; #29 |
| FT-011 | Resident Portal — visual review package | Updated three-panel File/Conversation, visual calendars, record editor and mobile screenshots supplied as a static walkthrough | Screenshot evidence only; functional claims unverified | Received; awaiting founder review and runnable preview |

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

**FT-004-B — Export-resolved confirmation chronology; duplicate-action defect.** The earlier pending proposal correctly described an unknown start. The JSON export shows that a screen control confirmed the pending proposal and saved the proposed start before the founder typed a second confirmation. The second chat action produced no additional database change in the exported revision list but its tool summary incorrectly said Changed. The cause of the discrepancy in the screenshots is the **two distinct confirmation actions**. The implementation must prevent the repeated write attempt and show accurate no-op feedback. See #23 and the Session 01 export review below.

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

## FT-006 — File needs to match the established Universe City workspace

**Evidence:** Screenshot of the founder mockup **Your File in this test**, shared October 11, 2026. The screenshot is described here and not uploaded to this public repository.

**Founder feedback and priority:** The File screen is too plain and visually different from the Window OS-style interface already designed for Universe City. The founder says **this is the main visual issue to fix**, while specifically endorsing the Conversation layout.

**Observed UI:** One text-heavy page with a relatively narrow column and stacked categories: Waiting for your answer; Proposals waiting for a person; Time, Weekly schedule and Days; What you said by folder; Follow ups; Still unknown; Changes and earlier versions. It accurately represents some File information but behaves visually like a report, with little folder/path navigation evident.

**Relevant approved interface direction:** `docs/product/RESIDENT_INTERFACE.md` calls for a stable three-part desktop workspace: File/folder navigation on the left, selected content in the center, and contextual Agent on the right. It uses a navigable tree, active selection, breadcrumb, nested records, and compact status/history. `DESIGN_SYSTEM.md` specifies differentiated working surfaces. The founder calls this a Window OS-style interface. The approved specification forbids draggable floating windows, so keep the static shell unless the founder explicitly revises that decision.

**Direction:** Rebuild File as the existing resident working surface, not a new generic summary page. Preserve Time records, unknown states, proposals, source links, and history; represent them through meaningful navigation and selected content. Do not show empty records as a long series of explanatory paragraphs. Keep the approved Conversation interaction style and functionality.

**Implementation:** [#25 — File workspace visual rebuild](https://github.com/ucitysocial/Universe-City/issues/25). **Status:** Main visual priority, not yet implemented.

---

## FT-007 — Mobile chat input anchored at bottom

**Founder requirement:** Retain the current Conversation layout. On mobile, the text input and send button must remain fixed to the usable bottom of the conversation screen, similar to a conventional messaging thread. The composer should not move unpredictably with the conversation scroll, keyboard, or page viewport.

**Evidence status:** The screenshots demonstrate desktop Conversation layout only. The founder specified the desired mobile behavior but did not provide a screenshot of a mobile layout defect. Treat the mobile implementation as a requirement to build/verify.

**Acceptance:** A single scrolling transcript with a stable composer visible above the on-screen keyboard and safe area. Check long histories, multiline typing, keyboard open/close, iOS and Android viewports, scroll position preservation, and no awkward double scrolling. Desktop Conversation layout remains recognizable.

**Implementation:** [#26 — Mobile composer stability](https://github.com/ucitysocial/Universe-City/issues/26). **Status:** Founder direction, pending implementation and device verification.

---

## FT-008 — Public website sign-out and signed-in navigation continuity

**Scope:** Canonical public **www.ucitysocial.com**, **not** the founder-only test.

**Founder-observed issues:** There is no usable sign-out option while logged into the regular website, and navigating to the homepage via the logo makes it appear that the resident is no longer logged in.

**Code review (October 11, 2026):**
- Static marketing homepage `ucitysocial/index.html` displays a fixed **Log in** action and **Apply for residency**, with no sign-out UI or session-aware logic.
- Next `components/SiteHeader.tsx` conditionally shows **Resident Portal** versus **Log in**, but does not provide Log out.
- `components/ResidentFileNav.tsx` shows **Account** and **Replay orientation**, without Log out.
- `ucitysocial/_redirects` proxies application/auth routes to the Next stage host, while the public marketing homepage is static. This explains why the homepage displays anonymous controls even after login.

**Important distinction:** The code confirms misleading account navigation and no visible sign-out path. It does not prove that Supabase session cookies or credentials are actually invalidated when returning home. A secure end-to-end retest across canonical domain variants is required.

**Direction:** Add a working Supabase Log out action. Keep authenticated navigation coherent between the Resident Portal and the public homepage, including after following the site wordmark. Preserve valid auth sessions across route transitions; reflect real signed-in status rather than static anonymous copy. Test both www and non-www addresses and mobile.

**Implementation:** [#27 — Public account status and Log out](https://github.com/ucitysocial/Universe-City/issues/27). **Status:** Founder-reported, code-supported navigation issue; root cause of any true session loss remains unverified.

---

## FT-009 — Conversation in the main workspace, contextual decisions on the right

**Date reported:** October 11, 2026; additional screenshot shows Claude mid-build. **Status:** Founder clarification while a new preview is in development; final build not tested.

**Founder direction:** The interface should take cues from the broader Claude layout: left panel for File and conversation navigation, large center working area for the selected conversation, Time calendar or File contents, and a separate right panel for decisions, pending confirmations, related follow ups and relevant context. The conversation must **not** remain a narrow pane off on the right. The right context area can be optional/collapsible. This does not mean adopting Claude's color palette or replacing Universe City branding.

**Specification difference to reconcile:** `docs/product/RESIDENT_INTERFACE.md` still describes the Agent as persistent in the right rail and the center as selected Portal content. That earlier direction conflicts with the latest founder preference for full center Conversation. Build and visually review the new founder-test composition, then explicitly update the governing interface doc if approved; do not pretend the old spec already reflects this change.

**Evidence:** The founder's screenshot captures Claude actively listing work to take the guide out of the right frame and make Conversation a full main pane. The screenshot reports intentions and in-progress tasks, not verified implementation or deployment.

**Verification:** Open the Conversation in center without squeezing it; switch into File and Time; return to the same conversation state; show decisions on the right without a duplicate chat; collapse the context area; verify responsive navigation and brand styling.

**Implementation tracker:** [#30](https://github.com/ucitysocial/Universe-City/issues/30). Existing YAPTAIN browser reference remains [#25](https://github.com/ucitysocial/Universe-City/issues/25).

---

## FT-010 — Time's system is a functional visual calendar

**Date reported:** October 11, 2026; Claude reportedly implementing a Time calendar. **Status:** Founder core product requirement explicitly recorded; not yet verified in a preview.

**Founder direction:** The Time folder must build and maintain the resident's actual **visual schedule**, with **day, week and month** views; the daily and weekly grids must show time slots and events physically placed at the right time. A month grid shows events on their actual dates. The product is not complete when only facts about a shift are filed or listed as text. Conversation creates or updates the schedule, and the schedule displays those changes. The resident must also be able to open and work with the calendar directly.

**Existing specifications:** `docs/systems/TIME.md` defines the maintained schedule as Time's system, and its section 5.8 explicitly provides for dragging, resizing, adding, editing, and deleting blocks by hand. `docs/systems/TIME_OPERATIONS.md` 4.3 leaves day and month views to define; a previous week view was calculated as hour figures rather than a finished, visual time-block calendar. This test requirement clarifies expected UI completion without replacing those operating documents or changing permissions.

**Verification requirements:** Create a dated commitment by chat and inspect the exact date/time placement in all three calendar views. Update it with proper approval, then verify all views reflect the same canonical Time record. Unknown end time stays unknown—show the known start without fabricating a duration. Test work crossing midnight, timezone, overlaps, empty slots, direct permitted manipulation, error states, and history/provenance. A separate pop-out or expanded calendar is an **optional design concept**, not an approved requirement or a replacement for the main Time workspace.

**Evidence limit:** The screenshot shows Claude's in-progress checklist including a calendar, day/month design, and removing the chat side rail. No screenshot of a finished working calendar is provided.

**Implementation tracker:** [#29](https://github.com/ucitysocial/Universe-City/issues/29). Related to [#22](https://github.com/ucitysocial/Universe-City/issues/22), [#23](https://github.com/ucitysocial/Universe-City/issues/23), [#25](https://github.com/ucitysocial/Universe-City/issues/25), [#30](https://github.com/ucitysocial/Universe-City/issues/30).

---

## FT-011 — Resident Portal visual review package

**Received:** October 11–12, 2026 (the source describes itself as an October 11 preview).  
**Evidence:** User-uploaded `Universe City Resident Portal.zip` supplied in ChatGPT. ZIP contents: `index.html` plus nine PNG images: `home`, `conversation`, `week`, `day`, `month`, `entry`, `search`, `phone-week`, `phone-conversation`. The images and ZIP remain in the conversation; no raw screenshot assets were committed to public GitHub.  
**Source type / verification limit:** `index.html` is an **illustrated walkthrough**, not the running Resident Portal. The ZIP contains **no app source JS, server code, tests, or deployed preview link**. Its claims about tests and database integration are supplied by its author, not independently proven by this review.  
**Status:** Visual redesign supplied for review, awaiting founder feedback and functional testing. **Do not mark issues closed from screenshots.**

### What the supplied screenshots actually demonstrate

- **Three zones:** left File tree/places/search; center Conversation, Home, selected Time calendar or record; right **Now on file** panel for ongoing work, unknowns, pending decision buttons, recently filed items, and next events. Conversation is no longer visually squeezed into the right rail. This reflects FT-009 / #30 at the screenshot level.
- **YAPTAIN-style navigation:** browsable department and folder hierarchy with icons, counts, selected rows and breadcrumbs. Four fixed departments and nested folders are visible. This appears closer to the founder's stated File direction than the earlier text-only report, but usability and actual routing remain untested.
- **Time calendar:** the screenshots show a 7-day time-grid with colored appointment/commitment blocks, an individual day time-grid with overlapping appointments, and a true monthly date grid. A separate **No time** row shows entries with missing start information. These are **design evidence**, not proof that entries are generated accurately from canonical records or that edits persist.
- **Entry detail:** selected Bar shift displays a source quote/message link, a note, a direct edit form for date/time/name, a note composer, and history with a prior start time. The demo screenshot shows an updated start at 3:30 PM versus earlier 3 PM.
- **Search:** the left rail can visually show a search result list comprising File entries and conversation messages.
- **Mobile:** screenshots show a vertical navigation/header, a conversation with its input along the bottom edge, and a horizontally scrollable-looking weekly time grid. A picture cannot establish keyboard handling, viewport anchoring, or scroll behavior.
- **Color:** visual appearance is broadly aligned to Universe City's ink/ivory base and department accent colors rather than copying YAPTAIN teal.

### Statements made by the walkthrough, not independently verified

The HTML presentation says **108 automated checks pass**, a test message was written to the test database, and the public site is unchanged. It also lists open work: no direct edit form for weekly schedule items, mobile keyboard not tested on an actual phone, and public-site sign-out still separate. These are **the author's claims**, not findings from running tests or inspecting implementation code.

### Candidate issues or next questions (no new founder-approved fixes)

**FT-011-A — Confirm the calendar actually works with real data.** Repeat the first founder-test scenario: discuss an uncertain, dated bar shift, approve once, then inspect all 3 calendar views, the File record, and history. Editing from the displayed form must update those same records, not an isolated UI list. Check week scrolling to late hours, overnight work, and source attribution. Link #29, #23, #25.

**FT-011-B — Untimed/unknown-end display.** The captions say entries with no end time **fade out at the bottom** of the week display. Inspect whether that visual treatment implies an invented duration or occupies time the resident never authorized. Requirement: no fabricated block duration; missing end must be clearly labeled, with an honest start marker or equivalent. Link #29.

**FT-011-C — Guide continuity remains a live test.** The illustrated conversation displays very short replies such as **"Three are on tomorrow," "Both are on file," and "On file."** That meets the request to shorten filing feedback but the screenshot does not show the guide asking a purposeful next question. Do not claim regression solely from a screenshot excerpt; test an actual conversation with an original Time-building objective. Link #22 and #24.

**FT-011-D — Context panel density.** The right panel currently displays recurring work, several unknown times, waiting approval, recent files and next items concurrently. Review whether it makes the next required decision clear or recreates an overlong information dump; don't treat it as a confirmed flaw without founder input. Link #30.

**FT-011-E — Classification/ownership and colors.** Monthly Time calendar shows differently colored appointments by their originating departments; the left File tree shows the same set of Time commitments under Agency Assessment. Confirm that color means origin/linked folder rather than an entirely different canonical owner. Cross-folder links should not create duplicate records. Link #29 and #25.

**FT-011-F — Search/history across screenshots.** The search screenshot displays a Bar shift with a 3 PM start while the later individual-entry screenshot displays 3:30 PM and change history. These may be different moments in the demonstration, not stale data. Test search after an edit to establish that it reflects the current canonical value.

**FT-011-G — Mobile composer.** Check a real mobile device, opening the keyboard and scrolling a long conversation. The screenshot alone cannot verify a fixed footer or prevent double scrolling. Link #26.

### Founder direction

**Awaiting founder feedback.** The founder supplied the ZIP while Claude was working on the full build. No newly specified changes were sent with the ZIP. Existing approved direction (visual calendar, persistent File navigation, center Conversation, right decisions/context, stable mobile composer) remains the benchmark.

### Next verification

Request the **actual Netlify deploy preview URL and commit SHA** when Claude finishes. Re-run FT-003 through FT-010 against the live preview and compare real Time data, permission handling, and conversation continuity. Do not mark #22, #23, #24, #25, #26, #29 or #30 closed based on this package alone.

---

## Findings and implementation tracking

- **Confirmed duplicate-action issue:** FT-004-C and exported JSON: a screen action already confirmed and saved the new start; a later typed confirmation invoked an additional no-op action and was labeled Changed.
- **Source of earlier inconsistency established:** FT-004-B: the first screen confirmation had already changed the stored start before the repeated chat confirmation. No premature write was established.
- **Founder-requested improvements:** FT-004-A: concise inline filing and confirmation summaries; FT-005: agent-led next question; FT-006: YAPTAIN-inspired File; FT-007: stable mobile composer; FT-008: authentic public navigation and Log out; FT-009: full center Conversation and right decisions; FT-010: Time day/week/month visual calendar.
- **Potential improvements / review questions:** FT-001-A, FT-001-C, FT-002-A, FT-002-D, FT-003-D; FT-003-C is partially retested (approval works; deferral untested).
- **Observed positive behavior:** FT-003-A, founder-reported FT-003-B, and FT-004-D (conversation continues after confirmation).
- **Unverified functional claims:** FT-001-B; FT-002-B and FT-002-C partially observed; FT-003-E and FT-004-B require File/Activity/history inspection.
- **Approved direction for future improvement:** Shorten and clarify the feedback beneath guide responses (FT-004-A); final copy and implementation not yet approved.
- **Code fixes deployed:** None through this founder-testing log. Session 01 paused for cleanup. Behavioral priorities #22 and #23; primary visual priority #25; public navigation #27; feedback #24; mobile composer #26.
- **Pending retests:** FT-005 next purposeful question; FT-004 duplicate confirmation and concise feedback; FT-003 deferral; FT-006 File navigation; FT-007 mobile composer; FT-008 public auth; FT-009 center chat/right context shell; FT-010 Time calendar day/week/month, data synchronization and manual edits; FT-011 new screenshots versus actual running preview.

### Maintenance rules

Append each new finding below the existing entries, update the test inventory, and preserve past observations rather than rewriting what was seen. Keep the founder's requested edits quoted or clearly attributed. When implementation occurs, link the actual issue, PR, and commit; record its retest outcome separately. Screenshots shared only in chat remain conversational evidence and are not automatically stored as GitHub assets.
