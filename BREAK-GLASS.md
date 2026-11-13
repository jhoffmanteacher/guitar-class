# Break glass: what to do on a bad day

Three situations. Do them in order, one step at a time. Every command runs in the repo folder
on `main`. A Claude session can run all of it; tell it "follow BREAK-GLASS.md, situation (a)".
When Google itself is down (sign-in or saving fails), see `docs/when-google-is-down.md` instead.

Before any of them: `git switch main && git pull --ff-only`, then `git status` must say
"nothing to commit". Find the commit that caused it with `git log --oneline -15`.

## (a) The last push broke the site

1. Revert it. This adds a NEW commit that undoes the old one; nothing is deleted.
   - One commit: `git revert --no-edit <sha>`
   - Several commits in a row: `git revert --no-edit <oldest-sha>^..<newest-sha>`
     (one undo commit each, newest first). To get a single undo commit instead:
     `git revert --no-commit <oldest-sha>^..<newest-sha>`, then `git commit -m "Revert: <what broke>"`.
   - Revert only the commits that changed site code. A docs commit in the range can stop the
     revert with a conflict (tried 2026-11-13: a range with a docs commit stopped on `CLAUDE.md`).
2. A conflict? If it is ONLY the `const CACHE_VERSION` line of `sw.js`: keep either line,
   `git add sw.js`, `git revert --continue`. Anything else: `git revert --abort` (puts everything
   back as it was), then revert fewer commits, or stop and ask.
3. Run the full `node tools/checks.mjs` (not `--check`). It rewrites the `sw.js` version line
   from the files as they are now, which is what makes every Chromebook drop the broken copy.
   Never edit that line by hand. If it changed `sw.js`: `git add sw.js && git commit -m "Cache version after the revert"`.
   If the revert took `sw.js` back to before 2026-10-30 (no `AUDIO_HASHES` block in it), stop and
   read skill `audio-and-snippets`, "Rolling `sw.js` back past this scheme".
4. `git push`. **Never `git push --force`**: other sessions push to the same `main`, and a force
   push silently deletes their commits and the history the Friday check reads. A revert is an
   ordinary commit, so a plain push always works (if it is refused, `git pull --rebase`, then
   push again).
5. Confirm, one or two minutes later: `node tools/checks.mjs --live` must print
   "live site is serving this exact version". If it says "does not match", wait a minute and run it again.
6. Open tabs reload themselves once (after a drill, recording, exit check or playing card ends; at
   most 5 minutes). Anyone still seeing the problem reloads the page.

## (b) Students are stuck on a broken cached copy

Use this only when (a) is done and students STILL see the broken site after reloading, or the
update never arrives. The kill switch tells every Chromebook to drop its cached copy and load the
site straight from the internet.

1. The code on `main` must already be good (do (a) first, or fix it). The kill switch only removes
   the cache; Chromebooks then load whatever `main` has.
2. Check the kit: `node tools/kill-switch/proof.mjs` must end "14 of 14 mutations caught" and exit 0.
3. `cp tools/kill-switch/kill-sw.js sw.js`
4. `git add sw.js && git commit --no-verify -m "BREAK GLASS: kill-switch service worker in sw.js"`.
   `--no-verify` is needed here and only here: the checks read the real worker's file lists, which
   the kill switch does not have, so the git hooks refuse it. GitHub's "Site checks" run will go red
   for this push; that is expected and does not stop the deploy.
5. `git push --no-verify`
6. Confirm: `node tools/checks.mjs --live` must print "live site is serving this exact version
   (guitar-class-kill-switch)". GitHub can take up to about 10 minutes to hand out the new file.
7. Each Chromebook switches the next time it opens or reloads the site. Open tabs reload once by
   themselves. While the kill switch is live the site needs the internet (no offline copy), and backing
   tracks come from the internet; the copies students already have stay on the Chromebook for later.
8. Leave it live for one full school day, so every Chromebook in class opens the site once.
9. Put the real worker back: `git log --oneline -5 -- sw.js` to find the kill-switch commit, then
   `git revert --no-edit <kill-switch-sha>`.
10. Full `node tools/checks.mjs`: it must exit 0. If it changed `sw.js`:
    `git add sw.js && git commit -m "Cache version: the real service worker is back"`.
11. `git push` (normal hooks this time), then `node tools/checks.mjs --live` must show a normal
    version (`guitar-class-<date>-<code>`), and `node tools/kill-switch/proof.mjs` must still pass.
    Open tabs reload once more by themselves; the backing tracks are still on every Chromebook.

## (c) Student work was damaged or deleted

There is no restore button, on purpose: the console never writes students' saved work. The backup
is a file the teacher downloads: console → Manage → **Download a backup**
(`guitar-class-backup-YYYY-MM-DD.json`, in Downloads).

1. Stop the damage first: if a push caused it, do (a).
2. Ask the affected students to sign out and stay signed out (a tab left open can save its old copy
   back over the restored work).
3. Open the newest backup from BEFORE the damage. Check that it says `"complete": true` and that the
   counts look right. It holds every student's saved work (`progress`, under each student's id; their
   name and email are inside), the class settings (`config/class`), practice-minutes weeks, and problem
   reports. It does NOT hold mic recordings, the live quiz, the practice boards, or sign-in accounts.
4. One student or a few: Firebase console → Firestore Database → `progress` → the student's id →
   replace each damaged field with the value from the file, by hand. A value written like
   `{"__type":"timestamp", ...}` goes back as a timestamp field (its `iso` line shows the time).
5. Many students: this needs a one-off script run on the Mac with a Firebase service-account key.
   It does not exist yet. Ask a Claude session to write it as its own reviewed change, following the
   "RESTORE" notes at the top of `teacher-backup.js`, and to try it on one student first. Delete the
   key from the Firebase console afterwards.
6. A restored document REPLACES what is there: anything a student saved after the backup is lost.
   Restore `config/class` only with every console tab closed.
7. A student restored from an old backup in the old Module 4/5 numbering is moved to the new numbering
   by their own browser on their next visit. Nothing to do.

## Who to tell

Put the matching line on the projector.

- (a) or (b): "The site had a problem. It is fixed now. Reload the page." /
  "El sitio tuvo un problema. Ya está arreglado. Vuelve a cargar la página."
- (b), if a page still looks wrong: "Close the tab and open the site again." /
  "Cierra la pestaña y abre el sitio otra vez."
- (c): "Sign out now and wait. I will tell you when to sign in again." /
  "Cierra tu sesión ahora y espera. Te aviso cuando puedas volver a entrar."

## Afterwards

1. Write down in `WORKFLOW.md`, dated: what students saw, for how long, and which commit caused it.
2. Write down what fixed it, and anything in this page that was wrong or slow.
3. Add the check that would have caught it (a `tools/checks.mjs` rule or a proof tool), and break it
   once on purpose to see it fail.
4. If the kill switch was used: confirm the real `sw.js` is back (step (b) 11).
5. Take a fresh backup (Manage → Download a backup) once things are normal.
