import { expect, test } from '@playwright/test'

test('loads the game shell at 1280x720', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Curse Slot Machine/)
  await expect(page.getByText('저주받은 슬롯머신').first()).toBeVisible()
  await expect(page.getByText(/START GAME/i)).toBeVisible()
})

