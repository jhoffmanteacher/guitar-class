/* ══════════════════════════════════════════════════════════════════════
   PRACTICE MINUTES — settings you can edit.   (2026-11-01; simplified 2026-11-02)

   Read by practice-minutes.js, which counts the seconds a student spends
   playing a backing track (class-activity practice cards, Song Journey
   play-alongs, the Songs-page library). It is a visible, ungraded signal:
   nothing here feeds a grade. No page edits this file — change a number,
   run `node tools/checks.mjs`, push.

   Loaded as a plain script on index.html and on every tabs/*.html page,
   BEFORE practice-minutes.js. It defines one global, PRACTICE_MINUTES_CONFIG.
   practice-minutes.js fills in any key you delete with the default shown here.
   ══════════════════════════════════════════════════════════════════════ */
var PRACTICE_MINUTES_CONFIG = {

  /* THE SWITCH FOR EVERYTHING A STUDENT SEES. false = the site still counts
     minutes and writes them (so you gather two weeks of data first) but draws
     nothing: no status strip, no recap, no toast, nothing on My progress, and
     no live "N playing" lookups. true = all of it appears. */
  uiOn: false,

  /* The weekly goal, in minutes. It is FLAT: the same number in every counted
     week, for every student, whichever days they practise. (There is no
     per-section schedule and no proration.) */
  weeklyGoalMinutes: 30,

  /* The most minutes counted in one day. Playing past it does not count.
     ⚠ firestore.rules has the same number in seconds (dailyCapSeconds(),
     1200 = 20 minutes) and REJECTS a day above it. If you raise this, raise
     that number and re-publish the rules in the same push — checks.mjs (1cg)
     fails the push when the two disagree. */
  dailyCapMinutes: 20,

  /* Weeks that neither count nor break a streak (breaks). Each entry is the
     MONDAY of the week, 'YYYY-MM-DD' (checks.mjs fails a date that is not a
     Monday). Minutes played in a skipped week still add to the totals and show
     on My progress; they just are not held to the goal. */
  skipWeeks: [
    '2026-11-23',   // Thanksgiving
    '2026-12-21',   // winter break
    '2026-12-28',   // winter break
    '2027-02-15',   // mid-winter break
    '2027-04-12'    // spring break
  ],

  /* The first Monday of semester 2. Every student gets one free missed week per
     semester (the streak is kept, not extended); the free miss resets on this
     date. A week belongs to semester 2 when its Monday is on or after it.
     '' = one semester all year. */
  semester2Start: '2027-01-04',

  /* Weeks before this one never count toward a streak (an ISO week id such as
     '2026-W48'). Set it to the week you turn uiOn on, with the goal you want,
     so the streak starts fresh. '' = count from the student's first week. */
  streakStartWeek: '',

  /* ── Smaller knobs ── */
  liveMinCount: 3,        // hide "N playing" until at least this many are playing in the student's period
  recapMinSeconds: 60,    // a session shorter than this gets no recap
  recapGapSeconds: 180,   // at most one recap per this many seconds
  recapShowSeconds: 6,    // the recap closes itself after this long
  toastSeconds: 3         // the "week goal hit" pill stays this long
};
