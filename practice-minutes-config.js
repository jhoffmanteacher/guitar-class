/* ══════════════════════════════════════════════════════════════════════
   PRACTICE MINUTES — settings you can edit.   (2026-11-01)

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

  /* The weekly goal, in minutes, for a section's NORMAL week. A week with
     fewer class meetings gets a smaller goal: goal × (meetings this week ÷
     normal meetings for that section), rounded to whole seconds. */
  weeklyGoalMinutes: 30,

  /* The most minutes counted in one day. Playing past it does not count.
     ⚠ firestore.rules has the same number in seconds (DAILY_CAP_SECONDS,
     1200 = 20 minutes) and REJECTS a day above it. If you raise this, raise
     that number and re-publish the rules in the same push — checks.mjs (1cg)
     fails the push when the two disagree. */
  dailyCapMinutes: 20,

  /* Which weekdays each class period meets: Monday = 1 … Friday = 5. The keys
     are the period the student picked on the site ('4' = 4th, '7' = 7th,
     'CAS'). The length of each list is that section's "meetings in a normal
     week" (4th: 3, 7th: 5).
     ⚠ 4th period's three days are a GUESS (Mon / Wed / Fri). Only "3 a week"
     was specified. Put the real days here — "This week by day" on My progress
     draws bars for exactly these weekdays. */
  meetingDays: {
    '4': [1, 3, 5],
    '7': [1, 2, 3, 4, 5]
  },
  /* Used for a student with no period yet, or a period not listed above (CAS). */
  defaultMeetingDays: [1, 2, 3, 4, 5],

  /* Days with no school for anyone. A 'YYYY-MM-DD' string, or a
     ['first', 'last'] pair for a run of days (both included). A week whose
     meeting days are all listed here has zero meetings: it is SKIPPED — it
     neither counts as a hit nor breaks a streak.
     ⚠ PLACEHOLDERS. Check every line against the district calendar. */
  noSchool: [
    '2026-11-11',                       // Veterans Day
    ['2026-11-23', '2026-11-27'],       // Thanksgiving week
    ['2026-12-21', '2027-01-01'],       // Winter break
    '2027-01-18',                       // MLK Day
    '2027-02-15',                       // Presidents' Day
    ['2027-04-05', '2027-04-09']        // Spring break
  ],

  /* Short weeks where the meetings are fewer than the weekdays above minus
     noSchool (a half-day schedule, an assembly, a testing day). The listed
     number REPLACES the count for that week and period; the goal shrinks to
     match. Week ids are ISO weeks, Monday first: '2026-W47' starts Mon Nov 16.
       { week: '2026-W47', meetings: { '4': 2, '7': 4 } }
     Leave a period out to keep its normal count. */
  shortWeeks: [],

  /* The two semesters, for "one free missed week per semester". A week belongs
     to the semester that holds its Thursday.
     ⚠ PLACEHOLDERS. Put the real first and last day of each. */
  semesters: [
    { start: '2026-08-12', end: '2027-01-22' },
    { start: '2027-01-25', end: '2027-06-04' }
  ],

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
