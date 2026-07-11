// ============================================================
//  MODULE 12 — Fingerstyle: Travis, Waltz & Requinto
//  Edit this file to change Module 12 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm12w1',
    label: 'Set 1',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    title: 'Set 1',
    subtitle: 'The thumb becomes a drummer · Pinch on the downbeat · Fills between',
    objective: 'I CAN keep an alternating thumb-bass going and add pinches and finger fills over it.',
    skillFocus: 'Thumb alternates two bass strings in quarter notes · Pinch = thumb + finger together · The thumb NEVER stops',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/rGt-lMXYzZc" target="_blank">Folk Fingerstyle Patterns #1 — Travis Picking (FO-101) – JustinGuitar</a>.',
                hint: 'In Travis-style picking, the thumb is the engine — steady quarter notes on two bass strings while the fingers decorate on top.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'In Travis-style picking, the thumb\'s job is to:',
                  answer: 1,
                  explain: 'The thumb is the engine — steady quarter notes on two bass strings while the fingers decorate on top.',
                  choices: ['Play melody', 'Alternate steadily between two bass strings like a drummer', 'Strum', 'Rest'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle — Travis Finger Picking (FO-108) – JustinGuitar</a> (this was Module 8\'s teaser — now it\'s the main event; watch the full pattern section).',
                hint: 'A pinch is bass and treble sounding at the same instant — the signature Travis accent.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'A "pinch" is:',
                  answer: 1,
                  explain: 'Bass and treble sound at the same instant — the signature Travis accent.',
                  choices: ['Two fingers on one string', 'Thumb and a finger plucking together on the beat', 'Muting the strings', 'A very quiet note'] }
              }
            ]
          },
          {
            title: 'Listen for the alternating bass',
            steps: [
              {
                text: 'On a C chord, the alternating thumb usually bounces between two bass strings. Listen for it in a Travis-picked recording of your choice.',
                hint: 'The root (A string) and a neighbor — the C chord\'s bass lives on string 5, so the thumb anchors there.',
                skills: [1, 4],
                response: { type: 'mc', prompt: 'On a C chord, the alternating thumb usually bounces between:',
                  answer: 1,
                  explain: 'The root (A string) and a neighbor — the C chord\'s bass lives on string 5, so the thumb anchors there.',
                  choices: ['Strings 6 and 5', 'Strings 5 and 4 (or 5 and 3)', 'Strings 2 and 1', 'Any two strings at random'] }
              }
            ]
          },
          {
            title: 'Try the alternating thumb',
            steps: [
              {
                text: 'Now try it: alternate your thumb between strings 5 and 4 over a C chord, 8 bars, no finger notes yet.',
                hint: 'Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat.',
                skills: [1, 5],
                response: { type: 'mc', prompt: 'If your fingers get lost mid-pattern, what must keep going no matter what?',
                  answer: 1,
                  explain: 'Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat.',
                  choices: ['The melody', 'The thumb bass', 'The metronome app', 'Your foot'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — take a beat to reflect: what tempo could you hold the alternating thumb today without it stumbling?',
                response: { type: 'short', placeholder: 'e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — alternating thumb & the pinch',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Alternate the thumb between two bass strings',
            steps: [
              {
                text: 'Challenge 1 — Thumb Only: alternate strings 5↔4 in quarter notes, 60 BPM, 8 bars, zero finger notes. You\'ve got it when: a steady, even alternating thumb with no wobble.',
                hint: 'Compared to Module 8\'s p-i-m-a-m-i arpeggio, the thumb ALTERNATES between bass strings instead of staying put — that bounce is the whole style.',
                stuck: 'Drop to half tempo and count "1-2-3-4" aloud, landing the thumb exactly on each number.',
                levelUp: 'Add a chord change Am↔C every 4 bars without the thumb missing a beat.',
                skills: [1, 4],
                playSeq: { label: 'Thumb alternation on C — strings 5 & 4', bpm: 60, notes: [48, 52, 48, 52] }
              }
            ]
          },
          {
            title: 'Add the pinch',
            steps: [
              {
                text: 'Challenge 2 — The Pinch: pinch (thumb string 5 + m on string 2) on beat 1, thumb alone beats 2–4. You\'ve got it when: both notes of the pinch sound together as one, perfectly in sync.',
                hint: 'A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet.',
                stuck: 'Pluck the bass and the treble separately first, slowly, then bring them closer until they land together.',
                levelUp: 'Add a second pinch on beat 3, or hold the thumb alternation through an Am↔C change.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Add finger fills',
            steps: [
              {
                text: 'Challenge 3 — Fills: keep the thumb going, add i on the "and" of beat 2. You\'ve got it when: the fill lands cleanly between two thumb strokes without slowing the thumb down.',
                hint: 'Fingers decorate ON TOP of an already-grooving thumb — the thumb\'s rhythm never bends to fit the fingers.',
                stuck: 'Isolate just the thumb + one fill note, looping it until it\'s automatic before adding more.',
                levelUp: 'Add a second fill on the "and" of beat 4.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Keep the pattern through a chord change',
            steps: [
              {
                text: 'Challenge 4 — Am↔C: play the alternating thumb + pinch pattern through an Am↔C change. You\'ve got it when: the pattern survives the change with the thumb never stopping.',
                hint: 'Anticipate the change — start moving your fretting hand on the last note of the bar so beat 1 always lands ready.',
                stuck: 'Strum Am then C once each to check both chords ring clean, then loop just the thumb through the change before adding the pinch back.',
                levelUp: 'Run Am → C → Am → C for 8 bars without a single broken beat.',
                skills: [5],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — House of the Rising Sun, bass-note + pinch verse: play the verse with your alternating thumb and pinch pattern, following the chord progression. You\'ve got it when: the verse survives every chord change with the thumb never stopping.',
                hint: 'This song is the textbook example of alternating-thumb fingerpicking — the bass moves on every beat, the fingers play between the beats.',
                stuck: 'Loop just the first two chords of the verse until the pattern is rock solid before adding the rest.',
                levelUp: 'Play the whole verse from memory, no chord chart.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'What tempo could you hold the alternating thumb today without it stumbling? Write it below — that\'s your warm-up target next time.',
                response: { type: 'short', placeholder: 'e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Alternating thumb in steady quarters · Clean pinch on the downbeat · Pattern survives an Am↔C change',
      performance: 'Record yourself thumb-drumming at 60 BPM for 16 bars; listen back for your thumb stopping when the fills enter.',
      selfCheck: 'Can your thumb keep going while you talk? Does the pinch land exactly together, or does one note leak first?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm12w1-s1', text: 'Alternate the thumb between two bass strings in steady quarter notes',
        practice: { type: 'playSeq', label: 'Thumb alternation on C — strings 5 & 4', bpm: 60, notes: [48, 52, 48, 52] } },
      { id: 'm12w1-s2', text: 'Play a pinch (thumb + finger together) on the downbeat',
        practice: { type: 'mc', prompt: 'A pinch means the bass and treble notes sound:',
          choices: ['One after the other', 'At exactly the same time', 'Only on beat 3', 'Muted'], answer: 1 } },
      { id: 'm12w1-s3', text: 'Add i-m finger fills while the thumb keeps alternating' },
      { id: 'm12w1-s4', text: 'Play a Travis-feel pattern over C at 60 BPM for 8 bars' },
      { id: 'm12w1-s5', text: 'Keep the alternating pattern unbroken through an Am–C change' },
      { id: 'm12w1-s6', text: 'Play a bass-note + pinch verse of House of the Rising Sun',
        gotItWhen: 'the verse survives every chord change with the thumb never stopping.' }
    ]
  },

  {
    id: 'm12w2',
    label: 'Set 2',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    title: 'Set 2',
    subtitle: 'Picking in 3 · "the cure" finally at home · Your pattern, your song',
    objective: 'I CAN fingerpick in 3/4 time and play "the cure" and Let It Be in their native fingerstyle.',
    skillFocus: 'The 3/4 pattern: bass–pluck–pluck · Feeling 3 vs 4 · "Native style" — why the ◐ disappears',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music</a> (the pinch/pattern half).',
                hint: 'In 3/4 time, each bar has 3 beats — count ONE-two-three, ONE-two-three. Your bass note owns beat one.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'In 3/4 time, each bar has:',
                  answer: 1,
                  explain: 'Count ONE-two-three, ONE-two-three — the waltz. Your bass note owns beat one.',
                  choices: ['4 beats', '3 beats', '2 beats', '6 beats'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/Z4ltlHtQUA0" target="_blank">Fingerpicking Pattern for 3/4 or 6/8 Time – MrPoloniaMusic</a>. Notice the bass note always lands on beat 1, with the fingers answering after.',
                hint: 'The simplest 3/4 picking pattern: thumb states the bar on beat 1, fingers answer on 2 and 3.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The simplest 3/4 picking pattern is:',
                  answer: 1,
                  explain: 'Thumb states the bar on beat 1; fingers answer on 2 and 3.',
                  choices: ['pluck–pluck–bass', 'bass–pluck–pluck', 'bass–bass–bass', 'pinch–pinch–pinch'] }
              }
            ]
          },
          {
            title: 'Listen for the waltz feel',
            steps: [
              {
                text: 'Which course song has been our 3/4 (waltz) vehicle since the first half of the course? Think back to Happy Birthday, strummed "in 3" in Module 6-era work — now you\'ll pick it in 3.',
                hint: 'Happy Birthday is a waltz — you strummed it "in 3" in Module 6-era work; now you pick it in 3.',
                skills: [2, 6],
                response: { type: 'mc', prompt: 'Which course song has been our 3/4 (waltz) vehicle since the first half of the course?',
                  answer: 1,
                  explain: 'Happy Birthday is a waltz — you strummed it "in 3" in Module 6-era work; now you pick it in 3.',
                  choices: ['Seven Nation Army', 'Happy Birthday', 'Beat It', 'Let It Be'] }
              }
            ]
          },
          {
            title: 'Try "the cure" fingerstyle — its native style',
            steps: [
              {
                text: 'Playing "the cure" fingerstyle removes its ◐ flag — fingerpicking IS the song\'s native style, not "against the grain" like power-chording a gentle ballad. Try picking through Am–C–Dm–F, one bar each.',
                hint: 'The ◐ flag marked renderings that fought a song\'s nature. Fingerpicked, "the cure" is finally itself.',
                skills: [3, 5],
                response: { type: 'mc', prompt: 'Playing "the cure" fingerstyle removes its ◐ flag because:',
                  answer: 1,
                  explain: 'Fingerpicking IS the song\'s native style — no more "against the grain."',
                  choices: ['It\'s easier', 'Fingerpicking IS the song\'s native style — no more "against the grain"', 'The capo comes off', 'The flag was a mistake'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — take a beat to reflect: which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song?',
                response: { type: 'short', placeholder: 'e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the waltz pattern & native-style songs',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Count and pick a 3/4 pattern',
            steps: [
              {
                text: 'Challenge 1 — Count-and-Pick: play the 3/4 pattern (bass–pluck–pluck) on one chord, counting aloud, 60 BPM. You\'ve got it when: a steady 3-count with the bass landing exactly on beat 1 every bar.',
                hint: 'Keeping a pattern "unbroken" through a chord change mostly depends on moving the fretting hand early, on the bar\'s last note.',
                stuck: 'Drop the counting and just feel "long-short-short" for bass-pluck-pluck.',
                levelUp: 'Count silently in your head instead of aloud, or add a pinch on beat 1.',
                skills: [1, 2],
                playSeq: { label: '3/4 pattern on C — bass, then G string, then C on the B string', bpm: 60, notes: [48, 55, 60] }
              }
            ]
          },
          {
            title: 'Fingerpick "the cure" in its native style',
            steps: [
              {
                text: 'Challenge 2 — "the cure" Native Style: fingerpick capo 1, Am–C–Dm–F, one bar each, pattern of your choice. You\'ve got it when: the ◐ is gone — this IS how the song wants to be played.',
                hint: 'Native style — why the ◐ disappears: fingerpicking is this song\'s home texture, not a workaround.',
                stuck: 'Loop just Am–C until the pattern survives that one change before adding Dm–F.',
                levelUp: 'Add a pinch on beat 1 of each chord.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Fingerpick Let It Be with your own pattern',
            steps: [
              {
                text: 'Challenge 3 — Let It Be: arpeggiate C–G–Am–F, your chosen pattern, working toward 70 BPM. You\'ve got it when: one full lap with the pattern unbroken through all four chords.',
                hint: 'You already fingerpicked this verse in Module 8 — now push the tempo and choice of pattern further.',
                stuck: 'Drop to 50 BPM and loop just C–G until it\'s automatic.',
                levelUp: 'Reach 70 BPM clean, or add a pinch on beat 1 of each chord.',
                skills: [4, 5]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Happy Birthday in 3, fingerstyle: play the melody\'s chords with the 3/4 bass–pluck–pluck pattern all the way through. You\'ve got it when: the waltz feel never breaks, start to finish.',
                hint: 'This is the same song you strummed "in 3" back in Module 6-era work — now you\'re picking it.',
                stuck: 'Play just the chord changes with the pattern first, humming the melody instead of picking it out.',
                levelUp: 'Sing along while you pick it.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song? Write it below.',
                response: { type: 'short', placeholder: 'e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Picks a 3/4 pattern in time · Plays "the cure" or Let It Be fingerstyle with the pattern unbroken · Explains "native style"',
      performance: 'Pick 8 bars in 4, then 8 bars in 3, then swap back and forth — record a pass and check that beat 1 always carries the bass.',
      selfCheck: 'Can you count aloud while picking in 3? Does your pattern survive the F chord?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.8a']
    },

    skills: [
      { id: 'm12w2-s1', text: 'Play a 3/4 fingerpicking pattern (bass–pluck–pluck) in time',
        practice: { type: 'playSeq', label: '3/4 pattern on C', bpm: 60, notes: [48, 55, 60] } },
      { id: 'm12w2-s2', text: 'Count and feel the difference between 3/4 and 4/4 while picking',
        practice: { type: 'mc', prompt: 'A waltz pattern repeats every:',
          choices: ['2 beats', '3 beats', '4 beats', '8 beats'], answer: 1 } },
      { id: 'm12w2-s3', text: 'Fingerpick "the cure"\'s capo-1 shapes — its native style' },
      { id: 'm12w2-s4', text: 'Fingerpick Let It Be\'s C–G–Am–F with a pattern of my choice' },
      { id: 'm12w2-s5', text: 'Keep my pattern unbroken through a 4-chord progression at 70 BPM' },
      { id: 'm12w2-s6', text: 'Play Happy Birthday\'s waltz feel fingerstyle' }
    ]
  },

  {
    id: 'm12w3',
    label: 'Set 3',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    title: 'Set 3',
    subtitle: 'Melody on top, thumb below · Luna\'s intro for real · Choose your showcase voice',
    objective: 'I CAN blend melody into a picking pattern requinto-style and perform one full fingerpicked verse.',
    skillFocus: 'The requinto role in sierreño · Melody notes ride ABOVE the thumb bass · Pick the pattern you\'ll perform with',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Video coming soon — in the meantime, listen for the requinto lines in Luna and Tu Boda from this module\'s song list. <!-- VIDEO-TODO: requinto / sierreño-style guitar picking introduction — Spanish-lane content; Jonathan reviews before it goes live -->',
                hint: 'Requinto sings the melodic lines you\'ve been hearing in Luna, Tu Boda, and La Diabla since the course\'s first tone-ID days.',
                skills: [3],
                response: { type: 'mc', prompt: 'In a sierreño group, the requinto is:',
                  answer: 1,
                  explain: 'Requinto sings the melodic lines you\'ve been hearing in Luna, Tu Boda, and La Diabla since the course\'s first tone-ID days.',
                  choices: ['The bass', 'A smaller, higher-pitched guitar that carries the melody', 'The singer', 'A drum'] }
              },
              {
                text: 'Watch: <a href="tabs/luna.html#layer-6" target="_blank">Luna\'s Song Journey — Layer 6, the fingerpicked intro</a>. This on-site lesson shows the intro rolling through the little-F shape.',
                hint: 'Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time.',
                skills: [1],
                response: { type: 'mc', prompt: 'Luna\'s fingerpicked intro rolls through which chord shape?',
                  answer: 1,
                  explain: 'Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time (Journey Layer 6).',
                  choices: ['Full barre F', 'The little F (xx3211)', 'Open C', 'Am'] }
              }
            ]
          },
          {
            title: 'Listen for melody riding on top of a steady thumb',
            steps: [
              {
                text: '"Melody on top" in fingerstyle means the tune rides the treble strings while the thumb keeps the bass going underneath — two jobs, one hand. Listen for it in Luna or Tu Boda.',
                hint: 'Two jobs, one hand — the requinto texture in a nutshell.',
                skills: [4],
                response: { type: 'mc', prompt: '"Melody on top" in fingerstyle means:',
                  answer: 1,
                  explain: 'The tune rides the treble strings while the thumb keeps the bass going underneath.',
                  choices: ['Play only high notes', 'The tune rides the treble strings while the thumb keeps the bass going underneath', 'The melody comes first, chords after', 'Sing while playing'] }
              }
            ]
          },
          {
            title: 'Try melody-on-top over C',
            steps: [
              {
                text: 'Now try it: over a C chord, keep the thumb on steady quarters and pick a 3-note melody on strings 1–2 on top.',
                hint: 'Fingerpicking makes our regional-Mexican songs sound MORE authentic than power chords did — sierreño is an acoustic, fingerpicked tradition, and this is its real timbre.',
                skills: [4, 5],
                response: { type: 'mc', prompt: 'Why does fingerstyle make our regional-Mexican songs sound MORE authentic than power chords did?',
                  answer: 1,
                  explain: 'Sierreño is an acoustic, fingerpicked tradition — this is its real timbre.',
                  choices: ['It\'s louder', 'Sierreño is an acoustic, fingerpicked tradition — this is its real timbre', 'It isn\'t', 'Distortion is illegal'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — take a beat to reflect: name your showcase song and pattern — and the one spot you\'ll drill this week.',
                response: { type: 'short', placeholder: 'e.g. "the cure," 6-note pattern — the Dm-to-F change still hiccups' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — requinto texture & your showcase pattern',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play Luna\'s fingerpicked intro',
            steps: [
              {
                text: 'Challenge 1 — Luna Intro: play the Layer 6 rolls from <a href="tabs/luna.html#layer-6" target="_blank">Luna\'s Song Journey page</a>, slow then at tempo. You\'ve got it when: all notes ring cleanly in order at performance tempo.',
                hint: 'This roll uses the little-F shape you already know from Module 5.',
                stuck: 'Fret the little F shape, strum it once to hear the target chord, then break it apart one string at a time.',
                levelUp: 'Play it twice through without stopping, or add it as your showcase intro.',
                skills: [1]
              }
            ]
          },
          {
            title: 'Play Tu Boda\'s requinto intro line',
            steps: [
              {
                text: 'Challenge 2 — Tu Boda Requinto Line: play the song\'s requinto intro line fingerstyle, reusing its existing TAB reference from the song\'s Module 6–8 material. You\'ve got it when: the line rings clean and in time.',
                hint: 'This is the real sierreño sound — a smaller, higher-pitched guitar carrying the melody.',
                stuck: 'Slow the line down to half tempo and isolate just the first 4 notes.',
                levelUp: 'Play it at full performance tempo.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Blend melody over a steady thumb',
            steps: [
              {
                text: 'Challenge 3 — Melody on Top: over a C chord, keep the thumb going in steady quarters and pick a 3-note melody on strings 1–2 above it. You\'ve got it when: the thumb never wavers while the melody rides on top.',
                hint: 'Two jobs, one hand — the requinto texture in a nutshell.',
                stuck: 'Isolate the thumb alone first, then add just one melody note at a time.',
                levelUp: 'Extend the melody to 6 notes without losing the thumb.',
                skills: [4]
              }
            ]
          },
          {
            title: 'Choose your showcase pattern',
            steps: [
              {
                text: 'Challenge 4 — Choose Your Pattern: run ALL patterns learned this course (6-note · Travis · pinch · 3/4) over one chord, then pick one and write it in the box below. You\'ve got it when: you\'ve named the pattern you\'ll perform with.',
                hint: 'The smartest choice is the one you can keep unbroken at performance tempo TODAY — not the hardest one.',
                stuck: 'If none feel ready, default to the 6-note pattern from Module 8 — it\'s the most forgiving.',
                levelUp: 'Practice your chosen pattern at 10 BPM above your current comfortable tempo.',
                skills: [5],
                response: { type: 'short', placeholder: 'e.g. Travis with a pinch on beat 1 — steady at 65 BPM today' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Full-Verse Rehearsal (your assessment piece): play one complete fingerpicked verse of your showcase song, no stopping, mistakes recovered. You\'ve got it when: you reach the last bar without stopping.',
                hint: 'Performances reward reliability, not difficulty — pick the pattern that never breaks, then make it musical.',
                stuck: 'Slow the whole verse down until you can finish it clean, even at half speed.',
                levelUp: 'Record a performance take, or play it for someone at home.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Name your showcase song and pattern — and the one spot you\'ll drill this week. Write it below.',
                response: { type: 'short', placeholder: 'e.g. "the cure," 6-note pattern — the Dm-to-F change still hiccups' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays the Luna intro rolls · Blends melody over a steady thumb · Performs one full fingerpicked verse, recovering from mistakes',
      performance: 'Mini-showcase, solo edition: record one verse, listen back, and name one strength + one target yourself — and share the recording with someone if you like.',
      selfCheck: 'Can you keep the thumb going while the melody enters? Did you finish the verse even where you slipped?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Cn.11a']
    },

    skills: [
      { id: 'm12w3-s1', text: 'Play Luna\'s fingerpicked intro (Journey Layer 6) with p-i-m rolls' },
      { id: 'm12w3-s2', text: 'Play Tu Boda\'s requinto intro line fingerstyle' },
      { id: 'm12w3-s3', text: 'Explain the requinto\'s role in sierreño / corridos tumbados',
        practice: { type: 'mc', prompt: 'The requinto\'s job in the group is:',
          choices: ['Rhythm chords', 'The melodic lead lines', 'Bass', 'Percussion'], answer: 1 } },
      { id: 'm12w3-s4', text: 'Blend melody notes into a picking pattern — tune on top, thumb bass below' },
      { id: 'm12w3-s5', text: 'Choose and name the picking pattern I\'ll perform with',
        practice: { type: 'mc', prompt: 'Your showcase pattern should be the one that:',
          choices: ['Impresses the most', 'Never breaks at performance tempo', 'Uses all four fingers', 'Is newest'], answer: 1 } },
      { id: 'm12w3-s6', text: 'Perform one full fingerpicked verse start to finish, recovering from any mistake',
        gotItWhen: 'you reach the last bar without stopping — slips allowed, stops not.' }
    ]
  }

); // end module-12.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[12] = [
      { name: '"the cure" — Olivia Rodrigo', meta: 'Full fingerpicked verse — its native style, the ◐ comes off', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Let It Be" — The Beatles', meta: 'Arpeggiated C–G–Am–F with your chosen pattern', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'The fingerpicked intro — rolls through the little-F shape', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Bass-note + pinch — the alternating-thumb classic', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Requinto intro line, fingerstyle — the real sierreño sound', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Fingerpicked verse, capo IV — pattern endurance', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"Blackbird" — The Beatles', meta: 'The capstone challenge — pinches and moving shapes', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Turn the arpeggiated riff into a picking pattern', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA' }
    ];

MODULE_REVIEWS[12] = {
  moduleNum: 12,
  module: 'Fingerstyle: Travis, Waltz & Requinto',
  skills: [
    { id: 'mr12-s1', text: 'I can hold a steady alternating thumb-bass in quarter notes for 8 bars without it stumbling', set: 'm12w1' },
    { id: 'mr12-s2', text: 'I can play a clean pinch — thumb and finger landing together — right on the downbeat', set: 'm12w1' },
    { id: 'mr12-s3', text: 'I can pick a 3/4 waltz pattern (bass–pluck–pluck) in time, bass always landing on beat 1', set: 'm12w2' },
    { id: 'mr12-s4', text: 'I can fingerpick "the cure" or Let It Be in its native style with the pattern unbroken', set: 'm12w2' },
    { id: 'mr12-s5', text: 'I can blend a melody on top of a steady thumb bass — the requinto texture', set: 'm12w3' },
    { id: 'mr12-s6', text: 'I can perform one full fingerpicked verse start to finish, recovering from any mistake without stopping', set: 'm12w3' }
  ],
  assessItems: [
    'Play one full fingerpicked verse with a steady thumb bass and a clean, unbroken finger pattern — flagship options: "the cure" (capo 1) or Let It Be',
    'Show your chosen showcase pattern and name it'
  ],
  forward: 'Twelve modules — the whole toolkit, twice as deep as most first-year players ever get. <strong>Now comes your capstone performance:</strong> pick your song, pick your lane — strummed, fingerpicked, or riff + solo — get it performance-ready, then record a full take or play it live for people you choose. This website got you here; the stage is yours. And after your capstone? Keep the list of songs you want to learn, and go learn them — you know how now.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Cn.11a']
};
