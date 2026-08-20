# Showcase Step Header Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve `SHOWCASE-QA-003` by giving the Showcase step counter and Korean step title explicit visual separation.

**Architecture:** `ShowcaseOverlay` remains a React display/input component only. It will expose the step counter, separator, and step title as distinct DOM elements so CSS can prevent the `STEP 4 / 4` text from visually running into the Korean title. No game rules, RNG, reward, or combat logic changes.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, CSS.

## Global Constraints

- React renders state and dispatches commands only.
- Do not move reward generation, RNG, combat resolution, or Showcase step rules into React.
- Fix only `SHOWCASE-QA-003` in this branch.
- Verify with `npm.cmd run typecheck`, `npm.cmd run test:run`, and `npm.cmd run build` before PR.

---

### Task 1: Separate Showcase Step Counter And Title

**Files:**
- Create: `src/components/Showcase/ShowcaseOverlay.test.tsx`
- Modify: `src/components/Showcase/ShowcaseOverlay.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `ShowcaseOverlayProps` with `currentStepIndex`, `steps`, and `onDispatch`.
- Produces: a `.showcase-step-heading` container with `.step-num`, `.step-separator`, and `.step-title` children.

- [x] **Step 1: Write the failing component test**

Add `src/components/Showcase/ShowcaseOverlay.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShowcaseOverlay } from './ShowcaseOverlay';
import type { ShowcaseStep } from '../../types/game';

const steps: ShowcaseStep[] = [
  {
    stepIndex: 4,
    title: '4단계: 보스 마무리 전투',
    instruction: '마지막 전투 흐름을 보여준다.',
    actionScript: 'NONE',
    highlightMessage: '확실한 구분이 필요하다.',
  },
];

describe('ShowcaseOverlay', () => {
  it('separates the step counter from the step title with a dedicated separator', () => {
    const { container } = render(
      <ShowcaseOverlay currentStepIndex={0} steps={steps} onDispatch={vi.fn()} />,
    );

    const heading = container.querySelector('.showcase-step-heading');
    const stepNum = container.querySelector('.showcase-step-heading .step-num');
    const separator = container.querySelector('.showcase-step-heading .step-separator');
    const stepTitle = container.querySelector('.showcase-step-heading .step-title');

    expect(heading).toBeInTheDocument();
    expect(stepNum).toHaveTextContent('STEP 4 / 1');
    expect(separator).toHaveTextContent('•');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(stepTitle).toHaveTextContent('4단계: 보스 마무리 전투');
    expect(screen.getByText('마지막 전투 흐름을 보여준다.')).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run RED**

Run: `npm.cmd run test:run -- src/components/Showcase/ShowcaseOverlay.test.tsx`

Expected: FAIL because `.showcase-step-heading`, `.step-separator`, and `.step-title` do not exist.

- [x] **Step 3: Implement minimal JSX structure**

In `src/components/Showcase/ShowcaseOverlay.tsx`, replace the current inline step counter/title pair:

```tsx
<span className="step-num">STEP {currentStep.stepIndex} / {steps.length}</span>
<strong>{currentStep.title}</strong>
```

with:

```tsx
<div className="showcase-step-heading">
  <span className="step-num">STEP {currentStep.stepIndex} / {steps.length}</span>
  <span className="step-separator" aria-hidden="true">•</span>
  <strong className="step-title">{currentStep.title}</strong>
</div>
```

- [x] **Step 4: Add CSS spacing hooks**

In `src/styles.css`, add:

```css
.showcase-step-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.showcase-step-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.step-separator {
  color: #ffb703;
  font-weight: bold;
}

.step-title {
  color: #fff0d0;
  min-width: 0;
}
```

- [x] **Step 5: Run targeted GREEN**

Run: `npm.cmd run test:run -- src/components/Showcase/ShowcaseOverlay.test.tsx`

Expected: PASS.

- [x] **Step 6: Full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Expected: all pass.

Focused browser check also passed: Showcase step 4 `.showcase-step-heading` is visible, `.step-separator` renders `•`, and computed heading gap is `10px`.

- [x] **Step 7: Update docs, commit, push, and open draft PR**

Update:
- `docs/agent/PROJECT_PROGRESS_SUMMARY.md`
- `docs/agent/SESSION_HANDOFF.md`
- `docs/CODEX_COLLABORATION.md`

Commit and push the branch, then open a draft PR against `main`.
