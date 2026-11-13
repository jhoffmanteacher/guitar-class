#!/usr/bin/env node
/* Claude Code PreToolUse hook (2026-11-13): keep student names out of Claude.

   Jonathan, 2026-11-13: "I am allowed to store data in google/firestore but not in
   claude", then "let's block student names from claude". Whatever a Claude tool
   reads, lists or prints is sent to Anthropic as part of the conversation. This hook
   stops the tool calls that would read the files on this computer that hold student
   names, and makes Claude ask before it drives the real browser or a Google
   connector, where a page with names may be on screen.

   What holds names (and is blocked):
   - the teacher console's raw downloads: mic-recordings-<date>.zip, an unzipped
     mic-recordings-<date>/ folder, the per-take files mic-<game>-<Name>-<date>.wav/.json;
   - the console's backup files: guitar-class-backup-<date>.json (every name and email);
   - anything in a folder named guitar-class-private or student-data (the place to
     keep such files).

   What is still allowed, because it sends no name to Claude:
   - `node tools/mic-sim/takes-in.mjs`: it unzips, removes the names and prints counts;
   - listing or moving the files themselves (ls of the .zip / .json, mv, du, stat);
   - reading code that merely mentions these file names (a pattern is not a path).

   What it asks about every time (it cannot see what is on the screen):
   - the Claude in Chrome extension (the real browser may show the teacher console,
     Gmail, Drive or Classroom);
   - the Google Drive / Gmail / Calendar / Classroom connectors.

   It is a guard rail, not a wall: a script that opens one of these files under
   another name, or text pasted into the chat, gets past it. The rule in CLAUDE.md
   ("Student data never goes to Claude") is what binds; this catches the slips.

   Fails OPEN on its own errors (a broken hook must not brick a session), which is
   why tools/checks.mjs runs `--self-test` on every push. Off switch:
   GC_NO_STUDENT_DATA_HOOK=0 in the environment. Node only, so it works on both of
   Jonathan's machines and in cloud sessions. */

const NAME = 'no-student-data';

/* A concrete protected thing named in a path or a shell command. `dir: true`
   means the token is (or is inside) a folder whose listing itself shows names. */
const PROTECTED = [
  // As a PATH only (after a slash or ~, or followed by a slash): code and settings that merely name the folder are not a read.
  // The name must be a whole folder name: "student-data-notes.md" is a file that merely starts with the words.
  { re: /(?:[/~]guitar-class-private(?=\/|$|[\s"'`;|&)])(?:\/[^\s"'`;|&)]*)?|(?:^|[\s"'`=(])guitar-class-private\/[^\s"'`;|&)]*)/gi, dir: true, what: 'the private student-data folder' },
  { re: /(?:[/~]student-data(?=\/|$|[\s"'`;|&)])(?:\/[^\s"'`;|&)]*)?|(?:^|[\s"'`=(])student-data\/[^\s"'`;|&)]*)/gi, dir: true, what: 'a student-data folder' },
  { re: /mic-recordings[-\w.*?]*\.zip\b/gi, dir: false, what: 'a raw recordings download (student names inside)' },
  { re: /mic-recordings-(?:\d{4}-\d{2}-\d{2}|\*)[-\w]*\/[^\s"'`;|&)]*/gi, dir: true, what: 'an unzipped raw recordings folder (student names in the file names)' },
  { re: /mic-recordings-\d{4}-\d{2}-\d{2}(?![-\w]*\.zip)\b/gi, dir: true, what: 'an unzipped raw recordings folder (student names in the file names)' },
  { re: /mic-(?:pw|coach|nr|take)-(?!\$\{)[A-Za-z0-9*?][-\w*?]*\.(?:wav|json)\b/gi, dir: true, what: 'a raw recording file (a student name is in its file name)' },
  { re: /guitar-class-backup(?:-\d{4}-\d{2}-\d{2}|[-\w]*[*?])[-\w.*?() ]*\.json\b/gi, dir: false, what: 'a console backup file (every student name and email)' }
];

// Shell commands that send no file CONTENT to Claude. `ls` is safe only on the file itself, never on a folder.
const SAFE_ANY = new Set(['mv', 'du', 'stat', 'test', '[', 'mkdir']);
const SAFE_FILE_ONLY = new Set(['ls']);
const INTAKE = /^\s*(?:env\s+\S+=\S+\s+)*node\s+(?:\S*\/)?tools\/mic-sim\/takes-in\.mjs(?:\s|$)/;

function hits(text){
  const out = [];
  for (const p of PROTECTED){
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text))) out.push({ token: m[0].trim(), dir: p.dir, what: p.what });
  }
  return out;
}

