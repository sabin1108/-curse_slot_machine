import { expect, test } from '@playwright/test'

test('keeps reel lock labels separate from result text', async ({ page }) => {
  await page.goto('/')
  await page.locator('.nav-screen-tabs .tab-btn').nth(2).click()
  await page.locator('.slot-action-area .k-btn').first().click()

  const firstReel = page.locator('.reel-col-wrap').first()
  const reelWindow = firstReel.locator('.reel-window')
  const lockBadge = firstReel.locator('.lock-badge')

  await expect(lockBadge).toBeVisible()
  await reelWindow.click()
  await expect(firstReel).toHaveClass(/is-locked/)

  const badgeBox = await lockBadge.boundingBox()
  const resultTextBox = await firstReel.locator('.symbol-name').boundingBox()

  expect(badgeBox).not.toBeNull()
  expect(resultTextBox).not.toBeNull()
  expect(badgeBox!.y).toBeLessThanOrEqual(resultTextBox!.y - badgeBox!.height)
})
