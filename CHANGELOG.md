# Changelog

Notable changes to the Guitar Class site. Newest first.

For the full session-by-session history (and the reasoning behind each change),
see `WORKFLOW.md` and the git commit log.

## 2026-08-20 — In-class activities are numbered in teaching order

### Changed

- **Activity numbers now follow the order you'll be taught them**, not the
  order they were written. "Happy Birthday — First Notes" is now **#1** and
  "Playing Happy Birthday — Practice" is **#2**, with the six Finger Gyms
  following as #3–#8. Your finished check-marks are untouched — an activity
  keeps its own permanent id behind the scenes, so only the number you see
  changed.

## 2026-08-19 — A new in-class activity, and a way back from the Mood Chart

### Added

- **"Happy Birthday — First Notes" in-class activity**, scheduled for
  2026-08-24 — your first time pressing a string down. Everything stays on
  the low E string: find fret 5 by the dot, land on it cleanly, play the
  "Hap-py birth-day" chunk, then the whole first line, and finish by
  climbing the BPM as far as it'll go. Like every in-class activity, it
  stays invisible until its day is scheduled from the teacher console.
- **A "Back to class site" link at the top of the Mood Chart.** The chart opens
  in its own tab, so the browser's Back button had nothing to go back to. The
  link returns you to the class site — and if the tab you came from is still
  open, it hops you straight back to it instead of loading a second copy.

## 2026-08-16 — A Mood Chart in the side menu

### Added

- **New "Mood Chart" link in the Explore menu** — opens a reference page that
  maps six moods (Peaceful, Inspiring, Joyful, Sorrowful, Dark, Aggressive) to
  the musical choices that create them: dynamics, tempo, rhythm, and texture.
  Tap any word for a plain-English definition, and rhythm words include a
  song to hear it in. Opens in a new tab so your place in the module stays put.

## 2026-08-13 — The module assessment says hello when you open the review

### Added

- **Opening a Module Review now pops up a short heads-up about that module's
  assessment** — what you'll be asked to play for your teacher, listed out.
  Close it with "Got it" and keep scrolling — the assessment box itself
  hasn't moved. It's still at
  the bottom of the review page with the practice-run recorder, exactly where
  it has always been. The pop-up appears every time you open a review page
  that's unlocked, so the assessment is never a surprise.

## 2026-08-09 — Module 7 tidy-up: the last challenge gets its number

### Changed

- **The F# and Bb barre challenge is now "Challenge 5"** — it was the only
  challenge in the module without a number.
- **The chili on the Sweet Child O' Mine level-up card is now a drawn icon**
  matching the rest of the site's icon style, instead of a phone-style emoji
  that looked different depending on the device.

## 2026-08-09 — "Pick up where you left off"

### Added