// A path handed to a file tool: any hit blocks.
function checkPath(path){
  const h = hits(String(path || ''));
  return h.length ? h[0].what : null;
}

// A shell command: every segment that names a protected thing must be a known-safe command.
function checkShell(cmd){
  const text = String(cmd || '');
  if (!hits(text).length) return null;
  const segments = text.split(/\n|&&|\|\||;|\|/);
  for (const seg of segments){
    const h = hits(seg);
    if (!h.length) continue;
    if (INTAKE.test(seg)) continue;
    const first = (seg.trim().match(/^(?:sudo\s+)?([^\s]+)/) || [])[1] || '';
    const base = first.split('/').pop();
    if (SAFE_ANY.has(base)) continue;
    if (SAFE_FILE_ONLY.has(base) && h.every(x => !x.dir)) continue;
    return h[0].what;
  }
  return null;
}

const ASK_TOOLS = [
  { re: /^mcp__claude-in-chrome__/, why: 'The real Chrome browser may have a page with student names on it (the teacher console, Gmail, Drive, Classroom). Whatever Claude reads or screenshots there is sent to Anthropic. Approve only if no such page is open or will be opened; use headless Chrome for Testing with the stub Firestore for site checks.' },
  { re: /^mcp__claude_ai_(?:Google_Drive|Gmail|Google_Calendar|Google_Classroom)/i, why: 'A Google connector can return rosters, gradebooks or emails with student names. Whatever it returns is sent to Anthropic. Approve only for a file or message you know holds no student names.' }
];

