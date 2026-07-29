/* ════════════════════════════════════════════════════════════════════
   Guitar Class — In-Class Activities (teacher-curated, day-specific work
   pushed out alongside the self-paced modules)

   An activity is LIVE the moment its entry lands on main — there is no
   toggle, flag, or admin switch. Activities never retire: this file is a
   permanent archive, newest first at render time (app.js sorts, this file
   doesn't need to be kept in date order).

   ids are PERMANENT — never renumber or reuse one. Student completion is
   keyed to the id in Firestore (classActivities: { [id]: true }), same
   rule as skill ids in the module files. If two activities land on the
   same day, suffix the second id -b, -c… (ca-2026-09-15-b).

   Every display string carries an `_es` twin, same convention as module
   files — rendered through tf(obj, field) in app.js (see the "field on a
   Set/skill/song/etc." comment there). Never ship an English-only string;
   add both in the same edit.

   SCHEMA
   {
     id:      'ca-2026-09-15',   // permanent, ^ca-\d{4}-\d{2}-\d{2}(-[b-z])?$
     date:    '2026-09-15',      // ISO — display + sort only; the id stays
                                  // fixed even if the date is later corrected
     title:    'Power Chord Relay',
     title_es: 'Relevo de acordes de poder',
     intro:    'One or two sentences of context — why today\'s in-class work
                 matters, tied back to what the student just did in stations.',
     intro_es: '…',
     steps: [
       {
         text:    'What the student reads and does. Multi-step directions
                    are an <ol>/<ul>, same house rule as module content.',
         text_es: '…',
         // Optional — at most one of the two per step:
         video:  { id: 'YOUTUBE_ID', start: 45 },   // oEmbed-verified at
                                                      // authoring time, NEVER
                                                      // from memory (see
                                                      // CLAUDE.md "Videos")
         figure: 'img/ca-0915-powerchords.svg',      // renders as the
                                                      // existing .step-figure
                                                      // span idiom; any img/
                                                      // asset also goes in
                                                      // sw.js ASSETS
       },
       // …
     ],
   }

   v1 ships EMPTY — real activities come from future lesson-planning
   sessions. Do not hand-write example content here; the schema above is
   documentation, not a template to copy live.
   ════════════════════════════════════════════════════════════════════ */
window.CLASS_ACTIVITIES = [];
