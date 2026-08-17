# Review Artifacts

Store milestone reviews here after a playable build exists.

Recommended layout:

```text
docs/reviews/
  milestone-01/
    evidence/
      seed-101.json
      turn-01.png
    ux-review.md
    level-design-review.md
    qa-review.md
    decisions.md
```

Each finding should include:

```md
## Finding

- ID:
- Area: UX | LEVEL | QA | VISUAL
- Severity: Blocker | High | Medium | Low
- Build or commit:
- Observed seed:
- Evidence:
- Moment:
- Suspected cause:
- Recommended experiment:
- Confidence:
- Status: Proposed | Accepted | Rejected | Deferred
- Related GitHub PR or issue:
- Human decision reason:
```
