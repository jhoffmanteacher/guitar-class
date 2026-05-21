# TODO — Future Functional Ideas

Two ideas from the "compare to popular guitar sites" review. Both fit the existing Firebase/Firestore setup.

---

## 1. Practice session logging

**What it is:** The site has a practice timer but doesn't record anything. Yousician, JustinGuitar Practice Assistant, and Fender Play all track cumulative practice time and streaks. Adding a "Log this session" button on the timer popup that writes the duration + current set to Firestore would give:

- **Students:** a visible total / streak to motivate consistency
- **You:** a column in the teacher dashboard showing actual minutes practiced per student, not just self-reported skill checks

**Rough scope:**
- New Firestore collection: `practice_sessions` with `{userId, setId, durationSec, timestamp}`
- "Log session" button appears on the timer when timer hits 0 (or any time, manually)
- Teacher dashboard gets a new column: "Practice this week (min)"
- Optional: student streak indicator near the user avatar

**Why it's high-value:** lets you spot students who self-report "Got it" without putting in time, and rewards students who do practice but struggle with the skill self-assessment.

---

## 2. Student performance submission (link-based)

**What it is:** Current assessment is self-check or whole-class observation. Sites like ArtistWorks and Noteflight let students submit recordings for feedback. You don't need to build audio recording — a simple "Submit your performance" field per set where students paste a YouTube unlisted link or Google Drive link would let you review individual playing outside class time.

**Rough scope:**
- Add an optional "Performance link" field to each set's checklist (alongside the skill rows)
- Save link string to Firestore: `progress/{userId}.performances.{setId} = url`
- Teacher dashboard: show a "▶ View" link next to each student's row when they've submitted
- Optional: status field ("Submitted" / "Teacher reviewed")

**Why it's high-value:** scales individual assessment to a class of 30+ without building audio recording infrastructure. Also makes "I've got it!" more accountable — there's evidence.

---

## Notes for Claude

When picking these up later: both are smaller than they look. The Firebase infra is already in place — these are mostly UI additions + one new Firestore field each. The chord diagram work (already shipped) is the bigger architectural change of the three.