- **A new card at the top of the practice page shows exactly where you
  stopped last time** — the station you were working through in your current
  set (with how many steps are done) and the Song Journey you touched most
  recently (with how many layers you've marked ready). One tap on Continue
  or Open takes you straight there, so you can get playing without hunting
  for your spot. The × hides it until next time; brand-new students won't
  see it until there's something to come back to.

## 2026-08-09 — Fixes from a full-site error sweep

### Fixed

- **Two Module 10 steps now check off the right skill.** "Why 'Luna's solo is
  in D minor" and the "Smoke on the Water" challenge were quietly crediting a
  different skill than the one they actually teach — fixed, no change to what
  you read or do.
- **A Module 11 quiz now checks off A-shape barre chords, not E-shape.** The
  "Watch: A-shape barre chords" step's quiz was crediting the wrong skill.
- **Fret labels read correctly in Spanish again.** Chord-diagram tooltips like
  "traste 6.º" were showing the plain number ("traste 6") instead.
- **The Listening Coach's "Good" rating can appear again on short drills.**
  A scoring bug made it skip straight from "Needs work" to "Great" on drills
  with only two graded criteria — you'd never see "Good" in between.
- **Strum Hero and Strum Radar now track your best per pattern, not overall.**
  A genuine new best on a harder pattern could get silently ignored — and miss
  its XP bonus — if an easier pattern already scored higher.
- **The Finger Gym "circuit" activities now read as a checklist**, not one
  run-on paragraph, so the steps are easier to follow mid-workout.

## 2026-08-07 — Clearer Modules 7–12 after a student walkthrough

### Removed

- **"Tu Boda" has been taken off the site.** It was a Choice song in Modules 6,
  7, 8 and 12, and Module 12 had a challenge and a skill built on its requinto
  intro line. The lyrics aren't appropriate for class, so the song, its videos,
  and everything built on it are gone.

### Fixed

- **The Songs page now describes every song in Spanish.** In Español mode the
  song descriptions on the "All the songs" page stayed in English even though
  the Spanish was already written — every song, not just the new ones. They now
  switch with the rest of the page.
- **The Songs page fits on a phone in Spanish.** The six core songs' buttons ran
  off the right edge of the screen, because "Recorrido de la canción" is much
  wider than "Song Journey". They now wrap onto a second line instead.
- **Song titles no longer disappear in a module's Songs list on a phone.** On a
  narrow screen the buttons squeezed the title out entirely — some rows showed
  nothing but buttons — and still ran off the edge. Title, description, buttons
  and label now stack, so you can read every row. Both languages.
- **The song labels are in Spanish too** — Core, Choice, Focus and Supp now read
  Básica, A elección, Destacada and Complementaria, in both the Songs page and each
  module's own song list.

### Added

- **New sierreño song: "Está Dañada" — Iván Cornejo.** It takes the slot the
  removed song left, in Modules 6, 7, 8 and 12. Module 12's requinto challenge
  is back with this song's intro line — a fingerpicked melody that slides
  between notes on the thin strings, the same technique, on a song about
  heartbreak rather than anything you'd have to think twice about.

### Changed

- **One name for the song you perform: your "performance song."** Module 12 used
  to call it your "showcase song," which made it sound like a different
  assignment from the one Modules 8 and 11 talk about. It's the same song, so
  it now has the same name everywhere (*canción de interpretación* in Spanish).
- **Module 5 no longer asks you to have a performance song picked.** Choosing
  that song is Module 12's job. Module 5's planning and pressure-point cards now
  just say "the song you're working on," so you're not being asked to commit to
  a piece six modules early.
- **Module 5 talks about the assessment instead of "a performance."** The
  practice-planning section is now just "Plan your practice," and the full-run
  challenge says a mistake in *a full run* is one you play through — same
  advice, without implying there's a performance coming that isn't on your
  calendar. The one thing you're actually working toward in Module 5 is the
  assessment, so that's what the cards name.

- **Module 7 no longer sends you to a specific TAB website.** The school
  Chromebook filter blocks them, so the cards now tell you what to look for —
  the rhythm stem marks above the numbers — instead of naming a site you can't
  reach. Finding a TAB online is still the skill; you just pick where.

- **The "write Seven Nation Army in TAB" challenge (Module 9) no longer shows
  you the answer** — the example in the answer box is now a different riff, so
  it shows you the format instead of handing you the notes.
- **"Spot the Power Chord" (Module 7) no longer says you already built F** —
  you build the barre at the 5th fret first, so the card now points forward to
  the F you're about to make.
- **"the cure" now shows up in Module 8's Song Journey links** — both
  fingerpicking challenges link straight to its Journey page, and each Set says
  which layer of the song it grows.
- **Module 8's 6/8 challenge doesn't overclaim any more** — it names the 6/8
  pulse as the one you've felt in "Luna" since Module 2, just counted out note
  by note this time.
- **Module 12's Station B wrap-ups now ask something different from Station C** —
  B asks you to explain the idea in your own words, C keeps the practical note
  you'll want written down.
- **Module 12's first wrap-up tells you there's more below**, so you don't stop
  early.
- **The "Luna" full-barre challenge (Module 7) now shows the F chord diagram**
  and counts toward its skill check-off.
- Smaller wording fixes: the Module 10 "the cure" hint credits the right module
  for the chord names, the Module 9 Sweet Child skill matches the four notes the
  challenge actually asks for, and Module 11's Spanish now says
  "canción de presentación" like the rest of the site.

## 2026-08-06 — Strings called by name everywhere, clearer Modules 1–6 after a student walkthrough

### Changed

- **Strings are now always called by their names** — low E, A, D, G, B, high e
  (Mi grave … mi aguda in Spanish) — instead of "string 6" / "string 1", across
  every module. You no longer need to know the numbering convention to follow a
  hands-on instruction like "vibrato on the 5th fret of the high e string." The
  only numbers left are in the two Module 7 questions that teach how chord
  charts count strings, and each one now says which string the number means.
- **Watchtower's "real rhythm" challenge (Module 4) is now an ear challenge** —
  instead of going off to find a TAB with rhythm stems, you count along with the
  record and catch where each chord lands: in the verses the G sneaks in on
  beat 4, and in the chorus the changes come on beat 3 (the two-beats-per-chord
  version you already know from Module 3). The play button now plays the verse
  rhythm.
- **The Dm chord (Module 5) is now taught on its own** — the hint walks the
  actual shape (a small triangle on the top three strings) instead of comparing
  it to D major, which you only meet in the next Set.
- **One tempo ladder for Module 3's chord changes:** the skill check-off is
  60 BPM, the Module Review keeps 60 (changes) and 80 (hold), and the
  assessment is 80 BPM held for 15 seconds — three steps up, no more mixed
  numbers.
- **Every Module 5 practice station now starts with the tuning warm-up**, same
  as Modules 4 and 6 — Sets 2, 3, and 4 had been skipping the ritual.
- **Clearer first steps in Modules 1 and 2:** Module 2's first video question
  now asks about the open strings the video actually covers; the "what comes
  after G?" question says "in the musical alphabet" so G# doesn't trick you;
  the note-chart steps now show the fret-by-fret note map right in the step;
  and Module 1's "first fretted note" no longer pretends the riff preview
  didn't happen.
- **The Tuner and Metronome directions now say where the tools actually live**
  — at the bottom of the left menu (behind ☰ on a phone) — instead of "the
  corner button."
- **The header now fits on phones** — one compact row instead of a tall
  stack of wrapped text under overlapping buttons.
- **The menu's Station B label now matches the station you land on.** It used
  to always read "Watch · Listen · Practice," even on the two sets that call
  themselves something else — Module 1 Set 1 is "Watch · Listen · Reflect"
  (there's nothing to play yet in that set) and Module 9 Set 1 is "Where do I
  start?". The menu now says whatever the set says, in both languages.
- Small fixes from the same walkthrough: the G/B card explains why the diagram
  ✕'s the low E while your finger stays planted; Sweet Child's level-up points
  to Set 2 (where the down-up strum lives); a Module 6 strum-pattern answer
  choice no longer miscounts the strums; the Module 4 scale-degree warm-up
  explains what "♭3" means on the spot; the Finger Gym stretch no longer
  claims to be the power-chord shape; and Module 1's assessment no longer
  grades a wrist technique the module never taught.

## 2026-08-05 — Readiness checkboxes replace ratings, floating backing-track button

### Changed

- **Song Journey layers now use a simple "I'm ready for the next layer"
  checkbox** instead of the old 1–3 rating buttons. Checking a box shows a
  concrete "Check it when: …" bar (the old top rating level), checks off the
  layer's header ✓, and opens the next layer for you automatically —
  checking the last graded layer opens the bonus layer as your reward.
  Unchecking just clears the checkmark; it doesn't move you anywhere. The
  progress pill now reads "N of 5 layers ready."
- **Returning to a Song Journey page picks up where you left off** — a
  signed-in student who hasn't clicked anything yet opens straight to their
  first un-checked layer (still scrolled to the top of the page). A link to
  a specific layer still wins over that.
- **A new floating "Backing track" button** sits above the Tuner on every
  Song Journey page, so you can start or stop the play-along track from
  anywhere on the page without scrolling back up to the top box (which
  still works too, and still has the Slow/Metronome toggles). On "Sweet
  Child O' Mine" it's labeled "Jam loop" to match the top button.
- The top play-along button's label is now "backing track" instead of "jam
  loop" on the songs that already called it that everywhere else (Watchtower,
  Let It Be, Luna, "the cure") — just a wording match, nothing else changed.

## 2026-08-05 — Solo-layer ladders, bonus layers stop asking for a rating

### Changed

- **Every Song Journey's Pentatonic Solo layer is now a numbered ladder** —
  Rule of 3, the whole box, dress-ups, and licks show as always-visible
  numbered steps instead of a flat pile of "Level up" folds, so the skill
  order is visible at a glance. "All Along the Watchtower" has three rungs
  (no dress-ups step); the other five songs have four. Each rung's rating
  hint now names the actual skill instead of a generic "getting started /
  steady / solid."
- **Bonus layers no longer ask for a rating** — the slide solo, Hendrix
  lead, intro riff, requinto parts, and fingerpicked verses are optional
  extra credit with no score, so their rating row and header checkmark are
  gone. The progress pill now counts only the five graded layers ("N of 5
  layers rated") on every page.
- Every layer's rating hint got more specific across all six pages — e.g.
  Listen's key now reads "heard it once through / answered the questions /
  can hum the main hook from memory" instead of the generic three-tier text.
- Song Journey pages are a bit wider (760px) to fit the new ladder layout.

### Fixed

- A couple of "Level up" pointers to Module challenges were sitting below
  all the layers, easy to miss — they now live inside the layer they point
  from, as a "Next:" line.
- Two pages said their practice layers were "above" the play-along track
  when the track sits at the top of the page — fixed to "below."

## 2026-08-05 — Fingerpicking completions and a deeper Watchtower page

### Added

- **"Let It Be" and "the cure" verse fingerpicking, completed** — chord
  diagram cards for every verse chord (C · G · Am · F for Let It Be, Am ·
  C · Dm · F for "the cure"), each captioned with the thumb note it starts
  on, plus a bar-by-bar tab walking the whole verse chord by chord. "the
  cure"'s caption notes the record actually changes chords twice as fast
  as the tab shows.
- **"Luna" Requinto Intro gets its chord card** — the little F shape now
  shows right on the page, captioned "hold it — the high e stays open."
- **"All Along the Watchtower" page goes much deeper**:
  - A new "The Story" stop above Layer 1 — the song's history plus a
    six-item listening map for what to notice, so it's there without
    being one more layer to check off.
  - A song anatomy roadmap showing the six sections, what the guitar
    does in each, and which layer teaches it.
  - Two Hendrix-style licks — a roll-down and a slide-in.
  - The lead layer expands to three parts: the verse answer phrase
    (already on the site), a new entrance slide-in, and a climb-and-fall
    to close it out.

## 2026-08-05 — "Luna" requinto definition and full bridge lead

### Added

- **"Luna" Layer 7 expanded to the whole lead in four parts** — Part A keeps
  the low chord-shape answers; new Parts B–D teach the bridge lead up the
  neck: the fret-12 slide phrase (E–F an octave up), the fret-17 drumroll
  and 18–13–12 fall, and the whole bridge doubled in sierreño sixths on the
  G string (double stops, pick + middle finger). Per-part Play it lines,
  high-fret and slide tips added to the Stuck? fold, and the Level up
  arrangement now walks the full song shape.

### Fixed

- **Requinto is now defined before it's used** — a one-line definition sits
  in the always-visible song map, above Layer 1's "what does the requinto
  add" question; it was previously only inside the collapsed "More about
  this song" fold. First mention in the journey note de-jargoned to "main
  lead line," and the fold's now-redundant parenthetical trimmed. Both
  languages.

## 2026-08-05 — Bonus lead layers and chord cards for the rest of the Song Journeys

### Added

- **"Sweet Child O' Mine" Layer 6 — The Intro Riff** — a teaching
  arrangement of the famous opening riff, built inside the same fret
  zone Layer 4 already taught.
- **"Seven Nation Army" Layer 6 — The Slide Solo** — the main riff
  played an octave up on the high e string, showing how the same
  shape moves around the neck.
- **"Let It Be" Layer 7 — The Solo** — an original lead phrase over
  the song's chord loop: a rising question answered by the "let it
  be" melody, with a sing-it-first tip in the Stuck? fold.
- **Chord diagram cards** added to Sweet Child O' Mine, Seven Nation
  Army, Let It Be, and "the cure" — open chords now show right on the
  page instead of just in the tab.

### Fixed

- **Measure bars** added to the bass and power-chord tabs on Watchtower,
  Sweet Child O' Mine, Seven Nation Army, Let It Be, and "the cure" —
  each riff and loop is now marked off bar by bar so it's easier to
  count along, including "the cure"'s short 2-beat turnaround bar.

## 2026-08-05 — Luna: requinto lead bonus layer + bass tab fix

### Added

- **"Luna" Layer 7 — Requinto Lead** — a second bonus layer that teaches
  a simplified requinto lead line. Students hold the little F and Am
  shapes and pick single notes out of them; every note of the lead sits
  inside a shape they already know. Open-chord diagrams (F, Am, Dm) are
  displayed right in the layer, rendered live from guitar-diagrams.js —
  the first journey page to do so, and the model for adding lead parts
  and chord diagrams to the other song journeys.

### Fixed

- **"Luna" harmonic rhythm** — the song sits two bars per chord, so the
  Layer 2 bass tab is now a four-bar loop (F, F, A, A — one pluck at the
  start of each bar), the Layer 5 vamp reads | F | F | Am | Am |, and
  the Layer 3 power-chord instructions say "changing every two bars."
  Captions and surrounding text updated to match, EN + ES.

## 2026-08-05 — Five more Finger Gym in-class activities

### Added

- **Finger Gym 2 through Finger Gym 6** — the same Ladder/Spider/Reach
  events, each day adding one new demand: descending and all six strings,
  position shifts up the neck (5th and 9th), fingers staying planted,
  string skipping and a wider reach, and a final stamina day with a
  personal-record attempt. Like every in-class activity now, each one
  stays invisible until its day is scheduled from the teacher console.

## 2026-08-05 — Pre-deployment content sweep

### Fixed

- A couple of practice cards in Modules 5 and 9 had an extra instruction
  tacked on as plain text instead of being part of the numbered steps —
  now it's step 3 like it should be.
- Two Module 7 barre-chord challenge cards had explanation text sitting
  between the steps and the "you've got it when," which broke the
  list-only layout those cards are supposed to have. Reworded so the
  explanation leads in and the steps stay a clean list.
- The Module 9 song list said "Luna"'s picked intro line crosses three
  strings — it's actually four (D, G, B, and open high e), matching the
  lesson itself.
- A Module 9 mastery check asked you to name a note that the same
  lesson explicitly calls a "sneak preview" you're not expected to know
  yet — reworded so the bar matches what's actually taught.
- Module 13's "Anchored" skill only described the classical-guitar tie
  block method, even though the same lesson also teaches bridge-pin
  anchoring for steel-string guitars. Now it covers both, like the
  "Wound" skill next to it already did.

## 2026-08-04 — In-class activities stay hidden until their date

### Changed

- **An in-class activity no longer shows up on the site until its lesson
  date arrives.** Before, pushing an activity made it visible to everyone
  right away, even if the lesson was weeks out. Now it appears — and shows
  up in the "unfinished activities" reminder — starting on its own date.
  Teachers still see every activity, including upcoming ones, in the Class
  activities view, and can still hide/unhide anything by hand.

## 2026-08-04 — New in-class activity: Finger Gym

### Added

- **"Finger Gym" in-class activity**, running 2026-09-15 — three finger-strength
  events in the first five frets (the Ladder, the Spider, the Reach), ending in
  a BPM personal-record circuit. Companion to the in-class Finger Gym deck.

## 2026-08-04 — Module 13: restring process updates

### Changed

- **The Takamine nylon-restring video now jumps straight to 2:15**, past the
  intro, to the actual restring steps.
- **Dropped the steel-string change video** from the "Watch the full process"
  section — one fewer video to sit through.
- **"Free it at the bridge" now covers tied nylon strings, not just ball-end**
  — if your string ties on with a knot instead of a ball end, there's a step
  for untying it (and a tip for a stuck knot) alongside the ball-end and
  steel bridge-pin instructions.

### Added

- **A new sketch panel for "Coil and toss"** — shows coiling the old string
  and binning it, matching the other step panels.

## 2026-08-04 — Module 13: "finished in time" wording matches the rubric

### Changed

- **Module 13's "finished in time" step now says "at least four strings
  done"** instead of "all six" — matching what the grading rubric actually
  requires for full credit. Getting all six strings on in 40 minutes still
  earns the top score; that's called out explicitly in the wording now.

## 2026-08-04 — Fixed a blank image when offline

### Fixed

- The strumming-pendulum picture in Modules 5 and 6 wasn't saved for offline
  use, so it could show up blank without an internet connection. Fixed.

## 2026-08-04 — Modules now unlock in order

### Added

- **Each module's first set now stays locked until you finish the module
  before it** — every set, plus its Module Review. You can still look ahead:
  pick a locked module from the Module dropdown and its first set opens in a
  read-only preview, with a banner naming what to finish first. Nothing you've
  already done gets re-locked. Module 13 (Changing Your Strings) is unaffected
  — it's always open.

## 2026-08-04 — Module 9: the last two paper drills go digital

### Changed

- **Module 9's "Write Seven Nation Army from memory" and its day-later
  cold-read now use a text box in the app** instead of asking you to write
  TAB on paper — type your riff in Challenge 2, then reopen it for Challenge
  4 and play back exactly what you typed.
- **Two Module 5 hints that compared the chord decks to paper flashcards**
  got trimmed — the decks never needed the comparison, and it was confusing
  students who never used paper flashcards here in the first place.
- **The "space out TAB rhythm" step in Module 9 no longer mentions paper**
  — same quiz, just reworded.

### Added

- **A new optional level-up deck for Module 9's naturals flash drill** —
  deal it right after the base drill for a harder version that mixes in F#
  and Bb, instead of just dropping the time limit.

## 2026-08-04 — Small-patches bundle: Sweet Child labels, a tempo target, wording polish

### Changed

- **Sweet Child O' Mine's power-chord challenge is now labeled
  "Intro/Verse/Chorus"** instead of just "Verse" — the D5–C5–G5 chords you're
  practicing there show up in more than one part of the song, so the label
  (and the song list's chip) now says so.
- **Module 3's beat-1 power-chord tempo target moved from 60 BPM to 70 BPM**
  — the old "70+ is an optional harder challenge" note is gone since 70 is
  just the target now.
- **The Am↔Em one-minute-changes card now says "16 is a good result for your
  first day on chords"** instead of "Over 20."
- **A "Luna" fingerprint got added to one Module 3 challenge's label**
  ("F5 ↔ A5 Two-Shape Drill") — it's Luna's vamp, but the label didn't say
  so before.
- **The Module Review "Perform a song" prompt reads a little more naturally**
  in both languages.
- **The "You've got it when" label in the skills checklist** now uses the
  same bold green style as the one on step cards, so the two match side by
  side.

### Removed

- **A few leftover "grab a friend" lines are gone** — two optional Ear Spark
  bonuses (Modules 6 and 7) and a Module 4 Level-up still asked for a
  practice partner; the site's been solo-first since last year, so those
  didn't belong.

## 2026-08-04 — Peek at a locked set before you unlock it

### Added

- **Tapping a locked set now opens a read-only preview** instead of just a
  "finish the set before this one first" message. You can read through the
  lesson, watch the videos, and try the practice drills — a banner at the top
  reminds you what to finish first, and nothing you do there gets checked off
  or saved until you actually unlock it for real. Sets that aren't built yet
  still just say so, same as before.

## 2026-08-01 — Website tour for new students

### Added

- **A guided tour of the site, at `/tour.html`** — thirteen screens, in English
  and Spanish, walking a brand-new student through the whole website using real
  pictures of it: signing in, finding the menu, how modules and sets unlock,
  the Station B → Station C → checklist path, marking skills honestly, the
  Listening Coach, Songs, the games and review tools, and the Find and Español
  buttons. It ends with four quick questions so students can check they know
  their way around. Meant for the first day of class; it stands on its own and
  isn't linked from inside the site, so it can be handed out as a link.

## 2026-08-01 — Fairer quiz choices, and guardrails so these errors stay fixed

### Removed

- **"Ode to Joy" is gone from the site** — both the Module 1 song choice
  (its tutorial video didn't match what the card promised) and the Module 2
  TAB-reading option. That Module 2 step now features "Mary Had a Little
  Lamb" as its song.

### Fixed

- **No more guessing the quiz answer by length.** Fifteen more questions
  (across Modules 1–6, 11 and 12, in English and Spanish) had a right answer
  that was noticeably the longest choice. The choices are rebalanced — mostly
  by giving a wrong answer the same level of detail — so you have to know the
  material, not the pattern.
- **Module 11's Spanish chord-family video label** now says where the video
  really starts (0:41, past the intro), matching where the link takes you.

### Changed

- Behind the scenes, the site's pre-publish checks now catch all three of
  these error families automatically — answer-length giveaways, video labels
  that disagree with where the link starts, and lesson links whose text no
  longer matches the video's real title — so they can't quietly come back.

## 2026-08-01 — Error-sweep fixes: video times, Luna facts, arcade polish

### Fixed

- **Nineteen more video cards now say where the video really starts.** An
  earlier round of intro-skips added start times to some links without
  updating the "(0:00–4:00)" labels next to them, so the card promised the
  video from the top but the link jumped in partway. Labels now match the
  links. Five links whose jump-in point looked auto-generated and wrong
  (they skipped past a minute or more of actual teaching) go back to
  starting at 0:00.
- **Two video titles corrected** to match what the video is actually called
  on YouTube (the Module 5 Em & Asus2 lesson and the Module 6 strumming
  lesson).
- **Luna's Dm now taught the same everywhere.** Module 5 still said the
  passing Dm lands "near the end of the verse and in the closing bridge";
  the Song Journey page had already been corrected to its one appearance in
  the song's opening lines. Module 5 now agrees, in both languages.
- **Fairer quizzes in Spanish.** Five questions where the right answer was
  still noticeably the longest choice in Spanish (but not in English) got
  rebalanced Spanish choices.
- **Build-a-Chord polish:** the circle above a string now reads like a real
  chord diagram (O only when the string is open — nothing above a fretted
  string), a fast double-tap on "Check my chord" no longer costs two misses,
  the streak flame updates the moment you earn it, and the grid works
  properly with a keyboard and screen reader.
- **Pattern Detective's clicks and strums** are now scheduled on the audio
  clock, so a slow computer can't smear the timing you're being asked to
  judge.
- **Chord Blitz's "Open chords" deck now includes B7**, matching
  Build-a-Chord's "All open chords" deck.
- **The Spanish arcade now says "Acordes de potencia"** for the power-chord
  deck instead of the untranslated "Power chords".

## 2026-08-01 — Lesson videos start where the teaching starts

### Changed

- **Thirteen lesson videos now skip the intro.** Videos that opened with a
  greeting, a channel plug, or a full play-through of the song before any
  teaching now start you right at the lesson — anywhere from 8 seconds to
  1:50 in. The "(0:00–4:00)" watch ranges on those cards were updated to
  match, so what the card says is what you get. Everything else about the
  cards is unchanged, and you can always scrub back if you want the intro.

## 2026-08-01 — More voices in the lesson videos

### Changed

- **Some lessons now come in both languages.** The pick-holding lesson
  (Module 1) and the first strumming lesson (Module 6) each gained a
  "Same lesson in Spanish" link — from guitarraviva and Christianvib, two
  of the biggest Spanish-language guitar channels — right next to the
  English video. The chord-families lesson (Module 11) now leads with an
  English video from EricBlackmonGuitar, with the Spanish Guitarra con
  Maru lesson as its second option. The D-chord lesson (Module 5) is now
  taught by Guitar Goddess. Every video was checked live before linking;
  all the quizzes on those cards work unchanged.

## 2026-08-01 — Two new arcade games

### Added

- **Pattern Detective** — the arcade's last two planned games begin landing:
  a bar of strumming is written out (D and U arrows), the same or a different
  bar plays out loud with a click marking the beats, and you judge whether
  what you heard matches what you see. Uses the same four strum patterns as
  Strum Hero. No guitar needed; keys 1–2 answer on a laptop.
- **Build-a-Chord** — chord diagrams in reverse: a chord name comes up and
  you place its fingers on a blank grid, mute or open each string, then
  check. A miss tells you how many strings are off (not which!); the third
  miss shows you the shape and moves on. Two decks: your first six chords,
  or all ten open shapes. Both games feed the arcade XP goal and streak.

## 2026-08-01 — Video title check

### Fixed

- **Every lesson video's on-site title now matches the real video** — all 166
  videos were re-checked against what YouTube actually serves (the link
  checker only proves a video loads; this pass proves it's still the right
  one). Six links had drifted: the hammer-on video no longer claims to also
  cover pull-offs (the card teaches the pull-off itself), Marty's song-ideas
  and first-power-chord videos, Justin's fret-buzz and practice-routine
  videos, and the Spanish chord-family lesson (credited to the channel
  "Guitarra con Maru") all show their real titles now. No video needed
  replacing — every one still teaches what its card says.

## 2026-08-01 — Full-site error sweep

### Fixed

- **A dozen fact and consistency fixes across the modules**, found by a
  fresh adversarial audit of all 13 modules, the games, and the chord data:
  - Module 4's pentatonic quiz said you slide "up the neck" to reach G major
    from C — G's home is actually five frets *down*; the question now just
    says "along the neck" (the answer was always right).
  - Module 3's Set 2 "Watchtower" challenge now says its bar-long chords are
    a deliberate slow-down — Set 1 had just taught the record's two-beat cycle.
  - Module 5's waltz lesson pointed to "House of the Rising Sun" as an in-3
    song; Module 12 (correctly) teaches that song is in 6/8, so the example is
    now "Happy Birthday."
  - Module 5's G/B turnaround now describes all three fingers of the G shape
    instead of quietly dropping one.
  - Module 7 no longer claims the "Smoke on the Water" record uses power-chord
    pairs on the low strings — it now says that's *your* version and notes
    Ritchie Blackmore actually plucks fourths on the D and G strings; the
    "higher part" Level-up now spells out the real closing phrase.
  - Module 8's ear bonus (and its arcade hint) called the open D string "Am's
    passing bass, a step higher" — it's Dm's root, a fourth higher.
  - Module 9's D-string drill labeled frets 0–5 as "D–A" (fret 5 is G), asked
    for "8 out of 10" from a 7-card deck (now 6 of 7), and explained TAB as
    matching the look-down view of your guitar — it's the opposite, as
    Module 2's own figure says.
  - Module 11's "Oye Mi Amor" barre challenge asked for Bm–A but showed a G
    diagram — it now shows the A.
  - The arcade's "Partial barres" deck included B7, which is an open chord —
    it now holds just the three real partial barres (B7 stays in "All chords").
  - The "Sweet Child" Journey page now calls the verse loop by its chords
    (D–C–G) instead of "the G verse loop."

## 2026-08-01 — Song Journey TAB check

### Fixed

- **Every TAB on the six Song Journey pages was note-checked** (all 35 blocks,
  fret by fret). Real fixes: "Seven Nation Army"'s singalong grid showed one
  beat per chord when the song (and its own caption) has two — it now counts
  all four beats per bar like every other page; a "Luna" Level-up sent the
  solo box to a position that clashes with the song's key (now fret 5, which
  fits); a "Let It Be" line had its note-sharing claim backwards (A minor
  pentatonic lives inside C major, not the other way around).
- **Small notation cleanups:** the "Sweet Child" verse tabs now say (loop) so
  the last D doesn't read as a fourth chord, "the cure"'s bonus fingerpicking
  layer explains that each chord stretches to a full bar there, a misaligned
  chord label and a few ragged barlines were straightened, and one Spanish
  string name got its missing "grave."

## 2026-07-31 — Core-song fact checks

### Fixed

- **"Luna"'s song map places the Dm correctly now** — it makes one brief
  appearance in the song's opening lines, not "near the end of the verse and
  in the closing bridge," and the unsupported Dm9 note is gone. The Layer 5
  play-along instruction matches.
- **"the cure"'s listening layer** now says the song *starts* quiet and keeps
  building to its big ending — the old text claimed the chorus "grows without
  ever getting loud," which isn't how the record goes.
- **The "Sweet Child" riff challenge in Module 9 names the right strings** —
  the riff's second note is the famous skip up to the B string, not the G
  string; the card now walks the first four notes correctly.
- **The Module 5 "Sweet Child" verse challenge points at the play-along
  track**, not "the actual record" — the record is tuned a half step down, so
  strumming along with it in standard tuning would sound sour. The ▶ button
  was already playing the in-tune track; the words just said otherwise.
- **The "Sweet Child" solo is labeled E minor everywhere now.** The Module 4
  song card said "G major / E minor pentatonic" and its backing-track button
  read "(Em/G)" — both now say Em, matching how the solo lessons already
  teach it.

## 2026-07-31 — Choice-song chords verified

### Fixed

- **Every chord, key, and capo claim on the Choice song lists was checked
  against real charts** (two independent sources per song, eighteen songs).
  Fifteen were already right; three needed fixes:
  - **"Buffalo Soldier"** is A–F#m–D (the site said Bm–G–D–A — the song has no
    G chord).
  - **"Ella Baila Sola"** keeps its capo-1 chords but in the song's real
    order: C–D–B7–Em (was Em–D–C–B7).
  - **"Beat It"** now notes the record sits a half step low, so naming the
    key by ear lands where it should.

## 2026-07-31 — "Oye Mi Amor" chords corrected

### Fixed

- **"Oye Mi Amor" now shows the song's real chords.** The verse is Bm–A (the
  site said Bm–G), and the chorus is D · A · Bm · G (the site said A · D · E ·
  D — the song has no E chord at all). Fixed in the Module 6 strum challenge,
  the Module 7 and Module 11 barre challenges, and the song lists. Verified
  against two independent chord charts; the song stays in the key of Bm with
  no capo.

## 2026-07-31 — Fairer quizzes

### Fixed

- **The longest answer is no longer usually the right one.** In 64 quiz
  questions across the site, the correct choice was noticeably the longest —
  a pattern test-savvy students learn to exploit. Correct answers were trimmed
  to their core claim (the trimmed explanation still appears after you answer)
  and thin wrong answers got real substance, in English and Spanish alike.
- **Hints no longer hand you the quiz answer.** Six hints stated their
  question's answer word for word right above it — they now coach you on where
  to look or how to think instead. One Module 4 question about pentatonic
  roots was upgraded to ask about sliding the pattern to a new key, since the
  lesson right above it unavoidably teaches the old answer.

## 2026-07-31 — Full-site error sweep

### Fixed

- **Lesson cards that told your fingers the wrong thing:** the 4-finger G now
  says where each finger actually goes (ring finger moves to string 2 so the
  pinky can take string 1), the Am↔C switch keeps the right fingers planted
  (only the ring finger moves), Dm is described as one **fret** lower than D —
  not one string over — the B and Bb barre cards no longer ask your index to
  fret and mute string 6 at the same time, and Module 2's stretch drill covers
  frets 1–4 (four fingers, four frets — not five).
- **A Module 4 card's Spanish named the wrong finger** — it said ring finger
  (anular) where the English said pinky (meñique).
- **Demo audio now matches the directions:** Module 2's root-strike loop rings
  each root two beats like the text says, Module 3's eighth-note pulse plays at
  the promised speed, and Module 12's thumb-and-fill demo actually plays the
  fill on the "and" of 2. Buttons that promised accents the audio can't make
  now tell you to add the accent yourself.
- **The Luna fingerpicking roll says to leave the high e string open** — it
  looks like the little F, but fretting the high e the little-F way plays the
  wrong note. Module 8's fingerstyle checklist now asks for the eight-note
  pattern over 4/4 progressions, matching its own lesson card.
- **Daily Review's +10 XP bonus can't fire early anymore.** Practicing one of
  today's review skills before ever opening the page could bank the bonus off
  a partial list and block it for the rest of the day.
- **Recorder:** it now trades the microphone cleanly with the tuner, Listening
  Coach and games (one owner at a time, both directions), an abandoned
  permission prompt no longer freezes the Record button until reload, and
  switching to Español mid-listen-back no longer stops your take at 0:00.
- **Tempo ladder:** moving the BPM slider resets the clean-lap streak, so one
  lap at the new tempo can't cash in a streak earned at the old one.
- **String changing (Module 13):** the slack guide now gives steel-string
  guitars their own measure (about two finger-widths) instead of the classical
  hand's width, which wound too many wraps on a steel post.
- **Module 5's review list gained a Group 3 check** (E and B7 with clean tone)
  — those two chords were the only ones never reviewed.
- **Many small repairs across every module:** quiz questions no longer contain
  their own answers, "catch-all" quiz options keep their place instead of
  shuffling above the options they refer to, the Watchtower card now shows the
  Am diagram it names, Module 11's chord-family chart uses the full-barre Bm
  from Module 7, Spanish consistently says "baraja" for card decks and
  "tonalidad" for keys, missing ¿ marks were added, and Modules 10–11 now
  mention their 12-bar blues sections in the set descriptions.

## 2026-07-31 — Review-pass fixes for the new practice tools

### Fixed

- **Daily Review no longer gets stuck on "Nothing to review yet."** If you
  opened the page before earning any skills (or with only one or two), it
  locked in that short list for the whole day — now skills you earn during
  the day join today's review list, up to the usual four.
- **The Recorder can't leave the microphone stuck on anymore.** Double-tapping
  Record while the permission prompt was up left an invisible recording
  running until you closed the tab. Switching sets mid-take also no longer
  cuts your recording short — the rail Recorder keeps rolling while you look
  at a chord chart.
- **The Tempo ladder's status line follows the tempo now.** Dragging the BPM
  slider used to leave it reading the old number, and at the slider's limits
  (40/220 BPM) it claimed the tempo changed when it couldn't — it now says
  it's holding steady there.
- **The four practice-tool tiles are a 2×2 grid**, so "Metronome",
  "Temporizador" and friends aren't squeezed into "Metro…" anymore.
- **Small polish everywhere:** "Last practiced 1 days ago" now reads
  "yesterday" (both languages), stray \*\*asterisks\*\* were removed from a
  Module 10 card, a Module 12 quiz no longer refers to a chord shape "you
  just learned" before it's taught, the Module 5 assessment goal lists the
  full Group 2 (D, A, Em, Bm), the Recorder popup fully switches languages
  with the Español button, and the "Skip to content" link no longer makes
  the next ✕ button need two clicks.

## 2026-07-31 — Three new practice tools

### Added

- **The Metronome has a Tempo ladder now.** Turn it on, play a pass, and tap
  "Clean lap" or "Had mistakes" — two clean laps in a row bumps the tempo up
  5 BPM, and a slip brings it back down. A guided way to work up to speed
  instead of guessing what tempo to try next.
- **A Recorder tile joined Tuner / Timer / Metronome in the practice-tools
  dock.** Record up to 90 seconds, play it back, and check yourself against a
  short listen-back checklist (on the beat? buzzing strings? steady tempo?).
  Nothing uploads — it stays on your device until you close the tab.
- **A new Daily Review page brings back four skills you've already earned**,
  oldest-practiced first, so what you learned in an early module doesn't fade
  by the time you reach a later one. Finish all four in a day for a small XP
  bonus.

## 2026-07-31 — Strumming photo added

### Added

- **A photo now shows the down-up strumming motion.** The Module 6 pendulum
  challenge and the Module 5 down-up strum challenge both show a strumming hand
  with an arrow tracing the down-up swing, so you can see the relaxed wrist
  motion the cards describe.

## 2026-07-31 — Site review fixes

### Fixed

- **The "Seven Nation Army" real-rhythm riff card now actually loops in 4/4.**
  The last note was cut a beat and a half short, so looping it against the
  record drifted out of time — it now holds the record's real length.
- **String-changing directions for nylon strings were backwards.** The card
  said to feed the ball end in from the soundhole side; it should be the tail
  side (the face away from the soundhole) — the old wording would have pulled
  the ball right back out under tension.
- **The blues-scale shift for "Smoke on the Water" said three frets instead of
  two.** Fixed the wording so it matches where the scale box actually sits.
- **Module 12's C chord diagrams now show the bass note you actually play.**
  The pictures had the low E string muted, but the Travis-picking pattern this
  set teaches uses that string as the alternating bass — the diagram and the
  playing were disagreeing with each other.
- **Rail tool popups (Tuner / Timer / Metronome) no longer cover each other
  up.** Opening a second one used to hide whichever was already open with no
  way to close it — opening one now closes the others first.
- **Name That Riff no longer stacks overlapping riffs** if you answer fast or
  replay a clip mid-round.
- **Change Up now always awards XP at the end of a round**, not just on a
  round you pass — same as every other arcade game.
- **Pentatonic Simon Guitar Hero's octave forgiveness was slightly too
  generous** — it could occasionally accept the wrong pad as correct because
  two of the pads share the same note name an octave apart. Tightened so that
  specific mix-up is caught again.
- **Spanish-mode fixes:** several tool tooltips (rail popups, the chord-strum
  button, the offline banner, Song Journey pages' jam-track and translate
  buttons) were still showing English after switching to Español — they're
  translated now. Spanish hints in a handful of sets weren't splitting into
  bullet lists the way their English versions did (accented capital letters
  and ¿¡ weren't recognized as list breaks) — fixed.

## 2026-07-31 — Site-wide bug sweep

### Fixed

- **Pentatonic Simon Guitar Hero no longer ends your run on a correct note.**
  If your mic picked up the note an octave higher than you actually played it
  (common on laptop/Chromebook mics for the low strings), the game used to
  call it wrong and end the round — it now accepts either octave, same as
  every other mic-graded game on the site.
- **The Tuner and Metronome no longer interfere with each other.** Opening the
  Metronome while the Tuner was still listening used to make the click get
  picked up as a note and throw off your tuning reading — the Tuner now stops
  automatically. And pressing Escape to close the Metronome popup no longer
  silently stops a click you're practicing to — same as clicking away, it just
  slides shut and keeps playing.
- **Search no longer swallows a query you typed before it finished loading.**
  On a slow connection, typing into search right when you opened it could get
  lost with no results ever showing up — it now re-runs your search as soon
  as it's ready.
- **The "the cure" play-along card now teaches the G/B turnaround by default**
  instead of a plain G, since G/B is the actual turnaround used in the song
  and in the assessment — you'll still see plain G offered as an easier
  starting point if you need it.
- Fixed a few small Module 5 inconsistencies: the Sweet Child O' Mine songs-list
  description now matches what Module 5 actually teaches (open chords, not
  power chords), the Group 2 chord list now consistently includes Em, and the
  Am↔Em "anchor" hint no longer implies one finger stays down when it's really
  two different fingers landing on the same fret.
- Two Module 8 fingerpicking cards ("the cure" and "Let It Be") now note that
  their slow one-bar-per-chord practice pace is a teaching count — the real
  recordings move about twice as fast.
- Fixed a couple of leftover Spanish string-name translations in Module 9 that
  used the English letter (e.g. "Cuerda D") instead of the correct solfège
  term ("Cuerda Re").

## 2026-07-31 — New game: Pentatonic Simon Guitar Hero

### Added

- **A new game in the 🎸 guitar section of the arcade: Pentatonic Simon Guitar
  Hero.** It's the same growing-sequence memory game as Pentatonic Simon, but
  you answer on your real guitar instead of tapping — the mic listens for every
  note. Six positions, one octave of pentatonic Pattern 1 at fret 5. Each pad
  names the note along with its string and fret, so the pattern stays on screen
  while you play. Every clean round adds one more note, and there's no timer,
  so you can take as long as you want on each one. One wrong note ends the run,
  and the score screen tells you what it heard and what it was waiting for.

## 2026-07-31 — Video links now skip the intro and stop before the outro

### Improved

- **Tutorial and backing-track videos now jump straight to the lesson** instead
  of opening on someone's intro or channel plug, and on lessons where the video
  keeps going past what you need, it now stops itself before the outro/plug at
  the end — you can still scrub past it if you want to keep watching.
- **A few in-lesson "Watch" links now start a little later in the video too**,
  landing right where that step's instructions pick up.
- **Fixed two lesson notes that stated a video ran longer than it actually
  does** — the listed watch time now matches the real video length.

## 2026-07-31 — A second "Level up" on every Song Journey pentatonic solo

### Added

- **Every Song Journey's Pentatonic Solo layer now has a second "Level up" — the
  whole box.** Layer 4 still starts you on three notes; the new fold hands you
  the full minor-pentatonic Pattern 1 box in TAB, at that song's own position —
  open position for "Seven Nation Army," 5th fret for "All Along the
  Watchtower," "Let It Be," and "the cure," 10th fret for "Luna" — so a student
  who is ready can use the whole shape without leaving the page.
- **"Sweet Child O' Mine" gets the parallel version.** Both of its boxes were
  already printed in that layer, so instead of repeating them its second Level
  up is the two-octave climb: run the open box one note at a time, make the same
  climb at fret 12, then connect the two in a single unbroken run.

English and Spanish throughout.
## 2026-07-31 — More descriptive Challenge titles across every module

### Improved

- **Challenge titles across all 12 modules now say what the card is actually
  about**, not just "Challenge 2." For example, "Play the Tune" now reads
  "'Happy Birthday' Full Melody at 60 BPM," and "Full Progression" now reads
  "Eight-Note Pattern Over 4 Chords" — so you can tell what you're about to
  work on before you open the card.

## 2026-07-31 — Back button and search fixes

### Fixed

- **The Back button now takes you where you'd expect.** Closing Songs, Games,
  Keep practicing, My progress or Class activities used to leave a phantom
  step in your history, so the next Back tap popped the page you'd just closed
  right back open. Back now goes back, and "Back to practice" always lands on
  the practice view in one tap.
- **Back (or the phone's back gesture) closes the search panel** instead of
  leaving the site. Escape closes it too.

### Changed

- **Search understands accents.** Typing "cancion" finds "Canción" and
  "pentatonica" finds "pentatónica" — no accent key required.
- **Search stopped giving up early.** It used to stop scanning after the first
  400 hits, so common words like "chord" never turned up anything from the
  later modules. It now looks at everything and shows the best matches first.
- **Better results, better ordering.** Set names, section titles and module
  names are searchable now, matches on a name beat matches buried mid-sentence,
  and your words are highlighted in each result.
- **Typing a word that doesn't fit no longer dead-ends.** If nothing matches
  every word, you get the closest matches instead of "no results".
- **Results show a count**, and chord searches accept commas ("g, c, d").

## 2026-07-31 — Fixed "Take me to the deck" not switching tabs

### Fixed

- **The "Take me to the deck" button in the practice check-off popup now
  actually takes you there.** It used to leave you on the checklist tab with
  nothing visibly happening, so the deck was easy to miss.
- **Each shuffle deck now shows which string it's for in bold, larger type**
  ("The A string — frets 0–12"), so back-to-back decks for different strings
  are easier to tell apart at a glance.

## 2026-07-31 — Note Hunt and Note Runner ignore the pick scrape

### Fixed

- **Note Hunt and Note Runner's Wait Mode now ignore the scratch of the pick
  and listen only to the note itself**, so a scrape before the pluck can't be
  mistaken for your answer.

### Behind the scenes

- Cleaned up a couple of small inconsistencies (an HTML tag and an overly
  long Spanish label) found in a routine audit.

## 2026-07-31 — Fixed Listening Coach and Tuner going silent on Mac

### Fixed

- **Listening Coach and Tuner now hear you on Safari/Mac.** On some Macs the
  mic would connect but every take came back "I couldn't hear that" no matter
  how loud you played — the browser was starting the audio connection paused
  and never un-pausing it. Both tools now make sure that connection is
  actually running before listening.

### Added

- **The mic indicator now names your microphone** (e.g. "Listening — MacBook
  Pro Microphone"), so it's obvious if the wrong device got picked up.
- **A small level meter** next to it fills in as it hears sound, so you can
  tell at a glance whether it's picking anything up at all.
- **A troubleshooting tip on a "couldn't hear" result** — check the right mic
  is selected, and on a Mac, that Mic Mode in Control Center is set to
  Standard (Voice Isolation filters out guitars).

## 2026-07-30 — Activity #1 reworked into a hands-on practice session

### Changed

- **"Activity #1 - Playing Happy Birthday" is now pure practice**, since the
  melody's already been taught in class: drill the low E string alone, then
  the A string alone, put the two halves together, play the whole song, then
  chase the tempo as high as it'll go. The listening clips are gone — this
  round is guitars-in-hand from the first step.

## 2026-07-30 — Song fact fixes from a full core-song audit

### Fixed

- **"the cure" turnaround described accurately.** Two theory cards (Modules 9
  and 11) said the song walks C straight into G/B — in the song, the G/B glide
  actually lands after the F chord on its way back to Am. The bass-walk
  exercise is unchanged; the description of what the song does is now right.
- **"Let It Be" tempo claims corrected.** Two cards called 60 BPM "the
  record's actual pace" — the record runs at about 71 BPM (the same speed as
  the play-along track). 60 BPM is now clearly labeled practice speed.
- **Fingerpicked bonus layers now match the Module 8 pattern.** The
  fingerpicked-verse layers on the "Let It Be" and "the cure" Song Journey
  pages taught the 6-note roll, but both songs are in 4/4 — they now use the
  8-note p-i-m-a-m-i-m-i stretch (two notes per beat), exactly as Module 8
  teaches it.
- **Module 11 chord diagrams show the full barre F.** Four diagrams still
  showed the simplified little-F shape; from Module 7 on you play the full
  barre, so the diagrams now match.

## 2026-07-29 — First In-Class Activity: Playing Happy Birthday

### Added

- **The first In-Class Activities entry is live**, dated 9/1: "#1 - Playing
  Happy Birthday — Part 1: Find Your Notes." Listen to the same melody played
  three very different ways, then learn the simple fret pattern on the low E
  and A strings that unlocks the whole tune, ending with the full TAB split
  into four bite-sized phrases you can play and hear at any tempo. Each
  activity now carries a number, so you and your classmates can refer to
  "Activity #1" and mean the same thing.

## 2026-07-29 — In-Class Activities

### Added

- **A new "In-Class Activities" page in the Explore menu.** This is where
  day-specific class work will show up alongside the regular modules — watch
  for the amber icon. There's nothing here yet; activities will appear as
  your class does them, newest first, and once something's posted you'll get
  a one-time reminder if you haven't checked it off yet.

## 2026-07-28 — Three new arcade games

### Added

- **Chord Detective** — a 60-second ear-training round. Tap Play to hear a
  chord with nothing shown, and name it from four choices purely by ear.
  Same streak-and-scoring feel as Chord Blitz, but for your ears instead of
  your eyes.
- **Name That Riff** — hear one of the class's four note-by-note riffs
  (Seven Nation Army, Watchtower, Luna, Sweet Child O' Mine) and pick the
  song from the other three.
- **Pentatonic Simon** — a classic call-and-response memory game using the
  pentatonic pattern you already know. Watch and listen to a growing note
  sequence, then tap it back in order — how long a sequence can you hold?

## 2026-07-28 — Arcade XP, a daily goal, and a streak

### Added

- **The Games arcade now tracks XP, a daily goal, and its own streak.** A bar
  at the top of the games menu shows how close you are to today's goal, and
  once you've played on back-to-back days it shows a streak count too. Every
  finished round counts — you don't have to beat your best score to earn XP,
  just play.

## 2026-07-28 — Games gets the whole screen back

### Changed

- **Guitar Games now takes over the full window again.** Once you're playing,
  the menu and the header step out of the way so the game has the whole screen
  — handy on a phone, and less to look at while you're watching the beat.
  Songs, Keep practicing and My progress still open beside the menu the way
  they do now. "Back to practice" (or your browser's Back button) returns you
  to exactly the step you left.
- **The Back button under a practice step now lines up with the left edge** of
  the card, opposite Next, instead of sitting slightly indented.

## 2026-07-28 — Clearer "what's next," and cleaner icons everywhere

### Changed

- **The step you're on now stands out.** A purple line and a filled step
  number mark the step you should do next, so it's easy to find your place
  again after a checkbox tap or a switch between stations.
- **Icons across the site now match the app's style** instead of mixing in
  phone-style emoji, which used to look different depending on the device.
  Locks, the module trophy, the Español globe, the tool icons, and dozens of
  smaller icons in the practice steps, Module Review, and Songs are now the
  same clean line-icon style throughout.
- **A few more emoji rounded up.** The lightning bolt on the Daily 5 (both the
  "open today's warm-up" button and the popup's heading) and on the ear-training
  drill, the pause mark on the Stop button while a play-along is running, and
  the pause mark on the "access is paused" screen are all line icons now too.
- **Every game in the arcade has a new icon.** All nine — Note Hunt, Change Up,
  Strum Radar, Riff Roulette, Note Runner, Riff Runner, Chord Blitz, Fret Zap
  and Strum Hero — now use the same drawn line style as the rest of the site,
  and each game's card and its heading always show the same icon. The lock on
  a game you haven't unlocked yet, and the "nothing is recorded" note under the
  Listening Coach, match too. Your streaks, best scores and trophies keep their
  emoji — those are meant to be a little loud.
- **The Ear Spark bonus cards** in Modules 2–8 now use the same drawn bolt as
  the Daily 5, in English and Spanish.

## 2026-07-28 — Games, Songs, Keep practicing and My progress all open the same way

### Changed

- **The four "Explore" menu items now open right where your lesson was, with
  the menu still beside them.** Songs used to pop open a small floating box in
  the middle of the screen, and Games, Keep practicing and My progress each
  took over the whole window and hid the menu. Now all four open in the same
  place, and the menu item you're on lights up so it's clear where you are.
- **You can hop straight from one to another** — Games to Songs to My
  progress — without backing out to your lesson in between.
- **Going back to your lesson puts you where you left off**, instead of at the
  top of the page. The Back button and "← Back to practice" both work.

## 2026-07-28 — The menu and the lesson scroll separately

### Changed

- **Scrolling a lesson no longer moves the left menu, and scrolling the menu
  no longer moves the lesson.** They're two independent panes now, so a long
  step list stays put while you go looking for another set — and the module
  picker, sets and stations never scroll off the screen.
- **Tuner, Timer and Metronome are locked to the bottom corner of the menu.**
  They're smaller now — icon over label — and they stay there no matter how
  far you scroll, so they're always one click away.

## 2026-07-28 — Set title stays pinned while you scroll

### Changed

- **The set title bar (Set N, the topic, "About this set", Print) now stays
  pinned at the top of the page as you scroll through a long step list**,
  instead of scrolling away after the first few steps. "About this set" opens
  as a small dropdown right under the title instead of pushing the page down.

## 2026-07-28 — Sweet Child O' Mine's solo box, fully mapped

### Changed

- **The "Sweet Child O' Mine" Song Journey's Pentatonic Solo layer now shows
  the full E minor pentatonic box** (all five notes, both in open position
  and up at the 12th fret) instead of just a few sample notes, and points you
  to the Module 4 "Backing track (Em/G)" jam — a separate E minor loop, since
  the solo isn't in the same key as the verse's G backing track at the top of
  the page.

## 2026-07-28 — Module reviews aligned with the curriculum map (Units 1–5)

### Changed

- **Module 4's assessment now matches the curriculum map exactly:** the
  sight-reading task is a 4-bar pentatonic lick (was 1 bar — the cold-read
  drill grew to match), and two extras that the map never graded — naming
  the D & G string notes, and a deliberate loud/soft contrast in the solo —
  are no longer part of the graded list. Both are still taught and still
  on the practice checklist.

### Added

- **Six new self-rating rows on the module review checklists**, so every
  graded skill can be self-rated 1/2/3: string names (Module 1), the
  memorized bass line (Module 2), the 80 BPM hold, split strum, and
  clap-and-count (Module 3), and the three-random-chords progression
  (Module 5).

## 2026-07-28 — Tuner, Timer, and Metronome stay put while you scroll

### Fixed

- **Tuner, Timer, and Metronome now stay pinned to the bottom of the side
  rail no matter how far you scroll down a step.** Right after today's move
  into the rail, they could drift out of view partway down a short step —
  fixed.

## 2026-07-28 — Tuner, Timer, and Metronome now live in the side rail

### Changed

- **Tuner, Timer, and Metronome moved into the left navigation rail** as a
  small always-visible row at the bottom, instead of floating pills in the
  corner of the screen. One tap opens each tool right where it now lives;
  nothing floats over your work anymore.

## 2026-07-28 — A quieter set header, with objectives one tap away

### Changed

- **The module/set header is now a single compact line** — the set number,
  the topic, and Print — instead of a full card. Tap "About this set" to
  see the skills you're working on and which song they build.

## 2026-07-28 — A dashed underline means "locked," so we stopped using it elsewhere

### Changed

- **A song's linked chat thread now has a plain solid underline** instead of
  a dashed one — dashed styling is reserved for locked-until-earned and
  provisional/dev-only spots elsewhere on the site, and this link isn't
  either of those.

## 2026-07-28 — More room in the "All the songs" list

### Changed

- **The "All the songs" popup is wider**, so song titles and the row of
  video buttons next to them have room to breathe — long titles no longer
  break awkwardly in the middle of a word.
- **Dropped the repeated "Core" label** under the Core songs section — the
  section heading already says it, so those rows show just the title and
  video buttons now.
- **Song Journey is now the obvious first choice** on songs that have one —
  it's colored to stand out from Tutorial/Backing/Original, since it's the
  course's own deep-dive content for that song.

## 2026-07-28 — Tuner, Timer, and Metronome now share one "Tools" button

### Changed

- **The three floating practice tools now live behind a single "Tools"
  button** in the corner, instead of three separate pills always taking up
  space. Tap it to expand the Tuner, Timer, and Metronome; tap it again, hit
  Escape, or tap elsewhere on the page to put them away. A running Timer
  still visibly pulses this button when it goes off, even if the tools are
  tucked away.

## 2026-07-28 — Guitar Games looks like the rest of the site

### Changed

- **The games arcade now matches the site's own look** instead of standing
  apart from it — calmer plum backdrop, the same display type used in the
  header, and each game's color strip now uses a color already found
  elsewhere on the site, so the arcade feels like the same site having fun.

## 2026-07-28 — A clearer practice page: one button, one focus

### Changed

- **"Mark done" is now the one obvious button on the page** — filled in and
  easy to spot, so it's always clear what to press next. Once a step is
  checked off, that button quiets down to a small green pill so it doesn't
  keep competing for attention.
- **The current step is the star of the page**, not the module info above it.
  The module card is smaller and sits back as context; the step you're
  actually working on stands out with a purple accent stripe.
- **Progress is easier to see at a glance** — a small bar now sits next to
  the step counter on every station, and My Progress has a new bar showing
  your total progress across all modules up top.
- **The sidebar is calmer** — station rows no longer carry a background tint
  before you've picked one, and the highlight for whatever's selected now
  matches everywhere (sets, stations, and Explore links alike).

## 2026-07-28 — The site's demo notes now play in tune

### Fixed

- **Every note button, TAB playback and chord demo was slightly sharp — and the
  higher the note, the worse it got.** Notes above the 12th fret were off by as
  much as a third of a semitone, which meant that if you tuned or checked
  yourself against them, you were matching the wrong pitch. They're now within
  a couple of cents, which is closer than anyone can hear.
- **Chords played straight down (rather than strummed) distorted on the
  attack** — six notes at once overloaded the output. Chords now sit at about
  the same loudness as a single note.
- **Low notes ended with a faint click** instead of fading out.
- **"Hear it" and the demo players kept sounding for a moment after you started
  a Listening Coach exercise**, so a leftover note could land in the mic while
  it was scoring you. Demo audio now stops immediately.

## 2026-07-27 — A big round of fixes across the site

### Fixed

- **Your ratings on the Song Journey pages could vanish.** Tapping a layer
  rating in the first few seconds after the page opened looked like it saved —
  the ✓ appeared and the counter went up — but nothing was written, and it was
  gone the next day. Those early taps are now saved properly. If the site
  genuinely can't reach the server, it now tells you instead of pretending.
- **Collapsing the play-along player left the track playing.** With the panel
  closed there was no way to stop it short of leaving the page. It pauses now,
  and picks back up if you re-open it.
- **Note Hunt kept the microphone on after the round ended**, which quietly
  silenced the metronome and the demo audio everywhere else until you closed
  the panel.
- **Stopping a Note Runner round early counted as failing it.** Tapping ■ Stop
  during the count-in could knock your level back and mark notes as ones you
  struggle with, even though you never played any. Only rounds you actually
  play through count now.
- **Strum Radar's moving highlight ran late** on devices with a mic delay set,
  so following it made you strum behind the beat. The highlight now sits on the
  beat you're hearing. The first beat of the first bar also lights properly.
- **A short, perfectly played drill could never score "Great"** in the Listening
  Coach — the tempo check reported "too short to tell" in a way that quietly
  capped your result at "Good work."
- **If the site failed to reach your saved progress**, it used to treat you as a
  brand-new student: everything unticked, later sets locked. It now leaves your
  sets open and stops itself from overwriting your streak, your arcade records
  and your practice history with blanks.
- **Switching modules quickly on a slow connection** could leave the menu
  showing one module and the page showing another, and could lose your place.
- **A module that fails to load now says so** instead of showing a blank page.

### Changed

- **Keyboard and screen-reader support.** Pop-up panels now keep the keyboard
  inside them while open and hand focus back when they close, the video player
  takes focus when it opens, and the timer, tuner-string and tempo controls
  announce what they are and which one is selected.

## 2026-07-27 — Right key for "Smoke on the Water", and safer string changing

### Fixed

- **The "Smoke on the Water" drill was in the wrong key.** Module 10 asked you
  to play the A blues scale over a riff that's actually in G, so the scale
  fought the riff instead of fitting it. It now moves you to the G blues scale
  — the same box shape, three frets down. The hint points out something worth
  seeing: the riff's own notes (G, B♭, C, D♭) are the first four notes of that
  scale, and the D♭ is the very ♭5 you just learned to add.

### Added

- **Note Runner now has a race.** A little guitar runs along a track above the
  notes, and it moves forward every time you land one. How far it gets is
  exactly how much of the level you played, so the flag at the end means a
  clean round — and the green marker partway along is the line you have to
  pass to unlock the next level. It runs faster on the faster levels, because
  the notes are coming at it faster.
- **Module 13 now warns you about string types.** Nylon guitars take nylon
  strings and steel-string guitars take steel — they're not interchangeable,
  and steel on a classical guitar pulls hard enough to lift the bridge off.
- **Two safety details that were missing:** hold the offcut as you cut it so it
  can't fly, and keep your face out of line with the headstock while tuning up
  — a string is most likely to break coming up to pitch, right at eye height.
- **Safe practice now counts.** The rule about never cutting a string under
  tension used to say it wasn't graded. It's now a stop: do that and the
  attempt restarts, however well the rest went.

## 2026-07-27 — String changing: winding steps that match our guitars

### Fixed

- **The winding instructions described the wrong kind of guitar.** Module 13
  told you every wrap should go "below the last one, walking down the post" —
  that's how a steel-string guitar works. Our classical guitars have a slotted
  headstock, where the tuners are rollers lying sideways: there is no "down" to
  wind along, so it was asking for something you couldn't actually do on the
  guitar in your hands. **And it was part of your grade.** The winding step is
  now split into a nylon path and a steel path, like the bridge step already
  was, and the checklist accepts either.
- **Locking the tail is now a step, not a bonus tip.** Trapping the loose end
  under the first wrap was listed as an optional "level up." On nylon it's the
  thing that stops the string slipping, so it's now part of the instructions.
- **Nylon wrap count corrected** — 3 to 5 wraps, not the 2 to 3 a steel string
  wants. Nylon is slicker and stretches more, so it needs the extra turns.

## 2026-07-27 — Changing your mind on a skill can't lock you out

### Fixed

- **Moving a skill back to "still working on it" could lock the next set.**
  If you'd finished a set and then honestly re-marked one of its skills as
  still in progress — or just mis-tapped — the set after it could snap back to
  🔒, even though you had already finished that set too, and tapping it only
  told you to finish the previous set first. Sets you've already worked in now
  stay open for good. Marking a skill honestly should never cost you access to
  your own work.

## 2026-07-27 — Your teacher can put an account on hold

### Added

- **Paused accounts.** Mr. Hoffman can put an account on hold from the teacher
  dashboard. If yours is paused you can still sign in, but instead of the site
  you'll see a short message explaining it and telling you to talk to him in
  class. **None of your work is lost** — everything you've checked off, written
  and practiced is saved exactly as you left it, and it all comes straight back
  the moment the hold is lifted.

## 2026-07-27 — Signing out now really signs you out

### Fixed

- **The last thing you did before signing out could be lost.** Ticking a skill
  or marking a step done and then immediately signing out — the normal
  end-of-period habit — could drop that change before it saved. Sign-out now
  finishes saving before it lets go.
- **On a shared computer, the next person could see your work on screen.**
  After signing out, some of the previous student's lesson page — typed
  answers, checked-off steps, ticked skills — could still be showing when the
  next student signed in, even though their own saved progress was correct.
  Signing out now clears the screen completely.
- **A pushed fix could fail to reach you.** Updates could be stored using
  older copies of the files, so a browser looked up to date while still
  running old code. Updates are now always fetched fresh.

## 2026-07-27 — Module content is back

### Fixed

- **Every module's lesson content was blank.** Opening any module showed an
  empty page and a "Something went wrong — please refresh" message, and
  refreshing didn't help. A change made earlier the same day broke the line
  that names which song layer a set builds, and that one line stopped every
  set on the site from drawing. All 13 modules load normally again. No saved
  progress was affected — the checklists, responses, and practice records
  were never touched.

## 2026-07-27 — Strum Radar can actually hear you now

### Changed

- **Strum Radar is a little more forgiving on the slower patterns.** The hit
  window now fits each pattern's own spacing: patterns with room between
  strums (downstrums, reggae) give you more slack, while the eighth-note
  pattern keeps the tightest window it can without confusing neighboring
  strums. The beat guide also follows your tempo a bit more readily.

### Fixed

- **Strum Radar was missing real strums played at normal volume.** It was the
  last mic game still listening with strict thresholds that guitar testing
  had already shown were too high — moderate strums simply weren't detected.
  It now uses the same sensitive detector as Change Up and the Listening
  Coach, and it also accounts for your device's mic delay (the same
  per-device setting Note Runner's timing slider adjusts), so honest strums
  no longer grade as "late."

## 2026-07-27 — Assessment pieces: play them for the Listening Coach, not a camera

### Changed

- **The old "turn on the Chromebook camera and record yourself" instructions
  are gone.** The Module 2 Watchtower assessment card no longer shows the
  camera-recording diagram — instead, its hint points you to the 🎤 Listening
  Coach button right below the TAB, which listens while you play and gives you
  feedback on the spot. The Module 4 solo challenge still has you record a
  take to listen back to, but it no longer implies you need the camera on —
  audio is all it takes.
- **Note Runner's mic timing slider now explains itself.** The tip under the
  slider tells you what to do in both directions — told you're "late"? Raise
  it. Told you're "rushing"? Lower it — and the "rushing" results message now
  mentions the slider too, just like the "late" one always did.

## 2026-07-27 — Every practice quiz now explains the answer

### Added

- **85 practice quizzes that used to say only "Not quite" now teach.** After
  you answer, a short explanation appears saying why the right answer is right
  — and when a wrong choice is extra tempting, why it's wrong. Every
  multiple-choice practice on the site now has one, in English and Spanish.

## 2026-07-27 — Module 7: a picture of the barre chord hand

### Added

- **Module 7's "E-Shape Barre" challenge now shows a drawing of the hand** —
  a front view of the index finger laid flat across all six strings with the
  E shape stacked on top, so you can see what the chord is supposed to look
  like before you build it.

## 2026-07-27 — Module 4: a map of pentatonic Pattern 1

### Added

- **Module 4's "Move the Box" challenge now has a fretboard diagram** of
  Pattern 1 at frets 5–8 — finger numbers on every note, the three root-note
  A's marked solid, in the same style as the string-map diagrams. English and
  Spanish.

## 2026-07-27 — New diagrams: string names and the fingerpicking hand

### Added

- **Module 1's "Name the 6 strings" card now has a diagram** — the six strings
  thickest to thinnest with each string's letter and its word of the
  "Eddie Ate Dynamite, Good Bye Eddie" mnemonic.
- **Module 8's "Hand Shape" challenge now has a diagram** showing which
  picking-hand finger takes which string — thumb (p) on low E and sitting
  forward of the fingers, i–m–a on G, B, and high e, with a reminder that the
  thumb also covers A and D. Both diagrams come in English and Spanish.

## 2026-07-27 — Spanish polish: tooltips, the chord pop-up, and the 404 page

### Changed

- **Hover tips now switch to Spanish** — the small labels that appear when you
  rest the mouse on buttons (play a note, print a set or routine, "Show me
  where", the Listening Coach button, and more) used to stay in English.
- **The chord pop-up viewer speaks Spanish** — its "Play chord" button and the
  message shown when a chord has no diagram.
- **The "page not found" page appears in Spanish** for students using Español.
- **"Slash chord" now has one Spanish name everywhere**: *acorde con barra
  diagonal*. Module 11 used to call it *acorde con bajo alterno*, which was too
  easy to confuse with the fingerpicking term *bajo alternante*.

### Fixed

- **"mi aguda"** — the high e string was called "mi agudo" in a few spots
  (the Fret Zap game, diagram labels, Module 13, and a warm-up), and a Module 9
  quiz now names all its strings in solfège (Sol, Re, Mi aguda, La).
- **Module 2's two hand photos now stack on phones** instead of shrinking to
  half width side by side.
- **Module 4's two fretboard diagrams now work offline** — they were the only
  figures missing from the offline bundle.

## 2026-07-27 — Module 2's teaching diagrams now speak Spanish

### Changed

- **Five Module 2 diagrams** (the A–G alphabet loop, where to press to avoid
  fret buzz, TAB orientation, one-finger-per-fret, and the record-your-riff
  steps) now switch to Spanish along with the rest of the page — the labels
  inside each picture used to stay in English. They were also redrawn in the
  same style as the new fretboard diagrams, so Module 2 looks like one set.

## 2026-07-27 — Full fretboard diagrams for the natural-notes drills

### Changed

- **The "name every natural note on this string" diagrams** (Modules 2 and 9)
  now show the whole 6-string fretboard, with your string highlighted and its
  notes circled — instead of one flat line with no other strings for context.

### Added

- **Module 4's D String Map and G String Map challenges** now have the same
  fretboard diagram to go with the drill.

## 2026-07-27 — Better hand-position pictures in Module 2

### Changed

- **The thumb-position picture in Module 2's finger workout** is now two
  hand-drawn photos of an actual fretting hand — one showing where the thumb
  sits behind the neck, one a close-up of the fingers arched over the frets —
  replacing the old diagram.

## 2026-07-27 — More Spanish string-name cleanup

### Fixed

- **More leftover letter-style string names in Modules 8, 9, and 12's Spanish**
  (like "G-B-e" and "cuerda Re o G") now read as solfège ("Sol, Si y mi aguda",
  "cuerda Re o Sol"), finishing the sweep started earlier today.

## 2026-07-27 — Removed the per-module "Songs" fold

### Removed

- **The collapsible "🎵 Songs" section that sat below each module's stations**
  (Modules 2–12). Every song is still browsable from the "Songs" link in the
  left sidebar, and Module 1's per-set Songs tab is unchanged.

## 2026-07-27 — Spanish string-name cleanup + Journey page fixes

### Fixed

- **A few leftover letter-style string names in Modules 8–9's Spanish** (like
  "G-B-e") now read as solfège ("Sol, Si y mi aguda"), matching the rest of
  the site.
- **The tuner's popup tip now renders small and centered on the six Song
  Journey pages** instead of full-size — it was missing its style there.
- **Slightly bigger tap targets on the Journey pages' close and translate
  buttons**, matching the rest of the site.

## 2026-07-27 — Module 9: fretboard charts for the last four strings

### Added

- **Single-string fretboard charts for the D, G, B, and high-e strings** on
  Module 9's four "String Naturals" challenges — the same style as Module 2's
  low-E and A charts, showing every natural note from the open string to
  fret 12. Available offline like the rest of the images.

## 2026-07-27 — Practice stations show one step at a time

### Added

- **Focus mode on every practice station** — station pages now show just the
  step you're on, with a "Step 4 of 16" counter, Back / Next buttons, and
  the section heading you're in. Marking a step done advances to the next
  one, across section boundaries. An **"All steps"** button at the top of
  the card brings back the full list at any time (and "One at a time"
  switches back); the choice sticks on your device. Printed handouts are
  unchanged — they always show the whole station.

### Changed

- **Long challenge steps now lead with the task.** On 35 of the wordiest
  steps (Modules 1–12), the background story, counting walk-throughs, and
  technique reminders moved into the 💡 Hint fold — the step itself now
  reads: do this, and here's how you know you've got it. Nothing was cut;
  everything moved is one tap away, in both English and Spanish.

### Fixed

- **"Next: My skills checklist" no longer shows up mid-station in one-at-a-time
  view.** It used to sit right under every step's own Next button, which made
  it look like there were two different "Next" buttons on screen. Now it only
  appears once you've reached the station's last step.

## 2026-07-27 — Note-naming skills now ask you to prove it with the deck

### Added

- **Four skills in Modules 2 and 3 now ask for a shuffle-deck run before
  "I've got it!"** — the note-naming skills that already have their own deck
  (low E and A strings in Module 2, the two power-chord root climbs in
  Module 3). When you tap "I've got it!", a pop-up offers to take you
  straight to the deck: score 9 of 10 within the time limit and the skill
  checks itself off, right there. If you've already hit 9 of 10 on that
  string's deck — even in an earlier module — the check-off works like
  before, no pop-up.
- Like the Listening Coach pop-up, there's always a **"Mark it anyway"**
  button — it never blocks you, and your teacher can see which check-offs
  had a deck run behind them.

## 2026-07-27 — Module 13: removed the remaining bridge diagrams

### Removed

- The two remaining **cross-section diagrams** (the tie-block drawing and the
  bridge-pin drawing) are gone from the "seat the new string at the bridge"
  steps, leaving only the hand-sketched pictures and the step-by-step text.

## 2026-07-27 — Site-wide audit: game fairness, saved progress, and Spanish fixes

### Fixed

- **Un-checking a step now sticks.** Before, un-marking a step you'd tapped by
  mistake looked right on screen but the check mark came back the next time
  you opened the site. It now stays un-checked everywhere.
- **Note Runner plays fair with the mic timing offset.** Raising the offset
  (like the game itself suggests when it says you're landing late) no longer
  turns on-time notes into misses — and no longer drops you a level for them.
- **Note Runner's count-in numbers now clear off the screen** after round 1,
  instead of a big "4" sitting on top of the notes for every later round.
- **Riff Runner "My guitar" and Note Hunt listen more carefully.** Yesterday's
  faster note detection could grade the very start of your pick attack;
  detection is still fast but now waits for the note itself.
- **"Practice again" on a review card works from any module** — it used to
  blank the whole lesson area if the skill came from a module you weren't in.
- **"Practice it now" in the Listening Coach pop-up** now actually opens the
  practice panel when you got there from a Station C drill.
- **Module 8's Ear Spark check-off now checks the right skill** (Set 2's
  "switch the thumb at a chord change") instead of silently marking a Set 1
  skill.
- **The practice timer keeps honest time** even if you switch tabs or close
  the laptop lid — it counts real minutes now, not just moments the tab was
  awake.
- **Dragging the metronome's BPM slider no longer machine-guns clicks** while
  it's running; the tempo just changes smoothly.
- **The tuner on Song Journey pages turns the mic off** when you switch away
  from the tab, like the main app already did.
- **The "Mic on" dot only shows when the mic is actually on.**
- **Chord names inside step instructions are tappable again** — the hover /
  tap chord diagrams had quietly stopped working in step text (they still
  worked in hints).
- **"Happy Birthday" in Module 6 now asks for a waltz strum in 3** — the old
  card suggested a 4-beat pattern that can't fit a 3/4 song.
- **Seven Nation Army's Journey page no longer calls the low-E version "an
  octave down"** — it isn't one; the wording now just says it sounds lower.
- **Spanish fixes:** the Watchtower Journey page's closing note was cut off
  mid-sentence in Spanish; string names in Modules 8–10 now use solfège
  (cuerda Sol, Si, mi aguda) consistently; key names on Journey pages and in
  Riff Runner cards now stay as letters (A menor, C mayor) to match the rest
  of the site; Modules 10–12 titles match their menu capitalization.
- **Module 2's diagrams now work offline on the first visit**, like Module
  13's photos already did.

## 2026-07-27 — Riff Runner and Note Hunt: faster note detection

### Fixed

- **"My guitar" mode in Riff Runner, and Note Hunt**, were slower than they
  should have been to recognize a note you'd just played. Both now confirm a
  note about twice as fast, so the games feel more responsive.

## 2026-07-27 — Module 13: removed the "wind the post" diagram

### Removed

- The **winding diagram** on the "trim the excess" step is gone — the
  hand-sketched picture already on that step covers the same instructions, so
  the diagram was redundant.

## 2026-07-27 — Module 13: fixed a clipped label in the winding diagram

### Fixed

- The **"wind the post" diagram** in Module 13 had a label that ran off the
  edge of the picture in both English and Spanish, so part of the instruction
  was cut off. It now wraps onto its own lines and is fully readable.

## 2026-07-27 — Module 5: G and A lesson videos, and Group 3 slims down

### Added

- **Two new lesson videos — the G chord and the A chord.** Every Group 1 and
  Group 2 chord now has a video the way C, F, D, and Bm already did.

### Changed

- **F#m and C#m are out of Module 5.** They were recognition-only — two
  diagrams tucked into the E-chord video card and one "identify the shape"
  skill. Group 3 is now E and B7. The barre shapes are still in the Chord
  Blitz game and still come back in Module 7.

## 2026-07-27 — Module 13 is now a full restring, with step-by-step pictures

### Changed

- **Module 13 is now "Changing Your Strings"** and the assessment is a **full
  six-string restring**, not a single string. You still work one string at a
  time — that part hasn't changed — but the graded attempt is the whole set.
- **The four graded skills are new**, and they match the rubric your teacher
  uses: **Anchored** (every string secured at both ends, on its own post),
  **Wound** (2–3 neat wraps per post, walking down, excess trimmed), **In tune**
  (stretched and re-tuned at least twice, in tune at the final check), and
  **Finished in time** (all six done and your station clear inside 40 minutes).
- **There's a 40-minute clock on the graded restring.** It starts when your
  teacher says begin and stops when you raise your hand *and* your station is
  clear. Practice runs are untimed.
- **Anchored, Wound, and In tune are judged only on the strings you actually
  installed**, so a string you didn't get to only costs you once.
- **Tuning is graded on the two stretch-and-re-tune passes, not on the guitar
  still being in tune tomorrow.** A brand-new nylon set keeps drifting for days
  no matter how well you work — that's the strings, not you.

### Added

- **Seven hand-drawn pictures through the process** — loosening, pulling the
  string off the post, freeing it at the bridge, seating the new ball end,
  threading the post, winding the wraps down, and tuning up. They sit right in
  the steps they belong to, in both languages.
- **A "what station clear means" step**, so there's no guessing about what has
  to be true before you raise your hand.

## 2026-07-27 — Four new chord challenges in Module 5, one Spanish fix

### Added

- **Module 5 now has a dedicated practice card for C, F, and G (Set 2) and A
  major (Set 3)** — before, these four chords were only ever taught folded
  into other cards, unlike every other chord in the module, which gets its
  own "Fret it cleanly" challenge with a diagram and tips.

### Fixed

- **A Module 4 quiz answer about pull-offs was mistranslated into Spanish**
  as "sliding" instead of "snapping the finger off" — the Spanish now
  matches what the question is actually asking.

## 2026-07-26 — Site-wide bug sweep: Listening Coach, tuner, and a couple of wrong chord tips

### Fixed

- **Two Module 5 chord-switch tips gave wrong advice** — they said your index
  finger barely moves between Am↔Em and Em↔Bm, but Em doesn't use an index
  finger at all. The tips now point to the finger position that's actually
  shared (or say plainly when there isn't one).
- **Module 5's C#m chord diagram now actually shows a barre**, matching what
  the lesson text and quiz already call it.
- **A few cards that were still one big paragraph are now clear numbered
  steps** — a Module 5 Ear Spark, a Module 1 ear-training card, and a Module 2
  self-quiz.
- **The Listening Coach could freeze mid-check** if you tapped "Keep
  practicing" or "My progress" while it was listening — fixed, along with a
  couple of scoring edge cases on short drills.
- **The tuner and the metronome could interfere with each other** — the
  metronome's clicks could sometimes throw off the tuner's pitch reading.
  Also, a running metronome or timer no longer stops just because you tapped
  something else on the page.
- **Skill "check it off" buttons could silently fail** to check anything off
  when a Listening Coach check was required first — they now stay live so
  you can try again.
- **Card Deck's "clean run" scoring now only counts cards you got right on
  the first try** — putting a card back and getting it later no longer
  counts as clean.
- **A finished practice timer now restarts properly** when you press Start
  again, instead of ringing the alarm one more time.
- **Fixed a caching bug that could re-download every backing track after any
  site update** — a fresh push now only re-downloads tracks that actually
  changed, not your whole library.
- On a shared Chromebook, **one student's practice history could carry over
  into another student's account** — practice logs and your last-visited
  page are now kept separate per student.
- A handful of screen-reader labels and button tooltips that stayed in
  English in Spanish mode are now translated, including the Español button's
  own tooltip.

## 2026-07-26 — More content fixes, new practice decks, and missing "you've got it when" targets

### Fixed

- **A Module 5 quiz question answered itself two different ways** — both the
  question and the practice version now agree that an "X" on a chord diagram
  means "don't play that string."
- **"Knockin' on Heaven's Door" (Module 6) is now taught with its real bar
  lengths** — Am and C each hold for two full bars, not one, matching the
  actual song instead of an evenly-spaced simplification.
- **Dm and the G/B "bass turnaround" now have real teaching content in
  Module 5** — two new practice cards with diagrams and hints, so "the cure"
  is fully playable as one of the songs you can perform for the Module 5
  check-off.
- **Fixed a few chord-progression mistakes**: "Happy Birthday" (Module 6) was
  shown with a progression that doesn't belong to it; Seven Nation Army's
  strummed version (Module 5) listed the wrong chords; a Module 2 note
  example said "one octave up" when it's actually a fourth.
- **Let It Be and "the cure" now show up everywhere they should** in the
  Songs lists for Modules 2, 3, and 6, including a working 🧵 Song Journey
  link for Seven Nation Army in Module 7 that was missing one.
- **Replaced the last few "grab some index cards" instructions with real
  practice decks and drills you can run right on the page** — in Modules 2,
  3, 5, 8, 9, 10, and 11. Nothing left on the site should ask you to cut up
  paper or find a partner to quiz you.
- **Added "you've got it when…" success criteria to skills that were
  missing them**, mostly in Modules 8 through 13, so it's clearer what
  "done" looks like before you check a skill off.
- **Module 12's wrap-up now mentions Module 13** instead of sounding like
  the course ends there.
- **Module 8's fingerpicking practice stations now open with the same
  tuning-check warm-up every other module's stations have.**
- **Fixed several Spanish translations that didn't match the English** —
  a couple of leftover "ask a partner" instructions in Module 10 and
  elsewhere, a chord-count example in Module 3, and a handful of spots using
  "cuerda B" instead of the site's usual "cuerda Si." The search box, save
  indicator, and a few pop-up labels also now translate into Spanish instead
  of staying in English.
- **A Module 4 songwriting example mixed notes from two different scales**,
  making it unplayable as written — the example now uses one consistent
  scale throughout.
- **Fixed a hint in Module 5 that pointed at a shared finger position
  between two chords that don't actually share one** — it now points at a
  pair of chords that do.
- **Fixed several "📍 Show me where" buttons that had stopped working**
  because the skill they were supposed to jump to wasn't linked correctly.

## 2026-07-26 — Fixed several wrong answers and mismatched instructions

### Fixed

- **"Smoke on the Water" (Module 7) was taught on the wrong strings** — the
  TAB and the quiz answer now match the linked lesson video (low E + A, not
  A + D).
- **The major/minor pentatonic explanation in Module 4 had it backwards** —
  it now correctly says which note is "home" for each.
- **A Module 3 power-chord step told you to use two different fingers for
  the same move** (pinky in one place, "3rd finger" in another) — it's the
  pinky, consistently now.
- **The "one octave up" Sweet Child O' Mine example was actually three
  octaves up** — fixed to match its own caption.
- **Travis picking (Modules 8 and 12) taught two different alternating-bass
  patterns for the same C chord** — both now agree.
- **A Module 11 "guess the key" drill printed the answers right next to the
  question** — it's now a real flip-card you can practice with.
- **The Spanish explanation of how to read a TAB (Module 2) said the
  opposite of the English version** — and of the module's own quiz.
- **The tuner could get confused on the high e string** and occasionally
  read it an octave low.
- **A few small fixes in Module 6**: a strumming demo played the wrong
  note, a chord-change hint was wrong, and a quiz answer contradicted its
  own practice card.

## 2026-07-26 — Numbered and bulleted steps line up now

### Fixed

- **Numbered and bulleted lists inside a step used to hang out to the left**,
  with the "1." and "2." sticking past the left edge of the paragraph above
  them. They're now indented like every other list on the site, so a card's
  directions read as one tidy column.

## 2026-07-26 — Listening Coach: the TAB keeps the beat

### Changed

- **The Listening Coach's "play now" screen is far calmer.** It used to have
  four things moving at once — a red mic dot blinking at one speed, a blue
  metronome dot blinking at another, the big note name swapping every beat,
  and the row of note chips changing color as it graded you — plus the same
  TAB printed twice, once in the card and once on the page underneath it.
- **Now one green column steps across the TAB, one column per beat**, and
  darkens right on the beat. That column *is* the metronome, so there's a
  single place to look: it shows the beat, the note, and where to put your
  finger all at once. The big letter above just names whatever the column is
  sitting on, with the next note to its right. Chord checks work the same
  way, with the strum row as the lane.
- The page's copy of the TAB now hides while the card is open, so the board
  you're reading is the board that's lighting up. Note-by-note scoring waits
  for the report card at the end instead of flickering underneath you while
  you play, and the beat column still fades out on its own once your timing
  is steady.

## 2026-07-26 — Step instructions now indent under their heading

### Changed

- **The bullet list, "You've got it when" note, and response box under each
  numbered step now sit clearly indented under that step's heading**, instead
  of lining up flush with its left edge. Makes it easier to see at a glance
  which instructions belong to which step.

## 2026-07-26 — Metronome Start button actually starts it

### Fixed
- **Tapping Start on the metronome now keeps it running**, instead of the
  popup instantly closing and the click going silent. The same glitch could
  hit the Timer's Start/Pause button too. Both are fixed.

## 2026-07-26 — Cleaner metronome layout

### Changed

- **The metronome popup is tidier.** The Play/Stop button now stands on its
  own instead of being squeezed between the tempo nudge buttons, and the
  2/4 / 3/4 / 4/4 time-signature choice moved to the bottom of the popup.
  The count-in option (a lead-in bar before the click starts) was removed —
  it wasn't adding much and just meant one more thing to tap through.

## 2026-07-26 — A beat guide during Listening Coach checks

### Added

- **Chord and note checks now show a pulsing beat guide while you play.** A
  small dot ticks along with the tempo so you can feel the beat visually —
  and once you've held tight timing for a few notes in a row, it fades out,
  since you don't need the crutch anymore. No sound was added — the mic is
  listening the whole time a check runs, so the guide stays visual only.

## 2026-07-26 — Module 2's note charts are real fretboard diagrams

### Changed

- **Challenge 1 (Low E Run) now shows a fretboard, not a staircase.** The
  step-figure was an abstract staircase of note names with the half-step
  gaps called out in red. It's been replaced with a single-string fretboard
  diagram — nut, fret wires, inlay dots, fret numbers 0–12 — with the
  naturals marked on the string (E open, F·1, G·3, A·5, B·7, C·8, D·10,
  E·12). Same visual vocabulary as the Find-the-Note board and the
  string/note hover diagrams, so students see one consistent picture of the
  neck across the site. The open-string note is a hollow circle, matching
  the site's open-string convention.
- **Challenge 2 (A String Run) has a matching diagram now.** It previously
  had no figure. Same chart for the A string: A open, B·2, C·3, D·5, E·7,
  F·8, G·10, A·12.

### Removed

- `img/m2-note-staircase.svg` — no longer referenced anywhere.

## 2026-07-26 — Module assessments: practice recorder + sign up with your teacher

### Added

- **Every module assessment now has its own Record button.** The assessment
  box at the end of a module review used to say "record yourself" without
  giving you anything to record with — the only recorder on the page belonged
  to the "Play it & Record it!" song section above it. There's now a practice-run
  recorder inside the assessment box itself, independent of the song one, so a
  practice take doesn't overwrite your performance take. Same rules as before:
  it stays in your browser tab, nothing is uploaded, and you can play it back
  or download it.
- **A clear "sign up with Mr. Hoffman" step.** The assessment box now ends with
  a highlighted note: the recording is a practice run, and the assessment itself
  is done in person — when the recording sounds clean on every skill, sign up
  with your teacher to take it.

### Changed

- **No more pointers at modules you can't open yet.** A few lessons name-dropped
  material from far-off locked modules — Module 1's wrap-up sent returning
  players to Module 9, Module 2 pointed at Modules 4 and 7, Module 4 and Module 5
  at Module 7. Those asides are gone; previews of the *next* module (which is
  what actually unlocks) stay.

## 2026-07-26 — Songs pop up properly, and the Listening Coach hears you better

### Changed

- **The Songs button now opens as a pop-up, not a jump to the top of the
  page.** Tap it from anywhere — deep in a practice set, mid-scroll — and it
  opens right where you are instead of teleporting you to the top of the
  site.
- **Fixed a bug where the metronome could go completely silent** after using
  a Listening Coach drill, with no explanation why. If it's ever silent
  because the Coach's mic is on, the metronome pop-up now says so.
- **The Listening Coach's microphone got more sensitive** — especially
  helpful on Chromebooks, whose built-in mics tend to run quieter, even in a
  loud room.
- **Riff Runner's metronome click now fades out once your timing locks in**
  — eight perfect hits in a row and the click goes quiet, so you can feel
  yourself holding the beat without the crutch.

## 2026-07-26 — "You've got it when" stands on its own now

### Changed

- **The success standard on every Challenge card is set apart from the steps.**
  It used to run straight on from the last bullet in the same size and colour,
  so it read like an unnumbered extra instruction. It now sits behind a thin
  green rule, in italic and a shade quieter — still under the list rather than
  in it, so it reads as what you're aiming for rather than one more thing to
  do. Anything after it — a "No score" note, a bonus, a Song Journey link, a
  diagram — stays outside, exactly where it was.

## 2026-07-26 — Quiz answers no longer cluster at the top

### Fixed

- **The correct answer moves around now.** Across the 237 graded quiz
  questions, the right answer used to sit in the first or second slot 84% of
  the time, and in the last slot only 2% — so a student who never picked the
  bottom option was right 98% of the time without knowing anything. Choices
  are now shuffled when the question is drawn on screen, and the four
  positions come out roughly even.
- The order is fixed per question rather than random each time, so options
  don't jump around as you move between tabs, and everyone in the room sees
  the same arrangement you do on the projector.
- Options like "All of them" or "All of the pick" stay in their original
  spot, since they only make sense there.
- Everyone's already-answered questions still show the right result.

## 2026-07-26 — The paper drills are digital now

### Added

- **Card decks.** Six drills that used to say "make five flashcards" or "write
  Am, Gm, Bm and Dm on four slips" now deal from a shuffled deck on screen.
  Two-sided decks — like the relative-pairs one in Module 10 — keep the answer
  hidden until you tap the card, so you still say it out loud first. Miss one
  and it comes back a few cards later, same as tossing a slip back in the pile.
  Your best clean run is saved.
- **Ear Spark plays itself.** The Module 2 and Module 4 Ear Sparks asked you to
  shuffle paper slips, record yourself, and play it back a few minutes later.
  Now the deck draws the notes at random and plays them for you — you never see
  which — and you tap your answers in before checking. No slips, no recording,
  no waiting.

### Changed

- The eight cards above no longer mention paper, and their "Got someone around?
  Have them call the notes instead" lines have come off — the deck does that job.
- Module 11's stuck-hint no longer tells you to write the chord family out on
  paper, and Module 10's level-up no longer asks for a partner to call keys.

## 2026-07-26 — Every Challenge card says its title once, and always uses bullets

### Changed

- **All 195 Challenge cards now put the title in the step heading, not twice.**
  A card used to read "Challenge: A string run" in the heading and then open
  "Challenge 2 — A String Run (your Set 1 check-off):" all over again in the
  body. The full title now lives in the heading — so the heading tells you
  which challenge this is and what it counts for — and the body starts
  straight in on what to do.
- **Every Challenge card's directions are bulleted.** Cards that were a single
  block of prose now have a bullet; cards whose steps repeated each other have
  been merged into one. The A String Run card that started this — "same run on
  the A string" followed by "up to fret 12 and back" — is now one instruction
  instead of two.
- **Definitions moved out of the titles.** "Challenge 3 — Fills (a fill is a
  short extra run of notes between the main parts)" now has a short heading,
  with the definition as the first line of the card. Subtitles that say what a
  challenge counts for — "(your assessment piece)", "(try it!)" — stayed put.
- **A few headings gained back detail they were missing.** "Pivot Finger" is
  "Pivot Finger (Am ↔ C)" again, and three headings that had drifted away from
  the title in their own card body now match it.
- "You've got it when:", "No score" notes, bonus lines, Song Journey links and
  the step figures all stay where they were — under the list, not inside it.

## 2026-07-26 — Module 5's assessment is one song again

### Changed

- **Module 5's assessment now asks for one song — your core song from memory
  (Let It Be, Luna, or "the cure") — not two.** The last two updates had
  grown this into a core song *plus* a song of your choice; that's been
  scaled back. The "song of your choice" material in Set 4 — mapping its
  chords, rehearsing it — is still there, just as optional bonus practice,
  not something the assessment checks.

## 2026-07-26 — Follow-up: the two-song assessment now reads the same everywhere

### Changed

- **Module 5 · the "both songs" message is consistent now.** After the earlier
  change, a few places still described the assessment as one song: the skill
  you rate at the end of the module, the practice counter on the performance
  skill, the Set 4 skill list, and a line in Set 2 that called Let It Be *the*
  from-memory song when it's one of three. All fixed.
- **Module 5 · Full Run now drills the from-memory half.** The challenge had
  you run your chosen song three times; it now adds a chart-away run of your
  core song, which is what the assessment actually asks for. If you picked
  Luna or "the cure," you were never being asked to practise from memory
  anywhere in the module.
- **Module 3 · the Mystery Chart challenge got clearer.** "The lowest fretted
  dot" was ambiguous — on screen the higher fret sits lower down — so it now
  says lowest-*sounding*, nearest the thick strings. The stuck-hint also spells
  out the A-string alphabet, not just the low E's, and the challenge is
  numbered like its neighbours.
- **Module 2** now says Let It Be becomes a core song in Module 4, not Module 5
  — it moved when Module 4 gained it.

## 2026-07-26 — Module 5's assessment says both songs, Let It Be joins Module 4, and a new "name the chord" challenge

### Added

- **Module 3 · Mystery Chart challenge.** Three power-chord diagrams with the
  names stripped off, and a check-yourself question. On the assessment you
  have to read chord names *off* a chart; every drill until now went the other
  way (name → fretboard), so this practices the direction you'll actually be
  tested on.
- **Module 4 · Let It Be is now in the songs list**, with a jam track to solo
  over — so all six core songs are there, not five.

### Changed

- **Module 5's end-of-module assessment now says both songs.** It read as "one
  song of your choice"; it's actually a core song from memory (Let It Be,
  Luna, or "the cure") *plus* a song of your choice. Anyone reading that panel
  was preparing half of it. The three-chord progression at 70 BPM and naming
  chords on an unlabelled chart are spelled out there now too.
- **Module 4's solo tracks are all jam tracks now.** Watchtower and "the cure"
  used the course backing tracks, which have the rhythm guitar taken out — great
  when you're the one playing the rhythm part, wrong when you're soloing over it
  and need a band under you. Both now use a jam track in the same key, like the
  rest of Module 4.
- **"Semester 1 Showcase" is now "the Module 5 assessment"** throughout Module
  5, and "your showcase song" is "your performance song." You move through the
  site at your own pace, so naming it after a fixed end-of-semester event was
  misleading — it's the assessment at the end of Module 5, whenever you get
  there.

## 2026-07-25 — Second pass: more assessment wording fixed after an independent re-check

### Changed

- An independent, blind re-audit of every module's assessment text (checking
  the previous fix pass rather than assuming it) turned up more of the same
  kind of drift: Module 1 had a couple of mismatched skill tags and two
  overclaims in its end-of-module recap; Module 2's Set 2 wording implied a
  4-bar melody wasn't graded when it is; Module 3 had a wrong bar count (a
  progression described as "8 bars" that's actually 6), a song example that
  didn't demonstrate the technique it was cited for, and a missing
  self-check question; Module 5 clarified an ambiguous chord-count skill;
  Module 6 removed a mislabeled "assessment piece" tag from a step that
  isn't the graded one; Module 7 and 8 each had a count/task mismatch
  fixed; Module 9's recap combined two different drills into one that
  doesn't exist; Module 12 had a performance description testing something
  never actually taught.

## 2026-07-25 — Assessment descriptions now match what's actually graded

### Changed

- Across Modules 1, 2, 4–12, the "what you'll be graded on" text for many
  module-end and Set-end assessments was out of sync with the actual
  recorded task — wrong bar counts, a wrong key, a dropped requirement, or
  a task that had quietly changed without the assessment text catching up.
  All of these now describe the real task: what you record, how long it
  should be, and what it's checked against.
- Module 5's Set 4 "showcase" is now labeled a **Semester 1 Showcase**
  rather than a "Course Showcase" — it was never meant to sound like the
  end of the whole class (Module 12 is still where the course wraps up).
- A handful of small mismatches: a Module 7 riff description that promised
  something the graded piece doesn't actually do, three different chord
  lists for the same Module 7 drill, and a couple of assessment checklists
  that were missing a skill (or crediting the wrong one) from their
  module's end-of-module review.

## 2026-07-25 — Lesson accuracy sweep: wrong notes, a dropped chord, and mixed-up fingers fixed

### Changed

- "All Along the Watchtower" in Modules 6 and 7 now teaches the full
  four-chord loop (Am–G–F–G) instead of accidentally dropping the last
  chord — matching what you learned in Module 5 and what the record
  actually does.
- Module 8's Travis-picking thumb pattern on a C chord was pointing your
  thumb at the wrong string; it now correctly walks between the A string
  and the low E string.
- Fixed a fingering hint in Module 2's Watchtower riff that had your pinky
  landing on the wrong fret, and a mixed-up finger-fill description in
  Module 12.
- Corrected the wrong note names in the fingerpicked bonus verses on the
  Luna and "the cure" Song Journey pages — the notes now match what you'll
  actually hear.
- Fixed a self-contradicting explanation in Module 11 about which chord
  "the cure"'s walking bass line resolves back to.
- Small cleanups: a leftover reference to the wrong instructor's name in
  Module 12, a couple of mismatched skill tags in Module 2, and some stale
  wording here and there.

## 2026-07-25 — The shuffle self-quiz is now a drill you can play

### Changed

- Module 2, Set 1: the two shuffle activities in Station C — the A-string
  self-quiz and Challenge 3 on the low E string — no longer ask you to cut
  up paper. The site deals the cards now: a random fret comes up, a ring
  counts down three seconds, and you say the note out loud and press it.
  Ten rounds. Miss one and it comes back later in the ten, exactly like
  tossing that slip back in the pile.
- The clock doesn't snatch the card away: run past three seconds and the
  ring turns red and keeps counting, and a right-but-late answer lands as
  "slow" rather than wrong. Only in-time answers add to your ten, so the
  three-second standard still means what it says on the check-off.
- Two piles: naturals only (the eight lettered frets) or all thirteen frets
  with the sharps mixed in.
- At the end you get the thing paper slips never could — a "drill these
  next" list naming the exact frets that were wrong or slow — and at nine
  out of ten, a button to check the skill off right there.
- Your best run is remembered per string and pile.

## 2026-07-25 — Directions you can follow at a glance

### Changed

- About 157 practice cards across all thirteen modules no longer hand you a
  paragraph. Anything that asked you to do more than one thing is now a
  numbered or bulleted list, with the "You've got it when…" line kept
  underneath where it always was. Spanish matches step for step.

### Added

- Skills you practice with the Listening Coach (the play-a-sequence and chord
  drills) now ask the Coach to hear you before you mark "I've got it!" If it
  hasn't heard you play that one at 💪 Good or better, a card offers to take
  you straight to the drill. You can still mark it anyway — a bad mic or a
  loud room should never block you — and that choice is recorded so your
  teacher can see it. Skills practiced by quiz, BPM log, or the fretboard
  game are never gated.

## 2026-07-24 — Module 2, now illustrated

### Added

- Eight new diagrams throughout Module 2, so the trickiest ideas are pictures now, not just words: the A–G musical alphabet loop, the uneven "staircase" showing why B–C and E–F are only one fret apart, how the shuffled-slips quiz game works, exactly where your fingertip goes behind the fret, how TAB lines map to the strings (top line = thinnest!), thumb-behind-the-neck seen end-on, one-finger-per-fret with the same numbered dots as the chord diagrams, and the three-step "record your assessment on your Chromebook" guide. Every diagram has a Spanish description for screen readers and Español mode.

## 2026-07-24 — New game: Note Runner

### Added
- A new game in the arcade: 🎼 Note Runner. Notes on the low E and A strings
  scroll toward a line over real six-line TAB, and you play them on your
  actual guitar — the mic checks that you hit the right note at the right
  moment. One Play button runs the whole journey: the game finds your
  level, steps you up a stage when you play a round clean (90%+), eases
  off when one falls apart, and quietly re-deals the exact notes you've
  been missing until they come out clean. Stages climb from open-position
  quarter notes through eighths and sixteenth-note bursts across the
  whole neck (through fret 12), with power-chord stages (E5/G5/A5-style
  shapes, graded by listening for the chord's notes) mixed into the
  journey partway along.
- Prefer to aim at one thing? A "practice a specific skill" door lists all
  fifteen levels so you (or your teacher) can drill exactly one — score
  80% there to unlock the next.
- It celebrates with you: sparks on perfect hits and a big ×2/×3/×4 when
  your streak multiplier climbs. (These sit out automatically if your
  device asks for reduced motion.)
- If the game keeps calling you "late" when you know you're on the beat,
  there's a mic timing slider on the level screen — Chromebook microphones
  hear you a moment after you actually play, and this lets you fix that.

## 2026-07-24 — Report a problem right from the site

### Added
- The "Report a problem" link at the bottom of the page now opens a quick
  form right on the site instead of trying to open your email app. Describe
  what happened and send it — it automatically includes which module and
  set you were on, so there's less to explain.

### Changed
- Opening or switching to a Set (or coming back to one you'd already
  started) now always starts you at the very top of the page, instead of
  sometimes landing wherever you'd last scrolled to.

## 2026-07-23 — New module: String Changing

### Added
- A new Module 13: String Changing. Learn the whole process — getting the
  old string off safely, seating the new one at the bridge (our nylon
  strings have ball ends, so no tricky knot), winding it neatly at the
  post, and tuning and stretching it until it holds. Step-by-step diagrams,
  four tutorial videos (including one in Spanish from a professional
  luthier), and a skills checklist that doubles as the in-class assessment:
  the four things you'll be graded on, with "you've got it when" for each.
  In English and Spanish.

## 2026-07-23 — Keep practicing and My progress get their own pages

### Changed
- "Keep practicing" and "My progress" no longer drop over the top of the
  module you're working in. Each opens as its own full page — like the Games
  arcade, but in the site's normal look — with a "Back to practice" button,
  and your browser's Back button exits too. Picking a skill from Keep
  practicing still jumps you straight to its lesson.

## 2026-07-23 — The song list is organized now

### Changed
- The Songs hub is no longer one long list. The six Core songs sit in their
  own card at the top, and every other song is grouped by difficulty — First
  riffs & single notes, Chord & strumming songs, and Advanced — based on the
  module where it first shows up. Tap a group to open it; the counts on each
  header show how many songs are inside. In English and Spanish.
- The "Student choice" row at the bottom now reads "any song that means
  something to you."

## 2026-07-23 — Smoother practice steps: no more jumping pills or hidden headings

### Changed
- Opening a Hint, Stuck?, or Level up panel no longer shoves the other pills
  onto a new line. The three pills stay put in one row, and the panel you
  tapped opens full-width right below them — one panel at a time, and tapping
  the open pill closes it.
- Opening a practice step no longer makes the page jump so the top of the
  step hides behind the purple header bar. Whatever you open — a step, a tab,
  a jump from your skills checklist — now lands just below the header where
  you can read it from the first line.
- Module 1's "Safe handling" step now shows just its checklist — the extra
  Hint / Stuck? / Level up pills were repeating what the step already says.

## 2026-07-23 — Everything in real Spanish + clearer step titles

### Added
- The whole site now speaks real Spanish. The Games arcade and the Listening
  Coach — every game card, in-game prompt, and report-card sentence — are
  hand-translated, the last part of the site that still used Google's
  automatic translation. The Google Translate widget is gone: press Español
  and everything you see was written for this class, in both languages.
- The six Song Journey pages are now fully hand-translated: press Español and
  every part of the page — layers, tips, the play-along notes — switches to
  real Spanish written for this class, instead of Google's automatic
  translation. Your language choice is remembered across pages.
- Every practice step now has its own short title in the checklist — like
  "Sound setup" or "Name the 6 strings" — instead of repeating the first
  line of the directions. Titles are hand-written in English and Spanish
  for all 476 steps.

### Changed
- The Daily 5 no longer adds an extra "Challenge Day" pick every third day —
  the Daily 5 is back to its core five minutes: tune-up, warm-up, and today's
  drill, in both English and Spanish.

## 2026-07-23 — Practice everywhere: Modules 6–12 join in, the whole fretboard opens up, and the site finishes learning Spanish

### Added
- **Every skill in Modules 6–12 now has its own practice exercise too** — 54
  new drills, so all 230 skills across the whole course are practiceable.
- **Find-the-Note now covers all six strings**: Module 9's fretboard skills
  become string-by-string games (D, G, B, high E) plus an all-strings mode
  that quizzes the entire fretboard on a six-string board.
- **More chord drills and personal-record ladders**: barre-chord skills in
  Modules 7 and 11 get diagram-plus-mic-check practice, and speed skills
  across Modules 6–12 get BPM/count ladders that remember your history.

### Changed
- **The whole site now speaks Spanish by hand, not by machine**: the last
  machine-translated corners — locked-set messages, the Songs Hub, Keep
  practicing, My progress, the Daily 5, the recording widget, and
  screen-reader labels — now have hand-written Spanish.
- **Step-by-step directions are now actual lists**: instructions that used
  to cram two or three steps into one paragraph (like the weekly practice
  check-in) now show as clean numbered or bulleted lists, in both languages.

## 2026-07-23 — Every Module 1–5 skill is now practiceable, and the site remembers your reps

### Added
- **Every skill in Modules 1–5 now has its own practice exercise** under a
  "Practice this" button — 29 new drills, so no skill is check-the-box only.
- **Find-the-Note game**: the note-naming skills in Module 2 are now a
  clickable fretboard game — find the named note on the low E string, the A
  string, or both mixed. Five notes a round, with a saved best score.
- **Rep tracking**: every practice panel now shows your reps for today (goal:
  3), your total reps, and how long since you last practiced that skill —
  saved to your account, so it follows you between school and home.
- **"Keep it sharp" review card** at the top of each set's checklist: skills
  you've marked "I've got it!" but haven't practiced lately come back around
  for a quick refresher, because practice fades without reps.
- **Personal-record ladders**: speed and consistency skills (like clean
  changes at 60 BPM) now track your history — "21 → 24 → 28" — so you can
  watch yourself get faster.
- **Chord practice with the Listening Coach**: the Luna vamp skill now shows
  its chord shapes with a mic check and a "log a clean rep" button.

## 2026-07-23 — Play buttons now play real rhythms on the real-rhythm challenges

### Added
- **Seven Nation Army's Module 4 "real rhythm" step now has two &#x25B6; buttons**
  so you can hear the riff both ways before you clap it — the straight
  teaching count you've played since Module 1, and the record's real,
  swung durations, side by side.
- **Let It Be, "the cure," and Sweet Child O' Mine each get a new "Hear it"
  play button** on their strummed/verse challenge steps, playing the full
  chords held for the record's real chord lengths — two beats each for
  Let It Be and "the cure," a full bar each for Sweet Child O' Mine —
  instead of just root notes.

## 2026-07-22 — Seven Nation Army gets a real jam track

### Added
- **Seven Nation Army's Song Journey page now has a play-along jam
  track**, replacing the old music-video link — same as the other five
  core songs. The mix keeps the vocals and full band but dials down the
  guitar, so you can play the riff live over the recording, with a 🎵
  Metronome toggle for a click track at record speed (123 BPM).

## 2026-07-22 — Backing tracks now have a 🐢 Slow tier to step down from record speed

### Added
- **Sweet Child O' Mine, "the cure," All Along the Watchtower, and Seven
  Nation Army's jam tracks now have a 🐢 Slow toggle** alongside the
  existing 🎵 Metronome toggle — a stepping-stone tempo between the 60 BPM
  teaching layers and full record speed (100/120/90/100 BPM vs.
  125/144/115/123). The two toggles work independently, and switching Slow
  mid-song rescales playback position so you land on the same musical spot
  instead of the same second. This completes the slow-tier program — Luna
  and Let It Be intentionally don't get one, since their records already
  sit at practice pace.

## 2026-07-22 — Every module is now in real, hand-written Spanish

### Added
- **All twelve modules are now fully hand-translated into Spanish** —
  fretboard mapping, scales and keys, chords and harmony, and fingerstyle
  (Modules 9–12) join Modules 1–8 from the past few sessions. Every step,
  hint, song, and self-assessment across the whole course now reads like a
  native Spanish lesson, not a machine translation. Next up: the six Song
  Journey pages and the practice games, then Google Translate comes out
  entirely.

## 2026-07-22 — Watchtower's "real rhythm" challenge now has a working demo you can hear

### Added
- **The Module 4 "Watchtower, the real rhythm" challenge now has a ▶ Play
  button** — tap it and you'll hear the A · G · F · G roots actually held
  for two full beats each, the way the record plays them, instead of just
  reading about it. This is the first step to get this treatment; more
  songs' real-rhythm challenges will get playable demos over time.

## 2026-07-22 — Modules 7 and 8 are now in real, hand-written Spanish

### Added
- **Módulos 7 y 8 are now fully hand-translated into Spanish** — TAB
  notation, barre chords, and fingerpicking all read like a native Spanish
  lesson now, not a machine translation. Modules 1–8 are done; Modules
  9–12 are still machine-translated for now.

## 2026-07-22 — New "real rhythm" challenges for Seven Nation Army and Sweet Child O' Mine, and honest jam-track expectations on every Song Journey page

### Added
- **Seven Nation Army now gets an ear-training "real rhythm" challenge in
  Module 4** — instead of waiting until Module 7, you now clap along with
  the record's actual swung feel much earlier, right after you first solo
  over the riff.
- **Sweet Child O' Mine now has a full open-chord verse challenge in
  Module 5**, ending with a play-along at the record's real 125 BPM — this
  song didn't have one before, even though its Song Journey page did.
- **Every Song Journey page's jam track now tells you what to expect** —
  its real tempo, and a heads-up when it's faster than the practice layers
  above it. Seven Nation Army's page also points you to YouTube's 0.75×
  playback if the real recording's speed catches you off guard. Five of the
  six pages now end with a "ready to play it for real?" pointer to exactly
  where that speed lives in the course.

## 2026-07-22 — Fixed rhythm mix-ups for Sweet Child O' Mine, Let It Be, All Along the Watchtower, and "the cure"

### Fixed
- **Some song challenges were teaching the wrong rhythm for how the record
  actually goes.** Sweet Child O' Mine's Song Journey said "two beats per
  chord" in one spot and "four beats per chord" everywhere else — it's four
  (one full bar), so that's fixed. Let It Be's "the way the recording does
  it" step was actually a slower practice tempo — it's now honest about
  that, and points you to the faster Half-Bar challenge that IS the record's
  real speed. All Along the Watchtower's assessment piece and its "strummed
  for real" challenge were both slower than the record's actual two-beat
  pace — fixed, with a clear note on where the real speed lives. And "the
  cure" now explains that its 144 BPM backing track feels like a slower 72 —
  count two beats per chord and you're right on the record's pace.

## 2026-07-22 — Modules 4, 5, and 6 are now in real, hand-written Spanish

### Added
- **Módulos 4, 5, y 6 are now fully hand-translated into Spanish** —
  pentatonic scales, open chords, and strumming patterns all read like a
  native Spanish lesson now, not a machine translation. Modules 1–6 are
  done; Modules 7–12 are still machine-translated for now.

### Fixed
- **A "Tune and warm up first" reminder on the practice-drill screen was
  stuck in English even in Spanish mode** for every module after Module 1
  — it's translated now.

## 2026-07-22 — Modules 2 and 3 are now in real, hand-written Spanish

### Added
- **Módulos 2 y 3 are now fully hand-translated into Spanish** — every step,
  hint, song, and skill in both sets of each module, plus their self-
  assessments. Switch to Español and Modules 1–3 all read like a native
  Spanish lesson, not a machine translation. Modules 4–12 are still
  machine-translated for now — they'll get the same treatment over the
  coming sessions.

## 2026-07-22 — Let It Be has a real jam track now, with a metronome option

### Changed
- **Let It Be's "🎵 Play along" button now plays a real backing track**
  instead of a generic YouTube loop — a clean C-major mix at 71 BPM that
  matches the C–G–Am–F verse loop you're playing.

### Added
- **A "🎵 Metronome" toggle on Let It Be's play-along track**, same as "the
  cure", Luna, and Sweet Child O' Mine — flip it on for a click laid under
  the backing track to help you lock in the downbeats, flip it off for the
  clean mix. Switching mid-song keeps your spot.

## 2026-07-22 — Sweet Child O' Mine has a real jam track now, with a metronome option

### Changed
- **Sweet Child O' Mine's "🎵 Play along" button now plays a real backing
  track** instead of a generic YouTube loop — a clean G-major mix at 125 BPM
  that matches the D–C–G verse loop you're playing.

### Added
- **A "🎵 Metronome" toggle on Sweet Child O' Mine's play-along track**, same
  as "the cure" and Luna — flip it on for a click laid under the backing
  track to help you lock in the downbeats, flip it off for the clean mix.
  Switching mid-song keeps your spot.

## 2026-07-22 — Module 1 is now in real, hand-written Spanish

### Added
- **Módulo 1 is now fully hand-translated into Spanish** — every step, hint,
  song, and skill in both sets plus the Module 1 self-assessment. Switch to
  Español and Module 1 reads like a native Spanish lesson, not a machine
  translation. The rest of the modules (2–12) are still machine-translated
  for now — they'll get the same hand-written treatment over the coming
  sessions, one or two modules at a time.

## 2026-07-22 — Luna has a real jam track now, with a metronome option

### Changed
- **Luna's "🎵 Play along" button now plays Jonathan's own recorded backing
  track** instead of a generic YouTube loop — a clean A-minor mix at 128 BPM
  that matches the F–Am vamp you're playing.

### Added
- **A "🎵 Metronome" toggle on Luna's play-along track**, same as "the cure" —
  flip it on for a click laid under the backing track to help you lock in the
  downbeats, flip it off for the clean mix. Switching mid-song keeps your spot.

## 2026-07-22 — A cleaner start screen, real Spanish for the app itself, and a tuner tip

### Changed
- **The "Start here" welcome pop-up is gone.** That orientation now happens
  in class, so the card was just an extra click between you and practicing.
- **The Español button now gives you real, hand-written Spanish for
  everything you see every session** — the header, the module/set/station
  navigation, the skills checklist, the Tuner/Timer/Metronome, and every
  button and footer link. Longer lesson content is still machine-translated
  (that part hasn't changed), but the words you read 100 times a week are
  now translated with care, not by a machine. Switching back to English
  restores everything exactly as it was.
- **The Tuner catches the high E string more easily.** It used to need you
  to play right up close to the microphone; a normal pluck should register
  cleanly now.

### Added
- **A quiet tip in the Tuner** for noisy classrooms: pick your string above
  and play close to the computer's mic for a cleaner reading.

## 2026-07-22 — "the cure" jam track is now perfectly in tune, plus an optional metronome click

### Changed
- **"the cure"'s jam track is now perfectly in tune with the app's built-in
  tuner.** The previous track was mastered a hair sharp, so if you tuned up
  with the app first, you'd be playing slightly out of tune with the track.
  It's been re-exported at the same pitch the tuner uses, so tuning up and
  playing along now line up exactly.

### Added
- **A new "🎵 Metronome" toggle on "the cure"'s play-along track.** Flip it on
  and the same backing track plays with a click track laid under it, so you
  can practice staying in time; flip it off for the clean mix. Switching
  mid-song keeps your spot — it doesn't restart the track.

## 2026-07-20 — New "the cure" jam track, and no capo needed

### Changed
- **"the cure" now has a custom jam track in A minor, and you no longer need a
  capo to play along with it.** The old backing track wanted a capo on the first
  fret to match the record; this new one is tuned so the open shapes you already
  know — Am, C, Dm, F, G/B — line up perfectly with no clamp on the neck. The
  "🎵 Play along" button on the Song Journey page and the "🎵 Backing track"
  button in Module 4 both use it. Every capo instruction for this song across the
  modules and its Journey page has been removed — it's an open-chord song from
  start to finish now.

## 2026-07-20 — Tuner, Timer, and Metronome now on every Song Journey page

### Added
- **The floating Tuner, Timer, and Metronome buttons now show up on the six
  Song Journey pages**, not just the main practice site — so if you're
  reading through Luna's layers or "the cure"'s chords, you can tune up or
  count in without switching tabs. Same tools, same look, same behavior as
  the main site.

## 2026-07-20 — Play-along tracks on every Song Journey page, and tidier layers

### Added
- **Every Song Journey page now has a "🎵 Play along" button** right above the
  layers — tap it and a backing track opens on the page, so you can play
  whatever layer you're working on over real music without hunting for the
  track inside a module. Seven Nation Army, Sweet Child O' Mine, and Let It
  Be got tracks that keep the singing but leave out the guitar — that part
  is yours to play. (Watchtower, Luna, and "the cure" use jam loops for now,
  until versions with vocals are ready.)

### Changed
- **The "Stuck?" and "Level up" tips inside each layer are now tucked behind
  small tap-to-open buttons**, the same way hints work in the station
  checklists. The lesson itself — the explanation, the TAB chart, and the
  "Play it" goal — stays right there; the extra help appears only when you
  ask for it.

## 2026-07-20 — Song Journey pages are now one layer at a time

### Changed
- **Song Journey pages (Seven Nation Army, Watchtower, Sweet Child O' Mine,
  Luna, Let It Be, "the cure") no longer dump every layer on the page at
  once.** Each layer now collapses to a single row — its number, name, and
  module — so you can see the whole journey at a glance and open just the
  layer you're on. Tap a row to expand it; tapping another closes the last
  one, same as the station checklists.
- **A small badge shows your progress** ("2 of 6 layers rated") right at the
  top of the page, and each rated layer gets a checkmark in its row.
- **The page opens on your next layer automatically** — the first one you
  haven't rated yet — so you don't have to scroll to find your spot. Links
  from inside a module still jump straight to the right layer.
- **Trimmed the intro text on each page** — the extra "how to use this page"
  sentence is gone now that the layout shows it visually, and Luna's page
  tucks the background story about the song into a "More about this song"
  toggle so the chords and feel are what you see first.

## 2026-07-20 — Sidebar redesign and a real search box up top

### Changed
- **The left sidebar has a new, cooler gray background** instead of the old
  warm tan shade.
- **Station B, Station C, and "My skills checklist" each keep their own color**
  in the sidebar all the time now — blue, green, and amber — instead of only
  lighting up once you tap into one. Makes it easier to tell at a glance which
  is which.
- **"Find" moved from the sidebar up to the header bar** at the very top of
  the page, styled like a real search box with a magnifying-glass icon. Same
  search as before — just easier to spot and out of the way of your practice
  materials.

## 2026-07-20 — Checklist polish: clearer rows, a shorter song blurb, one less box

### Changed
- **Steps within a station are easier to tell apart.** A thin line now
  separates one step from the next, and a slightly heavier line marks where
  one part of the station ends and the next begins (like "Watch the lesson
  videos" giving way to "Station Wrap-Up").
- **The "what this set builds" song blurb is one line instead of five.** Set
  pages used to list every song this set contributes to with its own note
  underneath — now it's a single line naming the songs and which layer
  you're building, so it doesn't compete with the actual lesson content for
  attention. The full song list with videos still lives in the "🎵 Songs"
  section at the bottom of each module.
- **Removed the "Keep going" box** that sat at the top of the practice page —
  it was adding a second "what should I do" prompt on top of the set
  description right below it, which felt repetitive rather than helpful.

## 2026-07-20 — Station checklists are now a compact, one-tap-at-a-time list

### Changed
- **Station B and C are no longer one long scroll of everything at once.**
  Each step now collapses to a single line — a status circle, a short
  description, and an arrow — so you can see the whole station at a glance.
  Tap a step to open it and see the full instructions, video, chords, or
  question; tap another step and the first one tucks itself away again.
- **Finishing a step automatically opens the next one.** Mark a step done and
  it collapses with a checkmark while the next thing to do opens right below
  it — no more scrolling to find where you left off.
- **A small "N of M steps done" counter** now sits next to each station's
  title and updates live as you check things off.
- Anything you're in the middle of typing stays put if you collapse and
  reopen a step, and printing a set still shows every step fully expanded,
  exactly as before.

## 2026-07-20 — Practice streaks, two new progress views, and a smarter search

### Added
- **A practice streak.** Practicing on consecutive days now builds a visible
  streak, shown on the Daily 5 card — miss a day and it resets, just like the
  streak in Riff Roulette.
- **"Keep practicing" list.** A new panel gathers every skill you've marked
  "still working on it" across all 12 modules in one place, with a jump link
  back to each one — no more hunting for what you meant to revisit.
- **"My progress" overview.** A new panel shows a full ladder of all 12
  modules with how many skills you've finished in each, plus your
  total-skills-mastered count in one place.
- **Arcade cards remember Change Up and Note Hunt too.** Those two games now
  save your best BPM/score like the rest of the arcade, and Note Hunt gets its
  first "best" chip on the hub.
- **The Listening Coach remembers your last attempt.** Finishing a Coach
  check now shows "last time vs. this time," so you can see yourself improve.
- **Metronome accent + count-in.** Pick a time signature (2/4, 3/4, 4/4) and
  beat 1 is now audibly accented, with an optional one-bar count-in before it
  starts.
- **An offline notice.** If your connection drops, a small banner lets you
  know practice pages still work and videos/saving will resume once you're
  back online.
- **Chord-based song search.** Typing chord names into Find (e.g. "G C D")
  now also returns songs you can play using only those chords.
- **A teacher "trouble spots" view** ranking the class's least-mastered
  skills, and **BPM personal records now keep a short history** instead of
  overwriting your last one.

### Fixed
- **Progress saves now retry automatically** if a save fails on a spotty
  connection, instead of silently staying unsaved until your next click.
- **The "Start here" welcome card** now keeps keyboard focus inside it while
  open, and returns focus to where you were when you close it.

## 2026-07-20 — "Next up" card, easier tapping, and clearer text everywhere

### Added
- **A "Next up" card at the top of your practice page.** It shows which set
  you're on, how many skills you have left ("only 2 more to finish this set!"),
  and one big button for your next step — start at Station B, update your
  checklist, or jump straight into the next set the moment you finish one.
- **An always-visible module progress bar** in the left menu, right under the
  module picker. You no longer have to open the dropdown to see how far along
  you are — the green bar fills as you check off skills.

### Changed
- **Everything is easier to tap on a phone or Chromebook.** Buttons across the
  site — set pills, station buttons, rating buttons, the metronome and timer
  controls, close buttons — now have bigger touch areas, so fewer missed taps
  with a guitar on your lap.
- **No more tiny text.** The smallest text sizes site-wide were raised to a
  readable minimum, and the gray "helper" text got darker (in both light and
  dark mode) so it's easier to read at arm's length.
- **Song Journey pages are friendlier to keyboards and text-size settings.**
  Tabbing through a song page now shows a visible highlight on each button and
  link, text respects your browser's text-size setting, and animations respect
  your device's "reduce motion" preference — matching the main site.

## 2026-07-20 — Song Journey pages get a redesign, plus a fingerpicked bonus layer

### Added
- **Song Journey pages now match the rest of the site**, including dark mode.
  The six song pages (Let It Be, Luna, Seven Nation Army, Sweet Child O' Mine,
  "the cure", All Along the Watchtower) had their own separate look before —
  now they share the same colors, fonts, and dark-mode support as everywhere
  else, so switching between them and the main site feels like one app.
- **Spanish translate button on Song Journey pages.** The same "Español"
  toggle from the main site now works on every song page too, so Spanish-reading
  students don't lose that support when they click into a song.
- **A real fingerpicked bonus layer for Let It Be and "the cure".** Both songs'
  journey pages now include an optional Layer 6 with the actual fingerpicking
  pattern (the same one taught in Module 8), matching what those modules had
  already promised.
- **Arcade games remember your real best score.** Chord Blitz, Fret Zap, Strum
  Hero, Strum Radar, and Riff Runner now show your all-time best on the game
  card — not just what you scored today. Come back tomorrow and your record is
  still there.
- **Tempo sliders remember your setting.** If you slow a tricky riff down to
  practice it, that speed stays set the next time you open the page — no more
  re-adjusting every visit.

### Removed
- **The "Read aloud" button.** The built-in browser voices never sounded
  natural enough to be worth keeping. If you want a step read aloud, Google
  Read&amp;Write or your device's built-in text-to-speech both work well.

## 2026-07-12 — Riff Runner: play the riffs on your real guitar

### Added
- **A new "My guitar" way to play Riff Runner.** On the start screen you can now
  choose **⌨️ Keys / tap** (the original — press a key or tap as notes cross the
  line) or **🎸 My guitar**, which listens through your device's mic while you
  play the riff on a real guitar. Pick a **play-along speed** (Slow, Medium, or
  full song speed), and a metronome counts you in and keeps the beat — the beat
  dots light up and the line flashes so you can see the tempo as well as hear it.
- **It waits for you.** Play each note in time with the click; the moment it
  hears the right note, it moves on to the next. Fall behind and it simply holds
  the note and waits — no penalty — so you can start slow and build up to full
  speed. If you play the wrong note it gives you a nudge ("go 2 frets up," or
  "right note, wrong octave"). A great way to learn a riff by ear and hands
  before racing the clock.

## 2026-07-12 — Work each module in order, and pages remember your place

### Added
- **Sets now unlock in order.** Within a module, each Set stays locked until you
  finish the one before it — "finished" meaning every skill in it is marked
  **"I've got it!"** (the same bar the Module review already used). A locked Set
  shows a 🔒 and, if you tap it, a quick reminder of which Set to finish first.
  Set 1 is always open, and the next Set unlocks the moment you check off the
  last skill of the current one. This keeps everyone on the intended path
  instead of skipping ahead.

### Fixed
- **Pages open where you left them.** Returning to a Set you were already working
  on now drops you back at the same spot you'd scrolled to, while a Set you're
  opening for the first time starts cleanly at the top. Before, a page would
  sometimes open already scrolled part-way down for no clear reason.

## 2026-07-12 — Change Up game: more chord sets + a Random 4 mode

### Added
- **More chord combinations to switch between** in the Change Up game — the
  2-chord, 3-chord, and 4-chord menus each grew (new picks like C↔F, G↔D,
  C–F–G, and the classic C–Am–F–G turnaround), so there's more variety to
  train against.
- **A 🎲 Random 4 mode** — draws a fresh set of four chords each round and
  reveals them at the count-in, so you never know exactly what's coming. Great
  for testing whether your changes hold up on combinations you haven't drilled.
  Works at every switching speed, and it keeps its own best-BPM record.

## 2026-07-12 — Change Up game: pick how fast the chords switch

### Added
- **The Change Up game now lets you choose how often the chord changes** —
  **every bar** (the original), **every 2 beats**, or **every beat**. Faster
  settings pack more changes into a round, so you can push your switching speed
  toward the pace real songs actually move. Your best BPM is now saved separately
  for each speed, so beating your "every beat" record is its own goal.

## 2026-07-12 — New: practice for faster chord changes

### Added
- **A "Speed Changes" set of drills in three modules** — the chord-switching
  practice used to top out at one change per bar, which is slower than most real
  songs move. Now each of these modules has a new practice block that ramps up
  the challenge to match real playing:
  - **Two-Finger Power Chords** — half-bar and one-per-beat switches, building up
    to the "All Along the Watchtower" riff played a new chord every beat.
  - **Open Chords** — the same C–G–Am–F loop from "Let It Be," first every two
    beats, then a new chord on every beat.
  - **Strumming Patterns with Chords** — faster switches while the strum hand
    never stops, which is the real rhythm-guitar skill.
- Each drill goes **2 chords → 3 chords → 4 chords**, and **every two beats →
  every beat**, with a ▶ play-along so you can hear the target before you try it,
  and a spot to log your fastest clean tempo and beat it next time.

## 2026-07-12 — Fixed: picking a Set while Songs (or Search) was open

### Fixed
- If you opened **Songs** (or Search) from the sidebar and then clicked a
  **Set**, **Module review**, or changed the **Module** dropdown, the page
  silently switched behind the scenes but Songs stayed on screen — it looked
  like nothing happened. Doing any of those now closes Songs/Search first and
  scrolls you up to the set you picked.

## 2026-07-12 — A little guitar pick in the header

### Added
- A small hand-drawn guitar pick icon now sits next to the site title in the
  header — just a friendlier visual touch, nothing to click or use.

## 2026-07-12 — The Games hub matches the rest of the site now

### Changed
- **The Guitar Games arcade screen's colors now come from the same palette as
  the rest of the site**, instead of a grab-bag of unrelated rainbow hues. The
  colored stripe on top of each game card is now built from the site's own
  blue, green, amber, and purple, plus one pink accent for variety — so a
  screenshot of the games hub and the regular practice pages now reads as one
  product instead of two. The arcade screen still keeps its own bold, after-dark
  look — this only changes where the colors come from.

## 2026-07-12 — A tidier "Songs" spot, and a sidebar that gets out of the way

### Changed
- **"Songs" only shows up once now**, under Explore in the sidebar. It used to
  also appear as its own button under "This set," which pointed to the same
  place — a little confusing since they looked like two different things.
- **On a narrow window or phone-sized screen, the sidebar tucks itself away**
  instead of stacking above your practice material (which used to push
  everything else way down the page). Tap the ☰ menu button next to the title
  to open it, pick what you want, and it closes automatically so you can see
  what you picked.

## 2026-07-12 — Titles got some personality, and one less color to compete with

### Changed
- **Set titles and page headings now use a warm serif typeface** instead of the
  same plain sans-serif as everything else, so titles clearly stand out from
  body text at a glance. Body text and step instructions are unchanged.
- **Badges and tags got quieter.** "Layer 1 of 5" and the song-list "Choice"
  label are now plain text instead of little pill shapes — only things you can
  actually click, or the "Core" tag, still look like buttons. The Original and
  Tutorial video links on each song row are now quiet text links until you
  hover over them, so the Song Journey button — the one action that matters
  most on that row — stands out more clearly.
- **The purple header color now shows up throughout the app, not just at the
  top.** The "Next" button at the bottom of each station, the welcome popup's
  start button, and the chord-tab header are all the same brand purple now,
  instead of blue/gray tints that didn't quite match.
- **On wide screens, the page content is centered** between the sidebar and
  the floating Tuner/Timer/Metronome buttons instead of hugging the left edge,
  so there's no more big empty stripe on a large monitor.
- **The floating Tuner, Timer, and Metronome buttons are now one calm, matching
  set** (previously each was a different color) — the icons keep their color,
  but the buttons themselves are neutral so they don't compete for attention.
- **The numbered section headers inside each station** ("1 · Watch the lesson
  videos") are now a simple underlined heading instead of a solid gray/green
  bar, so they feel lighter and match the rest of the calmer redesign.

## 2026-07-12 — A calmer, warmer look

### Changed
- **Module 9's sets are numbered 1–4 now.** The "welcome back" checkpoint that
  used to be called Set 0 is simply Set 1, so every module starts counting from
  the same place. (Nothing about your saved progress changes.)
- **The whole site got a gentler coat of paint.** The background is now a warm
  ivory instead of cool gray, the purple header bar is softer, and the sidebar
  lost its heavy colored boxes — sections are now separated by simple spacing
  and small labels, so the page feels quieter and easier on the eyes.
- **The sidebar buttons are calmer too.** Station buttons sit flat until you
  pick one, then light up with a soft wash of their color (blue for Station B,
  green for Station C, amber for the checklist). The Explore buttons highlight
  with a soft purple pill instead of a solid dark bar.
- **The Set and Module review buttons moved into the sidebar.** They now sit
  right under the Module dropdown, so the whole path — Module, then Set, then
  Station — reads top to bottom in one place. The little 8-segment module
  progress strip came out to make room (the Module dropdown still shows where
  you are, and the 🏆 trophy still lights up — with confetti — when you finish
  a module).
- **The work area is tidier.** The white content cards are narrower now, ending
  where the text ends — so the floating Tuner, Timer, and Metronome buttons no
  longer sit on top of your reading. Inside each card, the extra boxes and
  divider lines between steps are gone; section headers are simple soft bars,
  which makes each station page feel much less cluttered.
- **The set card now reads top to bottom in order.** The module name comes
  first, then the Set badge, then the skills you're working on — module,
  then set, then skills, instead of set-badge-first.

## 2026-07-12 — Tidier step controls

### Changed
- **Hint, Stuck?, and Level up now sit in one row** under each step instead of
  stacked one above the other, so you can see all three at a glance and open
  whichever one you need.
- **The "Listen" button is now labeled "Read aloud"** and moved to the
  bottom-right of each step, next to Mark done, so the two step-ending
  controls are together.

## 2026-07-12 — New look: a side navigation rail

### Changed
- **The site has a new layout with a navigation rail down the left side.** The
  module picker, your progress strip, and the buttons for each set's stations
  (Station B, Station C, your skills checklist, and Songs) now live together in
  a sidebar, along with an Explore section for Practice, Games, Songs, and Find.
  It keeps everything one click away instead of stacked across the top, adds a
  little "module complete" badge, and includes a Skip-to-content link for
  keyboard and screen-reader users.

### Added
- **Teachers can turn Games on or off** — for the whole class at once, or for
  individual students — from a new Games tab in the teacher dashboard. When
  Games are off for a student, the 🎮 button simply doesn't show for them.

## 2026-07-12 — The Listening Coach now hears your chords

### Changed
- **The Listening Coach can finally hear a full strummed chord.** Before, it
  often shrugged and said it "couldn't make out the pitches" when you strummed
  a chord at a normal volume — it was really only built to hear one note at a
  time. Now it picks up your strums reliably and tells you whether the chord
  rang true. It's also more forgiving: quieter strumming still registers, and
  a strum that's a little off the beat still counts as on time.
- **One clear name for the feature.** The mic-feedback buttons used to have
  three different labels ("Check me", "Check my changes", "Strum check") for
  what is really one tool. They're now all just **🎤 Listening Coach**, matching
  the title you see when it opens.

## 2026-07-12 — Riff Runner, and lessons from more teachers

### Added
- **Riff Runner** — the arcade's biggest game yet. The class songs become a
  scrolling game: six lines on screen are the six strings (laid out like
  TAB), fret numbers slide toward a line, and you press that string's key
  (1–6 on a laptop) or tap its lane (on a phone) right on time. Every hit
  plays the real note, so playing well means hearing the riff come together.
  Four songs from class — Seven Nation Army, All Along the Watchtower,
  Luna, and Sweet Child O' Mine — each at three speed levels. Clear a speed
  at 90% to unlock the next; clear a song at full speed to unlock the next
  song. A "Hear it" button plays any riff for you first, and after three
  stars the game points you back to your real guitar.

### Changed
- **24 lesson videos now come from a wider range of teachers.** The video
  lineup leaned heavily on two channels; you'll now also learn from Lauren
  Bateman, Guitar Goddess, Maru Martinez (in Spanish), and
  EricBlackmonGuitar across tuning, chords, strumming, scales, blues, and
  fingerpicking lessons. Every replacement was checked to be as good as or
  better than the video it replaced — where nothing better existed, the
  original stayed.

## 2026-07-12 — Site-wide accuracy pass: 30+ fixes from a full audit

### Changed
- **Three teaching errors corrected.** Module 4 now points you to the right
  string for the blues note (the A string, fret 6 — not the D string) and
  the right frets for the open-position E-minor pentatonic shape (frets 2
  and 3). Module 5 now says E major uses three fingers (B7 is the
  four-finger chord).
- **"Straight eighths" is now described correctly everywhere in Module 3**
  — down on each number, up on each "+" — instead of a five-stroke pattern
  that couldn't fit the count. The quiz was re-keyed to match.
- **Module 8's "the cure" now matches the song everywhere else teaches:**
  the verse loop is Am · C · Dm · F with a capo on fret 1 to match the
  recording (the old text skipped Dm and never mentioned the capo).
- **Module 7's A-shape barre no longer argues with itself.** The lesson
  now explains that muting the high E is a real technique you'll see in
  videos, but this module teaches the arched version where it rings — the
  same standard the set's own checks use.
- **The mic checks now tell you the click goes silent while they listen**
  (it always did — the tips just never said so), and the timing feedback
  talks about "the beat" instead of a click you can't hear.
- **Quizzes only test what was taught:** volume letters (p, mf, f), scale
  degrees, intervals, and "diatonic" now get plain-English definitions
  before they're used.
- **Riff Roulette now has challenge cards for Modules 9–12**, so students
  in the later modules get spins that match what they're learning.
- Smaller fixes: the module-review unlock message now says "every set"
  (some modules have three or four, not two); a Strum Hero "Good" score
  no longer wears the same amber color as a wrong answer; dozens of small
  wording, spelling, and alignment corrections across modules and song
  pages; better keyboard and screen-reader support in the Games arcade;
  the tuner and the review recorder now always release the microphone
  when you move on.

## 2026-07-11 — Fret Zap: name the note on the fretboard

### Added
- **Fret Zap** — a 60-second sprint that trains your fretboard memory. A dot
  lights up on a blank neck diagram (no letter on it) and you tap that note's
  name from four choices before the 60 seconds run out. Right answers build a streak —
  every 5 in a row is worth more points — and you hear the note ring as a
  reward. Miss one and the right answer lights up green, then that spot comes
  back a few cards later so you get another shot. Four decks get harder in order:
  just the low E and A strings, then all six strings up to the 5th fret, then
  the natural notes (the plain letters, no sharps) all the way to the 12th
  fret, and finally everything including the sharps (a sharp, written ♯, is
  the note one fret above a letter). No mic and no guitar needed — just your
  eyes and a tapping finger. On a laptop, keys 1–4 answer.

## 2026-07-11 — Two games that need your real guitar: Riff Roulette and Strum Radar

### Added
- **Riff Roulette** — spin for a short real-guitar challenge picked from your
  current module ("E5 to A5, 10 clean changes at 70 BPM"). The metronome
  starts by itself, a timer runs, and when it ends you score yourself: Got it
  (full points), Almost (half points — the card comes back later today), or
  Not yet. Three scored cards finish your daily set, and finishing a set
  every day builds a streak. Score yourself honestly — honest answers help
  you get better faster.
- **Strum Radar** — strum a real pattern on your real guitar and the mic
  checks your timing. Pick a pattern and tempo, hold any chord you know, and
  after the count-in the radar listens quietly (no click during the round —
  it would hear itself) and marks every strum on time, early, or missed. It
  hears WHEN you strum, not which direction — follow the arrows with your
  arm anyway. Like all listening on this site, nothing is recorded or
  uploaded.

## 2026-07-11 — Chord checks that hear real strums, and a pop-up Daily 5

### Changed
- **The 🎤 chord checks now hear strums the way strums actually sound.**
  A strummed chord rings several notes at once, but the old check listened
  for a single note and often reported "couldn't hear that clearly" on
  perfectly good strums. Now it credits a strum when the notes it hears
  belong to the chord — so clean playing scores clean. The same fix powers
  the Change Up game.
- **Chord checks now show you what's coming.** During a check you see the
  current chord big, plus "next:" so you can get your fingers moving before
  the switch — and the chord diagrams stay on screen from the count-in on,
  so you can set up your first shape while the clicks run (Change Up too).
  The moving beat highlight also follows your actual playing now instead of
  drifting away from it.
- **The Daily 5 opens right where you practice.** Its button lives on the
  "Tune and warm up first" card at the top of Station C and opens as a
  pop-up over the page — close it and you're exactly where you left off.
  (The old Daily 5 button at the top of the page is gone.)
- Station C's drill sections start at #1 again, the intro cards line up
  with the drill boxes, and finger-placement instructions are spelled out
  in plain words ("index finger on string 2, fret 1") instead of shorthand.
- The Module 4 pentatonic video now starts at 1:45, skipping straight to
  the lesson.

### Added
- **The Am ↔ Em switch drill (Module 5, Set 1) has its own "Check my
  changes" button** — the mic listens to the actual chord changes, not just
  each chord on its own.

## 2026-07-11 — Two new games in the arcade: Chord Blitz and Strum Hero

### Added
- **Chord Blitz** — a 90-second sprint on chord shapes. You see a chord
  diagram and pick its name from four choices (or flip it: see a name, pick
  the shape). Right answers build a streak worth more points, missed chords
  come back a few cards later so you learn them, and every correct answer
  plays the chord so your ears learn it too. Four decks: open chords, power
  chords, partial barres, or everything. On a laptop, keys 1–4 answer.
- **Strum Hero** — a rhythm game for real strumming patterns. Down and up
  arrows slide toward a line while a click keeps the beat; tap the screen
  (or the spacebar) on every strum. Your timing is graded (Perfect / Good /
  Miss), and the end screen tells you if you tend to tap early or late —
  the same habit that makes real strumming rush or drag. Patterns come
  straight from class: all downstrums, down-up eighths, Old Faithful
  (D-DU-UDU), and the reggae chop.
- Neither game uses the microphone, so both work anywhere — including a
  quiet classroom. Your best scores now save with your progress, so they
  survive between visits.

## 2026-07-11 — Plainer English everywhere

### Changed
- **Music words are now explained the first time you see them.** Terms like
  *riff*, *vamp*, *barre*, *palm-mute*, *chug*, *turnaround*, *requinto*, and
  *sierreño* get a short plain-English definition at their first use on every
  page, so you learn the real vocabulary without having to guess.
- **Confusing idioms and slang were rewritten in plain English.** Phrases
  like "the song goes native," "boss-level," "victory lap," "stretch goal,"
  and "campfire version" now say what they mean — the site reads the same
  friendly way, just clearer, especially if English isn't your first
  language.
- **The welcome card now defines the words you'll see everywhere:** *Level
  up* (an optional harder version), *"You've got it when"* (the signs you're
  ready to move on), *a lap* (one full time through), and *BPM* (beats per
  minute).
- **The tuner speaks plainly:** "Too high — tune down (sharp)" and "Too low —
  tune up (flat)" instead of just "Sharp" and "Flat."

## 2026-07-11 — The Listening Coach hears real guitars much better

### Changed
- **The Listening Coach now recognizes your notes when strings ring into
  each other.** On a scale climb (like Pentatonic Pattern 1) the previous
  string keeps ringing while you pick the next note — and the coach's ear
  used to miss almost everything played that way. It now listens for the
  pick attack itself, waits out the attack noise before judging the pitch,
  and only calls a note wrong when its readings agree. Quiet takes and
  lightly muted notes score correctly too.
- **When a few notes don't register, the report now says why.** If every
  note the coach heard was right but some never came through, it tells
  you the likely culprit is uneven volume — pluck every note at the same
  confident level — instead of hinting your fingers were in the wrong
  place.
- **The Change Up game hears your strums the same improved way.** Its
  graded moment — the first strum of each new chord, played while the old
  chord still rings — now uses the same upgraded ear, and it won't call a
  change "off" unless its readings actually agree.
- **The TAB stays on screen during the count-in.** It used to vanish
  behind the big 1-2-3-4 count right when you needed it to get your
  fretting hand in position; now it stays put from the moment you open
  the check until the report card.

## 2026-07-11 — Challenge Day replaces the always-on 15-Day list

### Changed
- **The 15-Day Challenge list no longer shows challenges you can't do
  yet.** Instead of the full list (which mentioned barre chords and
  fingerpicking to Module 1 students), every third day your Daily 5 ends
  with a **🏔 Challenge Day** — pick one of two challenges, drawn only
  from skills your current module has already covered. Same ideas, right
  timing.

## 2026-07-11 — Games get their own page, the site gets clearer everywhere

### Added
- **🎮 Guitar Games is its own page now.** The Games button takes over
  the whole screen with an arcade look — big game cards, your best
  tempo on display, and a "← Back to practice" button (your browser's
  Back button works too). Practice stays practice; games feel like
  games.
- **A "watch it on YouTube" escape hatch under every video** in the
  pop-up player — some videos (age-restricted or label-limited) only
  play on YouTube itself, and now there's always a one-tap way out.
  Timestamped links also start at the right moment now.

### Changed
- **A clarity pass across all twelve modules** — 93 fixes from a
  module-by-module review: wrong or contradictory instructions
  corrected (the octave add-on's finger placement, the folk-strum
  count, a mislabeled riff that's actually Smoke on the Water, a chord
  diagram that showed F where the song needs G), quiz answers that
  disagreed with their own lessons re-keyed, undefined terms glossed at
  first use (TAB, BPM, fretting hand), stale pointers fixed, invented
  course history removed, and "don't stop yet" notes added where a
  wrap-up sits above real content.
- **The page finally uses your screen.** Content can spread to ~1160px
  — TABs, chord rows, and checklists get room to breathe — while
  paragraphs stay capped at a comfortable reading width.
- The practice-station warm-up card now reads **"Tune and warm up
  first"**, and the two remaining old-style tuning warm-ups (Modules 2
  and 11) now route through the Daily 5 like everywhere else.

## 2026-07-11 — Song badges now name the exact layer you're building

### Changed
- **The "song unlocks" got precise.** Every core song is built the same
  way across the course — Layer 1 *Listen* → Layer 2 *Single Notes* →
  Layer 3 *Power Chords* → Layer 4 *Pentatonic Solo* → Layer 5 *Open
  Chords* (Luna adds a bonus Layer 6, the requinto intro). The set
  badges now say exactly which layer you're on — *"Luna — Layer 3 of 5 ·
  the F5–A5 vamp"* — one row per song, and each name links straight to
  that layer on the song's Journey page. Checking off a skill answers in
  kind: *"You just built more of Luna — that's Layer 3 work."*
- Three older steps claimed wrong layer counts ("Layer 1 of 4" on a
  5-layer song) — corrected to match the Journey pages.

## 2026-07-11 — Warm-ups route through the Daily 5, and jam tracks are one tap away

### Changed
- **Practice stations no longer start with the same tuning drill.** The
  generic "tune all 6 strings" warm-up at the top of most practice
  stations is replaced by a pointer to **today's ⚡ Daily 5** — which
  starts with the tune-up anyway, plus a finger warm-up and one drill
  from your module. Open it with one tap, and a **"↩ Done — back to my
  set"** button drops you right back where you were. (Warm-ups that
  teach something module-specific — like Module 6's strum recall —
  stay.)
- **Jam tracks are now IN the step.** Improv challenges used to say
  "hit ▶ Backing track on the card below" — pointing at song cards that
  moved months ago. Every one of those steps now carries its own
  ▶ 🎵 jam-track button right where you need it (and points to the
  module's 🎵 Songs list for more).

## 2026-07-11 — Cleaner steps, a moving beat cursor, and text that scales

### Changed
- **Steps lead with the doing.** Play buttons, chord diagrams, TAB, and
  your response boxes now come first in every step; the hint and the
  "Stuck?" / "Level up" coaching fold behind small tap-to-open chips —
  there when you want them, never burying the thing you're supposed to
  play. (Printed handouts still show everything.)
- **The TAB follows along.** Press ▶ Play on any TAB and the sounding
  column lights up as it plays — you can *see* where you are in the
  line, which is half of learning to read rhythm.
- **Your device's text-size setting works now.** If you make text bigger
  on your phone or Chromebook, the whole site respects it — every text
  size was converted from fixed pixels to scalable units, with zero
  visual change at the default setting.

## 2026-07-11 — Follow-up fix round from a full review

### Changed
- **More mic-reliability edge cases closed:** rapid open/close around the
  permission prompt can no longer leave a check listening on a dead mic,
  a tab backgrounded during the prompt no longer lets the mic run
  hidden, and audio you start while the prompt is open can't get scored
  as your playing anymore.
- **Module 7's hammer-on/pull-off lick no longer offers a mic check** —
  playing it correctly means most notes aren't picked, which is exactly
  what the mic can't count. Correct technique was failing; now the drill
  is self-checked by ear, as it should be.
- **Small fixes:** the tuner no longer shows a stale green readout after
  closing or switching strings; chord-demo buttons can't get stuck in
  their pressed style; a "Save failed" message can no longer be wiped
  before you see it; the metronome can't be armed silently during a
  check; and switching accounts on a shared device no longer fires
  celebration confetti for the new user's old completions.

## 2026-07-11 — Every set now tells you which song it unlocks

### Added
- **🎸 Song badges.** Sets that build one of the six core songs now say
  so right at the top — *"This set unlocks: Seven Nation Army · Luna"* —
  with each name linking to that song's Journey page. Twenty-one sets
  across the course carry badges, every one hand-checked against a real
  drill in that set (no decorative claims).
- **The check-off echoes it.** Mark a skill "I've got it!" in a badged
  set and the checklist answers: *"🎸 You can now play more of Luna."*
  Progress reads as songs growing, not boxes ticking.

## 2026-07-11 — Design polish: friendlier on phones, kinder on eyes

### Changed
- **Dark mode looks finished.** The purple chips on Module Reviews, the
  tuner button, and the welcome card used to glare bright-lavender on
  dark phones — the whole purple family now adapts to dark mode like
  the rest of the site's colors.
- **Easier to tap.** The module progress strip, tuner string buttons,
  set pills, and tool buttons all grew comfortable finger-sized tap
  areas — fewer missed taps on phones.
- **Small wins feel like wins.** The tuner's note pops green the
  instant a string locks in tune; Coach and Change Up report cards
  slide up like a graded paper; and checking off a module's last skill
  fires a little burst on the progress strip.
- **"3 skills left in Module 4."** The progress strip now tells you
  exactly how close the current module is to done.
- **The mic never runs in a hidden tab.** Switch tabs or lock your
  phone mid-check and the mic shuts off (and the tuner closes) — start
  again with one tap when you're back. Better privacy, better battery.
- **Calmer for those who need it:** the site now honors your device's
  "reduce motion" setting; faint gray labels darkened; buttons press
  down satisfyingly under your thumb; the header fits small phones.

## 2026-07-11 — Bug-fix round for the new mic features and player

### Changed
- **The mic can no longer get stuck on.** Closing a Coach card or game
  while the browser's microphone-permission prompt was still open could
  leave the mic recording invisibly and silence every ▶ Play button
  until reload — fixed, along with a double-click case that could open
  two mic streams at once.
- **Short drills are scorable now.** Two-note checks (like Luna's
  F5↔A5 vamp) always answered "I couldn't hear that clearly" no matter
  how well you played — the Coach now scales its "did I hear enough"
  bar to the length of the drill.
- **Power-chord checks name the right note.** The listening strip and
  wrong-note feedback used to name a chord's higher note instead of its
  root (E5 showed as "B").
- **Playing demos and checks don't fight anymore.** Starting a check
  now silences any running demo, chord strum, or metronome click (they
  were being scored as *your* playing), and the demo Stop button works
  during a check.
- **Songs panel: every button works.** Tutorial and backing-track
  buttons were dead for songs with apostrophes — *Sweet Child O' Mine*,
  *Knockin' on Heaven's Door*.
- **Video player fixes:** the corner tool buttons no longer sit on top
  of the player's controls while a video is open, and short landscape
  screens no longer clip the player's header off-screen.
- **Readability fixes:** the Coach's Start button was nearly invisible
  in dark mode; the "mic on" indicator is easier to read in both themes;
  the low-E string now registers on more audio hardware; keyboard users
  no longer land on an invisible button.
- **Module 1's assessment checklist** now includes the tune-up's
  "without restarting" bar and the full clean-tone standard, matching
  the course assessment exactly (Module 3's now names its two strum
  patterns too).

## 2026-07-11 — Semester 2: the tested-but-never-taught gaps are closed

### Added
- **Module 7:** a lick TAB that finally contains real **hammer-ons,
  pull-offs, and slides** — the markings your assessment asks you to
  recognise AND play now exist somewhere you can play them, with a
  legend and a what-your-hand-does breakdown for each. And the promised
  **F# and B♭ barre chords** get their own challenge: both shapes,
  diagrams, and audio — F# lives all over "Hotel California," B♭ is the
  big IV chord in "Hey Jude."
- **Module 9:** "Read It Up High" now actually goes up high — a new
  cold-read TAB living entirely at frets 5–10, after the low warm-up.
  Plus a **partial-shape chart** drill (reading charts that only show
  three strings), and the Module Review checklist gains the two skills
  it was missing.
- **Module 12:** fingerstyle no longer assumes you remember Module 8 —
  a 60-second **p-i-m-a claw check** re-anchors which finger owns which
  string, and a dedicated **4-note arpeggio drill** on Am and C builds
  the even-volume roll your Travis and waltz patterns sit on.
- **Module 8 fix:** the review checklist's p-i-m-a skill now points its
  "Review this" link at the set that actually teaches it.

## 2026-07-11 — Getting around the site is much faster

### Added
- **No more dead ends.** Every station now ends with a "Next" button —
  finish Station B and one tap takes you to Station C, then to your
  skills checklist, then to the next set (or the Module Review). No more
  scrolling back to the top to find where to click. A **↑ Top** button
  also appears in the corner once you've scrolled down.
- **📍 Show me where.** Every skill on your checklist now has a link that
  jumps straight to the steps that teach it — they light up briefly so
  you can't miss them. Not sure how to practice "folk strum"? One tap
  shows you the lesson.
- **🔍 Find.** A search button at the top of the page searches every
  step, skill, and set across all twelve modules. Type "F chord" or
  "pentatonic" and tap a result to jump right to that spot in the site.
- **♪ Songs.** One button lists every song on the site — core songs
  first — with each song's tutorial, backing track, Song Journey page,
  and which modules teach it.
- **Station C now says the quiet part out loud:** do Station B first on
  your first pass, but coming back another day just to practice is not
  cheating — split days are how skills stick.

## 2026-07-11 — Skills you're tested on are now actually taught

### Added
- **Module 2:** two new challenges — play the **bass line of Let It Be**
  (the real roots, on your two lowest strings — a head start on a song
  you'll play for real in Module 5), and a **Mystery TAB** you've never
  heard: read it cold, play it, THEN hit play to check yourself. That's
  genuine sight-reading practice, which the module's assessment always
  asked for but nothing let you practice.
- **Module 3:** the **split strum** ("boom-chick" — bass note, then
  strum) is now taught step-by-step with a listen-along demo, instead of
  just being named in the set goal.
- **Module 4:** the **four-phrase solo plan** is now an actual lesson —
  say it, repeat it, stretch it, come home. Your skills checklist always
  mentioned it; now the module teaches it.
- **Module 5:** three additions — a **Mystery Chart** drill (name the
  chord from an unlabelled diagram, exactly like the assessment), the
  **folk strum** (D-DU-UDU) taught properly with the skipped-beat secret
  explained, and a **waltz strum** for songs that count in three.

## 2026-07-11 — Videos float over the page instead of living in a side panel

### Changed
- **The empty frame on the right is gone.** Videos, handouts, and chord
  diagrams now open in a **floating mini-player** when you click them —
  and the page stays fully usable behind it, so you can watch the lesson
  while you read the step and type your answers. Drag it by its header
  to wherever it's not in the way; the YouTube fullscreen button is
  there when you want it big. Close with the ✕ or the Escape key
  (closing stops the video). "Open in new tab" still works from the
  player header.
- With the side panel gone, your practice steps get a comfortable
  centered column instead of being squeezed against a blank frame.

## 2026-07-11 — Games: your guitar is the controller

### Added
- **A Games button now sits next to ⚡ Daily 5** at the top of the page.
  It opens a games area with two mic-powered games — the floating corner
  stays reserved for the Tuner, Timer, and Metronome.
- **🎯 Note Hunt.** The game names a note — *"Find G on the A string"* —
  you play it, and the mic tells you if you found it. Miss, and it
  coaches you toward it: *"I heard A — go 2 frets down"*, or *"That's G
  too, but an octave higher."* Ten notes per round, score your first-try
  finds, and climb the levels: open strings → E·A → D·G → B·e → all six
  strings (naturals, frets 0–10 — the same fretboard map Modules 9 and 10
  build).
- **🔁 Change Up.** Chord changes on the clock: pick a loop — two chords
  back and forth (Am↔Em, G↔C…), then three (G–C–D…), then four
  (C–G–Am–F, the Let It Be changes) — pick a tempo, and strum on every
  beat while the chord switches each bar. The game grades every change:
  did the new chord land on beat 1, and did it ring right? Nail 85% and
  it offers you +10 BPM; struggle and it suggests backing off — and it
  names the switch that's costing you (*"Drill just G → C"*). Your best
  clean tempo per loop is remembered for the session.
- Same privacy deal as the tuner and the Listening Coach: the mic only
  runs inside a game, everything happens on your device, nothing is
  recorded or uploaded.

## 2026-07-11 — The site can hear you play now

### Added
- **🎤 Check me — the Listening Coach.** Next to every ▶ Play button
  there's now a green **🎤 Check me** button. Tap it, get four count-in
  clicks, and play the drill into your microphone — the site listens and
  gives you a report card: **right notes, on the beat, steady tempo,
  chord changes, and played-it-through**, each rated *Needs work* /
  *You're getting it* / *Great*, with one plain sentence telling you what
  to fix first. Wrong note? It names the note and the spot. Rushing? It
  shows you the BPM you drifted to.
- **🎤 Check my changes.** Chord steps get their own version: strum along
  with the count and the Coach checks whether your chord changes are
  landing on time (the thing that actually makes songs work).
- **It's honest.** If the room is loud or the take is unclear, it says
  "I couldn't hear that clearly — try again closer to the mic" instead of
  guessing. And everything happens on your device: nothing is recorded,
  nothing is uploaded, and the mic only runs during a check (you'll see
  the red "mic on" dot).
- Works everywhere drills live: practice steps, TABs, the 10-Minute
  Routine, the Daily 5, and the skills-checklist practice panels.
- **The card shows you the TAB.** Note checks display exactly where to
  play each note — string and fret, same TAB grid as everywhere else on
  the site — before and while you play. Drills that already have a TAB
  use it as-is; the rest get a sensible fingering worked out for you
  (Pattern 1 lands on the frets 5–8 box, first-position drills stay
  down at the nut).

## 2026-07-11 — The tuner settles down

### Changed
- **The tuner no longer jitters.** The needle used to tremble and the
  note name could flicker even while a string rang steadily — it now
  ignores room noise between plucks, throws away one-off glitch readings,
  and holds its verdict at the in-tune boundary instead of flip-flopping.
  It still snaps to a new string in a fraction of a second. Trust the
  green.
- **The quiet strings register now.** The B and high-e strings no longer
  need a hard pluck to show up — a normal, gentle pluck is enough (tested
  on a real guitar).
- **One tap, no Start button.** Opening the tuner starts it listening;
  closing it stops. The Start/Stop button is gone because it was just an
  extra tap between you and being in tune.

## 2026-07-11 — You can now actually PLAY the blues

### Added
- **The 12-bar blues lands in Module 11.** The I–IV–V chords you build in
  Set 3 now pour into the most-played song form in American music: A7–D7–E7
  chord diagrams, the full 12-bar map (with the quick-change and the
  turnaround), a shuffle-feel lesson video, and a comp-then-solo challenge —
  record yourself playing the 12 bars, loop it, and solo over your own
  comping. Learn this form once and you can jam with strangers for the rest
  of your life.
- **Module 10's blues scale gets its payoff.** A new "Jam it" challenge has
  you solo over a looping 12-bar form with the blues scale — following the
  changes, not just the shape. The blues scale you build there was always
  waiting for this.

## 2026-07-11 — New teachers in the mix, a requinto lesson, and play-along challenges

### Added
- **The requinto set finally has its video** — a real requinto lesson (La
  Derrota, taught in English) shows the picking style that Luna and Tu Boda
  are built on. No more "video coming soon."
- **Second voices.** Five lessons now pair two different teachers on the
  same skill, so if one explanation doesn't click, the other might: Paul
  Davids on how chords are built and which chords belong together
  (Module 11), a fingerpicking specialist on your picking patterns
  (Module 8), Andy Guitar on strumming (Module 6) and Travis picking
  (Module 12), and a bonus Rick Beato watch on why anyone can train their
  ear (Module 10).
- **Play-along challenges** in Modules 6 and 12: set the lesson video to
  0.75× speed and play along for the entire demo without stopping — because
  real songs don't wait for you.

## 2026-07-11 — Ear Spark: 2-minute ear training in every Semester 1 module

### Added
- **⚡ Ear Spark micro-drills in Modules 2–8.** Each module's practice
  station now ends with an optional 2-minute ear challenge that matches what
  you're learning: name open strings by ear (Module 2), hear power vs. full
  chords (3), sing a note back before you find it (4), hear major vs. minor
  (5), echo a strummed rhythm (6), tell the mini-F from the full barre (7),
  and track the fingerpicked bass string (8). Each one works solo — record
  yourself in a shuffled order, then name what you hear on playback — and
  has a with-a-friend variant. Your ear is being trained for the real ear
  work in Modules 10 and 11.

## 2026-07-11 — Welcome back: Module 9 now starts with a six-skill re-test

### Added
- **Module 9, Set 0 — "Prove it, don't re-learn it."** Coming back from a
  break (or joining mid-course with some playing under your belt)? Set 0 is
  six quick re-tests of the first half's core skills — open chords,
  strumming, pentatonic Pattern 1, power chords, TAB reading, and
  fingerpicking. No new material: clear each one and check it off, or flag
  it and get pointed at exactly the module that rebuilds it. Ends with a
  speed round — record all six back to back and listen with the checklist
  open.
- The Module 1 and Module 9 reviews now point returning and transfer
  players at Set 0 as the "where do I start?" placement check.

## 2026-07-11 — Ready-made practice routines: 10-minute cards + the Daily 5

### Added
- **Every module review now opens with a 10-minute practice routine** built
  from that module's own material: tune up, a one-minute finger warm-up, the
  module's toughest drill, chord or scale work, and a song — each with play
  buttons and a jump back to the set it came from. There's a print button so
  you can stick it on a music stand.
- **The ⚡ Daily 5 button** (next to the module picker) shows today's
  5-minute warm-up for your current module — a tune-up, a rotating finger
  warm-up, and one drill. It changes every day, same for everyone.
- **The 15-Day Challenge** — taking a break between modules? Inside the
  Daily 5 panel there's a 15-day list of 5-minute days that keeps your hands
  in shape (one-minute chord changes, riffs from memory, one full song for
  someone at home on the last day).

## 2026-07-11 — The whole site now works fully self-paced

### Changed
- **Every lesson now works on your own** — no classroom required. Drills that
  used to need a partner or teacher ("have a partner call out frets," "your
  teacher will demo this") now come with a solo version first: homemade
  flashcards, record-yourself-and-listen-back checks, beat-your-own-timer
  challenges. If you *do* have someone around, the partner versions are still
  there as options.
- **Module assessments are now self-checks.** Instead of signing up for a
  teacher assessment, you record yourself doing the assessment skills and
  check the recording against the list. The same goes for every set's
  performance check.
- **Reflections now go straight into the page.** Anywhere you used to write in
  a journal or on a sticky note, there's now a text box that saves with your
  progress. (Writing TAB still happens on paper — that's the skill!)
- **New posture diagram in Module 1** — a picture of both good sitting
  positions (foot on a stool, feet flat) and the "let go and the guitar stays
  put" balance test, right where you learn to hold the guitar.
- **Module self-assessments now match the full course assessment goals** —
  a few missing checks (posture and pick grip in Module 1, clean muting in
  Module 3, clean tone in Module 4, the random-chords and chart-reading
  checks in Module 5) were added to the module review checklists.

## 2026-07-10 — Module 12 is live: Fingerstyle: Travis, Waltz & Requinto — all Semester 2 modules complete

### Added
- **Module 12 — Fingerstyle: Travis, Waltz & Requinto.** The Semester 2
  capstone: keep a Travis-style alternating thumb going while your fingers
  pinch and fill on top, fingerpick in waltz time (3/4), and finally play
  "the cure" and Luna's intro in their true fingerpicked, requinto-flavored
  style — no more working against the grain. Ends with choosing and
  rehearsing your own showcase pattern. Three new sets, 18 new skills.
- **Modules 9–12 (Semester 2) are now all live** — The Full Fretboard &
  Writing TAB, Scales/Keys/Ear Training, Chords/Keys/Harmony, and Fingerstyle
  round out a full second semester: 12 modules, 203 skills, start to finish.

## 2026-07-10 — Module 11 is live: Chords, Keys & Harmony

### Added
- **Module 11 — Chords, Keys & Harmony.** Learn how every chord family is
  built from a scale, label a progression with Roman numerals (and see why
  Luna's F–Am vamp isn't the "famous four" — it's I–iii), figure out a song's
  key just by looking at its chord list, decode slash chords like G/B, and
  turn one movable barre shape into twelve different chords you can name on
  sight. Three new sets, 18 new skills.

## 2026-07-10 — Module 10 is live: Scales, Keys & Ear Training

### Added
- **Module 10 — Scales, Keys & Ear Training.** Learn the recipe that builds
  every major scale, find the relative minor hiding inside any major key
  (and hear why Luna's solo uses D minor pentatonic even though the song is
  in F major), build the blues scale by adding one note to a pentatonic box
  you already know, and start training your ear — transposing patterns to
  new keys and echoing short phrases back by sound alone. Three new sets, 18
  new skills.

## 2026-07-10 — Module 9 is live: The Full Fretboard & Writing TAB

### Added
- **Module 9 — The Full Fretboard & Writing TAB.** Semester 2 starts here:
  you'll finish naming every note on all six strings (not just the low E and
  A from Module 2), learn the octave shortcut that turns one memorized note
  into several, read TAB up the neck, and write your own TAB that someone
  else could actually play. Three new sets, 18 new skills.

## 2026-07-10 — Luna's chords corrected, plus a bonus intro layer

### Added
- **"Luna" Song Journey now has a bonus Layer 6** teaching the song's
  fingerpicked intro — rolling through the same little-F chord shape you
  learn in Layer 5, one note at a time instead of strumming.

### Changed
- **Fixed "Luna"'s chorus chords**: the song is F and Am the whole way
  through, with Dm making only a brief appearance near the end of the verse
  and in the closing bridge — not "Dm and C in the chorus" as the site
  previously taught. Corrected on Module 5's Luna challenges and the Song
  Journey page.

## 2026-07-09 — One curated song list per module, plus new Spanish-language picks

### Added
- **Three new Spanish-language songs**: "La Bamba" (Ritchie Valens) in Module
  2, "De Música Ligera" (Soda Stereo) in Module 3, and "Ella Baila Sola"
  (Eslabon Armado × Peso Pluma) in Module 5 — every module now has at least
  one Spanish-language song to choose from.
- **"Just Like Heaven" by The Cure** joins Module 8's fingerpicking song list.

### Changed
- **Each module now has one combined "🎵 Songs" list** instead of a separate,
  shorter list buried in every individual set — easier to browse, and it
  collapses out of the way when you don't need it.
- **Trimmed each module's optional song picks down to a tighter, stronger
  five** so the list is easier to choose from, cutting songs that were doing
  the same job as a stronger pick already on the list.

## 2026-07-09 — Easier to use with a keyboard and screen reader

### Changed
- **Skill checkboxes now correctly announce their state to screen readers**
  when toggled — previously the checkmark showed visually but assistive tech
  could get out of sync.
- **"Saved ✓" messages now announce themselves** to screen readers instead of
  only appearing silently on screen.
- Added a proper page heading and main content landmark so screen reader
  users can jump straight to the lesson content.

## 2026-07-09 — Proper home-screen icon on iPhones

### Changed
- **Adding the site to your phone's home screen now gives you a proper guitar
  icon**, including on iPhones (iOS never picked up our old icon there — it
  showed a page screenshot instead).

## 2026-07-09 — Song Journey pages now work offline

### Changed
- **Song Journey pages now work offline, even on flaky Wi-Fi.** If you add the
  class site to your phone or laptop and later lose signal, all six songs'
  Journey pages (Watchtower, Let It Be, Luna, Seven Nation Army, Sweet Child
  O' Mine, and the cure) now load right away instead of showing a dead link.

## 2026-07-09 — Luna joins the core six songs

### Changed
- **"Luna" by Peso Pluma & Junior H is now one of our six core songs**, taking
  Oye Mi Amor's spot as the class's Latin song. You'll hear it starting in
  Module 1, play its bass notes in Module 2, drill its power-chord version in
  Module 3, solo over it in Module 4, strum it as open chords in Module 5,
  and graduate to the full barre F chord in Module 7 — it has its own
  five-layer Song Journey page, just like the other core songs.
- **Oye Mi Amor moves to the Choice song list** in Modules 6 and 7 — its
  lessons (the syncopated Latin strum and full-barre Bm) are still there for
  anyone who wants to keep playing it, just no longer required.

## 2026-07-08 — Backing tracks are simple videos again

### Changed
- **The 🎵 Backing track button now opens a plain video again**, like Original
  and Tutorial do — no more A/B loop points or speed control. The jam tracks
  already loop on their own, so just hit play and solo over them. The button
  now shows the track's key, e.g. "🎵 Backing track (Am)", so you know what to
  play in before you open it.

## 2026-07-08 — Save your favorite loops

### Added
- **The backing-track looper can now remember your loops.** Hit "💾 Save this
  loop" to name and keep a section (with its speed) for next time — it shows
  up as a pill you can tap to reload instantly, or delete with the ✕. You can
  keep up to 5 loops per song; saving a 6th asks whether to replace your
  oldest one.

## 2026-07-08 — Loop your backing tracks

### Added
- **The 🎵 Backing track button now opens a looper** instead of a plain video.
  Set a start (A) and end (B) point mid-song, nudge them by a second at a time,
  and loop the section on repeat — no more fighting the YouTube seek bar mid-
  practice. Slow the track down to 0.75× or 0.5× without changing its pitch.
  If the looper can't load for any reason, you'll still get the plain video —
  it never leaves you with a broken panel.

## 2026-07-08 — Better first-day videos in Module 1

### Changed
- **The "how to hold the guitar" step now links a full posture lesson** — feet,
  guitar on leg, back, and strumming arm — instead of a clip that only covered
  the fretting hand.
- **The guitar-care quiz now asks about something the video actually teaches**
  (keeping the wood safe from dry air). You'll still practice the safe way to
  set a guitar down at the hands-on station.

## 2026-07-08 — Module 1 videos point you to the part that matters

### Changed
- **Some Module 1 lesson videos now jump straight to the useful part.** The
  tuning video opens right where he shows how to use a tuner (skipping the
  "which tuner should I buy" section), and the guitar-anatomy video opens at the
  parts walkthrough — with a note that the later electric-guitar sections aren't
  the guitars we use. The guitar-care video now tells you that you only need its
  first few minutes. Less time hunting for the right moment, more time playing.

## 2026-07-07 — Module 1 caught up to the rest of the course

### Changed
- **Every Module 1 step now has the same support the later modules do** — a
  "Stuck?" lifeline that shrinks the task when you're struggling, a "Level up"
  when you want more of a challenge, and a "You've got it when…" so you can
  check yourself without waiting for the teacher.
- **The watch videos now give you a job while you watch** — something to look
  for, try, or copy on your own guitar — instead of just pressing play. Twice as
  many quick self-checks are sprinkled through the module, too.

## 2026-07-07 — Everything you need lives right here

### Changed
- **Retired the old Google Docs handouts behind the scenes** — everything you
  need is already built into the site, so there's nothing extra to open. Nothing
  changes on your screen.

## 2026-07-07 — Song Journey links open at the top

### Changed
- **Song Journey links now open at the top of the page** — you see the whole
  five-layer arc from the start, then scroll to the layer you're working on,
  instead of getting dropped into the middle of the page.

## 2026-07-07 — Handouts open in a clean read-only view

### Changed
- **Every module's handout link now opens in a clean, read-only view** — no
  more "request access" wall, and no chance of accidentally editing the master
  copy. Just open, read, and follow along.

## 2026-07-07 — "the cure" joins the Song Journey

### Added
- **"the cure" joins the Song Journey** — every "the cure" card now links to
  its five-layer page, just like the other core songs, so you can see the whole
  arc from listening to the capo-1 strum.

## 2026-07-07 — Module 3's unit check spells out all three parts

### Added
- **A new "Name your progression: I–IV–V" step in Module 3** — learn how
  musicians number chords (A5–D5–E5 is a I–IV–V in A) and read a three-chord
  progression straight from the symbols, exactly like the unit check asks.
- **Module 5 gets a Week 17 "Call & Response" step** — improvise a
  question-and-answer solo over any Module 4 backing track, the same way the
  semester-wrap check works. Want a partner? Trade phrases as the level-up.

### Changed
- **Module 3's end-of-unit summary now matches the real check** — all three
  parts, spelled out: a core-song excerpt with a clean same-fret switch between
  E- and A-root power chords at 60 BPM (then 80 for 15 seconds), a I–IV–V read
  from chord symbols with your named strum, and the clap-and-count rhythm.
- **All Along the Watchtower's loop is written `Am–G–F–G` everywhere** — the
  little G turnaround you hear on the record.
- **Week numbers are gone from the site** — the Call & Response step and one
  song tag now say "semester wrap" instead. Your pace is your pace; the class
  calendar lives in class.

## 2026-07-07 — Unit checks now match exactly what you'll be graded on

### Added
- **Module 4 has a new "Cold Read" step:** read a short 1-bar pentatonic lick
  straight from TAB and play it — no one plays it for you first. It's the new
  second half of your pentatonic unit check, so now you get to rehearse it before
  the real thing.

### Changed
- **Module 4's solo check is clearer about what counts:** you name your *phrasing
  strategy* (call-and-response or four-phrase) — you're no longer asked to
  announce the scale and root, which weren't part of the score.
- **Module 2's end-of-unit check now spells out both parts:** play the
  Watchtower low-E line (or the "the cure" root line) from memory at 60 BPM, and
  name the E & A notes through fret 12 *plus* sight-read a short 2-bar line from
  TAB.
- **Module 3's rhythm clap-and-count now includes half notes**, so you read and
  name all four note values — whole, half, quarter, and eighth.
- **Module 5's open-chord check now says the teacher names three chords** (not
  two) for your 8-bar progression at 70 BPM.

## 2026-07-06 — Station B checklists now fold up, just like Station C

### Changed
- **Station B (the computer station) is now organized into collapsible
  sections** in every set — Watch, Listen, Try it, and Wrap-Up steps are grouped
  under headers you can open one at a time, exactly like Station C. The first
  section starts open and the rest stay tucked away, so long step lists no
  longer feel like a wall of text. The steps themselves are unchanged.

## 2026-07-05 — Module 5 open chords, tuned to the songs you'll actually play

### Added
- **"the cure" comes to Module 5** with a capo-1 play-along — put a capo on the
  first fret and loop Am–C–Dm–F–G up a tempo ladder, with every shape pre-loaded
  on screen.
- **The "My Practice Routine" weekly check-in continues into Module 5.**

### Changed
- **Oye Mi Amor now uses its real chords, D–A–Bm–G**, in both the Set 3 and Set 4
  strum-alongs — the same progression you're asked to play from memory. Every
  chord is one you've already learned by that point.
- **Let It Be's C–G–Am–F verse is clearly marked as your in-class assessment
  song**, and the strum goals now name 70 BPM — the tempo you're actually aiming
  for.
- **Seven Nation Army and Sweet Child are marked as optional in this unit**, and
  "Happy Birthday" as supplemental, so the songs the unit is really built around
  stand out.
- **Your written "My Guitar Adventure" semester reflection is just for you** — a
  check-in, not something graded as part of the showcase.

## 2026-07-05 — Module 4 gets real backing tracks to solo over

### Added
- **Every core song now has a "🎵 Backing track" button** — one click and a jam
  track in the right key starts playing, so you always have something to solo
  over even when practicing solo. No more "have a partner play it."
- **Oye Mi Amor joins Module 4** with its own B-minor pentatonic solo, so our
  Latin core song is part of the improvising unit too.

### Changed
- **The Set 1 scale climb is now clearly a warm-up, not "the assessment."** Your
  real Module 4 assessment is your improvised solo, played in time with the
  backing track from start to finish.
- **The end-of-unit solo now asks you to name your phrasing strategy** (call-and-
  response or four-phrase) and to hold the track's pulse without restarting —
  exactly what the solo is graded on.
- **"Happy Birthday" is marked supplemental** rather than a core-thread song.

## 2026-07-05 — Module 3 power chords line up with the assessment

### Added
- **A new Oye Mi Amor Bm5–A5 drill** — meet Bm5 as a two-finger power chord and
  rock between the two verse chords up a 60→70→80 tempo ladder, exactly the drill
  the course plan calls for.
- **A Sweet Child O' Mine rehearsal step** (D5·C5·G5) clearly marked as one of the
  songs you can bring to the in-class check — with a note that we play it in
  standard tuning even though the record is tuned down a half step.
- **A "Clap & Count" rhythm step** so you read and clap whole, quarter, and eighth
  notes before you play them — and can name your strum as "straight eighths".
- **The "My Practice Routine" weekly check-in continues into Module 3.**

### Changed
- **The timing goals now match what you're actually assessed on:** change chords
  on beat 1 at 60 BPM, then hold 80 BPM for 15 seconds — instead of a vague "70+".
- **The Oye Mi Amor chorus is now the real chord order** (D5–A5–Bm5–G5).
- **"the cure" as power chords is now a clearly optional, no-score stretch**, and
  "Happy Birthday" is marked supplemental rather than a core-thread song.

## 2026-07-05 — Module 2 lines up with the core song thread

### Added
- **Seven Nation Army is now a core song in Module 2**, not a side option — the
  low-E riff you learn here is part of the thread you carry all semester.
- **"the cure" joins Module 2** as a bassline you play on single notes, and
  **Oye Mi Amor** shows up as a listen-ahead card so our Latin core song stays in
  view even before you play it.
- **The "My Practice Routine" weekly check-in continues into Module 2** — same
  quick, never-graded plan, now asking how last week's practice actually went.

### Changed
- **The Watchtower bass riff is clearly labeled as your in-class assessment
  piece**, so you know exactly what you'll be asked to play.
- **"Happy Birthday" is framed as a supplemental song** rather than a core-thread
  song (it's still a great melody to practice on E & A).

## 2026-07-05 — Module 1 tuned up to match the semester's song thread

### Added
- **Module 1 now introduces all of the semester's core songs on day one.** The
  Set 1 listening list shows Seven Nation Army, Sweet Child O' Mine, Oye Mi Amor,
  "the cure", and All Along the Watchtower as listen-and-explore cards, each
  linking to its 🧵 Song Journey — so you meet the songs you'll grow into all
  year right from the start.
- **A "My Practice Routine" weekly check-in** — a quick, never-graded spot to jot
  what you want to get better at, when and where you'll practice, and how last
  week went. It's just for you, and it'll follow you into every module.

### Changed
- **Your first melodies are about clean, steady notes — not hitting a number.**
  The open-string and "Happy Birthday" melodies no longer read as a 60-BPM test;
  the metronome is there to help you stay steady, but the goal is notes that ring
  clean. (60 BPM is still there to practice against when you're ready.)
- **"Happy Birthday" is now framed as your first real song rather than a
  core-thread song** — it's still one of the first things you'll play, just not
  one of the songs the whole semester is built around.

## 2026-07-03 — "Take It to a Song" comes to Modules 6–8

### Added
- **Every practice station in Modules 6–8 now ends with a "Take It to a Song"
  challenge** — the same real-song payoff Modules 2–5 already have. Each one
  puts the skill you just drilled straight into a song from the class song
  thread:
  - **Module 6 (strumming):** strum Watchtower and Knockin' on Heaven's Door
    with steady down-up 8ths; put the D-DU-UDU pattern on I'm Yours and the
    Oye Mi Amor verse; then play Watchtower two ways — folk like Dylan, rock
    like Hendrix — and give Three Little Birds the reggae chop.
  - **Module 7 (TAB & barre chords):** play Seven Nation Army with the
    record's real rhythm; slide one E-shape barre through the whole Sweet
    Child O' Mine verse; graduate Oye Mi Amor to the full barre Bm; and play
    Watchtower with no open chords at all.
  - **Module 8 (fingerpicking):** fingerpick "the cure" from your very first
    p-i-m-a plucks to its full verse loop, and turn Let It Be into a
    fingerpicked lullaby.
  Every challenge has the usual "you've got it when", Stuck?, and Level-up
  help, and the thread-song ones link to their 🧵 Song Journey layer.

## 2026-07-03 — Three more Song Journeys: every thread song now has one

### Added
- **Song Journey pages for Sweet Child O' Mine, Oye Mi Amor, and Let It Be** —
  every song that threads through multiple units now has its own journey page,
  five in all. Each one is shaped around where its song actually lives in the
  course:
  - **Sweet Child O' Mine** grows through Units 2–5 (bass roots → power chords
    → pentatonic solo → open chords), with the famous intro riff waiting as
    the Module 7 stretch goal.
  - **Oye Mi Amor** grows through Units 3–7 (power chords → open chords →
    the Latin strum → the full barre Bm — the last layer is the graduation).
  - **Let It Be** grows through Units 5–8 (open chords → down-up strum →
    fingerpicking the verse), in four layers.
  Every layer has TAB or a rhythm map, Stuck?/Level-up help, and a
  rate-yourself button that saves when you're signed in.
- **The modules link to all of them.** Challenges for these songs in
  Modules 2–5 end with a "🧵 Song Journey" link to the layer you're on, and
  every entry for these songs in the Songs lists (Modules 2–8) has the
  🧵 Song Journey button.

## 2026-07-03 — Second Song Journey page: All Along the Watchtower

### Added
- **All Along the Watchtower now has its own Song Journey page** — the second
  song to get one, after Seven Nation Army. It follows the song through all
  five units: listening to Dylan vs. Hendrix, the three-note bass line, power
  chords, soloing with A minor pentatonic, and the full open-chord campfire
  version — each layer with TAB, Stuck?/Level-up help, and a rate-yourself
  button that saves when you're signed in.
- **The modules link to it everywhere the song appears.** Watchtower challenges
  in Modules 1–5 end with a "🧵 Song Journey" link that jumps to the layer
  you're on, and the song's entry in every Songs list (Modules 1–7) has the
  🧵 Song Journey button.

## 2026-07-03 — Song Journey: easier to find, and ratings now save

### Added
- **The Seven Nation Army Song Journey page is now linked from the modules.**
  Every Seven Nation Army challenge in Modules 1–4 ends with a "🧵 Song Journey"
  link that jumps straight to the layer you're working on, and the song's entry
  in each Songs list has a new 🧵 Song Journey button — so you can always see
  where the song has been and where it's going next.

### Changed
- The **rate-yourself buttons** on the Seven Nation Army Song Journey page now
  **remember your answer**. If you're signed in on the class site, your 1–2–3
  rating for each layer saves automatically (you'll see "Saved ✓" at the top)
  and is highlighted again next time you open the page — on any device. Not
  signed in? The page still works; it just tells you to sign in if you want
  your ratings kept.

## 2026-07-03 — Every set now ends with a real song

### Added
- **"Take It to a Song" sections in Modules 2–5.** Almost every practice station
  now finishes by putting the skill you just drilled into an actual song from the
  class song thread — naming and playing the Seven Nation Army riff in time,
  sliding power chords through All Along the Watchtower, improvising over a
  backing groove, and strumming Let It Be and Oye Mi Amor with full open chords.
  Each one tells you exactly what "you've got it" sounds like, and has the usual
  Stuck? and Level-up help.
- **TABs can now show two-note power chords** — both fret numbers stacked in one
  column, and the ▶ Play button sounds both notes together, so what you hear
  matches what you play.
- **A new Song Journey page for Seven Nation Army** — one page that walks the
  song in five layers, from the bare riff up to the full arrangement, with a
  rate-yourself button on each layer. It's the first of its kind; more songs
  will get their own journey pages soon.

### Changed
- **Module 5, Set 3's song challenge is now Oye Mi Amor.** Instead of a song
  using chords you hadn't fully learned together, you now take the chorus
  (A · D · E) for a first spin — with a sneak preview of the E chord: it's just
  the Em you already know plus one finger. E still gets its full lesson in Set 4.

### Added
- A row of **8 little progress bars** now sits next to the Module dropdown — one
  per module, showing your own progress at a glance: solid green when you've got
  every skill in a module, light green when you're partway, and plain when you
  haven't started. Your current module is highlighted, and a running tally
  ("2½ of 8 modules") sums it up. Each bar is clickable, so you can jump straight
  to any module.
- The **Module dropdown** now shows how many skills you've marked in each module,
  e.g. "Module 5 — Open Chords · 7/24", with a ✓ once you've finished them all.
- The **set buttons** (Set 1, Set 2…) now show your progress too: a green ✓ when
  a set is fully done, or a small count like "· 3/6" once you've started it. These
  update instantly as you mark skills — no need to reload.
- A slim **footer** with a **Report a problem** link. It opens an email to
  Mr. Hoffman already filled in with which module and set you're on, so you don't
  have to explain where you were.

### Changed
- Tidied the top of the practice area — the set buttons now sit right under the
  Module row (the redundant "Select a set" label is gone), giving a little more
  room for the lesson itself on smaller screens.

## 2026-07-02 — A cleaner, more polished look

### Changed
- The whole site got a visual refresh so it looks sharper and reads the same on
  every device — school computer, Chromebook, phone, or home laptop. Text now
  uses each device's built-in system font instead of one that only some computers
  had installed, so nothing looks "off" depending on where you sign in.
- The purple header is now a single, consistent shade that matches the accent
  colors used throughout the app, and it sits under a subtle shadow so the page
  feels a little more like an app.
- The **Listen** (read-aloud) and **Print this set** buttons now use crisp icons
  that match the Tuner, Timer, and Metronome buttons, instead of stray emoji.
- Card and divider lines are a touch crisper on lower-resolution screens like
  Chromebooks, so everything stays clearly outlined.

## 2026-07-02 — Refreshed the songs you'll play all semester

### Added
- Three new songs join the course thread — the ones you'll return to as your
  skills grow: **"Oye Mi Amor" (Maná)**, **"Let It Be" (The Beatles)**, and
  **"the cure" (Olivia Rodrigo)**. Each shows up across several modules — you'll
  first *listen* for the guitar, then solo over it, strum it, and finally
  fingerpick or barre it as you level up. Every "coming soon" song slot that used
  to just say *"Core Song 2 — TBD"* is now a real, playable song with an official
  video and a beginner tutorial.

### Changed
- The core songs everyone learns together are now: Seven Nation Army, All Along
  the Watchtower, Sweet Child O' Mine, Oye Mi Amor, Let It Be, and "the cure."
- A few songs that used to be "everyone" songs — **Stand By Me, Tu Boda, Sailor
  Song, and House of the Rising Sun** — moved to the **Choice menu** instead, so
  they're still there to pick and play, now with a difficulty dot to help you
  choose. Nothing was removed.

## 2026-07-02 — A gentler catch when something goes wrong

### Added
- If the page ever hits a glitch, instead of quietly half-loading and leaving
  you stuck, a small message now pops up: *"Something hiccuped — your saved
  progress is safe, please refresh."* Your work is stored on the server, so a
  refresh always picks up right where you left off.

## 2026-06-15 — Fixed a broken song tutorial video

### Fixed
- **Modules 6 & 8:** the "How to play" tutorial link for **"House of the Rising
  Sun"** had gone dead (the video was taken down), so clicking it led nowhere.
  Swapped in JustinGuitar's beginner lesson, which walks through the same
  fingerpicked/arpeggio pattern. Every other video link on the site was
  re-checked at the same time — all 230 are working.

## 2026-06-15 — No more time limits on activities

### Changed
- **All modules:** the little "⏱ X min" time tags on every step are gone. They
  read like time limits, and the class is meant to be self-paced — everyone
  moves through the activities at their own speed. (The optional Timer tool is
  still there for "beat your record" practice drills if you want it.)

## 2026-06-15 — Clearer challenge labels

### Changed
- **All modules:** every practice challenge's success line is now labeled
  **"You've got it when:"** instead of **"Win:"** — clearer about what it means
  (how you know you've nailed it) and friendlier in tone.

### Fixed
- A couple more spots where a sentence-leading "A" (like "A note still buzzes…")
  could pop up an A-chord diagram by mistake — reworded so they read as plain
  English.

## 2026-06-15 — Easier-to-read instructions

A readability pass across the whole site to make directions clearer.

### Changed
- **All modules:** long, complex sentences in the instructions and hints were
  broken into shorter, more direct ones. Same friendly tone and the same
  information — just easier to follow at a glance.
- **Modules 1 & 4:** the two listening clips are now labeled **Clip 1** and
  **Clip 2** (instead of "Clip A" / "Clip B"), so the labels can't be mistaken
  for chord names.

### Fixed
- A grammatical "A" at the start of a sentence (like "A guitar that falls…") no
  longer pops up an A-chord diagram by mistake. Real chord references (A, A
  major, etc.) still link as before.

## 2026-06-14 — Modules 1–3 proofread fixes

A pass over the first three modules caught a couple of things that could trip you up.

### Fixed
- **Module 2:** the "Play A string" listen button was sounding a wrong note (a
  B-flat where it should have been a B). It now plays the correct pitch, so the
  notes you hear match the notes you're learning.
- **Module 3:** the F5 power-chord diagram was drawn in the wrong spot on the
  neck — it now shows in the right position.

### Changed
- **Module 3:** the Watchtower loop chord is now labeled **A5** instead of
  "Am5." A power chord has no major or minor — it's just A5 — with a quick note
  that the original song's chord is Am. The "Smells Like Teen Spirit" chord list
  was also corrected.
- **Module 1:** clearer wording — "a short melody on the E string" (the old
  phrasing called it an "open-string" melody even though it uses fretted notes).

## 2026-06-14 — Module 6 (Strumming) brought up to the course template

Module 6 now teaches with the same structure and supports as every other module.

### Added
- **Chord diagrams** at each chord's first use (Em/Am, G/D, C) on the computer
  stations, so students can see the shape, not just read its name.
- **Strum-pattern visuals** — a monospace down/up line aligned over the
  "1 + 2 + 3 + 4 +" count on the down-up, D-DU-UDU, folk, rock, and reggae
  challenges, so the rhythm is something you can *see*.
- **"Stuck?" and "Level up" tips** on every graded challenge, **time budgets**
  on each step, **Timer** references, and a **warm-up spiral** at the top of
  every set.
- **Personal-record ladders** (type your fastest clean BPM and beat it next
  class) and a **named assessment piece** per set — including a new
  "Two Feels, One Song" challenge that practices switching strum styles mid-song.
- A fuller **Module 6 review** (six "I can" lines, an assessment box, and a
  forward link into the barre-chord module).

### Changed
- Every lesson video now points at a specific timestamp range with a clear
  "job while you watch," instead of linking the whole video.

### Behind the scenes
- Finished the pre-launch checklist (live sign-in save test, printable handouts,
  accessibility) and tidied the repo so internal planning docs are no longer
  served on the public site.

## 2026-06-14 — Performance pass

A deep-dive optimization pass focused on first load on slow school Wi-Fi /
Chromebooks. No student-facing behavior changed — sign-in, progress saving, and
all content work exactly as before, just faster to load.

### Changed
- **Lazy-load module content.** The eight `module-N.js` data files are no longer
  loaded on every visit. Each is fetched on demand the first time its module is
  opened, and only that module's panels are built into the page (previously all
  modules were parsed and every set's panels were built up front on each load).
  The Module dropdown now populates from a lightweight manifest. The service
  worker still precaches every module, so offline use is unaffected.
- **Defer the Firestore SDK.** The ~100 KB Firestore library (two-thirds of the
  Firebase payload) is no longer loaded up front. It's fetched on demand the
  first time progress is read or written — i.e. only after sign-in — and
  pre-warmed during the Google sign-in popup. The sign-in screen now loads with
  only ~50 KB of Firebase instead of ~151 KB.
- **Consolidated progress saving.** Skill, last-place, response, and completion
  saves now batch into a single debounced Firestore write instead of up to three
  near-simultaneous writes, reducing write volume and simplifying the code.

### Evaluated, not adopted
- **Modular Firebase SDK swap.** Measured the actual CDN sizes: without a build
  step (which this project deliberately avoids), the modular SDK is ~23 KB
  *larger* than the current compat build. Skipped in favor of the Firestore
  defer above, which achieves the same goal at lower risk.
