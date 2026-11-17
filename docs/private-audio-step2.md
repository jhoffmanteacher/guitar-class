# Private song audio, step 2: the 18 practice-card files

Written 2026-11-17 (branch `mac/song-files-2a`). The design is in the header of `app/songfiles.js`. The tool is
`tools/song-files.mjs` (its header explains AWAITING SWITCH). The rule is `tools/checks.mjs` 1dz.

The 18 files: 2 each of Las Mañanitas, Perdón Mamá, Vuelve a la Vida, Ella and Arsenal Efectivo, and 4 each of
Madrecita Querida and Smells Like Teen Spirit. The 8 Watchtower files are NOT part of this: the Song Journey page
cannot play a private song yet (1dx).

## The in-between state: `"awaitingSwitch": true`

An entry on `SONG_FILES` can carry `"awaitingSwitch": true`. That marks a file the site **still plays from
`audio/`**. It is on the list only so that Manage → Song files can take it (Upload) and read it back (Verify)
before any track points at it. The id, name, bytes and SHA-256 do not change at the switch, so the copy Jonathan
uploads now is the same copy the site checks afterwards.

checks.mjs 1dz allows an awaiting entry only when all three hold:

- `audio/<file>` exists, with exactly the entry's bytes and SHA-256;
- a public path (`audio/<file>` in `SNIPPET_TRACKS`, or a Song Journey `data-audio*`) plays it;
- no `private:<id>` path names it.

In every other case it fails. An entry without the flag keeps the old rule: it must not be in `audio/` or in
`AUDIO_HASHES`.

## Step 1: done on this branch

`node tools/song-files.mjs --add audio/<file> --awaiting` was run once per file, 18 in all. It measured each file
where it is and copied, moved or deleted nothing. `SONG_FILES_PIN` is 18. To see the list:
`node tools/song-files.mjs` (it must say "18 awaiting a switch, 18 of them matching their audio/ file").

If one of these files is re-levelled (`tools/loudness.py`) or re-exported before the switch, 1dz fails with "the
class plays a different file than the one the console would upload". Fix it by re-listing the file
(`--add audio/<file> --awaiting`) and uploading it again.

## Step 2: Jonathan, in the console

The code from step 1 must be live on main first. The school-accounts rules (paste 2) are already published
(2026-11-14).

1. Teacher console → Manage → Song files (the section is open). The 18 rows read "on the site as a public file; upload
   it, then it can be switched".
2. Drop the 18 mp3 files from the Mac's site folder (`audio/`) on the drop zone. Upload takes only a file whose
   bytes are on the list.
3. Press **Verify all**. Each of the 18 rows must show ✓ and read "uploaded, matches; ready to switch (the site
   still plays the public file)". The line must say "Verified 18 of 18" (more if other songs are in the store).
4. Tell Claude it is done. Claude cannot see the store, so this report is the go-ahead for step 3.

## Step 3: the switch (one session, Always Reviewed)

Moving a track's audio counts as a review trigger. Plan one `site-reviewer` round before pushing (WORKFLOW).

### 3a. Switch the tracks: one commit for all 7 songs, or one commit per song

For each of the 18 ids (the list is in the report of step 1, or in `node tools/song-files.mjs`):

```
node tools/song-files.mjs --switch <id>     # copies audio/<file> into the private folder (it must match), drops the flag
```

Then, in `app/snippets.js` → `SNIPPET_TRACKS`, change each path that names the file
(`src` / `srcSlow` / `srcFull` / `srcFullSlow`) from `'audio/<file>'` to `'private:<id>'`. There is exactly one
path per file today: `grep -n "audio/<file>" app/*.js` finds it.

The public file is the hard part. 1dz fails while an entry without the flag is still in `audio/` (and, with
`--check`, while it is in `AUDIO_HASHES`). So the same commit must do one of these:

- **A (recommended): remove it now.** `git rm audio/<file>`. The fallback is git itself: reverting the switch
  commit brings back the public files, the old paths and the flags at once. The bytes stay in git history either
  way, since they were committed before. Then run `node tools/checks.mjs` (without `--check`). It rewrites the
  `AUDIO_HASHES` block in `sw.js` without those 18 files and bumps `CACHE_VERSION`. Commit the rewritten `sw.js`;
  never edit it by hand.
- **B: a fallback week with the file still in `audio/`.** This needs a second named state, which is NOT built:
  for example `"publicKeptUntil": "YYYY-MM-DD"`. 1dz would allow it only while the public file matches, a
  `private:<id>` path names the entry and no public path names the file. It would warn until the date and fail
  after it. It would also except the file from the `AUDIO_HASHES` refusal. WORKFLOW (2026-11-14) offered this as
  "a dated warning if he wants a fallback week". Build it only if Jonathan picks B; ask him (AskUserQuestion).

### 3b. What must pass before the push

- `node tools/song-files.mjs`: 18 entries, none awaiting. With the private folder on the Mac: "local copy
  matches" × 18.
- `node tools/checks.mjs`, exit 0. Its 1dz line reads "18 song files on the list (pinned): 0 awaiting a switch …,
  18 switched; 18 private paths in SNIPPET_TRACKS …". The audio checks (1ak, 1be, 1bk, 1bu) say "(private files:
  18 read from the private folder …)" on the Mac, or "… checked from the SONG_FILES list" elsewhere.
- `node tools/song-files-sim.mjs` and `node tools/song-files-console-sim.mjs`: 0 failed.
- `node tools/playalong-loop.mjs` (headless Chrome, one browser run at a time; the Mac): every card for the 7
  songs plays. Report its summary line, including "N private track files … stand in under their own path".
- Because `sw.js` changed: `node tools/kill-switch/proof.mjs` ("14 of 14 mutations caught") and
  `node tools/update-reload-loop.mjs` (CLAUDE.md, the `sw.js` rule).
- A `CHANGELOG.md` entry, in the student's words: the 7 songs now load after sign-in, with "Loading the song… 40%"
  the first time on each Chromebook.

### 3c. After the push

- `node tools/checks.mjs --live`.
- In class (or on the practice copy), open one card of each song while signed in: the loading line appears once,
  then it plays. A second open on the same Chromebook plays at once, from IndexedDB.
- Watch Manage → Song files' month line for the first week (the limit is 6 GiB a month).
- With option B only: when the date passes, `git rm` the public files, drop `publicKeptUntil` and run the full
  checks (the `sw.js` rewrite as in A).
