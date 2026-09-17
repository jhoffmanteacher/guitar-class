# Work order — Teacher console: Class activities as a two-column board

*2026-09-16 · Website work · guitar-class repo · Claude Code (Sonnet)*
*Supersedes the "navigation fixes" work order drafted earlier the same day — that plan is dropped.*

## The idea

Replace the Class activities **table** with a **board**:

- **Left column — Built.** Every activity that has been pushed to the site but not yet placed for students. Newest-built first.
- **Right column — Assigned to students.** Activities Jonathan has dragged over, **grouped by module** and ordered by drag within each module. This is the order students see.
- Dragging a card from Built into a module section on the right assigns it. Dragging it back to Built un-assigns it.
- **Going live:** an activity shows to students only when it is assigned **and** published (a **Publish** button, or a scheduled date that has arrived) **and** not hidden **and** not archived.
- **Archive** old activities off the students' page without losing anything — completion is keyed to the id and is never touched.
- The `#N` prefix is the card's position in Assigned; it can also be typed directly on the card, which moves the card the same way a drag would.

## Assumptions Jonathan can flip (say so before STOP 1)

| # | Assumed | Alternative |
|---|---|---|
| A1 | **Confirmed.** Students' page gets the same module grouping, headers use the module names already on the website (EN/ES), in the board's order. | — |
| A2 | **Confirmed.** `#N` = position in Assigned, top to bottom across modules; also editable by typing on the card (Part 2). File `number` and old console renumbering retired. | — |
| A3 | **Confirmed.** First load auto-places every dated activity in **Unsorted** at the top of Assigned; Jonathan drags them into modules. | — |
| A4 | Archived cards drop out of the `#N` count, so later cards renumber down by one. Students keep every tick. | Archived cards keep their slot, leaving gaps in students' numbering (#3, #5, #6). |

## Read first

- `CLAUDE.md`, `WORKFLOW.md`
- `class-activities.js` header comment (ids, `number`, console renames / renumbering)
- `app.js`: `loadClassConfig()`, `caIsVisible()`, `caNumberMap()`, `caNumber()`, `caTitle()`, `renderClassActivities()`, `caFocusActivity()`, the "unfinished activities" reminder popup
- `teacher.js`: `renderTeacherActivities()`, `renderTeacherActivityDetail()`, `renderTeacherCheckDetail()`, `teacherSetActivityDate/Hidden/Title/Number()`, `teacherActivityNumbers()`, the delegated `click` / `change` / `keydown` listeners in `showTeacherApp`
- `tools/checks.mjs` ratchets 1d and 1l; `MODULE_MANIFEST` wherever it is defined (module numbers and titles for the section headers)
- `firestore.rules` — confirm `config/class` is teacher-write / student-read; no rule change should be needed
- `module-N.js` / `MODULE_MANIFEST` — where each module's display title and `title_es` live; the board headers must reuse those exact strings, never retyped

Record the base SHA (`git rev-parse HEAD`) before editing.

---

## Part 1 — Data model (`config/class.activityBoard`)

One new map on the existing config doc, nothing else new:

```
activityBoard: {
  [id]: { module: <int | 0>, pos: <int>, archived?: true }   // 0 = Unsorted
}
```

