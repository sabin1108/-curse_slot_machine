import { expect, test } from '@playwright/test'

import { MVP_BUILD_CATALOG } from '../../src/game/build/MvpBuildCatalog'
import { MVP_DEMO_COMMANDS, MVP_DEMO_SEED } from '../../src/game/demo/MvpDemoTrace'

test('plays the first deterministic combat through the canonical engine', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Curse Slot Machine/)
  await expect(page.getByRole('heading', { name: 'CURSE SLOT MACHINE' })).toBeVisible()
  await page.getByLabel('런 시드').fill('e2e-mvp-seed')
  await page.getByRole('button', { name: 'START NORMAL RUN' }).click()

  await expect(page.getByText('다음 방: 1. 전투')).toBeVisible()
  await page.getByRole('button', { name: '1번 방 진입' }).click()
  await expect(page.getByText('STAGE 1 · 전투')).toBeVisible()

  await page.getByRole('button', { name: '릴 돌리기' }).click()
  await expect(page.getByRole('region', { name: '결과 미리보기' })).toBeVisible()
  await page.getByRole('button', { name: '문장 실행' }).click()

  await expect(page.getByText(/전투 문장 실행: (ongoing|victory)/)).toBeVisible()
})

test('replays the representative seed to the two-phase boss victory without browser errors', async ({ page }) => {
  test.setTimeout(120_000)
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
  await page.getByLabel('런 시드').fill(MVP_DEMO_SEED)

  let bossPhaseSeen = false
  for (const command of MVP_DEMO_COMMANDS) {
    switch (command.type) {
      case 'START_RUN':
        await page.getByRole('button', { name: 'START NORMAL RUN' }).click()
        break
      case 'ENTER_NEXT_STAGE': {
        const enterButton = page.getByRole('button', { name: /번 방 진입/ })
        const nextStage = Number((await enterButton.textContent())?.match(/\d+/)?.[0])
        await page.getByRole('button', { name: `${nextStage}번 방 진입` }).click()
        break
      }
      case 'SPIN_COMBAT_SLOT':
        await page.getByRole('button', { name: '릴 돌리기' }).click()
        await expect(page.getByRole('region', { name: '결과 미리보기' })).toBeVisible()
        break
      case 'TOGGLE_REEL_LOCK': {
        const reelIndex = { action: 0, target: 1, modifier: 2 }[command.reel]
        await page.locator('.slot-sentence > button').nth(reelIndex).click()
        break
      }
      case 'REROLL_UNLOCKED':
        await page.getByRole('button', { name: /미잠금 재굴림/ }).click()
        break
      case 'CONFIRM_COMBAT_SLOT':
        await page.getByRole('button', { name: '문장 실행' }).click()
        bossPhaseSeen ||= await page.getByText(/PHASE 2/).count() > 0
        break
      case 'CHOOSE_REWARD': {
        const reward = MVP_BUILD_CATALOG.rewards.find((candidate) => candidate.id === command.reward.id)
        if (!reward) throw new Error(`missing reward definition ${command.reward.id}`)
        await page.getByRole('button').filter({ hasText: reward.name }).click()
        break
      }
      case 'RESOLVE_REST':
        await page.getByRole('button', { name: command.action === 'heal' ? 'HP 15 회복' : '저주 5 정화' }).click()
        break
      case 'BUY_SHOP_ITEM': {
        const reward = MVP_BUILD_CATALOG.rewards.find((candidate) => candidate.id === command.rewardId)
        if (!reward) throw new Error(`missing shop reward definition ${command.rewardId}`)
        await page.getByRole('button').filter({ hasText: reward.name }).click()
        break
      }
      case 'LEAVE_SHOP':
        await page.getByRole('button', { name: '상점 나가기' }).click()
        break
      case 'RESOLVE_EVENT': {
        const label = { reward: '보상 탐색', gold: '골드 50', rest: 'HP 15 회복', skip: '지나치기' }[command.choice]
        await page.getByRole('button', { name: label }).click()
        break
      }
      case 'RESOLVE_COMBAT_SLOT':
        throw new Error('representative browser trace must not use the direct combat command')
    }
  }

  await expect(page.getByRole('heading', { name: 'HOUSE DEFEATED' })).toBeVisible()
  await expect(page.getByText('Clockwork Barrage')).toBeVisible()
  expect(bossPhaseSeen).toBe(true)
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
