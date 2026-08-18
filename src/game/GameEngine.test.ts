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
});
