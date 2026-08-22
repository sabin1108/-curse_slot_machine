import { OriginData, OriginId } from '../types/game';

export const ORIGINS: Record<OriginId, OriginData> = {
  SWORDSMAN: {
    id: 'SWORDSMAN',
    name: '몰락한 검사',
    title: '검술마저 저주받은 도망자',
    tagline: '명예를 잃고 마지막 도박을 하러 온 자',
    narrative: '한때 기사단의 긍지였으나, 금기된 술식에 손을 댄 대가로 검기를 불확실한 릴의 확률로 빼앗겼다. 안정을 지향하며 균형 잡힌 심볼 구성으로 딜링을 시작합니다.',
    startingGoldBonus: 0,
    startingHpBonus: 2,
    startingShieldBonus: 3,
    startingAugmentId: 'combo_starter',
    icon: '⚔️',
    symbolBiasText: '소드/단검 물리 공격 심볼 가중치 우세 (시작 증강: 화염검 강결)',
    rouletteTraitText: '검사의 결: 공격 피해가 16 이상이면 그 피해의 50%를 반올림해 적에게 1회 추가 공격합니다.',
  },
  GAMBLER: {
    id: 'GAMBLER',
    name: '빚진 도박사',
    title: '황금에 눈이 멀어 갇힌 자',
    tagline: '이미 다른 판에서 모든 걸 잃은 자',
    narrative: '지하 도박장에서 마지막 칩 대신 저주받은 캐비닛의 레버를 당겼다. 리스크는 크지만 시작 시 풍부한 골드와 폭주 코어로 하이리스크 하이리턴 판을 만듭니다.',
    startingGoldBonus: 50,
    startingHpBonus: -4,
    startingShieldBonus: 0,
    startingAugmentId: 'hexed_clutch',
    icon: '🎲',
    symbolBiasText: '골드/배율(CRIT) 심볼 가중치 우세 (시작 증강: 폭주 코어)',
    rouletteTraitText: '잭팟 감각: 매 턴 첫 재회전은 저주가 오르지 않고, x3 확정 시 골드 +25와 저주 -1을 얻습니다.',
  },
  PRIEST: {
    id: 'PRIEST',
    name: '파문당한 사제',
    title: '신마저 저버린 저주 수집가',
    tagline: '신마저 저버린 그를 저주가 거둬들였다',
    narrative: '이단 서적을 구하려다 슬롯머신의 환영에 사로잡혔다. 높은 체력과 방호막을 바탕으로 회복 및 보호 시너지 효과를 강화하며 생존을 도모합니다.',
    startingGoldBonus: 10,
    startingHpBonus: 6,
    startingShieldBonus: 5,
    startingAugmentId: 'guard_core',
    icon: '🔮',
    symbolBiasText: '방패/하트 회복 심볼 가중치 우세 (시작 증강: 방벽 코어)',
    rouletteTraitText: '정화의 손길: 회복 또는 방어 룰렛을 확정하면 저주를 1 정화합니다.',
  },
};

export interface CurseLogEntry {
  id: string;
  title: string;
  condition: string;
  fragment: string;
}

export const CURSE_LOGS: CurseLogEntry[] = [
  {
    id: 'log_01',
    title: '기계의 첫 번째 속삭임',
    condition: '첫 게임 시작',
    fragment: '"폐성의 지하, 오래된 이 기계는 단순한 오락기가 아니다. 당신의 운명을 릴의 톱니바퀴에 묶어두는 족쇄이다."',
  },
  {
    id: 'log_02',
    title: '떠돌이의 잔영',
    condition: '암시장 방문 1회',
    fragment: '"이곳을 방황하는 상인 역시 한때 레버를 당겼던 자다. 그는 저주를 삼키는 법을 터득해 상인을 자처하고 있다."',
  },
  {
    id: 'log_03',
    title: '멈추지 않는 릴',
    condition: '웨이브 3 도달',
    fragment: '"릴이 회전할수록 저주의 침식 수치가 차오른다. 잭팟을 맞추지 못하면 심연의 마물들이 그 자리를 채울 것이다."',
  },
  {
    id: 'log_04',
    title: '시너지의 개안',
    condition: '증강 아이템 장착',
    fragment: '"저주받은 보석과 유물들을 공명시키면, 슬롯머신조차 제어할 수 없는 막강한 힘이 폭발한다."',
  },
  {
    id: 'log_05',
    title: '구원의 잭팟',
    condition: '최종 보스 처치 또는 VICTORY 도달',
    fragment: '"모든 릴이 잭팟으로 정렬되는 순간, 저주의 족쇄가 풀리며 지하 던전의 문이 열릴 것이다."',
  },
];
