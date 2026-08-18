# Project Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the repository baseline expected by the branch workflow: project instructions, handoff docs, app shell, test alias, canonical app test path, and verification.

**Architecture:** Keep the current React + TypeScript + Vite shell, but place app UI under `src/app` so future game modules can grow beside `src/game`. This branch does not implement gameplay logic; it prepares the repo contract and smoke surface for later deterministic engine work.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 3, Testing Library, Playwright.

## Global Constraints

- React UI does not decide RNG, reel outcomes, combat results, rewards, or enemy actions.
- Keep `CombatSlotMachine` and `AugmentSlotMachine` separate in future branches.
- Do not merge PRs without explicit user approval.
- Do not commit credentials, OAuth tokens, cookies, or local browser profiles.
- Use `npm.cmd` and `npx.cmd` on Windows if PowerShell blocks npm/npx shims.
- Verify baseline with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build`.

---

### Task 1: Baseline Documentation

**Files:**
- Create: `docs/agent/SESSION_HANDOFF.md`
- Create: `docs/design/PLANNING_SUMMARY.md`
- Create: `docs/CODEX_COLLABORATION.md`
- Create: `docs/THIRD_PARTY_ASSETS.md`
- Modify: `docs/agent/SETUP_STATUS.md`
- Modify: `docs/agent/TOOL_VERSIONS.md`

**Interfaces:**
- Consumes: local planning documents and setup guide.
- Produces: handoff record for later branches.

- [x] **Step 1: Record source documents and decisions**

Write the read document paths, key architecture decisions, clone path, branch strategy, auth blocker, and verification status in `docs/agent/SESSION_HANDOFF.md`.

- [x] **Step 2: Record planning summary**

Create `docs/design/PLANNING_SUMMARY.md` with the gameplay pitch, architecture constraints, branch sequence, and MVP exclusions.

- [x] **Step 3: Record collaboration and assets**

Create `docs/CODEX_COLLABORATION.md` and `docs/THIRD_PARTY_ASSETS.md` with initial entries for this setup branch.

### Task 2: Canonical App Shell Path

**Files:**
- Create: `src/app/App.test.tsx`
- Create: `src/app/App.tsx`
- Modify: `src/main.tsx`
- Delete: `src/App.test.tsx`
- Delete: `src/App.tsx`

**Interfaces:**
- Produces: `App` exported from `src/app/App.tsx`.
- Consumes: Vitest setup from `src/test/setup.ts`.

- [x] **Step 1: Write the failing test**

Create `src/app/App.test.tsx` importing `./App` and asserting the heading `Curse Slot Machine` and button `Start Run`.

- [x] **Step 2: Run test to verify it fails**

Run:

```powershell
npm.cmd run test:run -- src/app/App.test.tsx
```

Expected: fail because `src/app/App.tsx` does not exist yet.

Actual: failed with unresolved `./App` import after rerunning outside the sandbox.

- [x] **Step 3: Move app shell**

Create `src/app/App.tsx` with the existing shell content, update `src/main.tsx` to import `./app/App`, then delete root-level `src/App.tsx` and `src/App.test.tsx`.

- [x] **Step 4: Run targeted test**

Run:

```powershell
npm.cmd run test:run -- src/app/App.test.tsx
```

Expected: pass.

### Task 3: Script Alias And Verification

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docs/agent/SESSION_HANDOFF.md`

**Interfaces:**
- Produces: `npm.cmd run test:run` alias for the required workflow.

- [x] **Step 1: Add script alias**

Set `scripts.test:run` to `vitest run` while preserving existing `test`.

- [x] **Step 2: Run required checks**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

If browser checks are stable, also run:

```powershell
npm.cmd run test:e2e
```

- [x] **Step 3: Update handoff**

Record command results, unresolved GitHub auth blocker, and next branch in `docs/agent/SESSION_HANDOFF.md`.

- [ ] **Step 4: Commit**

Run:

```powershell
git add .
git commit -m "chore: establish project baseline"
```
