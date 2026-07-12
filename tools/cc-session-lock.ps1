<#
  cc-session-lock.ps1 — Claude Code multi-session guard (Windows / PowerShell twin
  of the Mac hook ~/.claude/hooks/cc-session-lock.sh).

  Why: two Claude sessions in the SAME git working tree share one git index, so
  one session's `git commit` can sweep up the OTHER session's uncommitted changes.
  The fix is to give each concurrent session its own git worktree. This keeps a
  per-session heartbeat lockfile inside .git and, at SessionStart, warns Claude to
  isolate in a worktree if another session's lock is fresh and we're in the main
  working tree. Locks refresh on every prompt and are removed at SessionEnd;
  crashed sessions' locks go stale and get cleaned up automatically.

  Modes ($args[0]): detect (SessionStart) | beat (UserPromptSubmit) | end (SessionEnd)
  Reads the hook JSON payload on stdin (for .session_id).

  INSTALL (Windows, one time):
    1. Copy this file to  $HOME\.claude\hooks\cc-session-lock.ps1
    2. Add the three hooks to  $HOME\.claude\settings.json  (see the block in the
       repo's WORKFLOW.md / the assistant's message). Use  "shell": "powershell".
    3. Open /hooks once (or restart Claude Code) to load them.
#>
$ErrorActionPreference = 'SilentlyContinue'

$mode = if ($args.Count -ge 1) { [string]$args[0] } else { 'detect' }

$raw = [Console]::In.ReadToEnd()
$sid = ''
try { $sid = ($raw | ConvertFrom-Json).session_id } catch { }
if ([string]::IsNullOrEmpty($sid)) { $sid = "pid$PID" }
$sid = ($sid -replace '[^A-Za-z0-9._-]', '')
if ([string]::IsNullOrEmpty($sid)) { $sid = "pid$PID" }

# Only meaningful inside a git repo.
git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { exit 0 }

$common = git rev-parse --git-common-dir 2>$null
if ([string]::IsNullOrEmpty($common)) { exit 0 }
try { $common = (Resolve-Path -LiteralPath $common).Path } catch { exit 0 }

$lockdir = Join-Path $common 'claude-session-locks'
$mylock  = Join-Path $lockdir "$sid.lock"

function Touch-Lock {
  New-Item -ItemType Directory -Force -Path $lockdir | Out-Null
  Set-Content -LiteralPath $mylock -Value '' -NoNewline
  try { (Get-Item -LiteralPath $mylock).LastWriteTime = Get-Date } catch { }
}

switch ($mode) {
  'beat' { Touch-Lock; exit 0 }
  'end'  { Remove-Item -LiteralPath $mylock -Force -ErrorAction SilentlyContinue; exit 0 }
  default {
    Touch-Lock   # always register self

    # Already isolated in a linked worktree? Then nothing to warn about.
    $gitdir = git rev-parse --absolute-git-dir 2>$null
    if (-not [string]::IsNullOrEmpty($gitdir)) {
      try { $gitdir = (Resolve-Path -LiteralPath $gitdir).Path } catch { }
      if ($gitdir -ne $common) { exit 0 }
    }

    $now   = Get-Date
    $fresh = New-TimeSpan -Minutes 15
    $stale = New-TimeSpan -Minutes 60
    $live  = $false
    $locks = Get-ChildItem -LiteralPath $lockdir -Filter *.lock -ErrorAction SilentlyContinue
    foreach ($f in $locks) {
      if ($f.BaseName -eq $sid) { continue }
      $age = $now - $f.LastWriteTime
      if ($age -lt $fresh) { $live = $true }
      if ($age -gt $stale) { Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue }
    }
    if (-not $live) { exit 0 }

    $name = Split-Path -Leaf (Get-Location).Path
    $alnum = ($sid -replace '[^A-Za-z0-9]', '')
    $short = if ($alnum.Length -gt 0) { $alnum.Substring(0, [Math]::Min(6, $alnum.Length)) } else { 'alt' }

    $msg = "WARNING: Another Claude Code session looks active in this repository (a second session's lock is fresh). Two sessions sharing ONE working tree also share a git index -- one session's commit can sweep up the other's uncommitted changes (this has bitten this project before). Before editing shared files, isolate THIS session in its own git worktree, e.g.:  git worktree add ../$name-$short -b work-$short  -- then cd into it (or use the EnterWorktree tool) and make your edits there. If you and the user deliberately intend to co-edit the same tree, you can disregard this."

    $out = [ordered]@{
      hookSpecificOutput = [ordered]@{
        hookEventName     = 'SessionStart'
        additionalContext = $msg
      }
    }
    $out | ConvertTo-Json -Compress -Depth 5
    exit 0
  }
}
