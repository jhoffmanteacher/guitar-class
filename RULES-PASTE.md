# firestore.rules pastes

GitHub does not publish `firestore.rules`. A change reaches the live database only when
Jonathan pastes the whole file in the Firebase console (Firestore → Rules → paste → Publish).

`tools/checks.mjs` 1dn refuses a commit or push that changes `firestore.rules` until this
file has a NEW line naming the new text's hash, in this form (the check prints the exact
line, with today's date and the hash, when it refuses):

    - YYYY-MM-DD firestore.rules <12 hex>: told Jonathan to paste it in the Firebase console (Firestore → Rules → Publish)

Add the line only after telling Jonathan. The hash is the first 12 hex of the sha256 of the
file (line endings as LF), so a later edit, or a return to an older text, needs a line of
its own. Newest last.

- 2026-11-13 firestore.rules 789574577823: pasted by Jonathan in the Firebase console (the error-log rules of 2cd2a04; recorded in 7274ebc)
