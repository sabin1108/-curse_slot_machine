---
name: command-trace-recorder
description: Record and compare deterministic Curse Slot Machine engine traces for a seed and command sequence. Use for reproducible gameplay evidence, not feature implementation or balance judgment.
---

# Command Trace Recorder

Produce a normalized engine trace that another reviewer can replay. Do not modify game state outside the in-memory engine instance.

## Run

From the repository root, invoke:

```powershell
node .codex/skills/command-trace-recorder/scripts/record-trace.mjs --seed <seed> --commands <commands.json>
```

The command file must contain a JSON array. [references/example-commands.json](references/example-commands.json) is a minimal normal-play example. The script runs the sequence twice and exits nonzero when the traces differ.

The recorder refuses to attribute a trace to `HEAD` when tracked or untracked engine source under `src/`, package manifests, or TypeScript configuration differs from that commit. Commit or isolate those changes before recording review evidence.

Read [references/trace-schema.md](references/trace-schema.md) before consuming or extending the output schema.

## Evidence rules

- Record the exact commit, seed, ordered commands, events, post-command states, and final digest.
- Preserve rejected commands in the trace.
- Use game commands rather than injecting slot results when the claim concerns real spin, lock, reroll, or confirmation behavior.
- Direct `RESOLVE_COMBAT_SLOT` commands are acceptable only when the claim explicitly concerns resolver behavior; label that limitation.
- Do not replace representative seeds after observing an inconvenient result.

Return the trace or a concise comparison summary. Write a repository artifact only when the user supplies an output path or the applicable review workflow requires one.