- An activity **is assigned** iff it has an entry. No entry = Built column.
- `module` is a number from `MODULE_MANIFEST`, or `0` for Unsorted.
- `pos` is 1..N within that module, kept contiguous by every write (whole-section rewrite on each move, same pattern as today's `teacherSetActivityNumber`; rows that don't change aren't re-sent).
- `archived: true` keeps the card assigned to its module but takes it off the students' page and out of the `#N` count (A4). Absent = not archived. Restore = `FieldValue.delete()` on just that key.
- Un-assign = `FieldValue.delete()` on that id, then re-pack the section it left. **Un-assigning does not clear the date or hidden flag** — those are independent, as now.
- **Publishing** reuses the date gate — no new field. **Publish now** writes today's date to `activityDates[id]`; the date input still schedules a future day; **Unpublish** deletes the date. Live for students = assigned ∧ date ≤ today ∧ not hidden ∧ not archived.
- **Progress is never written by anything here.** Student completion lives in `progress/{uid}.classActivities[id]`; ids never change; assign / un-assign / publish / archive / restore touch `config/class` only.
- All existing maps (`activityDates`, `hiddenActivities`, `activityTitles`) stay exactly as they are. `activityNumbers` is retired (Part 5) but never deleted from Firestore by code — leave any old rows in place, ignored.

### Ordering helper — `app.js`, exported plainly (teacher.js calls it too)

`caBoardOrder(activities, board)` → `{ sections: [{module, title, ids:[…]}], number: {id → 1..N} }`

- Sections in order: Unsorted (module 0) first if non-empty, then modules in `MODULE_MANIFEST` order, each only if it has cards.
- Within a section: by `pos`, tiebreak by shipped `number` (still in the file for now), then numeric part of the id. Never `localeCompare` on ids.
- `number` is assigned 1..N to non-check, non-archived cards in that reading order; checks (`kind === 'check'`) and archived cards get no number.
- Each section also returns its `archived: […]` ids (by `pos`) so the console can list them under the module.
- Activities with no board entry are not in the result at all.

### Migration (A3) — `teacher.js`, runs once
On the first render of the board when `cfg.activityBoard` is **undefined** (not merely empty): build entries for every activity with a date — `module: 0`, `pos` by date ascending then shipped `number` — and write them in one `set({activityBoard: …}, {merge:true})`. If `activityBoard` exists (even `{}`), never migrate again. Log one console line saying what was migrated.

> **STOP 1** — Confirm A1–A3, the field shape above, and which activities the migration would place, before writing any code past this point.

---

## Part 2 — Console board (`teacher.js`, replaces the table in `renderTeacherActivities`)

### Layout
- `#t-grid-container` renders `<div class="t-board">` with two `<section>`s side by side: `.t-board-built` (left, ~38% width) and `.t-board-assigned` (right, ~62%). Chromebook 1366×768 is the target; each column scrolls on its own so the page doesn't grow tall. At <900px the columns stack, Built on top — phone must not break but doesn't drive the design.
- Keep the existing "no activities yet" / "no student data yet" early-outs.
- The short note at the top: one line — `Drag a built activity into a module to assign it. It goes live for students on its release date.` — plus `<details class="tg-help"><summary>How this page works</summary>` with the fuller text (date gate, Hidden toggle, rename applies in both languages, copy-link, number inside a title is part of the name).

### Built column (left)
- Header `Built (N)`. Cards newest id first (numeric part of `ca-N` descending).
- Card: drag handle · title (with `Exit check ·` prefix for checks) · id in small grey · **Preview** button (opens the existing detail page via `openActivityDetail`) · an **Assign to ▾** `<select>` listing Unsorted + each module — the no-mouse way to assign; picking one appends the card at the end of that section.
- No date input, no visibility buttons here. If a Built card happens to carry a date or Hidden flag (leftover), show it as a small grey line, read-only.

### Assigned column (right)
- One `<div class="t-board-section" data-module="N">` per section, **including empty modules** (an empty module is a drop target). Header: `Module N — <title>` from `MODULE_MANIFEST`; `Unsorted` for module 0, shown only when non-empty. Collapsed/expanded state per section in a module-level object (not persisted).
- Card (same base style as Built): drag handle · **`#` box** (see below; none for checks) · title with ✎ rename (existing rename editor and behaviour) · id · publish controls · Visibility segment (existing Hidden toggle) · **Done** summary `done / total` with the existing "Who hasn't finished" disclosure · Copy link · Preview.
- **`#` box:** a 2-digit `<input class="t-board-num">` showing the card's `#N`. Typing a number and pressing Enter (or blurring) calls `teacherMoveActivityToNumber(id, n)`: resolve which section and `pos` the n-th non-check, non-archived slot is in the current reading order, then call the same `teacherMoveActivity` writer a drag uses. Out of range or unchanged → repaint cached, write nothing. Enter blurs the box (it isn't in a form), same idiom as the old number input.
- **Publish controls** on each card, driven by `activityDates[id]`:
  - No date: status `Not published` · **Publish now** button (writes today) · a date input labelled `or schedule` .
  - Date in the future: status `Scheduled <date>` · date input to change it · **Unpublish** (deletes the date).
  - Date ≤ today: status `Live` (or `Hidden` if the Hidden toggle is on) · date shown read-only · **Unpublish**.
  Publish now and Unpublish go through the existing `teacherSetActivityDate(id, value)` writer (`''` clears) — no new writer.
