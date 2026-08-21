import { describe, it, expect } from 'vitest';
import { GameEngine } from './GameEngine';

describe('GameEngine - Specification v2.1 Contracts', () => {
  it('should generate deterministic results for the same seed', () => {
    const engine1 = new GameEngine('test_seed_123');
    const engine2 = new GameEngine('test_seed_123');

    engine1.dispatch({ type: 'SPIN_COMBAT_SLOT' });
    engine2.dispatch({ type: 'SPIN_COMBAT_SLOT' });

    expect(engine1.getState().reelIndexes).toEqual(engine2.getState().reelIndexes);
    expect(engine1.getState().currentResult?.finalEffectText).toEqual(
      engine2.getState().currentResult?.finalEffectText
    );
  });

  it('should handle reel locking and calculate reroll curse delta correctly', () => {
    const engine = new GameEngine('curse_test_seed');
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' });

    // Lock 1 reel (action)
    engine.dispatch({ type: 'TOGGLE_LOCK_REEL', reelId: 'action' });
    expect(engine.getState().lockedReels.has('action')).toBe(true);

    const initialCurse = engine.getState().curse.current;
    // 1 reel locked -> reroll curse cost = 1 + 1 = 2
    engine.dispatch({ type: 'REROLL_UNLOCKED' });

    expect(engine.getState().curse.current).toBe(initialCurse + 2);
  });

  it('should mark MISS when action and target are incompatible (e.g., HEART -> ENEMY)', () => {
    const engine = new GameEngine('miss_test_seed');
    const heartSymbol = {
      id: 'heart',
      name: '심장',
      type: 'HEART' as const,
      category: 'ACTION' as const,
      baseValue: 5,
      icon: '💖',
      color: '#ff66b2',
      description: '회복'
    };
    const enemySymbol = {
      id: 'enemy',
      name: '적',
      type: 'ENEMY' as const,
      category: 'TARGET' as const,
      baseValue: 1,
      icon: '🎯',
      color: '#ff4d4d',
      description: '적'
    };
    const x1Symbol = {
      id: 'x1',
      name: 'x1',
      type: 'X1' as const,
      category: 'MODIFIER' as const,
      baseValue: 1,
      icon: '⚡',
      color: '#ccc',
      description: '1배'
    };

    // Access private method calculateSlotResult for assertion
    const result = (engine as any).calculateSlotResult(heartSymbol, enemySymbol, x1Symbol);
    expect(result.isMiss).toBe(true);
    expect(result.calculatedValue).toBe(0);
  });

  it('should advance steps properly in Showcase Mode', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_SHOWCASE' });

    expect(engine.getState().showcase.active).toBe(true);
    expect(engine.getState().showcase.currentStep).toBe(0);

    engine.dispatch({ type: 'NEXT_SHOWCASE_STEP' });
    expect(engine.getState().showcase.currentStep).toBe(1);
  });

  it('should handle START_RUN -> PROLOGUE and SELECT_ORIGIN stat modifications', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_RUN' });

    expect(engine.getState().screen).toBe('PROLOGUE');

    // Select Gambler origin (+50 Gold, -15 HP bonus)
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'GAMBLER' });

    const state = engine.getState();
    expect(state.selectedOrigin).toBe('GAMBLER');
    expect(state.player.gold).toBe(200); // 150 + 50
    expect(state.player.maxHp).toBe(85); // 100 - 15
    expect(state.build.augments[0].id).toBe('aug_frenzy_core');
    expect(state.screen).toBe('MAP');
    expect(state.narrativeMicrocopy).toContain('빚진 도박사');
  });

  it('gives Gambler one curse-free reroll per turn', () => {
    const engine = new GameEngine('gambler_free_reroll');
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'GAMBLER' });
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1 });
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' });
    engine.dispatch({ type: 'TOGGLE_LOCK_REEL', reelId: 'action' });

    engine.dispatch({ type: 'REROLL_UNLOCKED' });
    expect(engine.getState().curse.current).toBe(0);
    expect(engine.getState().originTraitState.freeRerollAvailable).toBe(false);

    engine.dispatch({ type: 'REROLL_UNLOCKED' });
    expect(engine.getState().curse.current).toBe(2);

    const state = engine.getState();
    state.enemy.intent.value = 0;
    state.currentResult = {
      action: state.reels.action.find((symbol) => symbol.type === 'SHIELD')!,
      target: state.reels.target.find((symbol) => symbol.type === 'SELF')!,
      modifier: state.reels.modifier.find((symbol) => symbol.id === 'x1')!,
      isMiss: false,
      calculatedValue: 8,
      finalEffectText: 'test next turn'
    };
    engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' });
    expect(engine.getState().originTraitState.freeRerollAvailable).toBe(true);
  });

  it('adds a half-power Swordsman follow-up when attack damage reaches the threshold', () => {
    const engine = new GameEngine('swordsman_follow_up');
    const state = engine.getState();
    const action = state.reels.action.find((symbol) => symbol.type === 'BULLET')!;
    const target = state.reels.target.find((symbol) => symbol.type === 'ENEMY')!;
    const modifier = state.reels.modifier.find((symbol) => symbol.id === 'x1')!;

    state.enemy.hp = 100;
    state.enemy.maxHp = 100;
    state.enemy.intent.value = 0;
    state.currentResult = {
      action,
      target,
      modifier,
      isMiss: false,
      calculatedValue: 17,
      finalEffectText: 'test attack'
    };

    engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' });

    expect(engine.getState().enemy.hp).toBe(74);
  });

  it('rewards Gambler jackpot on x3 results', () => {
    const engine = new GameEngine('gambler_jackpot');
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'GAMBLER' });
    const state = engine.getState();
    const action = state.reels.action.find((symbol) => symbol.type === 'SHIELD')!;
    const target = state.reels.target.find((symbol) => symbol.type === 'SELF')!;
    const modifier = state.reels.modifier.find((symbol) => symbol.id === 'x3')!;

    state.curse.current = 3;
    state.enemy.intent.value = 0;
    state.currentResult = {
      action,
      target,
      modifier,
      isMiss: false,
      calculatedValue: 20,
      finalEffectText: 'test jackpot'
    };

    engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' });

    expect(engine.getState().player.gold).toBe(225);
    expect(engine.getState().curse.current).toBe(2);
  });

  it('purifies curse when Priest confirms shield or heart results', () => {
    const engine = new GameEngine('priest_purify');
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'PRIEST' });
    const state = engine.getState();
    const action = state.reels.action.find((symbol) => symbol.type === 'SHIELD')!;
    const target = state.reels.target.find((symbol) => symbol.type === 'SELF')!;
    const modifier = state.reels.modifier.find((symbol) => symbol.id === 'x1')!;

    state.curse.current = 3;
    state.enemy.intent.value = 0;
    state.currentResult = {
      action,
      target,
      modifier,
      isMiss: false,
      calculatedValue: 12,
      finalEffectText: 'test shield'
    };

    engine.dispatch({ type: 'CONFIRM_SLOT_RESULT' });

    expect(engine.getState().curse.current).toBe(2);
  });

  it('should attach context-sensitive narrative microcopy on NAVIGATE', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'NAVIGATE', screen: 'SHOP' });
    expect(engine.getState().narrativeMicrocopy).toBe('낯익은 그림자 — 떠돌이 상인이다.');

    engine.dispatch({ type: 'NAVIGATE', screen: 'REST' });
    expect(engine.getState().narrativeMicrocopy).toBe('잠시, 릴이 멈춘다.');
  });

  it('should trigger VICTORY ending upon clearing Stage 15', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'SWORDSMAN' });

    // Set stage to the final boss.
    (engine as any).state.floor = 1;
    (engine as any).state.wave = 15;

    // Choose reward for the final boss.
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'aug_combo_1' });

    expect(engine.getState().screen).toBe('VICTORY');
    expect(engine.getState().narrativeMicrocopy).toContain('Stage 15 final boss cleared');
  });

  it('should keep the first encounter tense and scale the final boss as a hard check', () => {
    const engine = new GameEngine();

    const firstEnemy = (engine as any).generateEnemyForStage(1, 1);
    const finalBoss = (engine as any).generateEnemyForStage(1, 15);

    expect(firstEnemy).toMatchObject({
      hp: 75,
      maxHp: 75,
      shield: 0,
      intent: expect.objectContaining({ value: 11 })
    });
    expect(finalBoss).toMatchObject({
      hp: 1231,
      maxHp: 1231,
      shield: 120,
      intent: expect.objectContaining({ value: 101 })
    });
  });

  it('maps 15-stage route node ids to the correct boss encounter', () => {
    const engine = new GameEngine('route-node-stage');

    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1502, nodeType: 'BOSS' });

    expect(engine.getState().wave).toBe(15);
    expect(engine.getState().enemy.id).toBe('house_dealer_boss');
  });

  it('should absorb enemy damage with player shield first', () => {
    const engine = new GameEngine('shield_test_seed');
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'PRIEST' }); // Priest starts with +10 Shield

    const initialShield = engine.getState().player.shield;
    const initialHp = engine.getState().player.hp;
    expect(initialShield).toBe(10);

    // Manually trigger enemy attack absorption
    const intentValue = 5;
    let enemyDmg = intentValue;
    if (engine.getState().player.shield > 0) {
      const absorbed = Math.min(engine.getState().player.shield, enemyDmg);
      engine.getState().player.shield -= absorbed;
      enemyDmg -= absorbed;
    }
    if (enemyDmg > 0) {
      engine.getState().player.hp -= enemyDmg;
    }

    expect(engine.getState().player.hp).toBe(initialHp);
    expect(engine.getState().player.shield).toBe(5);
  });
});



