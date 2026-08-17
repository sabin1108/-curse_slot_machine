# OpenAI Game Hackathon - Codex 협업 및 개발 기록

## 1. 개요
- **프로젝트명**: 저주받은 슬롯머신 (Cursed Slot Machine Roguelike)
- **개발 플랫폼**: Web Browser (Desktop First, Vite + React + TypeScript)
- **대회 트랙**: OpenAI Game Builders Warm-up Challenge (Track 1)

## 2. 사람이 직접 결정한 중요 판단
1. **슬롯머신 용어 및 시스템 명확 분리**:
   - `CombatSlotMachine`: 실제 전투 규칙 및 3릴 문장 생성 (`[행동] [대상] [변형]`).
   - `AugmentSlotMachine`: 보상 연출 전용 3릴 시각화 UI (RNG 소유하지 않음).
2. **UX 4대 원칙 적용**:
   - 도파민 중심을 단일 스핀의 우연보다 모은 증강과 시너지의 폭발적 성장에 배치.
   - 정보 패널이 스핀 캐비닛을 가리지 않도록 3단 레이아웃(좌측 증강 목록 - 중앙 릴 캐비닛 - 우측 예상 결과) 설계.
3. **Showcase Mode (3분 대회 시연 모드)**:
   - 3분 내에 시연 영상을 촬영할 수 있도록 시나리오 기반 스텝 진행 모드 구현.

## 3. Codex (Antigravity AI)가 수행한 역할
1. `D:\sabin\note\codex_ai 게임해커톤` 통합 명세서 v2.1 및 UI/UX 기획서 완벽 학습 및 아키텍처 설계.
2. `C:\Users\sabin\Desktop\겜 코덱스` 에셋 검수 및 최적 오픈소스 에셋 팩 추출/배치.
3. Seeded RNG 기반 `GameEngine` 구현 및 단일 페이라인 `CombatSlotMachine` 문장 조합 및 MISS 로직 개발.
4. 다크 던전 카지노 테마의 반응형 CSS 스타일링, 레버 당김 애니메이션, 릴 블러 스핀 연출, Web Audio API 사운드 매니저 제작.
5. Vitest 자동화 단위 테스트 및 Vite 프로덕션 정적 웹 빌드 성공적 검증.
