// The hosting predeploy in firebase.json: a `firebase deploy` typed on a Mac stops here; only GitHub
// (.github/workflows/practice.yml) publishes the practice copy. It is a file, not an inline `node -e "…"`,
// because firebase-tools runs a predeploy through cross-env-shell, which strips single quotes: the inline
// guard crashed with a SyntaxError on GitHub and blocked every publish (2026-11-18). checks.mjs 1ed runs it.
if (process.env.GITHUB_ACTIONS !== 'true') {
  console.error('The practice copy is published by GitHub only (.github/workflows/practice.yml), never by a firebase deploy typed on this computer: nothing was uploaded.');
  process.exit(1);
}
