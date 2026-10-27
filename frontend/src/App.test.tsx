import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('каркас приложения', () => {
  it('показывает пустой список и реальный статус сервера', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) }))
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByText('Пока нет чатов')).toBeInTheDocument()
    expect(await screen.findByText('Сервер доступен')).toBeInTheDocument()
  })
  it('показывает сетевую ошибку и не выдаёт заглушку за работающий вход', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Нет соединения'))
  })
})
