import { expect, test } from '@playwright/test'

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
  await expect(page.getByRole('button', { name: /미잠금 재굴림/ })).toBeVisible()
  await page.getByRole('button', { name: '문장 실행' }).click()

  await expect(page.getByText(/전투 문장 실행: (ongoing|victory)/)).toBeVisible()
})
