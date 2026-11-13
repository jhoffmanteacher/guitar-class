/* eslint.config.mjs — the site's "name checker" (2026-11-13, research-3 rec. 2). Report-only, run on GitHub.

   Run it through tools/lint.mjs, never as a bare `npx eslint`. The site is ~45 classic scripts that share ONE
   global scope per page (index.html and its lazy loads, each Song Journey page, the small standalone pages,
   the service worker). A name declared at the top of one script and used in another is not undefined, so
   tools/lint.mjs first collects every script's top-level names, then lints each script once per page it is on
   with the names the page's OTHER scripts declare as `globals`. A bare `npx eslint` has no such list and would
   call every cross-file name undefined. The wrapper fetches ESLint with npx at the versions pinned below, so
   nothing is installed in the repo and nothing here ships to students.

   What it reports (rules below; no formatting rules):
     no-undef          a name used that no script on that page declares: a ReferenceError waiting to happen
                       (cbFmtTime was deleted but still called and 4 games broke; fixed in 8f6b67b). Also run on
                       the inline on*="…" handlers inside HTML strings (tools/lint.mjs extracts them).
     no-redeclare      with builtinGlobals: a top-level name declared by TWO scripts on the same page (the later
                       `function` silently wins; a second `const`/`let` is a SyntaxError that kills the script)
     no-dupe-keys      an object literal with the same key twice (the first value is silently lost)
     no-unreachable    code after return / throw / break
     no-unused-vars    warn, LOCAL names only (vars: 'local'): a top-level function is reached from other scripts
                       and from inline handlers in HTML strings, which ESLint cannot see, so top-level names are
                       never reported. Arguments are not checked (args: 'none'): handler and callback signatures
                       keep unused parameters on purpose. Unused catch bindings are not checked either.
   tools/lint.mjs adds one check of its own, "load-order": a statement that RUNS when a script loads (not inside a
   function) and uses a name that only a LATER script on the page declares (CLAUDE.md: "a new top-level statement
   that RUNS at load may only use what is defined in the same or an earlier part").
   no-implicit-globals is NOT on: in a classic script every top-level declaration is a global, which is how the
   whole site is built, so it would flag all ~1,700 of them. A write to an undeclared name (an accidental
   implicit global) is already reported by no-undef. */

/* The exact versions npx fetches (each published at least two weeks before it was pinned). Change them here only. */
export const ESLINT_VERSION = '10.13.0';
export const GLOBALS_VERSION = '17.13.0';

export const RULES = {
  'no-undef': ['error', { typeof: false }],
  'no-redeclare': ['error', { builtinGlobals: true }],
  'no-dupe-keys': 'error',
  'no-unreachable': 'error',
  'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
};

/* Names that come from outside the site's own scripts and are not in the browser list of the `globals` package.
   Each one says where it comes from. A name goes here only when it really exists at run time on the page;
   never to silence a finding (CLAUDE.md: a check fails → fix the cause). */
export const OUTSIDE_GLOBALS = {
  firebase: 'readonly',            // the Firebase compat SDK from gstatic (index.html, tabs/*.html; Firestore lazily)
};

/* The config for one script on one page. `pageGlobals` = the names the page's other scripts declare, plus the
   browser (or service worker) globals; tools/lint.mjs builds it. */
export function scriptConfig(pageGlobals, plugin, extraRules = {}) {
  return [{
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...pageGlobals, ...OUTSIDE_GLOBALS },
    },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    plugins: plugin ? { site: plugin } : {},
    rules: { ...RULES, ...extraRules },
  }];
}

/* A bare `npx eslint` gets the rules with only the outside globals (see the header: use tools/lint.mjs). */
export default [
  { ignores: ['tools/**', '.claude/**', '.github/**', 'Claude outputs/**', 'node_modules/**', '**/*.mjs'] },
  ...scriptConfig({}, null),
];
