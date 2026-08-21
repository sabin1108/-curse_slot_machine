---
name: playable-checkpoint-preflight
description: Check whether a Curse Slot Machine commit is ready for seeded QA, level-design, and UX milestone reviews. Use before launching domain reviews, not as a substitute for those reviews.
---

# Playable Checkpoint Preflight

Decide whether a specific commit is ready to hand to milestone reviewers. This is read-only and does not fix readiness failures.

## Required inputs

Identify the commit, milestone intent, acceptance criteria, local run command and URL, representative seeds, known limitations, and prohibited modification scope. If the target is not fixed to a commit, return `Not ready` immediately.

Read `AGENTS.md` and `docs/reviews/README.md`. Check:

- the reviewed commit exists and the worktree used for review is clean;
- existing CI evidence or a disposable clean checkout proves lockfile installation; never run `npm ci` in the review target under a read-only preflight;
- the documented run command binds to `127.0.0.1`;
- seed input and normal game commands are reachable;
- targeted tests, full unit tests, typecheck, build, and applicable Playwright smoke checks pass against the commit;
- Playwright captures page errors or the gap is explicitly declared;
- a representative seed reaches the intended milestone path;
- normal and Showcase paths are clearly distinguished;
- acceptance criteria and known limitations are specific enough for reviewers to stop consistently;
- review agents are prohibited from editing product code or sharing a writable implementation checkout.

Do not launch domain reviews when a required item fails. A missing optional check may yield `Ready with gaps` only when it cannot invalidate the milestone claim.

## Output

Return `Ready`, `Ready with gaps`, or `Not ready`, followed by a checklist with evidence and exact blockers. Provide the complete handoff packet that can be passed unchanged to `$seeded-gameplay-qa`, `$slot-level-designer`, and `$slot-ux-review`.

Do not create GitHub issues, branches, commits, or review artifacts. Do not mark proposed findings as accepted.