- Move controls on each card for keyboard/no-mouse: `▲` `▼` (within section), `Move to ▾` (change section, append at end), **Archive**, `Un-assign` (back to Built).
- **Archived cards** render inside their module in a collapsed `<details>` at the bottom of the section — `Archived (N)` — greyed, no `#`, no publish controls, with **Restore** (clears `archived`; card returns to its module at its old `pos`, re-packed) and Un-assign. Archiving never changes date, Hidden, or anything in `progress/`.

### Drag and drop
- HTML5 DnD on the cards (`draggable="true"`), delegated `dragstart` / `dragover` / `dragenter` / `drop` / `dragend` on the same stable shell the click listener uses. `dragover` must `preventDefault()`. Dragged id in a module-level `boardDragId`, not in `dataTransfer`.
- Drop targets: anywhere inside a `.t-board-section` (insert before the card under the cursor, or append if over the header/empty space) and anywhere inside `.t-board-built` (un-assign).
- Visual: `.t-board-dragging` (opacity .5) on the source card; a 2px accent `.t-board-drop-line` above/below the target card, or an accent outline on an empty section.
- Every drop calls **one writer** `teacherMoveActivity(id, module, pos)` (pos = null means append). Un-assign calls `teacherUnassignActivity(id)`; Archive/Restore call `teacherSetActivityArchived(id, bool)`. All: optimistic local update → Firestore write → on failure roll back and `alert`, same shape as the other writers → re-render fresh (not cached) after the write, same reason as today.
- No touch drag. The ▾ selects and ▲▼ cover touch and keyboard.

### Detail pages
`renderTeacherActivityDetail` / `renderTeacherCheckDetail` unchanged except: the header line shows the section (`Module 3 · #7`) instead of the old number note, and the check page's "Checks take no #number" sentence stays.

> **STOP 2** — Screenshot the board at 1366×768 with real data (before any drag) and wait for a go on the layout before wiring writers.

---

## Part 3 — Student side (`app.js`)

- `loadClassConfig()` reads `activityBoard` into a new global `activityBoard = {}` (reset on sign-out like the others).
- `caIsVisible(a)` adds two conditions: `activityBoard[a.id]` must exist and must not be `archived`. Date gate and Hidden gate unchanged. The reminder popup uses `caIsVisible`, so it follows automatically — verify.
- Archived activities: not rendered, but a student's `classActivities[id] === true` stays in their progress doc untouched, and `caFocusActivity` on an archived id falls through to the normal list (no error).
- `caNumber(a)` reads from `caBoardOrder(CLASS_ACTIVITIES, activityBoard).number` instead of `caNumberMap`. Rebuild the cached map only when `activityBoard` is replaced, same as the existing rebuild-on-replace note.
- `renderClassActivities()` (A1): iterate `caBoardOrder().sections`; for each section with at least one **visible** card, render a header using the **same module name string the site already shows** for that module (EN and `_es` from `MODULE_MANIFEST` / module data — read it, never retype it; Unsorted renders no header) and then the cards in section order. Visible-card filtering, card markup, expand/collapse, `caFocusActivity` deep links (`#class-activities/ca-N`) all unchanged.
- Spanish: any new student-facing string goes through the existing i18n mechanism with an `_es` twin. Draft the Spanish and ship it.

---

## Part 4 — Retire `number` / `activityNumbers` (A2)

