import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('showcase reward choices can be discovered and activated from the keyboard', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /showcase mode/i }).click()
  await page.getByRole('button', { name: /NEXT STEP/i }).click()
  await page.getByRole('button', { name: /NEXT STEP/i }).click()

  const rewardChoice = page.locator('button[data-reward-id]').first()

  await expect(rewardChoice).toBeVisible()
  await expect(rewardChoice).toHaveAttribute('type', 'button')
  await expect(rewardChoice).toHaveAttribute('aria-label', /선택/)
  await expect(rewardChoice).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: await rewardChoice.getAttribute('aria-label') ?? '' })).toBeVisible()
  await expect(page.getByRole('button', { name: /NEXT STEP/i })).toHaveCount(0)

  await rewardChoice.focus()
  await expect(rewardChoice).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('button', { name: /NEXT STEP/i })).toBeVisible()
  await page.getByRole('button', { name: /NEXT STEP/i }).click()

  await expect(page.getByText(/STEP 4 \/ 4/i)).toBeVisible()
})
