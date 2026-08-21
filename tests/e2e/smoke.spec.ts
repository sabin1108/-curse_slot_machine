import { expect, test, type Page } from '@playwright/test'
import { ORIGIN_DEMO_TRACES } from '../../src/game/demo/OriginDemoTraces'
import type { OriginId } from '../../src/game/engine/OriginCatalog'

test.describe.configure({ timeout: 120_000 })
test.use({ reducedMotion: 'reduce' })

for (const origin of Object.keys(ORIGIN_DEMO_TRACES) as OriginId[]) {
  test(`${origin} completes the visible 15-stage run`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

    const trace = ORIGIN_DEMO_TRACES[origin]
    await page.goto('/')
    await page.getByLabel('Run seed').fill(trace.seed)
    await page.getByText(/START GAME/i).click()
    await page.getByRole('button', { name: /Skip/i }).click()
    await page.locator(`[data-origin-id="${origin}"]`).click()
    await page.locator('.origin-confirm-bar button').click()

    for (const [index, token] of trace.tokens.slice(2).entries()) {
      await test.step(`${index + 2}: ${token}`, async () => playToken(page, token))
    }

    await expect(page.locator('.victory-glow')).toBeVisible()
    expect(errors).toEqual([])
  })
}

async function playToken(page: Page, token: string): Promise<void> {
  const [kind, value] = token.split(':', 2)
  if (kind === 'enter') {
    await page.locator('.map-node-card.avail').click()
  } else if (kind === 'spin') {
    await page.locator('.slot-action-area .k-btn.primary').click()
    await expect(page.locator('.slot-action-area .k-btn.success')).toBeVisible({ timeout: 3_000 })
  } else if (kind === 'reroll') {
    await page.locator('.slot-action-area .k-btn.warning').click()
  } else if (kind === 'confirm') {
    await page.locator('.slot-action-area .k-btn.success').click()
  } else if (kind === 'reward') {
    await page.locator(`[data-reward-id="${value}"]`).click()
  } else if (kind === 'buy') {
    await page.locator(`[data-shop-reward-id="${value}"] button`).click()
  } else if (kind === 'leave') {
    await page.locator('.shop-footer-bar button').click()
  } else if (kind === 'rest') {
    await page.locator(`[data-rest-action="${value}"]`).click()
  } else if (kind === 'event') {
    await page.locator(`[data-event-choice="${value}"]`).click()
  } else {
    throw new Error(`Unsupported visible-play token: ${token}`)
  }
}
