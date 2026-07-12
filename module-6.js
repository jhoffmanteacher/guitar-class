// ============================================================
//  MODULE 6 — Strumming Patterns with Chords
//  Edit this file to change Module 6 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm6w1',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', note: 'your strumming patterns power this song' }],
    label: 'Set 1',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 1',
    subtitle: 'The down-up foundation · 8th-note pulse · Counting "1 + 2 + 3 + 4 +"',
    objective: 'I CAN play a steady down-up 8th-note strum pattern over open chords without losing the beat — playing it cleanly at 60 BPM, then trying 70.',
    skillFocus: 'Keeping a steady down-up strum · Counting 8th notes · Strumming through chord changes',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/n45PDizCRLw" target="_blank">Your FIRST Strumming Pattern EVER! – JustinGuitar</a> (0:00–4:00). Your task while you watch: keep your eyes on his strumming wrist and count how many times it changes direction in one bar.',
            hint: 'Pay close attention to his wrist — it never stops moving, even when he isn\'t hitting the strings. The pendulum motion is the secret.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'What is the SINGLE most important habit for good strumming?',
              answer: 0,
              explain: 'Keep the wrist swinging like a pendulum the whole time — even on skipped strums it keeps moving. That constant motion is what makes strumming steady and relaxed.',
              choices: [
              'Keep the wrist moving like a pendulum, even between strums',
              'Strum as loudly as possible',
              'Use a very thick pick',
              'Look at your strumming hand the whole time'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (0:00–3:00). Your task while you watch: count "1 + 2 + 3 + 4 +" out loud with him for the first pattern and notice which counts get a down and which get an up.',
            hint: 'Count out loud with him: "1 + 2 + 3 + 4 +". Saying the count is the fastest way to internalize the pulse.',
            skills: [3],
            response: { type: 'short', placeholder: 'When you count "1 + 2 + 3 + 4 +", which counts are the downstrokes? Which are the upstrokes?' }
          }
            ]
          },
          {
            title: 'Feel the pulse in a real song',
            steps: [
          {
            text: 'Listen to "Brown Eyed Girl" by Van Morrison. Tap along on your leg — down with your hand on the numbers, up on the "ands". Can you feel the 8th-note pulse?',
            hint: 'You don\'t need a guitar yet. Just train your body to feel the steady pulse before you add the strings.',
            skills: [3, 4],
            response: { type: 'mc', prompt: 'In a down-up 8th-note pattern, how many total strums (down + up) happen in one bar of 4 beats?',
              answer: 2,
              explain: 'Each of the 4 beats gets a down AND an up (the "+"), so 4 × 2 = 8 strums — that\'s "1 + 2 + 3 + 4 +".',
              choices: [
              '4',
              '6',
              '8',
              '16'
            ] }
          }
            ]
          },
          {
            title: 'Form today\'s chords',
            steps: [
          {
            text: 'Meet your two chords for today: <strong>Em</strong> and <strong>Am</strong> (from Module 5). Form each shape from the diagram and strum once to make sure every string rings — you\'ll switch between these two for the rest of this set.',
            hint: 'Em uses two fingers; Am adds a third. The diagrams show exactly where each finger goes. Clean chords now make the strumming sound good later.',
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: which was harder to keep steady today — your strum hand swinging non-stop like a pendulum, or counting "1 + 2 + 3 + 4 +" out loud the whole time? What started to feel easier?',
            response: { type: 'short', placeholder: 'e.g. my hand kept freezing on the chord change — slowing to 50 BPM helped it keep swinging' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — strumming hand drill (a short exercise you repeat)',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Build the down-up pendulum motion',
            steps: [
          {
            text: 'Challenge 1 — Pendulum Motion: mute the strings with your fretting hand and, at 60 BPM, strum just the down-up motion — down on each beat, up on each "+", counting aloud. You\'ve got it when: a free, even swing with no forearm tension — pure rhythm, no notes.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'No chord, no notes — just the rhythm. Your wrist should swing freely like a pendulum. If your forearm is tense, slow down.',
            stuck: 'Drop to 50 BPM and let your hand bounce loose, like shaking water off your fingers — the down-up should feel automatic before you add any pressure.',
            levelUp: 'Push to 80 BPM, or keep the swing perfectly even with your eyes closed for 8 bars.',
            skills: [1, 3]
          }
            ]
          },
          {
            title: 'Hold a steady down-up strum',
            steps: [
          {
            text: 'Challenge 2 — Even Eighths on Em: fret Em and strum down-up at 60 BPM for 8 bars. You\'ve got it when: every strum even — same volume, same timing — with upstrokes brushing only the top 3–4 strings.',
            hint: 'It\'s normal for upstrokes to feel weaker at first. They should brush only the top 3–4 strings, not the whole chord.',
            stuck: 'Lighten the pick on the way up so it grazes just the thin strings. If the chord buzzes, recheck your Em fingers before worrying about the strum.',
            levelUp: 'Speed up to 75 BPM, or hold the 8 bars without letting your eyes drop to your strumming hand.',
            skills: [2, 4],
            playSeq: { label: 'Hear the 8th-note pulse', bpm: 60, notes: [60, 60, 60, 60, 60, 60, 60, 60] },
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Keep time through a chord change',
            steps: [
          {
            text: 'Challenge 3 — Em ↔ Am Switch (your assessment piece): switch Em ↔ Am every 2 bars while the down-up strum never stops. Set the ⏱ Timer for 3 minutes and loop it. You\'ve got it when: the strum hand keeps swinging right through every chord change — let the chord catch up.',
            hint: 'The #1 beginner mistake is stopping the strum to fix the chord. Keep the wrist moving — let the chord catch up.',
            stuck: 'Park on a finger Em and Am share and pivot around it — don\'t lift every finger at once. Drop to 50 BPM so the change has room.',
            levelUp: 'Switch every bar instead of every 2 bars, or climb to 75 BPM with the strum still unbroken.',
            skills: [4, 5, 6],
            response: { type: 'short', prompt: 'Personal record — strum unbroken through Em↔Am: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN switch today (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time' },
            playSeq: { label: 'Em → Am roots (2 bars each)', bpm: 60, notes: [40, 40, 45, 45] },
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Watchtower, strummed for real: play Am · G · F (small F), four beats of down-up strumming per chord at 60 BPM, the pendulum swinging through both changes. You\'ve got it when: two full laps (a lap = one full time through the loop) where the strum hand never stops — not even when the F lands late. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this song has grown with you since Unit 1</a>.',
                hint: 'Same loop you strummed in Module 5 — the new skill is that your right hand is now the drummer. The chord change happens BETWEEN strums.',
                stuck: 'Drop to just Am ↔ G until the strum survives that change, then add the F back.',
                levelUp: 'Switch every 2 beats instead of 4, or count "1 + 2 + 3 + 4 +" out loud the whole time.',
                skills: [2, 5]
              },
              {
                text: 'Challenge — Knockin\' on Heaven\'s Door: play G · D · Am · C, four beats of down-up each at 60 BPM — the record is slow too, so this song never rushes you. You\'ve got it when: one full lap with even volume on downs and ups and every change landing on beat 1.',
                hint: 'Dylan built this song to support a voice — soft, even 8ths are the whole job. If an upstroke catches the strings, let the pick graze just the top 3–4 strings.',
                stuck: 'Loop the G → D change alone — it\'s the only move where every finger travels.',
                levelUp: 'Sing or hum a line over your own strumming, or speed up to 70 BPM with the 8ths still even.',
                skills: [2, 4],
                response: { type: 'short', prompt: 'Personal record — full laps in a row with the strum hand never stopping. Your count today?', placeholder: 'e.g. 3 — try for a higher number next time' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Keeps a steady down-up 8th-note pulse for 8+ bars · Counts "1 + 2 + 3 + 4 +" aloud while strumming · Switches between Em and Am without stopping the strum hand · Strums evenly (downstrokes and upstrokes same volume)',
      performance: 'Strum Em for 4 bars, then Am for 4 bars, with a steady down-up pulse at 60 BPM, counting aloud the whole time. Record 20 seconds on your phone and listen back for the strum hand never stopping — especially at the change.',
      selfCheck: 'Can you keep your strum hand moving even during a chord change? Can you count the 8th-note pulse out loud without slowing down?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm6w1-s1', text: 'Move my strumming wrist like a pendulum — continuous motion, even between strums',
        gotItWhen: 'you can watch your strum hand in a mirror or on a quick phone video and see that it never fully stops — the wrist is always traveling down or up, even when you skip a strum.',
        practice: { type: 'mc', prompt: 'When the wrist "stops" between strums, what usually goes wrong?',
          choices: ['Nothing — it should stop', 'You lose the pulse and the timing falls apart', 'The pick gets dropped', 'The chord sounds louder'], answer: 1 } },
      { id: 'm6w1-s2', text: 'Play a steady down-up 8th-note pattern at 60 BPM for 8 bars',
        gotItWhen: 'you can strum down-up at 60 BPM for 8 bars and every strum lands evenly with the metronome — no drift, no skipped strums.',
        practice: { type: 'playSeq', label: 'Hear the 8th-note pulse (8 evens)', bpm: 60,
          notes: [60, 60, 60, 60, 60, 60, 60, 60] } },
      { id: 'm6w1-s3', text: 'Count "1 + 2 + 3 + 4 +" out loud while strumming',
        gotItWhen: 'you can count aloud with the strum and the numbers always land on downstrokes, the "and"s always land on upstrokes — no thinking required.',
        practice: { type: 'mc', prompt: 'In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES?',
          choices: ['The "+" (and) counts', 'The numbers (1, 2, 3, 4)', 'All of them', 'Only beat 1'], answer: 1 } },
      { id: 'm6w1-s4', text: 'Strum with even volume — downstrokes and upstrokes feel equally controlled',
        gotItWhen: 'your downstrokes and upstrokes sound roughly the same volume — neither overpowers the other, and your pick doesn\'t catch the strings on the way up.' },
      { id: 'm6w1-s5', text: 'Keep the strum hand moving through a chord change',
        gotItWhen: 'when you switch from Em to Am (or any two chords), your strum hand never pauses — the chord change happens BETWEEN strums, not by stopping the rhythm.',
        practice: { type: 'mc', prompt: 'During a chord change, what should your STRUM hand do?',
          choices: ['Stop and wait for the chord', 'Keep moving in the down-up pendulum', 'Strum extra hard to cover the change', 'Lift off the strings'], answer: 1 } },
      { id: 'm6w1-s6', text: 'Play 4 bars of Em then 4 bars of Am with a continuous down-up strum',
        gotItWhen: 'you can loop Em-Em-Em-Em-Am-Am-Am-Am with down-up strumming at 60 BPM and never break the rhythm — even when the chord change is imperfect.',
        practice: { type: 'playSeq', label: 'Em → Am roots (4 bars each)', bpm: 60,
          notes: [40, 40, 40, 40, 45, 45, 45, 45] } }
    ]
  },

  {
    id: 'm6w2',
    label: 'Set 2',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 2',
    subtitle: 'The "D-DU-UDU" pattern · Rests and accents · Adding groove (the steady rhythmic feel)',
    objective: 'I CAN play the classic D-DU-UDU strum pattern at 60 BPM — pushing toward 70+ — and apply it to a real song with chord changes.',
    skillFocus: 'Playing the D-DU-UDU strum pattern · Adding accents and rests · Reading strum-pattern notation',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00). Your task while you watch: air-strum along and find the two moments the pick misses — the wrist keeps swinging, but on purpose it skips one upstroke and one downstroke.',
            hint: 'Justin calls it the pattern you can always rely on — D-DU-UDU. Listen for which strums he skips: the wrist still moves, but the pick doesn\'t hit the strings on those beats.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the D-DU-UDU pattern, which UPSTROKE is skipped (the wrist swings up but the pick misses)?',
              answer: 0,
              explain: 'Reading "D - DU - UDU" over "1 + 2 + 3 + 4 +", the skipped upstroke is the "+" of beat 1 — the wrist swings up but the pick misses on purpose. (Beat 3, a downstroke, is the other skip.)',
              choices: [
              'The "+" of beat 1',
              'Beat 2 (the third strum)',
              'The "+" of beat 4',
              'Beat 1'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00). Your task while you watch: clap a little louder on beats 2 and 4 along with him, and feel how that "backbeat" makes the pattern groove.',
            hint: 'Marty stacks patterns from easiest to harder, accenting beats 2 and 4 as he goes. The accents give the strum a "backbeat" feel, like a drummer\'s snare.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'Why might emphasizing beats 2 and 4 (instead of 1 and 3) make a strum pattern sound more "groovy"?' }
          }
            ]
          },
          {
            title: 'Tap the pattern with a real song',
            steps: [
          {
            text: 'Listen to "I\'m Yours" by Jason Mraz. Tap the D-DU-UDU pattern on your leg along with the song. Where does the pattern repeat?',
            hint: 'The pattern is one bar long and repeats throughout the whole song. Once you have it, you have most of his song.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'A one-bar strum pattern in 4/4 time covers how many BEATS?',
              answer: 1,
              explain: 'The top number of 4/4 means 4 beats (counts) per bar — "1, 2, 3, 4." Add the "+" upbeats and you get 8 eighth-note slots, but the bar is 4 counts.',
              choices: [
              '2',
              '4',
              '8',
              '16'
            ] }
          }
            ]
          },
          {
            title: 'Form today\'s chords',
            steps: [
          {
            text: 'Today\'s pattern lands on <strong>G</strong> and <strong>D</strong>. Form each shape from the diagram and strum once cleanly before you add the D-DU-UDU rhythm.',
            hint: 'G is a full six-string chord; D skips the two lowest strings (the X marks). Get them ringing clean first — the rhythm is easier when the chord isn\'t fighting you.',
            chords: [
              { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: in the D-DU-UDU pattern, what trips you up more right now — skipping a strum while the wrist keeps moving, or landing the accents on beats 2 and 4? What helped today?',
            response: { type: 'short', placeholder: 'e.g. I keep actually hitting the strings on the skip — pulling the pick back just slightly fixed it' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — D-DU-UDU pattern drill',
        sections: [
          {
            title: 'Warm-up — tune + recall the down-up (Modules 1 & 6)',
            steps: [
              {
                text: 'Tune all 6 strings to green, then warm the strum hand: 4 bars of steady down-up on Em at 60 BPM (Set 1). You\'ve got it when: in tune and the pendulum already swinging before you add the new pattern.',
                hint: 'Look back: D-DU-UDU is just the down-up you already own with two strums left out. Get the even swing going first.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Learn the D-DU-UDU pattern',
            steps: [
          {
            text: 'Challenge 1 — Learn the Groove: mute the strings and, at 60 BPM, strum the pattern "Down, Down-Up, Up-Down-Up" (D-DU-UDU). You\'ve got it when: the wrist keeps moving on the skipped downstroke — the pick just misses on purpose.<div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'The trickiest part is keeping the wrist moving on the skipped downstroke. The wrist still goes down — the pick just misses the strings on purpose.',
            stuck: 'Say it out loud — "down, down-up, up-down-up" — and air-strum with no pick first. The · dots above are the beats your hand passes but doesn\'t hit.',
            levelUp: 'Run it at 75 BPM, or accent the very first down of each bar so the pattern has a clear "top".',
            skills: [1, 2, 3]
          }
            ]
          },
          {
            title: 'Play the pattern with backbeat accents',
            steps: [
          {
            text: 'Challenge 2 — Pattern on Em: fret Em and play D-DU-UDU at 60 BPM for 8 bars, counting aloud and accenting beats 2 and 4. You\'ve got it when: 8 clean bars with a clear "snare hit" feel on 2 and 4.',
            hint: 'Add accents on beats 2 and 4 — those downstrokes should be a little louder. Feel the "snare hit" on those beats.',
            stuck: 'Drop the accents for now and just get the D-DU-UDU shape clean for 8 bars; add the louder 2-and-4 hits once the pattern runs on autopilot.',
            levelUp: 'Move it to G or D, or push to 75 BPM with the backbeat still landing.',
            skills: [2, 4, 5],
            playSeq: { label: 'Hear Em with accent on 2 and 4', bpm: 60, notes: [40, 47, 40, 47] }
          }
            ]
          },
          {
            title: 'Hold the pattern through a chord change',
            steps: [
          {
            text: 'Challenge 3 — G → D, Pattern Locked (your assessment piece): loop G → D every 2 bars playing D-DU-UDU, and set the ⏱ Timer for 3 minutes to keep going. You\'ve got it when: the pattern stays identical through the change — only the chord moves (drop to 50 BPM if it falls apart).',
            hint: 'If the pattern falls apart during the chord change, slow to 50 BPM. The pattern is the GROOVE — losing it is worse than missing a note in the chord.',
            stuck: 'Change the chord on the LAST upstroke of the bar, while your hand is already moving up — that\'s the free moment to jump from G to D. Loop just 2 bars until the join between the two bars (the seam) is smooth.',
            levelUp: 'Add a third chord (G → D → Em), or run it at 75 BPM with no break at the change.',
            skills: [4, 5, 6],
            response: { type: 'short', prompt: 'Personal record — D-DU-UDU through the G→D change: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN loop today (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — I\'m Yours, verse: play G · D · Em · C with D-DU-UDU, one bar per chord at 60 BPM. This is THE song this pattern is famous for. You\'ve got it when: the verse loop start to finish with the pattern identical on every chord — even when a chord lands imperfect, the groove holds.',
                hint: 'The pattern IS the song here. If it breaks at a change, the fix is Challenge 3\'s trick: jump chords on the last upstroke of the bar.',
                stuck: 'Play the loop with one strum per bar until the changes are clean, then layer the pattern back on.',
                levelUp: 'Accent beats 2 and 4 to match the recording\'s bouncy feel, or push to 75 BPM.',
                skills: [4, 5],
                playSeq: { label: '"I\'m Yours" verse roots (G · D · Em · C)', bpm: 60, notes: [43, 50, 40, 48] }
              },
              {
                text: 'Challenge — Oye Mi Amor, verse: the verse uses just two chords, Bm · G — use the small Bm (top four strings, no barre) and play one bar of each with D-DU-UDU at 60 BPM. You\'ve got it when: four laps with the pattern unbroken and beats 2 and 4 accented so it pushes like the record.',
                hint: 'The small Bm is the easier beginner version — the full-barre Bm (one finger pressed flat across several strings) arrives in Module 7. For now the pattern matters more than the shape.',
                stuck: 'Loop just the G → Bm change with one strum per bar until the landing is clean, then add the pattern.',
                levelUp: 'Lean into the up-strums a little — that extra offbeat push is the Latin feel.',
                skills: [3, 5],
                chords: [
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
                ],
                response: { type: 'short', prompt: 'Which fought you more — the small Bm shape, or keeping the pattern through the change?', placeholder: 'e.g. the Bm — my pinky keeps missing fret 4' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): play any lesson video from this set and pause right after one bar of strumming — clap the rhythm back exactly, then play it as muted strums. Rhythm echo is ear training too. Got someone around? Have them clap a bar of any pattern from this set for you to echo.'
              }
            ]
          },
          {
            title: 'Play-along — one full pass, no stopping',
            steps: [
              {
                text: 'Play-along: open Station B\'s D-DU-UDU lesson video, set YouTube\'s speed to 0.75×, and strum along for the ENTIRE demo section without stopping. You\'ve got it when: you finish a full pass with the video — flubbed changes and all, don\'t stop.',
                hint: 'Not stopping is the skill. Real songs don\'t wait for you, and neither does the video — keeping going after a mistake is better than starting over.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays the D-DU-UDU pattern cleanly at 60 BPM (70+ is the push goal) · Accents beats 2 and 4 (backbeat) · Keeps pattern steady through a chord change · Applies pattern to a real song',
      performance: 'Strum D-DU-UDU on Em for 4 bars, then switch to Am for 4 more without the pattern breaking at the change. With someone around, trade fours instead: one plays Em, the other takes over on Am, and the pattern must not break at the handoff.',
      selfCheck: 'Can you play D-DU-UDU without thinking about which strum is next? Can you keep the pattern going through a G-to-D change?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm6w2-s1', text: 'Play the D-DU-UDU pattern cleanly at 60 BPM',
        gotItWhen: 'you can play D-DU-UDU on a single chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping the wrist.',
        practice: { type: 'mc', prompt: 'How would you read D-DU-UDU out loud as a count? (one of these matches)',
          choices: ['1, 2-+, +-4-+', '1, 2-+, +-3-+', 'Just count "1, 2, 3, 4"', '1-2-3-4-5-6'], answer: 0 } },
      { id: 'm6w2-s2', text: 'Skip a downstroke while keeping the wrist in motion',
        gotItWhen: 'on the "skipped" strum in the pattern, your wrist still travels down — only the pick doesn\'t touch the strings. A quick phone video (or a mirror) shows the motion clearly.',
        practice: { type: 'mc', prompt: 'When you "skip" a strum in the D-DU-UDU pattern, what does your wrist do?',
          choices: ['Stops completely', 'Keeps moving in the pendulum — the pick just misses the strings', 'Lifts up away from the guitar', 'Locks for a beat'], answer: 1 } },
      { id: 'm6w2-s3', text: 'Accent beats 2 and 4 (the "backbeat")',
        gotItWhen: 'when you strum the pattern, beats 2 and 4 are noticeably louder than 1 and 3 — and the song starts to feel like it has a built-in drumbeat.',
        practice: { type: 'playSeq', label: 'Hear the backbeat — louder hits on 2 and 4', bpm: 70,
          notes: [40, 47, 40, 47] } },
      { id: 'm6w2-s4', text: 'Keep the D-DU-UDU pattern going through a chord change',
        gotItWhen: 'when you switch from G to D (or any two chords) the pattern doesn\'t change at all — only the chord underneath does.' },
      { id: 'm6w2-s5', text: 'Apply the D-DU-UDU pattern to a verse of a real song',
        gotItWhen: 'you can play the verse of "I\'m Yours" or "Oye Mi Amor" with the D-DU-UDU pattern from start to finish — even if a chord is imperfect, the pattern holds.',
        practice: { type: 'playSeq', label: '"I\'m Yours" verse roots (G · D · Em · C)', bpm: 70,
          notes: [43, 50, 40, 48] } },
      { id: 'm6w2-s6', text: 'Read a strum-pattern chart (D/U arrows or symbols)',
        gotItWhen: 'you can look at a written-out strum pattern (e.g., "↓ ↓↑ ↑↓↑") and play it correctly the first time, without someone demonstrating it.',
        practice: { type: 'mc', prompt: 'In strum notation, what does the symbol "↑" mean?',
          choices: ['Strum up (toward the ceiling, away from the floor)', 'Strum down', 'Mute the strings', 'Hold the chord'], answer: 0 } }
    ]
  },

  {
    id: 'm6w3',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', note: 'five layers deep and still growing' }],
    label: 'Set 3',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 3',
    subtitle: 'Multiple strum patterns · Folk, rock, reggae styles · Choosing the right groove',
    objective: 'I CAN play 2+ different strum patterns over the same chord progression and choose a pattern that fits a song\'s style.',
    skillFocus: 'Playing different strum styles · Matching a pattern to the song · Switching patterns mid-song',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (0:00–4:00). Your task while you watch: pick ONE pattern he shows and tap it on your leg until you can keep it going without looking.',
            hint: 'Notice how each pattern Justin demonstrates has a different feel — folk feels gentle, rock feels driving, reggae feels bouncy. The pattern is the GENRE in many cases.',
            skills: [1, 2, 3],
            response: { type: 'mc', prompt: 'Which strum-pattern feature most defines REGGAE rhythm?',
              answer: 1,
              explain: 'Reggae lives on the offbeat — crisp upstrokes on the "+" of each beat while the downbeats stay empty. That offbeat chop — reggae players call it the "skank" — is what makes reggae sound like reggae.',
              choices: [
              'Loud downstrokes on beat 1',
              'Upstrokes on the "+" (and) of each beat, with the downstrokes skipped',
              'Strumming only on beat 4',
              'Fast, constant 16th-note strumming throughout'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/vMt8T5Jqf10" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — a different teacher\'s method for building ANY pattern. Strum along with his exercise in real time, and notice how his approach differs from Justin\'s in the first video.',
            hint: 'There is no single "correct" pattern for a song — listen to the original recording and feel which fits. Andy\'s exercise builds the control to play whichever one you choose.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Pick a song you like. Describe the strum pattern in your own words — is it gentle, driving, choppy? What gives it that feel?' }
          }
            ]
          },
          {
            title: 'Compare reggae and rock feels',
            steps: [
          {
            text: 'Compare two recordings: "Three Little Birds" (Bob Marley — reggae) and "Bad Moon Rising" (CCR — rock). Same speed-ish, very different feel. What makes the difference?',
            hint: 'It\'s almost entirely the strum pattern. Reggae emphasizes the offbeats (the "+"); rock emphasizes the downbeats (the numbers).',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'In one sentence: what is the biggest difference between the reggae strum and the rock strum?' }
          }
            ]
          },
          {
            title: 'Refresh the C chord',
            steps: [
          {
            text: 'The progressions today lean on <strong>C</strong> — your shape from Module 5, back again. Form it from the diagram and strum the top five strings (the low E is muted) until it rings clean.',
            hint: 'C skips the lowest string (the X on string 6). Your ring finger reaches to the 3rd fret of the A string — a big stretch at first.',
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: of the three feels you tried — folk, rock, reggae — which was hardest to make sound convincing on your guitar, and what gave it away as "not quite right"?',
            response: { type: 'short', placeholder: 'e.g. reggae — my offbeat upstrokes were too heavy, so it sounded like rock with gaps' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — try three styles',
        sections: [
          {
            title: 'Warm-up — tune + a quick pass through all three feels (recall)',
            steps: [
              {
                text: 'Tune to green, then on a G chord play 2 bars each of: steady down-up (folk), heavy down-up (rock), and up-only on the "+" (reggae). You\'ve got it when: in tune and your hand remembers all three feels before you refine them.',
                hint: 'A quick 60-second pass through all three styles wakes up the patterns you\'ll polish this set.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play a folk strum',
            steps: [
          {
            text: 'Challenge 1 — Folk Feel: hold G and strum all downstrokes, one per beat, at 70 BPM — quiet and steady, singalong style. You\'ve got it when: even, soft, supportive strumming with no accents sticking out.<div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Folk is about supporting the singer, not standing out. Soft attack, even volume, no accents.',
            stuck: 'Strum from the wrist only and let the pick barely graze the strings — imagine someone is singing and you must not cover them up.',
            levelUp: 'Add a gentle up-strum on the "+" of beats 2 and 4 for a fuller singalong feel.',
            skills: [1, 4]
          }
            ]
          },
          {
            title: 'Play a rock strum',
            steps: [
          {
            text: 'Challenge 2 — Rock Feel: same G at the same tempo, but strum harder into the strings — heavy down-up-down-up accenting every down. You\'ve got it when: a thick, driving sound using arm weight, not just wrist.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Rock strumming uses arm weight more than wrist. Let the pick go deeper into the strings. Aim for a thick, heavy sound.',
            stuck: 'Strum from the elbow, not just the wrist — rock needs weight. Keep the accents on the downs and let the ups stay light.',
            levelUp: 'Push to 90 BPM, or palm-mute the low strings — rest the side of your strumming hand on them — for a tighter chug (a short, muted, punchy strum).',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Play a reggae strum',
            steps: [
          {
            text: 'Challenge 3 — Reggae Chop, a short, quick, muted upstroke (try it!): hold G, skip every downbeat, and strum UP only on each "+" — rest-up-rest-up. No score — play along with "Three Little Birds" to lock in the offbeat feel.<div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Counter-intuitive at first — your hand goes down on the beats but doesn\'t hit the strings. Listen to "Three Little Birds" while you do this to lock in the feel.',
            stuck: 'Keep your hand swinging down on every number, but lift the pick away so it only catches the strings on the way back up. Count "rest-UP-rest-UP" out loud.',
            levelUp: 'Mute with your fretting hand right after each up-strum for the crisp, clipped "chk" of a real reggae chop.',
            skills: [3, 4],
            playSeq: { label: 'Hear the backing root — chop your offbeat over it', bpm: 70, notes: [55, 55, 55, 55] }
          }
            ]
          },
          {
            title: 'Switch the feel mid-song (your assessment piece)',
            steps: [
          {
            text: 'Challenge 4 — Two Feels, One Song (your assessment piece): take G–D–Em–C and play 8 bars folk, then switch to rock for 8 bars — same chords, two clearly different feels, no break at the switch. Set the ⏱ Timer for 3 minutes and loop it.',
            hint: 'The switch is the skill. Change the feel on the downbeat of a new bar so the transition lands cleanly.',
            stuck: 'Keep the chords and tempo identical — change ONLY your strum hand. Drill just the 2-bar seam where folk becomes rock until it\'s smooth.',
            levelUp: 'Add reggae as a third 8-bar section, or switch feels every 4 bars instead of every 8.',
            skills: [5, 6],
            response: { type: 'short', prompt: 'Which two feels did you switch between, and on which song would you use them?', placeholder: 'e.g. folk verse → rock chorus on "Bad Moon Rising"' },
            playSeq: { label: 'G · D · Em · C progression (try each feel)', bpm: 70, notes: [43, 50, 40, 48] }
          }
            ]
          },
          {
            title: 'Solo over the groove with Pentatonic Pattern 1',
            steps: [
          {
            text: 'Challenge 5 — Trade Off (try it!): loop the backing roots below — or record yourself strumming 8 bars of a progression (try Am–G–C or G–D–Em–C) with any pattern from this module — then solo over it using Pentatonic Pattern 1 from Module 4. Take turns with yourself every 8 bars: strum one pass, then solo over the next. Got another guitarist around? One strums, one solos, swap after 8 bars. No score — aim for one clear musical idea, not a flurry of notes.',
            hint: 'Am–G–C fits A minor pentatonic; a major-key progression fits major pentatonic. This is the reward: the scale you learned in Module 4 lives on top of the chords you strum here. Leave space — silence is part of a solo.',
            playSeq: { label: 'Backing roots — Am · G · C', bpm: 70, notes: [45, 43, 48] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Watchtower, two ways: play Am · G · F with a soft folk strum for 8 bars, then the same loop rock-style — strum harder, accent the downs — for 8 bars, no break at the switch. You\'ve got it when: on a quick recording of yourself you can hear the exact bar the feel changed — Dylan\'s version becoming Hendrix\'s, live from your chair. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: five layers deep and still growing</a>.',
                hint: 'You heard exactly this in Module 1 — acoustic Dylan vs. electric Hendrix. Same chords, same tempo; ONLY your strum hand changes.',
                stuck: 'Make the switch on beat 1 of a new bar and drill just the 2-bar seam where folk becomes rock.',
                levelUp: 'Add the reggae chop as a third 8-bar section — three eras of the same song.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Which feel suited Watchtower better to your ear — folk or rock — and why?', placeholder: 'e.g. rock — the accents make the loop feel dangerous' }
              },
              {
                text: 'Challenge — Three Little Birds, reggae chop: play A · D · E with up-strums only on the "+", one bar each at 70 BPM. You\'ve got it when: two laps where every hit is an offbeat — then play along with the record and disappear into it.',
                hint: 'Your hand still travels down on every number — the pick just misses on purpose. The record is your metronome here; Marley\'s band never rushes.',
                stuck: 'Mute the strings and chop the offbeat rhythm alone until it feels natural, then add the chords.',
                levelUp: 'Clip each up-strum short with a quick fretting-hand mute — the crisp "chk" of a real reggae chop.',
                skills: [3, 4]
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays folk, rock, and reggae strum styles on demand · Switches between two patterns mid-song · Chooses a pattern that fits a song\'s style · Applies pattern to a full chord progression',
      performance: 'Solo: pick one song and one strum style (folk, rock, or reggae). Play 8 bars with that pattern. Then switch to a different style for the next 8 bars. Same chords, two feels.',
      selfCheck: 'Can you play the same chord progression three different ways (folk, rock, reggae) and have them actually sound different? Can you pick the right pattern for a new song by ear?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
    },

    skills: [
      { id: 'm6w3-s1', text: 'Play a folk strum (gentle, even all-downstrokes or simple down-up)',
        gotItWhen: 'you can play a chord progression with even, soft downstrokes that supports a singer — no accents, no aggressive attack.' },
      { id: 'm6w3-s2', text: 'Play a rock strum (heavy downstrokes with accent and weight)',
        gotItWhen: 'your rock strum has clear weight and drive — play back a quick recording and you can hear that you mean it.' },
      { id: 'm6w3-s3', text: 'Play a reggae strum (upstrokes on the "+", downstrokes skipped)',
        gotItWhen: 'you can play a reggae chop where ONLY the upstrokes hit the strings — your hand still moves on the beats, but the pick misses on purpose.',
        practice: { type: 'mc', prompt: 'In a reggae offbeat strum, the strings are hit on which counts?',
          choices: ['1, 2, 3, 4 (the numbers)', 'The "+" of each beat (between numbers)', 'Only beat 1', 'Continuously'], answer: 1 } },
      { id: 'm6w3-s4', text: 'Choose a strum pattern that matches a song\'s style',
        gotItWhen: 'you can put on any new song, listen for 15 seconds, and pick a strum pattern that fits — without a tutorial telling you what to play.',
        practice: { type: 'mc', prompt: 'You hear a song with a slow, gentle, acoustic feel and a singer-songwriter vibe. Which strum suits it best?',
          choices: ['Heavy rock chops on every downstroke', 'Reggae offbeat upstrokes', 'Gentle folk strum (soft down-up)', 'No strum at all'], answer: 2 } },
      { id: 'm6w3-s5', text: 'Switch strum patterns mid-song (e.g., verse vs. chorus)',
        gotItWhen: 'you can play 8 bars of one pattern, then switch cleanly to a different pattern for the next 8 bars — without losing the beat at the transition.' },
      { id: 'm6w3-s6', text: 'Play 2+ different patterns over the same chord progression',
        gotItWhen: 'you can take G–D–Em–C and play it two different ways (e.g., folk then rock) and the two versions actually sound like different songs.',
        practice: { type: 'playSeq', label: 'G · D · Em · C progression (try with each style)', bpm: 70,
          notes: [43, 50, 40, 48] } }
    ]
  }

); // end module-6.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[6] = [
      { name: '"Brown Eyed Girl" — Van Morrison', meta: 'G–C–G–D · classic 8th-note down-up strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=UfmkgQRmmeE',
        tutorialUrl: 'https://www.youtube.com/watch?v=v-EGJOz-Mek' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · steady down-up over chord changes', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am–C · slow tempo, perfect for first strum patterns', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y' },
      { name: '"Happy Birthday"', meta: 'Apply D-DU-UDU to C–G–Am–F arrangement', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"I\'m Yours" — Jason Mraz', meta: 'G–D–Em–C · iconic D-DU-UDU strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=EkHTsc9PU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=6ugeJWAMz6w' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · classic reggae offbeat strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving rock-style strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F · slow, even pattern', type: 'Choice', core: false, level: 2, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Syncopated Latin strum on the verse · Bm (partial barre)–G', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Corrido / sierreño strum · current Spanish-language style', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Wonderwall" — Oasis', meta: 'Em7–G–D–C · classic strum pattern with accents', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Wagon Wheel" — Old Crow Medicine Show', meta: 'G–D–Em–C · folk strum classic', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=1gX1EP6mG-E',
        tutorialUrl: 'https://www.youtube.com/watch?v=zx3Tv5uBAaE' },
      { name: '"Buffalo Soldier" — Bob Marley', meta: 'Bm–G–D–A · reggae offbeat practice', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=uMUQMSXLlHM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rNSq3E3KfMk' }
    ];

MODULE_REVIEWS[6] = {
  moduleNum: 6,
  module: 'Strumming Patterns with Chords',
  skills: [
    { id: 'mr6-s1', text: 'I can hold a steady down-up strum pattern (play it cleanly at 60 BPM, then try 70)', set: 'm6w1' },
    { id: 'mr6-s3', text: 'I can keep my strum hand moving right through a chord change', set: 'm6w1' },
    { id: 'mr6-s4', text: 'I can play the D-DU-UDU pattern and accent beats 2 and 4', set: 'm6w2' },
    { id: 'mr6-s5', text: 'I can read a written strum pattern (D/U over "1 + 2 + 3 + 4 +") and play it', set: 'm6w2' },
    { id: 'mr6-s2', text: 'I can play 2+ different strum patterns over the same chord progression', set: 'm6w3' },
    { id: 'mr6-s6', text: 'I can switch strum styles mid-song without dropping the beat', set: 'm6w3' }
  ],
  assessItems: [
    'Play Em for 4 bars, then Am for 4 bars, with a non-stop down-up strum at 60 BPM',
    'Take G–D–Em–C and play it two ways — folk, then rock — switching feel with no break at the seam'
  ],
  forward: 'Module 7 is the <strong>barre-chord</strong> module — and every steady strum hand you just built is what carries you through it. The rhythm keeps going even while your fretting hand fights the hardest shapes in the course. The groove you own now is what makes a clamped, buzzy first barre still sound like music.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