function decide(input){
  const tool = String(input.tool_name || '');
  const ti = input.tool_input || {};
  for (const a of ASK_TOOLS) if (a.re.test(tool)) return { decision: 'ask', reason: a.why };
  let what = null;
  if (tool === 'Bash' || tool === 'PowerShell') what = checkShell(ti.command);
  else if (tool === 'Read' || tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') what = checkPath(ti.file_path || ti.notebook_path);
  else if (tool === 'Grep') what = checkPath(ti.path) || checkPath(ti.glob);
  else if (tool === 'Glob') what = checkPath(ti.path) || checkPath(ti.pattern);
  else if (tool === 'Artifact') what = checkPath(ti.file_path) || checkPath(JSON.stringify(ti.files || '')) || checkPath((ti.file_paths || []).join(' '));
  if (!what) return null;
  return { decision: 'deny', reason: `Blocked by .claude/hooks/${NAME}.mjs: this would open ${what}. Student data never goes to Claude (CLAUDE.md, Jonathan 2026-11-13). To bring recordings in, run \`node tools/mic-sim/takes-in.mjs\`, which removes the names and prints only counts. Do not look for another way to read the file; if the task truly needs it, stop and tell Jonathan.` };
}

function selfTest(){
  const B = cmd => ({ tool_name: 'Bash', tool_input: { command: cmd } });
  const R = p => ({ tool_name: 'Read', tool_input: { file_path: p } });
  const cases = [
    // [expected, input, label]
    ['deny', B('unzip -l ~/Documents/mic-recordings-2026-11-07.zip'), 'list inside a raw zip'],
    ['deny', B('unzip -o ~/Downloads/mic-recordings-2026-11-13.zip -d /tmp/x && ls /tmp/x'), 'unzip a raw zip'],
    ['deny', B('cat ~/Downloads/guitar-class-backup-2026-11-13.json | head'), 'cat a backup'],
    ['deny', B('python3 -c "import json;print(json.load(open(\'/Users/x/Downloads/guitar-class-backup-2026-11-13.json\')))"'), 'python reads a backup'],
    ['deny', B('ls ~/Downloads/mic-recordings-2026-11-07/'), 'ls an unzipped raw folder (file names hold names)'],
    ['deny', B('ls ~/Downloads/mic-recordings-2026-11-07'), 'ls an unzipped raw folder, no slash'],
    ['deny', B('file ~/Downloads/mic-pw-Some-Name-2026-11-04-10-15.wav'), 'a raw per-take file'],
    ['deny', B('cd /tmp && grep -c name guitar-class-backup-*.json'), 'grep a backup by glob'],
    ['deny', B('ls ~/Documents/guitar-class-private/'), 'ls the private folder'],
    ['deny', B('echo ok; head -c 200 ~/Documents/mic-recordings-*.zip'), 'second segment reads a zip'],
    ['deny', B('node tools/mic-sim/anon-takes.mjs ~/Downloads/mic-recordings-2026-11-07/ out && cat out/T01.json; ls ~/Downloads/mic-recordings-2026-11-07/'), 'a safe-looking chain that ends in a folder listing'],
    ['deny', R('/Users/x/Downloads/guitar-class-backup-2026-11-13.json'), 'Read tool on a backup'],
    ['deny', R('/Users/x/Documents/guitar-class-private/roster.csv'), 'Read tool in the private folder'],
    ['deny', { tool_name: 'Grep', tool_input: { pattern: 'name', path: '/Users/x/Downloads/mic-recordings-2026-11-07/' } }, 'Grep tool in a raw folder'],
    ['deny', { tool_name: 'Glob', tool_input: { pattern: '**/mic-pw-*.json', path: '/Users/x/Downloads' } }, 'Glob tool for raw take files'],
    ['ask', { tool_name: 'mcp__claude-in-chrome__get_page_text', tool_input: { tabId: 1 } }, 'the real browser'],
    ['ask', { tool_name: 'mcp__claude_ai_Google_Drive__read_file_content', tool_input: { fileId: 'x' } }, 'the Drive connector'],
    [null, B('node tools/mic-sim/takes-in.mjs'), 'the intake, no argument'],
    [null, B('node tools/mic-sim/takes-in.mjs ~/Downloads/mic-recordings-2026-11-13.zip'), 'the intake with the zip named'],
    [null, B('ls -la ~/Documents/mic-recordings-*.zip ~/Downloads/guitar-class-backup-*.json'), 'ls of the files themselves'],
    [null, B('mkdir -p ~/Documents/guitar-class-private && mv ~/Documents/mic-recordings-2026-11-07.zip ~/Documents/guitar-class-private/'), 'moving a zip to the private folder'],
    [null, B('grep -n "mic-recordings" tools/mic-sim/takes-in.mjs teacher-mic.js'), 'searching CODE for the words'],
    [null, B('node tools/checks.mjs --check --skip-links'), 'an ordinary command'],
    [null, B('git commit -m "Console: Download everything saves mic-recordings-${day}.zip"'), 'a commit message with the template name'],
    [null, R('/Users/x/guitar-class/teacher-mic.js'), 'Read tool on code'],
    [null, R('/Users/x/guitar-class/Claude outputs/takes-anon/T01.json'), 'an anonymized take'],
    [null, { tool_name: 'Grep', tool_input: { pattern: 'guitar-class-backup-', path: '/Users/x/guitar-class' } }, 'Grep tool: the words as a PATTERN in code'],
    [null, { tool_name: 'Edit', tool_input: { file_path: '/Users/x/guitar-class/teacher-backup.js', old_string: 'a', new_string: 'guitar-class-backup-2026-11-13.json' } }, 'Edit tool: the words in CONTENT'],
    [null, { tool_name: 'Read', tool_input: { file_path: '/Users/x/guitar-class/tools/mic-sim/takes/T01.json' } }, 'a summary in the repo'],
    [null, { tool_name: 'Write', tool_input: { file_path: '/Users/x/.claude/projects/p/memory/student-data-never-in-claude.md', content: 'x' } }, 'a FILE whose name starts with the words (blocked by mistake on 2026-11-13)'],
    ['deny', R('/Users/x/Documents/student-data/roster.csv'), 'Read tool in a student-data folder'],
    ['deny', B('ls ~/Documents/student-data'), 'ls a student-data folder, no slash']
  ];
  let bad = 0;
  for (const [want, input, label] of cases){
    const d = decide(input);
    const got = d ? d.decision : null;
    if (got !== want){ bad++; console.log(`✗ ${label}: expected ${want || 'allowed'}, got ${got || 'allowed'}`); }
  }
  console.log(bad ? `${NAME}: ✗ ${bad} of ${cases.length} cases wrong` : `${NAME}: ✓ ${cases.length} of ${cases.length} cases (17 blocked, 2 ask, 13 allowed)`);
  process.exit(bad ? 1 : 0);
}

if (process.argv.includes('--self-test')) selfTest();
else {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => { raw += c; });
  process.stdin.on('end', () => {
    try {
      if (process.env.GC_NO_STUDENT_DATA_HOOK === '0') process.exit(0);
      const d = decide(JSON.parse(raw || '{}'));
      if (d) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: d.decision, permissionDecisionReason: d.reason } }));
    } catch (e) { /* fail open: see the header */ }
    process.exit(0);
  });
}
