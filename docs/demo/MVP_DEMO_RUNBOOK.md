# MVP Demo Runbook

## Checkpoint

- Demo seed: `demo-143510`
- Route: fixed 15-stage normal run
- Automated command fixture: `src/game/demo/MvpDemoTrace.ts`
- Expected command count: 81
- Expected maximum curse: 9/10
- Target duration for a narrated manual run: 5–10 minutes

## Start

```powershell
npm run dev
```

Open `http://127.0.0.1:5173`, keep the default seed, and select **START NORMAL RUN**. The default seed is the representative trace; changing it remains supported but is outside the demo balance guarantee.

## Narration checkpoints

1. Stage 1: spin, lock a useful reel, reroll, and point out the exact result preview before confirming.
2. Stages 1–2: choose `Combo Starter`, then `Multi-Hit Charm`. Let curse reach 5 so the +1 enemy-attack warning is visible.
3. Stage 3: purify 5 curse. Explain that 8 raises the pressure to +2 and 10 immediately loses the run.
4. Stage 5: choose `Combo Finisher`.
5. Stage 6 event: take the reward and choose `Ember Magazine`; the sidebar should show `Clockwork Barrage` completed.
6. Stage 8: heal 15. Stage 10: purchase `Retaliation Matrix` from the engine-owned shop offer, then leave.
7. Stage 12: purify 5. At stage 14, take the HP 15 event rest.
8. Stage 15: show the House Sovereign changing to phase 2 at half health (or when a phase-one overkill would otherwise skip it), with attack 10 applied on the transition turn. Finish at **HOUSE DEFEATED**.

The exact automated clicks are intentionally kept in the committed fixture instead of duplicated here. `tests/e2e/smoke.spec.ts` replays that fixture through visible controls.

## Expected proof

- Lock and reroll commands occur through normal combat controls.
- Result preview matches the confirmed HP/block/curse deltas.
- Curse crosses 5, is later purified, and never reaches 10.
- Shop offers and prices come from engine state; the run-wide purchase counter remains across shops.
- `Combo Starter`, `Multi-Hit Charm`, `Combo Finisher`, and `Ember Magazine` complete `Clockwork Barrage`.
- Boss phase 2 is observed before victory.
- No `pageerror`, console error, or 1280×720 horizontal overflow occurs in the automated run.

## Known boundary

The representative trace is a reproducible demo checkpoint, not a claim that every arbitrary seed is balanced to victory. Showcase Mode is separate and does not alter normal-run calculations.
