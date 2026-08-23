import { expect, test } from '@playwright/test'

test('keeps shop purchase buttons inside their cards at 1280x720', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '암시장' }).click()

  const cards = page.locator('[data-shop-reward-id]')
  await expect(cards).toHaveCount(4)

  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index)
    const button = card.getByRole('button', { name: '구매하기' })
    const cardBox = await card.boundingBox()
    const buttonBox = await button.boundingBox()

    expect(cardBox).not.toBeNull()
    expect(buttonBox).not.toBeNull()
    expect(buttonBox!.x).toBeGreaterThanOrEqual(cardBox!.x)
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width)
  }
})
