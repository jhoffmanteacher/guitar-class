# Changelog

Notable changes to the Guitar Class site. Newest first.

For the full session-by-session history (and the reasoning behind each change),
see `WORKFLOW.md` and the git commit log.

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
