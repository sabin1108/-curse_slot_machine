# Offline Font Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve `SHOWCASE-QA-004` by removing external Google Fonts network dependency and using offline-safe Korean/system font fallbacks.

**Architecture:** Styling remains CSS-only. The app will not request externally hosted font CSS or font binary URLs during local/offline judging. React components and game systems are unchanged.

**Tech Stack:** Vite, React, TypeScript, Vitest, CSS.

## Global Constraints

- React renders state and dispatches commands only.
- Do not move reward generation, RNG, combat resolution, or Showcase rules into React.
- Do not add new dependencies.
- Fix only external font dependency / fallback behavior in this branch.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Remove External Font Dependency

**Files:**
- Create: `src/app/OfflineAssetPolicy.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: source CSS and `index.html` as browser-loaded assets.
- Produces: no externally hosted Google Fonts URLs in app-owned browser assets.

- [x] **Step 1: Write the failing policy test**

Create `src/app/OfflineAssetPolicy.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const browserAssetFiles = ['index.html', 'src/styles.css'];

describe('offline browser asset policy', () => {
  it('does not depend on externally hosted Google Fonts', () => {
    const contents = browserAssetFiles
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n');

    expect(contents).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
    expect(contents).not.toMatch(/@import\s+url\(['"]?https?:\/\//);
  });
});
```

- [x] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/app/OfflineAssetPolicy.test.ts`

Expected: FAIL because `src/styles.css` imports `https://fonts.googleapis.com/css2?family=Jua&display=swap`.

- [x] **Step 3: Implement minimal CSS fallback**

In `src/styles.css`:

- Remove the Google Fonts `@import`.
- Add a root font variable:

```css
:root {
  --font-display: "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", system-ui, sans-serif;
}
```

- Replace `font-family: 'Jua', sans-serif;` with `font-family: var(--font-display);`.

- [x] **Step 4: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/app/OfflineAssetPolicy.test.ts`

Expected: PASS.

- [x] **Step 5: Full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected: all pass.

- [x] **Step 6: Focused browser check**

Run a local browser check and collect failed request URLs while loading the title screen.

Expected: no failed request URL contains `fonts.googleapis.com` or `fonts.gstatic.com`.

Actual: focused Playwright browser check loaded the title screen with `failedCount: 0` and `fontFailures: []`.

- [ ] **Step 7: Update docs, commit, push, and open draft PR**

Update:
- `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- `docs/agent/SESSION_HANDOFF.md`
- `docs/CODEX_COLLABORATION.md`

Commit, push, and open a draft PR against `main`.
