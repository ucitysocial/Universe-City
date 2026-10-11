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

## Findings and implementation tracking

- **Confirmed defects:** None yet established from this screenshot alone.
- **Potential improvements / review questions:** FT-001-A, FT-001-C.
- **Unverified functional claims:** FT-001-B.
- **Approved fixes:** None yet.
- **Pending retests:** None yet.

### Maintenance rules

Append each new finding below the existing entries, update the test inventory, and preserve past observations rather than rewriting what was seen. Keep the founder's requested edits quoted or clearly attributed. When implementation occurs, link the actual issue, PR, and commit; record its retest outcome separately. Screenshots shared only in chat remain conversational evidence and are not automatically stored as GitHub assets.
