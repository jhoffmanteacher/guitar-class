# firestore.rules pastes

GitHub does not publish `firestore.rules`. A change reaches the live database only when
Jonathan pastes the whole file in the Firebase console (Firestore → Rules → paste → Publish).

`tools/checks.mjs` 1dn refuses a push that changes `firestore.rules` (the pre-push hook and
GitHub; a commit only warns) until this file has one more record line naming the new text's
hash than it had before, in exactly this form, dated no earlier than the rules' change (the
check prints the line, with today's date and the hash, when it refuses). It also refuses any
push while the rules on main are named by no record line here.

    - YYYY-MM-DD firestore.rules <12 hex>: Jonathan was told on YYYY-MM-DD to paste it in the Firebase console (Firestore → Rules → Publish)

Add the line only after telling Jonathan. The hash is the first 12 hex of the sha256 of the
file (line endings as LF), so a later edit, or a return to an older text, needs a line of
its own; adding a line whose words are already here counts too. Record lines are only ever
added: 1dn refuses a push that removes or changes one. Newest last. The first line records
the error-log rules of 2cd2a04, which Jonathan pasted himself on 2026-11-13 (7274ebc); the
second, "Paste A" (the rules on main at 00d4be4: school accounts step 1, song requests and the
teacher's read of minutes days), which Jonathan was told on 2026-11-13 to paste; the third,
Paste A rebuilt at af1166e (the same text plus the song files block, `songFiles` and
`songFilesUsage`), which Jonathan was told on 2026-11-14 to paste; the fourth, the rules on
main since de68fd8 (Pastes C, D and E: the teacher's deletes, built songs, practice minutes with
no daily limit), which Jonathan published as one paste on 2026-11-15 (WORKFLOW.md, "Class rules
published 2026-11-15"). `tools/checks.mjs` 1dt pins the same text by its full sha256
(`RULES_FILE_SHA256`): a rules change moves both, in the same commit.

- 2026-11-13 firestore.rules 789574577823: Jonathan was told on 2026-11-13 to paste it in the Firebase console (Firestore → Rules → Publish)
- 2026-11-13 firestore.rules fbb109792326: Jonathan was told on 2026-11-13 to paste it in the Firebase console (Firestore → Rules → Publish)
- 2026-11-14 firestore.rules e08e52157c9d: Jonathan was told on 2026-11-14 to paste it in the Firebase console (Firestore → Rules → Publish)
- 2026-11-15 firestore.rules 8cb7341f61c3: Jonathan was told on 2026-11-15 to paste it in the Firebase console (Firestore → Rules → Publish)
- 2026-11-17 firestore.rules fe73c9cd6837: Jonathan was told on 2026-11-17 to paste it in the Firebase console (Firestore → Rules → Publish)
