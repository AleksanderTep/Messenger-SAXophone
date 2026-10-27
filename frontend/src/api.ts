export async function getHealth(signal?: AbortSignal) {
  const response = await fetch('/api/health', { signal })
  if (!response.ok) throw new Error('Сервис недоступен')
  const data = await response.json()
  if (data.status !== 'ok') throw new Error('Неожиданный ответ сервера')
  return data as { status: string; service: string }
}
