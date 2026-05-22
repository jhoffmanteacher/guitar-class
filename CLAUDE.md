# Guitar Class Website — Claude Instructions

## Who I'm working with
Jose Rosario is new to Claude Code and git. He prefers plain-English instructions and wants Claude to handle all git mechanics without him needing to remember commands.

## Plain-English workflow
| Jose says | Claude does |
|---|---|
| "Let's test these changes locally" | Start Live Server (VS Code extension, right-click index.html → Open with Live Server) |
| "Push to GitHub" | git add relevant files, git commit with a clear message, git push, confirm success |
| "Save progress with a note: [message]" | Commit with that message and push |

## Project: what this is
Plain static HTML/JS/CSS site — no build step, no Jekyll, no Node framework. Content lives in `index.html` and per-module JS files (`module-1.js` through `module-8.js`, `config-main.js`). Uses Firebase for auth and Firestore for student progress. Deployed by pushing to GitHub.

## Live preview
VS Code **Live Server** extension. Right-click `index.html` → "Open with Live Server". Browser auto-refreshes on save. No commit needed.

## Dev testing bypass
A "Dev bypass" button exists on the auth wall (below "Sign in with Google"). It skips Firebase auth and loads the app with a mock user (`Dev User / dev@test.local`). Progress won't save to Firestore in bypass mode — it's for UI/layout testing only.

## Shell
Windows, VS Code, PowerShell. No changes needed — Claude Code already defaults to PowerShell on Windows.

## How to ask follow-up questions
When you need to clarify something with Jose, use the **AskUserQuestion** tool to present a multiple-choice picker rather than a free-text question. He prefers to click an option than to type a freeform answer.

- 2–4 options per question, mutually exclusive
- One question per turn unless the choices are truly independent
- Use this for design choices, scope decisions, style preferences — anywhere a free-text question would normally appear

## Switching topics — prompt to start a fresh chat
When Jose asks for something that is clearly a **new, unrelated topic** from what we've been working on (e.g., we just finished a feature on Module 5 and he now asks about a different part of the site, a different project, or general Claude Code questions), use **AskUserQuestion** to ask whether he'd like to start a fresh conversation before continuing. A fresh chat keeps context focused and responses faster.

Phrase it like: "Looks like we're switching topics — want to start a fresh chat for this, or keep going here?"

- Only ask once per topic switch, not every message.
- Don't ask for natural follow-ups on the same topic (bug fixes, tweaks, refinements to what we just built).
- If he says "keep going," don't ask again unless the topic shifts a second time.
