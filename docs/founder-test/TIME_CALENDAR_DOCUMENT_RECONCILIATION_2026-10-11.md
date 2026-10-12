# Founder Test — Time Calendar Documentation Reconciliation

**Review date:** October 11, 2026  
**Status:** Documentation review and implementation acceptance, **not** an additional sixth Time folder document.  
**Scope:** Folder 01 Time, founder-test calendar build, and the maintained five-document set.  
**Reason:** Founder Test Session 01 showed correct conversational filing of a shift but no working resident calendar. The founder reiterated that the **calendar/schedule, populated with commitments**, is the primary system produced by Time; records exist to operate it.

## 1. Binding product progression

Application → email confirmation → Enrollment → Orientation → **Time intake** → initial seven-day schedule and confirmed first Plan → Resident Portal home under the existing conditions.

- **Enrollment** obtains the established Start/Target assessment. The current Curriculum Version 2 explicitly places its twelve questions before Time's Schedule intake. This review does **not** remove, defer, or replace that assessment.
- **Time intake begins with a calendar the resident can use and see.** The guide learns real commitments from prior File information and natural conversation and progressively populates the date/time views. A mostly empty calendar is not a requirement to manually fill the grid.
- **One Time system:** Day, week, and month reflect the same maintained Time schedule/commitments, revisions, authorization, and source attribution. Rendering a block must never create a fabricated start/end/duration or incorrectly upgrade an estimate.
- **After that initial schedule:** Plans, execution, Daily Close, Review, and follow through operate on the calendar and maintained commitments, rather than reducing Time to storage of chat-derived facts.

## 2. Source-of-truth table

| Existing source | What it already says | Calendar-first clarification / change |
| --- | --- | --- |
| [Time specification](https://github.com/ucitysocial/Universe-City/blob/main/docs/systems/TIME.md) | 2.4.1 the agent builds the schedule; 9.3 first seven-day schedule and first Plan; 11.2–11.4 the schedule is Time's working system and program calendar; 5.8 client edits it directly | Document Version 4.1 in this PR makes visual day/week/month requirements and progressive display explicit. The build status remains unverified until code passes the test. |
| [Time Operations](https://github.com/ucitysocial/Universe-City/blob/main/docs/systems/TIME_OPERATIONS.md) | 4.1 a built weekly **totals summary**; 4.3 day/month and manual editing To define | Version 1.1 distinguishes the summary from an actual time grid and specifies view, record, uncertainty, permission, and test requirements without inventing unresolved implementation mechanics. |
| [Time Developments](https://github.com/ucitysocial/Universe-City/blob/main/docs/systems/TIME_DEVELOPMENTS.md) | 3.1 records missing day/month/manual editing; 4.3 historically said Curriculum and Research were not revised | Version 1.1 appends the dated founder ruling, missing implementation contract, and correction that current Curriculum and Research copies were located in Drive. Old dated findings are retained with explicit superseding entries. |
| [Time Curriculum Version 2 in Google Drive](https://docs.google.com/document/d/1birf8DEefOEkTMA91j3ne1kxlIOyy79CgwBD2vWp2w8/edit) | Revised October 11; section 18 defines Schedule intake after Orientation and assembly of the first seven-day schedule by conversation; section 18.4 says twelve questions are answered at Enrollment, **before** Time intake; section 20.7 says no teaching lesson is a condition of a schedule/Plan | The actual curriculum is **not an unrevised Version 3 draft**. Its wording remains intact here. A future review should add only genuinely needed teaching/use-of-calendar details without changing client assessment choices or existing lesson authority by implication. |
| [Time Research in Google Drive](https://docs.google.com/document/d/1YhKspM4EAKzEIy9Jhl0huyuSTz-Bfdv1nli4NWEkjZg/edit) | Original August findings; newer dated October 11 analysis and research verification about planning, monitoring, estimates, support, and limitations | Already revised from Version 3's assumptions. Preserve the original dated research and its explicit limits. The specific design of a three-view calendar is a product requirement, **not** an experimentally validated claim by this research. No fabricated study or retroactive evidence is required. |
| [Resident Interface](https://github.com/ucitysocial/Universe-City/blob/main/docs/product/RESIDENT_INTERFACE.md) | Stable File/center/Agent shell; center displays selected folder or system | Founder now prefers **full-center Conversation or selected system, left File navigation, right decisions/context**. This conflicts with the earlier locked right-rail Agent. Retest in the founder preview and only then formally reconcile the interface spec. See #30. |

## 3. What Claude must prove in the calendar preview

1. Enter Time after Orientation. The empty or sparse calendar is visible and usable. The resident is not told to drag blocks in to begin.
2. Discuss an irregular work schedule with changing working days. The guide asks a relevant unanswered question rather than offering a generic choice of workflow.
3. Confirm one dated bar shift start at 3:00 PM while leaving its end unestablished. Day and week put the start at its known clock time, month puts it on the correct date, and none invents an end or duration.
4. A tentative shift time produces a pending/uncertain item rather than a confirmed time block. Screen approval and typed chat confirmation cannot create duplicate writes or falsely report Changed.
5. Select the entry in the calendar, inspect the maintained File information, original source statement, pending decisions and revisions.
6. Change the start through a permitted conversation action; all calendar views reflect it from the same record.
7. Change it through a permitted direct calendar edit; the same underlying record is updated under the same authorization and history rules.
8. Verify an overnight shift, another local timezone, overlapping commitments, and a date with only untimed obligations.
9. Check that the initial seven-day schedule and first Plan reach the operational conditions in `TIME.md` section 10 without inventing attendance, completion, or income.
10. Check mobile use and source/Activity continuity.

## 4. Explicit non-changes

- This review does **not** merge the founder's unverified code into production or declare it complete.
- It does **not** replace Curriculum Version 2's twelve questions, Start/Target options, or teaching layer.
- It does **not** rewrite or append unsupported evidence to Research.
- It does **not** change who can approve File entries, change a commitment, or authorize software action.
- It does **not** add a second calendar database or separate Schedule folder copy.
- It does **not** remove the planned Enrollment → Orientation → Time sequence or the three operational conditions in `TIME.md`.
- It does **not** replace the approved resident interface shell without a deliberate reconciliation of the founder's updated layout decision.

## 5. Pending follow-through

- Review the finished Claude preview against [calendar issue #29](https://github.com/ucitysocial/Universe-City/issues/29) and [shell issue #30](https://github.com/ucitysocial/Universe-City/issues/30), using the test cases above.
- Confirm the Drive Curriculum and Research as source copies, establish their canonical GitHub versions under the **existing five-document rule**, and close outdated status entries when approval is documented.
- Add to Developments when actual implementation ships, including the tested commit/branch and any scope left open.
- Merge the documentation PR after reviewing it alongside Claude's branch to avoid a conflicting simultaneous edit.
