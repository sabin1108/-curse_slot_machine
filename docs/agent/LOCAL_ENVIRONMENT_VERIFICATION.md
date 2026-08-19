# Local Agent Environment Verification

Run this checklist once per teammate machine after pulling the agent-environment hardening changes. These checks verify account- and machine-scoped capabilities that the repository cannot prove.

Do not record tokens, cookies, email addresses, user-home paths, or browser-profile details in this file.

## 1. Start a new Codex session

Launch Codex from the repository root after pulling the changes. A pre-existing session may still hold the old `AGENTS.md` or skill catalog.

## 2. Project instructions

Ask:

```text
Summarize this repository's implementation and milestone-review ownership. Do not modify files, create a plan, spawn subagents, or start OMX.
```

Pass when the response says Superpowers owns development, OMX is optional and review-only, review agents do not edit product code, and only human-accepted findings enter implementation.

## 3. Native project skills

Open `/skills` and confirm these entries appear:

- `slot-level-designer`
- `slot-ux-review`
- `seeded-gameplay-qa`

Explicitly invoke one skill with a review request that lacks a playable build. Pass when it reports the missing prerequisite without modifying code.

## 4. Context7 MCP

Run `codex mcp list`, then ask:

```text
Use Context7 to identify the official Vite documentation relevant to the version in package.json. Return the source and a one-sentence summary. Do not modify files.
```

Pass when Context7 appears in the server list and the documentation lookup succeeds.

## 5. Playwright MCP

Start the local app, then ask:

```text
Use Playwright MCP to open the local game at 1280x720. Report the page title, primary controls, and browser-console errors. Do not modify files.
```

Pass when the browser opens the local URL, the requested observations are returned, and product files remain unchanged.

## 6. Superpowers

Open `/plugins` and confirm Superpowers is installed and enabled. Start a new session after changing plugin state.

Ask:

```text
Read AGENTS.md and summarize the boundary between Superpowers development and OMX review. Do not create a plan, worktree, subagent, or file.
```

Pass when the project boundary is preserved and no workflow starts automatically.

## 7. GitHub plugin

Open `/plugins` and confirm the GitHub plugin is installed, enabled, and connected to the intended account with access to `sabin1108/-curse_slot_machine`.

Ask:

```text
Use the GitHub plugin to report the default branch and open pull-request count for sabin1108/-curse_slot_machine. Do not create or change any external state.
```

Pass when the repository is read successfully and no issue, comment, pull request, label, branch, or setting is changed.

## 8. OMX, only if retained

Run:

```text
omx doctor
omx exec --skip-git-repo-check -C . "Reply with exactly OMX-EXEC-OK"
```

Then request a review outline that explicitly forbids planning and code changes. Pass only when OMX stays inside the review boundary. If it starts implementation planning or edits product code, disable it for this repository and record the failure without attempting a workaround.

## Result

Report only:

```text
Codex session refreshed: PASS/FAIL
Project instructions: PASS/FAIL
Native project skills: PASS/FAIL
Context7 MCP: PASS/FAIL
Playwright MCP: PASS/FAIL
Superpowers: PASS/FAIL
GitHub plugin: PASS/FAIL
OMX review boundary: PASS/FAIL/NOT USED
Blockers: <short description or none>
```
