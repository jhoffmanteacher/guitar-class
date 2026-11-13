# When Google is down: a class period with no sign-in or no saving

The site's pages come from GitHub. Sign-in and saved work come from Google (Firebase sign-in and
Firestore). Either can fail on its own. This page is for the day Google's side fails.

Real example: on 12 June 2025 a Google Cloud outage hit many products, Cloud Firestore and Identity
Platform (the service behind Firebase sign-in) among them. Google's own report gives 10:49 to 13:49
Pacific (three hours) for most services; the last product recovered at 18:18
(status.cloud.google.com, incident `ow5i3PPK96RduMcb1SsW`, read 2026-11-13).

Each statement about the site says where it comes from: **[code: file:line]** was read in the code
on 2026-11-13; **[browser]** still needs a check in a real browser and is not proven.

## 1. Is it Google, or the site?

1. Open `https://jhoffmanteacher.github.io/guitar-class/tuning-sim.html`. It uses no Google service
   at all **[code: tuning-sim.html has no Firebase script]**. If it loads, GitHub (the site) is up.
2. Check Google: `https://status.cloud.google.com` (look for **Cloud Firestore** and **Identity
   Platform**) and `https://status.firebase.google.com` (**Authentication**; that page says Firestore
   incidents are on the Google Cloud page). Check GitHub: `https://www.githubstatus.com` (**Pages**).
3. What students report when it is Google:
   - "Can't reach the sign-in service" with a Try again button: the Google sign-in scripts did not
     load at all **[code: app/boot.js:126-134, 498; i18n.js:230]**. A school filter blocking
     `gstatic.com` looks the same.
   - Stuck on "Signed in — loading your progress…", then after 20 s "This is taking longer than usual…"
     with Try again **[code: app/start.js:205-208, app/boot.js:761-768, index.html:126]**.
   - "Not saved yet — trying again. Keep this tab open.", then "Not saving — your newest work is not saved. Check
     the internet connection." while other websites work **[code: app/save.js:714-726; i18n.js:793-796]**. On a
     Song Journey page: "Not saved yet — check the internet connection, then tick a box again."
     **[code: tabs/journey.js:1198; i18n.js, journey.saveRetry]**.
4. A Claude session can also run `node tools/checks.mjs --live`: it reads the live site from GitHub
   only, so a ✓ there means the site itself is deployed and reachable.

## 2. What still works

| | Works? | Where it comes from |
|---|---|---|
| **Tuning Simulator** (`tuning-sim.html`), no sign-in, no mic | Yes | [code: no Firebase in tuning-sim.html; it is in `sw.js` ASSETS, line 278, so a Chromebook that has opened the site before has it offline] |
| **Song Journey pages** (`tabs/the-cure.html`, `luna.html`, `let-it-be.html`, `seven-nation-army.html`, `sweet-child-o-mine.html`, `all-along-the-watchtower.html`): the tab, the layers, the backing track, the tuner and the metronome | Yes, signed out; the "ready" checkboxes are not kept | [code: tabs/journey.js:1-8 "the highlight quietly stays session-only"; the gate does not lock, tabs/journey.js:1264 `JOURNEY_GATE_LOCKS = false`; the tools are on the page, tabs/the-cure.html:51-52, 371-457] [browser: that the tools and the backing track work with sign-in failing] |
| The main site for a student who is **not** signed in yet | **No**: the sign-in wall covers everything | [code: app/start.js:240-246 hides the app and the tools when signed out] |
| The main site for a student who **was** signed in before | Unknown: it depends on how Google fails | [browser] Firebase usually remembers a sign-in on the Chromebook, but the site then reads the student's saved work before it opens [code: app/start.js:208]. If that read fails quickly, the site opens with saving limited (next row). If it hangs, the student stays on "loading your progress" [code: app/boot.js:750-768] |
| The site after the saved-work read failed | Opens; In-Class Activities are not locked; answers and ticks are sent if saving comes back, but scores, streaks, bests and exit-check results are held back and lost when the tab closes | [code: app/save.js:217 `progressLoadFailed`; app/activities-2.js:1164 no gate; app/activities-2.js:268-287 exit check marked not saved; app/save.js:565-585 the held-back list: streak, arcade bests, practice-rep history, exit checks] |
| Work done after saving starts failing | Kept in the open tab only. A save Google refuses is retried 5 times, 3 s apart, then "Not saving" until the student does something new | [code: app/save.js:549, 714-726]. Sign out refuses to throw it away and offers "Sign out anyway" [code: app/boot.js:557-581]. Closing the tab or the lid loses it. [browser: whether a save that just hangs (no answer from Google) shows "Not saved yet" at all, and whether Google's library sends it by itself once Google is back, as the comment at app/boot.js:572-575 expects] |
| Teacher console | No (it reads the roster and settings from Google) | [code: teacher-core.js reads Firestore; not traced further] |
| Live quiz, Games, practice minutes, mic recordings | Need sign-in, inside the main site | [code: they live in the main site behind the sign-in wall] |

## 3. What to tell students

- "Google is having problems today, so the site cannot save. Don't sign out, and don't close your
  tab." / "Google tiene problemas hoy, así que el sitio no puede guardar. No cierres tu sesión ni
  tu pestaña."
- "Today we use the song pages. Your checkmarks there will not be kept." / "Hoy usamos las
  páginas de canciones. Tus marcas ahí no se guardan."
- Skip exit checks and anything graded that day: a score taken while saving fails is not kept.

## 4. A lesson that needs no saving (one period)

Post the links where students can click them (the Journey pages are `https://jhoffmanteacher.github.io/guitar-class/tabs/<song>.html`).

1. **Tune (5 min).** The tuner on any Song Journey page, or a clip-on tuner. No guitar: the Tuning
   Simulator.
2. **Warm up together (10 min).** Project a Song Journey page. Use its metronome; the class plays the
   first layer together, slow, then faster.
3. **Song work (20 min).** Each student, or each pair, picks the Journey page of the song they are on
   and works up its layers with the backing track. The teacher walks the room and listens.
4. **Play through (10 min).** The whole class plays one song along with the projected backing track.
5. **Check (5 min).** Students play their best layer for the teacher. Write down by hand who showed
   what, and tick it on the site on the next normal day.

Before it is needed: walk through it once on one Chromebook in a normal class, opening each link
above, so the day itself holds no surprises. **[browser]**
