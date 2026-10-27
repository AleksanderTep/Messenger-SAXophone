import { expect, test } from '@playwright/test'

test.skip(!process.env.E2E_API, 'Requires full stack; set E2E_API=1')

for (const width of [375, 1440]) {
  test(`register → login → refresh → logout ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const username = `e2e_${Date.now()}_${width}`
    const password = 'E2e-only-password-123'
    await page.goto('/register')
    await page.getByLabel('Логин', { exact: true }).fill(username)
    await page.getByLabel('Электронная почта').fill(`${username}@example.test`)
    await page.getByLabel('Отображаемое имя (необязательно)').fill('Тестовый пользователь')
    await page.getByLabel('Пароль').fill(password)
    await page.getByRole('button', { name: 'Создать аккаунт' }).click()
    await expect(page.getByText(/Аккаунт создан/)).toBeVisible()
    await page.getByRole('link', { name: 'Перейти ко входу' }).click()
    await page.getByLabel('Логин или почта').fill(username)
    await page.getByLabel('Пароль').fill('wrong-password')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page.getByRole('alert')).toHaveText('Неверный логин или пароль.')
    await page.getByLabel('Пароль').fill(password)
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toBeVisible()
    await expect(page.locator('dd').filter({ hasText: username }).first()).toBeVisible()
    const token = await page.evaluate(() => sessionStorage.getItem('saxophone.access-token'))
    expect(token).toBeTruthy()
    await page.screenshot({ path: `test-results/profile-${width}.png`, fullPage: true })
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    await page.getByRole('button', { name: 'Выйти', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Экран входа' })).toBeVisible()
    expect(await page.evaluate(() => sessionStorage.getItem('saxophone.access-token'))).toBeNull()
    const revoked = await page.request.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
    expect(revoked.status()).toBe(401)
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Экран входа' })).toBeVisible()
  })
}

test('истёкшая сессия возвращает на вход', async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => sessionStorage.setItem('saxophone.access-token', 'invalid-token'))
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Экран входа' })).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('saxophone.access-token'))).toBeNull()
})
