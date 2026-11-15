/* ══════════════════════════════════════════════════════════════════════
   PRACTICE MINUTES — settings you can edit.   (2026-11-01; simplified the same day)

   Read by practice-minutes.js, which counts the seconds a student spends
   working on the site — modules, class activities, Song Journey pages, the
   Songs library, the tools: a click, key, scroll or touch in the last 2
   minutes, or something playing (a song, a sound, an open mic) with a click,
   key, scroll or touch in the last soundAloneMinutes (since 2026-11-15; any
   work since 2026-11-03; backing tracks only before). There is no daily
   limit (2026-11-15). It is a visible, ungraded signal:
   nothing here feeds a grade. No page edits this file — change a number,
   run `node tools/checks.mjs`, push.

   Loaded as a plain script on index.html and on every tabs/*.html page,
   BEFORE practice-minutes.js. It defines one global, PRACTICE_MINUTES_CONFIG.
   practice-minutes.js fills in any key you delete with the default shown here.
   ══════════════════════════════════════════════════════════════════════ */
var PRACTICE_MINUTES_CONFIG = {

  /* THE SWITCH FOR EVERYTHING A STUDENT SEES. false = the site still counts
     minutes and writes them (so you gather two weeks of data first) but draws
     nothing: no status strip, no recap, no toast, nothing on My progress.
     true = all of it appears. ("N playing" and its liveMinCount knob were removed 2026-11-04.)
     ON since 2026-11-01. (checks.mjs 1cg / tools/pm-sim.mjs pin this value: flip
     both together.) */
  uiOn: true,

  /* The weekly goal, in minutes. It is the same number in every counted week,
     for every student, whichever days they practise, unless the console sets
     another goal for ONE week (see "ONE WEEK ONLY" below). (There is no
     per-section schedule and no proration.) 60 since 2026-11-04 (30 before).
     checks.mjs 1cg fails a goal above 600 (the most the console's box takes
     too); tools/pm-sim.mjs and tools/pm-e2e.mjs pin this value: change them with it.
     ONE WEEK ONLY (2026-11-09): the console's Practice minutes view has a "This week's
     goal (minutes)" box. It sets another goal, or 0 for a break, for the current week
     and nothing else; it is kept in config/class.pmWeekGoals, never in this file, and
     the week after it this number applies again. A skipWeeks entry below beats it. */
  weeklyGoalMinutes: 60,

  /* NO DAILY LIMIT (2026-11-15, Jonathan: "remove the 20 minute a day limit. it
     should be actual minutes"; it was dailyCapMinutes: 20). Every minute of work
     counts. What keeps a song left looping in an empty room from counting all day
     is this window: something playing on its own (a backing track, a practice
     card, a Journey page's player, the metronome, an open mic) counts only while
     the student clicked, pressed a key, scrolled or touched the screen in the
     last soundAloneMinutes. A student plays guitar along with a 3 to 6 minute
     track without touching the Chromebook, so the window must be longer than a
     song; a track left looping alone adds at most this many minutes. Work with
     no sound keeps the 2-minute window (practice-minutes.js, ACTIVE_MS). */
  soundAloneMinutes: 10,

  /* NOT A LIMIT: the most one day's record can hold, 24 hours, a guard against
     a hand-written number. ⚠ firestore.rules has the same number in seconds
     (dayCeilingSeconds(), 86400) and refuses a day above it (a week: 7 x it).
     checks.mjs (1cg) fails the push when the two disagree. Leave it at 1440. */
  dayCeilingMinutes: 1440,

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
  streakStartWeek: '2026-W45',   // the first full week with the display on (Mon 2026-11-02): streaks start here

  /* TOP 5 (2026-11-04). The students with the most practice minutes THIS week
     (Monday to Sunday), ranked inside their own class period, get a "TOP 5" medal
     in the strip and on My progress. Each student sees only their own place.
     Ties share a place. A student needs at least this many minutes this week to
     be ranked at all, so Monday morning is not a giveaway. 0 = no minimum.
     (checks.mjs 1cg wants a number from 0 to the weekly goal.) */
  top5MinMinutes: 10,

  /* ── Smaller knobs ── */
  recapMinSeconds: 60,    // a session shorter than this gets no recap
  recapGapSeconds: 180,   // at most one recap per this many seconds
  recapShowSeconds: 6,    // the recap closes itself after this long
  toastSeconds: 3         // the "week goal hit" pill stays this long
};
