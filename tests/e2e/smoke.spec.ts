import { expect, test } from '@playwright/test'

test('loads the game shell at 1280x720', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Curse Slot Machine/)
  await expect(page.getByRole('heading', { name: 'Curse Slot Machine' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start Run' })).toBeVisible()
})
