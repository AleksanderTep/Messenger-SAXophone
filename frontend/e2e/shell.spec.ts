import { expect, test } from '@playwright/test'

for (const width of [375, 1440]) {
  test(`маршруты и ширина ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const [route, title] of [
      ['/dialogs', 'Экран входа'], ['/login', 'Экран входа'],
      ['/register', 'Регистрация'], ['/profile', 'Экран входа'],
      ['/chat/example', 'Экран входа'], ['/unknown', 'Страница не найдена'],
    ]) {
      await page.goto(route)
      await expect(page.getByRole('heading', { name: new RegExp(title) })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    }
  })
}