- `teacher.js`: delete `teacherActivityNumbers()`, `teacherSetActivityNumber()`, the `.t-act-num-input` change/keydown branches, `activitySortKey/Dir`, `teacherSetActivitySort()`. Delete their CSS.
- `app.js`: `caNumberMap()` and the `activityNumbers` global/loader go; `caBoardOrder` replaces them. Search the whole repo for other callers first (`grep -n "caNumberMap\|activityNumbers\|teacherActivityNumbers"`), including `coach.js` and any tools.
- `class-activities.js`: keep the `number` field on existing entries **for this release** (it's the migration tiebreak); update the header comment: `number` is now only a legacy tiebreak, new activities may omit it, the board sets order. Remove the RENUMBERING FROM THE CONSOLE paragraph; replace with three lines describing the board.
- `tools/checks.mjs` 1d: stop requiring `number` and stop enforcing 1..N contiguity; keep id uniqueness, `title_es`/`intro_es`, no `date` field. 1l (series digits in titles) stays as is — it sorts by `number` today; change it to sort by numeric id and keep the "series digits read 1,2,3…" rule, since a series is authored in order.
- `CLAUDE.md`: one line under the activity rules — order and module placement live on the console board, not in the file.

---

## Guardrails

- `node tools/checks.mjs --skip-links` **exactly once**, at the end. Never hand-edit `sw.js`.
- No change to progress keys, module files, or anything under `img/`.
- No Firestore rule changes; if a write is refused, stop and report rather than editing `firestore.rules`.
- Firestore ids only ever land in `data-*` via `escAttr`, never in inline JS strings.
- Do not remove `activityNumbers` or `activityTitles` rows from Firestore.
- **Nothing in this work order reads or writes `progress/{uid}`.** If an implementation step seems to need it, stop and report.
- Module header strings come from the existing module data — one source, no duplicate copy in `teacher.js` or `app.js`.
- Presentation-first: the board is new console UI; the only student-facing changes are the assigned gate, the `#N` source, and module headers.

## Verification (Playwright, `?teacher=true`, `devBypass()` via `page.evaluate()`)

1. Fresh load with no `activityBoard`: migration writes dated activities into Unsorted in date order; a second load writes nothing.
2. Board renders at 1366×768; both columns scroll independently; Built is newest-id first.
3. Drag Built → Module 2: entry `{module:2,pos:N}` written; card appears with `#N`; Built count drops by one.
4. Drag within a module and between modules: `pos` stays 1..N in every touched section, untouched sections aren't rewritten.
5. Drag Assigned → Built: entry deleted, date and hidden flag preserved.
6. `Assign to ▾`, `Move to ▾`, `▲▼`, `Un-assign` all produce the same writes as the equivalent drag.
7. Student view: only assigned + dated-reached + not-hidden cards show; module headers appear in EN and ES; `#N` matches the console; `#class-activities/ca-N` deep link still opens and scrolls to the card; reminder popup counts only visible cards.
8. Exit check cards: no `#N` anywhere, detail page and results table unchanged.
9. `checks.mjs` passes; a test entry with no `number` passes 1d.
10. 390px: columns stack, nothing overflows horizontally.
11. `#` box: type `2` on the card at #6 → it moves to #2, others shift, writes identical to the equivalent drag; `0`, `99`, and the current number write nothing.
12. Publish now → `activityDates[id]` = today, student sees it immediately; Unpublish → key deleted, student no longer sees it; scheduling a future date shows `Scheduled` and stays hidden until then.
13. Progress preserved: as a test student, mark an activity complete; in the console archive it, then restore it; the student's tick is still there and the console Done count is unchanged. Repeat with un-assign → re-assign.
14. Archived card: not on the student page, not in the reminder popup, no `#N`; later cards renumber down (A4); module header still shows the site's module name in EN and ES.

> **STOP 3** — Before pushing: base SHA, files touched, checks.mjs output, verification 1–14 with screenshots. Push only on a go.

## Report back

- Base SHA · new SHA
- Files changed, one line each
- Migration result (which ids landed in Unsorted)
- Verification 1–14
- Anything deliberately not done and why
