# Trace schema

The recorder emits one JSON object:

- `schemaVersion`: currently `1`.
- `commit`: reviewed Git commit, or `unknown` when unavailable.
- `sourceClean`: whether the engine, manifests, and TypeScript configuration match `commit`. The recorder exits before execution when this is false.
- `recorderDigest`: SHA-256 of the recorder script, preserving tool provenance independently from game source provenance.
- `seed`: exact engine seed.
- `commands`: input command array in execution order.
- `steps`: one entry per command containing `index`, `command`, `events`, and the complete post-command `state`.
- `finalDigest`: SHA-256 of the normalized `steps` JSON.
- `deterministic`: whether two fresh runs produced byte-identical normalized steps.

Consumers must compare `schemaVersion` before assuming fields. A deterministic trace proves repeatability for that seed and command sequence only; it does not prove balance, reachability, or correctness of injected commands.
