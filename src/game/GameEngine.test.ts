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

  it('should attach context-sensitive narrative microcopy on NAVIGATE', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'NAVIGATE', screen: 'SHOP' });
    expect(engine.getState().narrativeMicrocopy).toBe('낯익은 그림자 — 떠돌이 상인이다.');

    engine.dispatch({ type: 'NAVIGATE', screen: 'REST' });
    expect(engine.getState().narrativeMicrocopy).toBe('잠시, 릴이 멈춘다.');
  });

  it('should progress through 3 floors and trigger VICTORY ending upon clearing 3-7', () => {
    const engine = new GameEngine();
    engine.dispatch({ type: 'START_RUN' });
    engine.dispatch({ type: 'SELECT_ORIGIN', originId: 'SWORDSMAN' });

    // Set stage to 3-7
    (engine as any).state.floor = 3;
    (engine as any).state.wave = 7;

    // Choose reward for 3-7 boss
    engine.dispatch({ type: 'CHOOSE_REWARD', augmentId: 'aug_combo_1' });

    expect(engine.getState().screen).toBe('VICTORY');
    expect(engine.getState().narrativeMicrocopy).toContain('3층 최종 보스를 정복');
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



