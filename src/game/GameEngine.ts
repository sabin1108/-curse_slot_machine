import {
  GameState,
  GameCommand,
  ReelId,
  SlotResult,
  ReelSymbol,
  AugmentItem,
  SynergyProgress
} from '../types/game';
import {
  ACTION_SYMBOLS,
  TARGET_SYMBOLS,
  MODIFIER_SYMBOLS,
  ALL_AUGMENTS,
  INITIAL_SYNERGIES,
  DEFAULT_ENEMIES,
  SHOWCASE_STEPS
} from './data';
import { SeededRNG } from './rng';

import { ORIGINS, CURSE_LOGS } from './origins';

export class GameEngine {
  private state: GameState;
  private rng: SeededRNG;

  constructor(seedString: string = 'curse_slot_demo_2026') {
    this.rng = new SeededRNG(seedString);
    this.state = this.createInitialState(seedString);
  }

  public getState(): GameState {
    return this.state;
  }

  private createInitialState(seed: string): GameState {
    const enemyCopy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[0]));

    return {
      mode: 'NORMAL',
      screen: 'TITLE',
      seed,
      turn: 1,
      wave: 1,
      totalWaves: 7,
      player: {
        hp: 100,
        maxHp: 100,
        shield: 0,
        gold: 150
      },
      enemy: enemyCopy,
      curse: {
        current: 0,
        max: 10,
        threshold1Triggered: false,
        threshold2Triggered: false
      },
      build: {
        augments: [ALL_AUGMENTS[0]], // Initial augment
        items: ['낡은 나침반'],
        activeSynergies: [],
        synergyProgress: JSON.parse(JSON.stringify(INITIAL_SYNERGIES))
      },
      visitedNodePath: [],
      selectedOrigin: 'SWORDSMAN',
      narrativeMicrocopy: '저주받은 슬롯머신이 침묵하고 있습니다.',
      curseLogsUnlocked: ['log_01'],
      reels: {
        action: [...ACTION_SYMBOLS],
        target: [...TARGET_SYMBOLS],
        modifier: [...MODIFIER_SYMBOLS]
      },
      reelIndexes: {
        action: 0,
        target: 0,
        modifier: 0
      },
      lockedReels: new Set<ReelId>(),
      currentResult: null,
      hasSpunThisTurn: false,
      isSpinning: false,
      rewardCandidates: [],
      augSlotPresentation: null,
      combatLogs: ['[시스템] 저주받은 던전에 진입했습니다.'],
      lastDamagePop: null,
      showcase: {
        active: false,
        currentStep: 0,
        steps: SHOWCASE_STEPS
      }
    };
  }

  public dispatch(command: GameCommand): GameState {
    switch (command.type) {
      case 'START_RUN':
        this.handleStartRun(command.seed, command.mode);
        break;
      case 'OPEN_PROLOGUE':
        this.state.screen = 'PROLOGUE';
        break;
      case 'SELECT_ORIGIN':
        this.handleSelectOrigin(command.originId);
        break;
      case 'SELECT_MAP_NODE':
        this.handleSelectMapNode(command.nodeId);
        break;
      case 'SPIN_COMBAT_SLOT':
        this.handleSpinCombatSlot();
        break;
      case 'TOGGLE_LOCK_REEL':
        this.handleToggleLockReel(command.reelId);
        break;
      case 'REROLL_UNLOCKED':
        this.handleRerollUnlocked();
        break;
      case 'CONFIRM_SLOT_RESULT':
        this.handleConfirmSlotResult();
        break;
      case 'CHOOSE_REWARD':
        this.handleChooseReward(command.augmentId);
        break;
      case 'NAVIGATE':
        this.handleNavigate(command.screen);
        break;
      case 'START_SHOWCASE':
        this.handleStartShowcase();
        break;
      case 'NEXT_SHOWCASE_STEP':
        this.handleNextShowcaseStep();
        break;
      case 'BUY_SHOP_ITEM':
        this.handleBuyShopItem(command.itemId, command.price);
        break;
      case 'REST_ACTION':
        this.handleRestAction(command.actionType);
        break;
    }

    this.updateSynergies();
    return this.state;
  }

  private handleStartRun(seed?: string, mode: 'NORMAL' | 'SHOWCASE' = 'NORMAL') {
    const activeSeed = seed || `seed_${Date.now()}`;
    this.rng = new SeededRNG(activeSeed);
    this.state = this.createInitialState(activeSeed);
    this.state.mode = mode;
    this.state.screen = 'PROLOGUE';
    this.state.narrativeMicrocopy = '폐성의 지하, 오래된 슬롯머신 하나가 웅웅거리고 있습니다.';
    this.state.combatLogs.push(`[런 시작] 서사 프롤로그 진입 (모드: ${mode})`);
  }

  private handleSelectOrigin(originId: typeof ORIGINS[keyof typeof ORIGINS]['id']) {
    const origin = ORIGINS[originId] || ORIGINS.SWORDSMAN;
    this.state.selectedOrigin = originId;
    
    // Apply starting stat bonuses
    this.state.player.gold += origin.startingGoldBonus;
    this.state.player.maxHp = Math.max(50, 100 + origin.startingHpBonus);
    this.state.player.hp = this.state.player.maxHp;
    this.state.player.shield = origin.startingShieldBonus;

    this.state.screen = 'MAP';
    this.state.narrativeMicrocopy = `'${origin.name}' 기원을 선택했습니다: ${origin.tagline}`;
    this.state.combatLogs.push(`[기원 선택] ${origin.name} (${origin.title}) - ${origin.symbolBiasText}`);
  }

  private handleNavigate(screen: GameState['screen']) {
    this.state.screen = screen;
    switch (screen) {
      case 'SHOP':
        this.state.narrativeMicrocopy = '낯익은 그림자 — 떠돌이 상인이다.';
        break;
      case 'REST':
        this.state.narrativeMicrocopy = '잠시, 릴이 멈춘다.';
        break;
      case 'MAP':
        this.state.narrativeMicrocopy = '다음 릴이 멈출 곳을 정한다.';
        break;
      case 'BATTLE':
        this.state.narrativeMicrocopy = '저주가 한 걸음 더 조여온다.';
        break;
      case 'REWARD':
        this.state.narrativeMicrocopy = '쓰러진 자가 무언가를 흘렸다.';
        break;
      case 'GAMEOVER':
        this.state.narrativeMicrocopy = '릴이 완전히 멈췄다. 하지만 처음으로 돌아갈 뿐, 끝은 아니다.';
        break;
      case 'VICTORY':
        this.state.narrativeMicrocopy = '모든 릴이 잭팟으로 정렬되었다! 저주의 구속에서 해방되었습니다.';
        break;
      default:
        this.state.narrativeMicrocopy = '저주받은 슬롯머신의 톱니바퀴가 숨죽이고 있습니다.';
    }
  }

  private handleSelectMapNode(nodeId: number) {
    if (!this.state.visitedNodePath.includes(nodeId)) {
      this.state.visitedNodePath.push(nodeId);
      this.state.combatLogs.push(`[지도 이동] 노드 #${nodeId} 탐사 진입`);
    }
    // Clear previous damage pop & result when entering a new room
    this.state.lastDamagePop = null;
    this.state.currentResult = null;
  }

  private handleSpinCombatSlot() {
    if (this.state.isSpinning) return;

    this.state.isSpinning = true;

    // Determine spin indices
    let actionIdx = this.rng.nextInt(0, this.state.reels.action.length - 1);
    let targetIdx = this.rng.nextInt(0, this.state.reels.target.length - 1);
    let modifierIdx = this.rng.nextInt(0, this.state.reels.modifier.length - 1);

    // If Showcase mode step has forced result
    if (this.state.showcase.active) {
      const step = this.state.showcase.steps[this.state.showcase.currentStep];
      if (step && step.forcedResult) {
        actionIdx = Math.max(0, this.state.reels.action.findIndex((s) => s.id === step.forcedResult!.actionId));
        targetIdx = Math.max(0, this.state.reels.target.findIndex((s) => s.id === step.forcedResult!.targetId));
        modifierIdx = Math.max(0, this.state.reels.modifier.findIndex((s) => s.id === step.forcedResult!.modifierId));
      }
    }

    this.state.reelIndexes = {
      action: actionIdx,
      target: targetIdx,
      modifier: modifierIdx
    };

    const actionSym = this.state.reels.action[actionIdx];
    const targetSym = this.state.reels.target[targetIdx];
    const modifierSym = this.state.reels.modifier[modifierIdx];

    this.state.currentResult = this.calculateSlotResult(actionSym, targetSym, modifierSym);
    this.state.hasSpunThisTurn = true;
    this.state.isSpinning = false;

    this.state.combatLogs.push(
      `[슬롯 회전] ${actionSym.name} + ${targetSym.name} × ${modifierSym.name} => ${this.state.currentResult.finalEffectText}`
    );
  }

  private handleToggleLockReel(reelId: ReelId) {
    if (this.state.lockedReels.has(reelId)) {
      this.state.lockedReels.delete(reelId);
    } else {
      this.state.lockedReels.add(reelId);
    }
  }

  private handleRerollUnlocked() {
    if (!this.state.hasSpunThisTurn || this.state.isSpinning) return;

    const lockedCount = this.state.lockedReels.size;
    const curseDelta = lockedCount + 1;

    this.state.curse.current = Math.min(this.state.curse.max, this.state.curse.current + curseDelta);
    this.checkCurseThresholds();

    // Reroll non-locked reels
    let { action: actionIdx, target: targetIdx, modifier: modifierIdx } = this.state.reelIndexes;

    if (!this.state.lockedReels.has('action')) {
      actionIdx = this.rng.nextInt(0, this.state.reels.action.length - 1);
    }
    if (!this.state.lockedReels.has('target')) {
      targetIdx = this.rng.nextInt(0, this.state.reels.target.length - 1);
    }
    if (!this.state.lockedReels.has('modifier')) {
      modifierIdx = this.rng.nextInt(0, this.state.reels.modifier.length - 1);
    }

    this.state.reelIndexes = { action: actionIdx, target: targetIdx, modifier: modifierIdx };

    const actionSym = this.state.reels.action[actionIdx];
    const targetSym = this.state.reels.target[targetIdx];
    const modifierSym = this.state.reels.modifier[modifierIdx];

    this.state.currentResult = this.calculateSlotResult(actionSym, targetSym, modifierSym);
    this.state.combatLogs.push(
      `[재회전] (잠금: ${lockedCount}개, 저주 +${curseDelta}) => ${actionSym.name} + ${targetSym.name} × ${modifierSym.name}`
    );
  }

  private calculateSlotResult(action: ReelSymbol, target: ReelSymbol, modifier: ReelSymbol): SlotResult {
    let isMiss = false;
    let missReason = '';

    if (action.type === 'HEART' && target.type === 'ENEMY') {
      isMiss = true;
      missReason = '적을 회복시킬 수 없습니다. (MISS)';
    }

    let multiplier = modifier.baseValue;
    const baseValueSum = action.baseValue + target.baseValue;
    const calculatedValue = isMiss ? 0 : Math.round(baseValueSum * multiplier);

    let text = `[${action.name}] + [${target.name}] × [${modifier.name}]: `;
    if (isMiss) {
      text += missReason;
    } else if (action.type === 'SHIELD') {
      text += `${calculatedValue} 수호 방벽 획득!`;
    } else if (action.type === 'HEART') {
      text += `${calculatedValue} HP 회복!`;
    } else {
      text += `적 몬스터에게 ${calculatedValue} 피해 (${multiplier}연타 타격!)`;
    }

    return {
      action,
      target,
      modifier,
      isMiss,
      missReason,
      calculatedValue,
      finalEffectText: text
    };
  }

  private handleConfirmSlotResult() {
    if (!this.state.currentResult) return;

    const res = this.state.currentResult;
    this.state.lockedReels.clear();

    if (!res.isMiss && res.calculatedValue > 0) {
      const act = res.action.type;

      if (act === 'SHIELD') {
        this.state.player.shield += res.calculatedValue;
        this.state.lastDamagePop = {
          value: res.calculatedValue,
          type: 'SHIELD',
          id: Date.now()
        };
        this.state.combatLogs.push(`[보호] 보호막 +${res.calculatedValue} (총: ${this.state.player.shield})`);
      } else if (act === 'HEART') {
        const heal = res.calculatedValue;
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + heal);
        this.state.lastDamagePop = {
          value: heal,
          type: 'HEAL',
          id: Date.now()
        };
        this.state.combatLogs.push(`[회복] HP +${heal} 회복`);
      } else {
        // Attack Enemy
        const dmg = res.calculatedValue;
        this.state.enemy.hp = Math.max(0, this.state.enemy.hp - dmg);
        this.state.lastDamagePop = {
          value: dmg,
          type: 'ENEMY_DMG',
          id: Date.now()
        };
        this.state.combatLogs.push(`[타격] ${this.state.enemy.name}에게 ${dmg} 피해! (남은 체력: ${this.state.enemy.hp})`);
      }
    }

    // Check Enemy Victory/Defeat
    if (this.state.enemy.hp <= 0) {
      this.state.combatLogs.push(`[전투 승리] ${this.state.enemy.name}을 처치했습니다!`);
      this.prepareRewardScreen();
      return;
    }

    // Enemy turn execution if enemy is alive
    const intent = this.state.enemy.intent;
    let enemyDmg = intent.value;
    if (this.state.player.shield > 0) {
      const absorbed = Math.min(this.state.player.shield, enemyDmg);
      this.state.player.shield -= absorbed;
      enemyDmg -= absorbed;
    }
    if (enemyDmg > 0) {
      this.state.player.hp = Math.max(0, this.state.player.hp - enemyDmg);
      this.state.lastDamagePop = {
        value: enemyDmg,
        type: 'PLAYER_DMG',
        id: Date.now()
      };
      this.state.combatLogs.push(`[적 반격] ${intent.name}! ${enemyDmg} 피해를 입었습니다.`);
    }

    // Check Player Defeat
    if (this.state.player.hp <= 0 || this.state.curse.current >= this.state.curse.max) {
      this.state.screen = 'GAMEOVER';
      this.state.combatLogs.push('[패배] 체력이 다했거나 저주에 삼켜졌습니다.');
      return;
    }

    // Prepare next turn
    this.state.turn += 1;
    this.state.hasSpunThisTurn = false;
  }

  private prepareRewardScreen() {
    this.state.screen = 'REWARD';
    const available = ALL_AUGMENTS.filter(
      (aug) => !this.state.build.augments.some((existing) => existing.id === aug.id)
    );
    this.state.rewardCandidates = available.slice(0, 3);
    if (this.state.rewardCandidates.length === 0) {
      this.state.rewardCandidates = ALL_AUGMENTS.slice(0, 3);
    }

    const targetAug = this.state.rewardCandidates[0];
    this.state.augSlotPresentation = {
      reels: [targetAug.tags[0] || 'COMBO', targetAug.rarity, targetAug.name],
      targetAugment: targetAug,
      isRevealed: true
    };
  }

  private handleChooseReward(augmentId: string) {
    const chosen = ALL_AUGMENTS.find((a) => a.id === augmentId);
    if (chosen) {
      this.state.build.augments.push(chosen);
      this.state.player.gold += 40;
      this.state.combatLogs.push(`[보상 획득] 증강 '${chosen.name}' 획득 (+40 골드)`);
    }

    // Return to MAP for route selection!
    if (this.state.wave >= this.state.totalWaves) {
      this.state.screen = 'VICTORY';
    } else {
      this.state.wave += 1;
      const enemyIndex = Math.min(this.state.wave - 1, DEFAULT_ENEMIES.length - 1);
      this.state.enemy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[enemyIndex]));
      this.state.screen = 'MAP';
    }
  }

  private checkCurseThresholds() {
    if (this.state.curse.current >= 5 && !this.state.curse.threshold1Triggered) {
      this.state.curse.threshold1Triggered = true;
      this.state.combatLogs.push('[저주 임계점 5] 저주의 조율: 적 의도 피해량 +3 상승!');
      this.state.enemy.intent.value += 3;
    }
    if (this.state.curse.current >= 10) {
      this.state.curse.threshold2Triggered = true;
      this.state.screen = 'GAMEOVER';
    }
  }

  private updateSynergies() {
    const augTags = this.state.build.augments.flatMap((a) => a.tags);
    this.state.build.synergyProgress.forEach((syn) => {
      const count = augTags.filter((t) => t === syn.tag).length;
      syn.current = count;
      if (syn.current >= syn.required && !syn.completed) {
        syn.completed = true;
        this.state.combatLogs.push(`[시너지 완성!] ${syn.name} 활성화! ${syn.effectDescription}`);
      }
    });

    this.state.build.activeSynergies = this.state.build.synergyProgress
      .filter((s) => s.completed)
      .map((s) => s.name);
  }

  private handleStartShowcase() {
    this.handleStartRun('showcase_seed_2026', 'SHOWCASE');
    this.state.showcase.active = true;
    this.state.showcase.currentStep = 0;
    this.state.combatLogs.push('[Showcase Mode] 3분 시연 모드가 시작되었습니다.');
  }

  private handleNextShowcaseStep() {
    if (!this.state.showcase.active) return;

    this.state.showcase.currentStep = (this.state.showcase.currentStep + 1) % this.state.showcase.steps.length;
    const step = this.state.showcase.steps[this.state.showcase.currentStep];

    this.state.combatLogs.push(`[Showcase Step ${step.stepIndex}] ${step.title}`);

    if (step.stepIndex === 3) {
      this.prepareRewardScreen();
    } else if (step.stepIndex === 4) {
      this.state.screen = 'BATTLE';
      this.state.enemy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[2]));
      this.handleSpinCombatSlot();
    }
  }

  private handleBuyShopItem(itemId: string, price: number) {
    if (this.state.player.gold >= price) {
      this.state.player.gold -= price;
      this.state.build.items.push(itemId);
      this.state.combatLogs.push(`[상점 구매] '${itemId}' 아이템을 구매했습니다.`);
    }
  }

  private handleRestAction(actionType: 'HEAL' | 'UPGRADE') {
    if (actionType === 'HEAL') {
      const healAmt = 35;
      this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + healAmt);
      this.state.combatLogs.push(`[휴식] 체력 +${healAmt} 회복되었습니다.`);
    } else {
      this.state.curse.current = Math.max(0, this.state.curse.current - 3);
      this.state.combatLogs.push('[휴식] 정화 의식: 저주 게이지 -3 정화되었습니다.');
    }
    this.state.screen = 'MAP';
  }
}
