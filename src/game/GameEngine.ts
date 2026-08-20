import {
  GameState,
  GameCommand,
  ReelId,
  SlotResult,
  ReelSymbol,
  AugmentItem,
  SynergyProgress,
  EnemyState
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
    const enemyCopy = this.generateEnemyForStage(1, 1);

    return {
      mode: 'NORMAL',
      screen: 'TITLE',
      seed,
      turn: 1,
      wave: 1,
      totalWaves: 7,
      floor: 1,
      totalFloors: 3,
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
      isEnemyAttacking: false,
      isEnemyDefeated: false,
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

    // Apply origin-specific starting augment
    const startingAug = ALL_AUGMENTS.find((a) => a.id === origin.startingAugmentId) || ALL_AUGMENTS[0];
    this.state.build.augments = [startingAug];

    this.state.screen = 'MAP';
    this.state.narrativeMicrocopy = `'${origin.name}' 기원을 선택했습니다: ${origin.tagline}`;
    this.state.combatLogs.push(`[기원 선택] ${origin.name} (${origin.title}) - 시작 증강: '${startingAug.name}'`);
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
        this.state.narrativeMicrocopy = `다음 릴이 멈출 곳을 정한다. (${this.state.floor}층 ${this.state.wave}단계)`;
        break;
      case 'BATTLE':
        this.state.narrativeMicrocopy = `저주가 한 걸음 더 조여온다. (${this.state.floor}-${this.state.wave} 전투)`;
        break;
      case 'REWARD':
        this.state.narrativeMicrocopy = '쓰러진 자가 무언가를 흘렸다.';
        break;
      case 'GAMEOVER':
        this.state.narrativeMicrocopy = '릴이 완전히 멈췄다. 하지만 처음으로 돌아갈 뿐, 끝은 아니다.';
        break;
      case 'VICTORY':
        this.state.narrativeMicrocopy = '3층 최종 보스를 정복하고 저주의 구속에서 해방되었습니다!';
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
    this.state.isEnemyDefeated = false;
    this.state.isEnemyAttacking = false;
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
    const actionFlatBonus = this.getLegacyActionFlatBonus(action.type);
    const actionPctBonus = this.getLegacyActionPctBonus(action.type, modifier.id);
    const calculatedValue = isMiss
      ? 0
      : Math.round((baseValueSum * multiplier + actionFlatBonus) * (1 + actionPctBonus / 100));

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
        const extraDmg = this.getLegacyExtraHitDamage(dmg, res.modifier.id);
        if (extraDmg > 0 && this.state.enemy.hp > 0) {
          this.state.enemy.hp = Math.max(0, this.state.enemy.hp - extraDmg);
          this.state.lastDamagePop = {
            value: extraDmg,
            type: 'ENEMY_DMG',
            id: Date.now()
          };
          this.state.combatLogs.push(`[Multi-Hit] 추가 타격 ${extraDmg} 피해! (남은 체력: ${this.state.enemy.hp})`);
        }
      }
    }

    // Check Enemy Victory/Defeat
    if (this.state.enemy.hp <= 0) {
      this.state.isEnemyDefeated = true;
      this.state.combatLogs.push(`[전투 승리] ${this.state.enemy.name}을 처치했습니다!`);
      this.prepareRewardScreen();
      return;
    }

    // Enemy turn execution if enemy is alive
    this.state.isEnemyAttacking = true;
    const intent = this.state.enemy.intent;
    let enemyDmg = intent.value;
    let absorbedTotal = 0;
    if (this.state.player.shield > 0) {
      const absorbed = Math.min(this.state.player.shield, enemyDmg);
      this.state.player.shield -= absorbed;
      enemyDmg -= absorbed;
      absorbedTotal += absorbed;
      this.state.combatLogs.push(`[수호 방벽 흡수] 보호막이 ${absorbed} 피해를 차단했습니다!`);
    }
    const thornDamage = this.getLegacyThornDamage(absorbedTotal);
    if (thornDamage > 0) {
      this.state.enemy.hp = Math.max(0, this.state.enemy.hp - thornDamage);
      this.state.combatLogs.push(`[Thorns] 방어막 반격 ${thornDamage} 피해!`);
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

  private generateEnemyForStage(floor: number, wave: number): EnemyState {
    const isBoss = wave === 7 && floor === 3;
    const isElite = wave === 4;

    let baseEnemy: EnemyState;
    if (isBoss) {
      baseEnemy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[6])); // Final Boss
    } else if (isElite) {
      const eliteIdx = floor === 1 ? 3 : floor === 2 ? 4 : 5;
      baseEnemy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[eliteIdx]));
    } else {
      const idx = (wave - 1) % 3;
      baseEnemy = JSON.parse(JSON.stringify(DEFAULT_ENEMIES[idx]));
    }

    // Dynamic Roguelike Level Design Scaling Formula
    const hpScale = 1 + (floor - 1) * 0.78 + (wave - 1) * 0.11;
    const dmgScale = 1 + (floor - 1) * 0.58 + (wave - 1) * 0.08;
    const shieldBonus = (floor - 1) * 16 + (wave > 3 ? 8 : 0) + (isBoss ? 12 : 0);

    const scaledHp = Math.round(baseEnemy.maxHp * hpScale);
    const scaledDmg = Math.round(baseEnemy.intent.value * dmgScale);
    const scaledShield = Math.round(baseEnemy.shield + shieldBonus);

    return {
      ...baseEnemy,
      name: `${floor}층 ${wave}단계: ${baseEnemy.name.split(': ')[1] || baseEnemy.name}`,
      hp: scaledHp,
      maxHp: scaledHp,
      shield: scaledShield,
      intent: {
        ...baseEnemy.intent,
        value: scaledDmg,
        description: `다음 턴 ${scaledDmg} 피해 예고`
      }
    };
  }

  private handleChooseReward(augmentId: string) {
    const chosen = ALL_AUGMENTS.find((a) => a.id === augmentId);
    if (chosen) {
      this.state.build.augments.push(chosen);
      this.state.player.gold += 40;
      this.state.combatLogs.push(`[보상 획득] 증강 '${chosen.name}' 획득 (+40 골드)`);
    }

    // Check 3-Floor Progression (Wave 1~7 per Floor)
    if (this.state.wave >= this.state.totalWaves) {
      if (this.state.floor >= this.state.totalFloors) {
        this.state.screen = 'VICTORY';
        this.state.narrativeMicrocopy = '3층 최종 보스를 정복하고 저주의 구속에서 해방되었습니다!';
        return;
      } else {
        this.state.floor += 1;
        this.state.wave = 1;
        this.state.visitedNodePath = []; // reset map for next floor
        this.state.narrativeMicrocopy = `${this.state.floor}층에 진입했습니다. 더욱 강력한 마물들이 등장합니다!`;
      }
    } else {
      this.state.wave += 1;
    }

    this.state.enemy = this.generateEnemyForStage(this.state.floor, this.state.wave);
    this.state.isEnemyDefeated = false;
    this.state.isEnemyAttacking = false;
    this.state.screen = 'MAP';
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
      .flatMap((s) => this.getLegacyActiveSynergyNames(s));
  }

  private getLegacyActionFlatBonus(actionType: ReelSymbol['type']): number {
    if (actionType === 'BULLET' || actionType === 'DAGGER' || actionType === 'BOMB') {
      return this.countLegacyTags('BURN') * 3
        + this.countLegacyTags('COMBO') * 2
        + (this.countLegacyTags('BURN') >= 2 ? 4 : 0)
        + (this.hasLegacyReward('aug_fire_sword') ? 6 : 0)
        + (this.hasLegacyReward('safe_cracker') ? 2 : 0)
        + (this.hasLegacyReward('thorn_shell') ? 4 : 0);
    }

    if (actionType === 'SHIELD') {
      return this.countLegacyTags('DEFENSE') * 3
        + (this.countLegacyTags('DEFENSE') >= 2 ? 5 : 0)
        + (this.hasLegacyReward('aug_barrier') ? 3 : 0)
        + (this.hasLegacyReward('green_vial') ? 2 : 0);
    }

    if (actionType === 'HEART') {
      return this.countLegacyTags('RESOURCE') * 2
        + (this.countLegacyTags('RESOURCE') >= 2 ? 4 : 0)
        + (this.hasLegacyReward('aug_regen') ? 2 : 0)
        + (this.hasLegacyReward('red_coin') ? 3 : 0)
        + (this.hasLegacyReward('green_vial') ? 4 : 0);
    }

    return 0;
  }

  private getLegacyActionPctBonus(actionType: ReelSymbol['type'], modifierId: string): number {
    let pct = 0;

    if (actionType === 'BULLET' || actionType === 'DAGGER' || actionType === 'BOMB') {
      pct += this.countLegacyTags('CRITICAL') * 12;
      pct += this.countLegacyTags('RISK') * 8;
      if (this.countLegacyTags('COMBO') >= 2) pct += 15;
      if (this.countLegacyTags('COMBO') >= 4 && modifierId === 'x3') pct += 75;
      if (this.countLegacyTags('BURN') >= 3) pct += 30;
      if (this.countLegacyTags('BURN') >= 4 && this.state.curse.current >= 3) pct += 60;
      if (this.countLegacyTags('CURSE') >= 2 && this.state.curse.current >= 3) pct += 25;
      if (this.countLegacyTags('CURSE') >= 4 && this.state.curse.current >= 7) pct += 90;
      if (this.countLegacyTags('CRITICAL') >= 2 && (modifierId === 'x2' || modifierId === 'x3')) pct += 25;
      if (this.countLegacyTags('CRITICAL') >= 4 && modifierId === 'x3') pct += 100;
      if (this.hasLegacyReward('glass_cannon')) pct += 45;
      if (this.hasLegacyReward('cursed_lens') && this.state.curse.current >= 5) pct += 50;
      if (this.hasLegacyReward('furnace_heart') && this.state.curse.current >= 4) pct += 40;
      if (this.hasLegacyReward('black_candle') && this.state.curse.current >= 3) pct += 35;
      if (this.hasLegacyReward('blood_price') && this.getPlayerHpPct() <= 40) pct += 65;
      if (this.hasLegacyReward('royal_joker') && modifierId === 'x3') pct += 80;
      if (this.hasLegacyReward('house_mark') && modifierId === 'x2') pct += 40;
      if (this.hasLegacyReward('crit_die') && modifierId === 'x3') pct += 45;
    }

    if (actionType === 'SHIELD') {
      pct += this.countLegacyTags('DEFENSE') * 8;
      if (this.countLegacyTags('DEFENSE') >= 3) pct += 40;
      if (this.hasLegacyReward('mirror_buckler')) pct += 25;
      if (this.hasLegacyReward('fortress_oath')) pct += 60;
    }

    if (actionType === 'HEART') {
      pct += this.countLegacyTags('RESOURCE') * 8;
      if (this.countLegacyTags('RESOURCE') >= 3) pct += 45;
      if (this.countLegacyTags('RESOURCE') >= 4 && this.getPlayerHpPct() <= 45) pct += 90;
      if (this.hasLegacyReward('blue_vial')) pct += 30;
      if (this.hasLegacyReward('panic_button') && this.getPlayerHpPct() <= 45) pct += 80;
    }

    return Math.min(220, pct);
  }

  private getLegacyExtraHitDamage(baseDamage: number, modifierId: string): number {
    let pct = this.countLegacyTags('MULTI_HIT') * 20;

    if (this.countLegacyTags('COMBO') >= 3) pct += 30;
    if (this.countLegacyTags('CURSE') >= 3 && this.state.curse.current >= 5) pct += 40;
    if (this.countLegacyTags('CRITICAL') >= 3 && modifierId === 'x3') pct += 50;
    if (this.hasLegacyReward('aug_frenzy_core')) pct += 35;
    if (this.hasLegacyReward('multi_hit_charm')) pct += 35;
    if (this.hasLegacyReward('split_blade')) pct += 45;
    if (this.hasLegacyReward('jackpot_debt')) pct += 90;
    if (this.hasLegacyReward('echo_trigger') && modifierId === 'x3') pct += 75;

    return pct > 0 ? Math.floor(baseDamage * Math.min(150, pct) / 100) : 0;
  }

  private getLegacyThornDamage(absorbedDamage: number): number {
    if (absorbedDamage <= 0) return 0;
    const defenseTags = this.countLegacyTags('DEFENSE');
    if (defenseTags < 2 && !this.hasLegacyReward('thorn_shell')) return 0;

    return Math.max(1, Math.floor(absorbedDamage * (defenseTags >= 3 ? 0.5 : 0.3)));
  }

  private getLegacyActiveSynergyNames(synergy: SynergyProgress): string[] {
    const tierNames: string[] = [];
    if (synergy.current >= 2) tierNames.push(`${synergy.name} I`);
    if (synergy.current >= 3) tierNames.push(`${synergy.name} II`);
    if (synergy.current >= 4) tierNames.push(`${synergy.name} III`);

    return tierNames.length > 0 ? tierNames : synergy.completed ? [synergy.name] : [];
  }

  private countLegacyTags(tag: AugmentItem['tags'][number]): number {
    return this.state.build.augments.reduce((count, augment) => (
      augment.tags.includes(tag) ? count + 1 : count
    ), 0);
  }

  private hasLegacyReward(id: string): boolean {
    return this.state.build.augments.some((augment) => augment.id === id);
  }

  private getPlayerHpPct(): number {
    return (this.state.player.hp / this.state.player.maxHp) * 100;
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
