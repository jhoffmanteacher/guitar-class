# REMOVE_WEEK_REFS.md — Strip week numbers from student-facing copy

> **Status:** ✅ DONE 2026-07-07. All three edits applied to `module-5.js`,
> `grep -rinE "week [0-9]+"` over `*.js`/`*.html` returns zero, checks passed,
> pushed. Archived for the record.

> **Purpose:** The website is fully self-paced — pacing lives in the map and
> the classroom, not on the site. A repo-wide grep (2026-07-07, chat-side)
> found exactly three week references in student-facing files, all in
> `module-5.js`. Remove them. Approved by Jonathan in chat; wording below is
> final — paste as written.
>
> **Rules:** verbatim-paste — if the live "Current" text differs from what's
> quoted below, flag it, don't silently fix. No `skills:` changes, no
> `skillCount` changes. Run `node tools/checks.mjs` before pushing. Live
> Server check with Jonathan → push → ✅ note in WORKFLOW.md → move this file
> to `archive/`.

## Edit 1 — Step title (~L831)

**Current:** `title: 'Week 17 — Call & Response over a backing track',`
**New:** `title: 'Call & Response over a backing track',`

## Edit 2 — Step text parenthetical (~L834)

In the Challenge text, change **only** the parenthetical:

**Current:** `Challenge — Call & Response (your Week 17 check piece): open Module 4 and pick any core-song backing track`
**New:** `Challenge — Call & Response (your semester-wrap check piece): open Module 4 and pick any core-song backing track`

Everything after that phrase is unchanged.

## Edit 3 — Seven Nation Army meta tag (~L619)

**Current:** `meta: '◐ optional stretch · D–A–Em strummed adaptation (Week 16)'`
**New:** `meta: '◐ optional stretch · D–A–Em strummed adaptation'`

## Verify

After the edits, `grep -rinE "week [0-9]+" --include="*.js" --include="*.html" .`
should return **zero** hits (planning `.md` docs will still match — that's
fine, they're not student-facing).

## Changelog

If pushing the same day as the SITE_ALIGNMENT_3 work, fold one line into that
entry's **Changed** list; otherwise a new dated entry:

> - **Week numbers are gone from the site** — the Call & Response step and
>   one song tag now say "semester wrap" instead. Your pace is your pace;
>   the class calendar lives in class.
