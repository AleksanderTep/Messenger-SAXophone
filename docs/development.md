# Локальная разработка

Обычный запуск всех сервисов описан в [README](../README.md). Ниже — запуск backend/frontend
на хосте с PostgreSQL в Docker. Нужны Python 3.12, Node.js 22 и Docker Compose.

## Backend

Из корня проекта, PowerShell:

```powershell
docker compose up -d db
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.lock
.\.venv\Scripts\python.exe -m pip install --no-deps -e backend
cd backend
..\.venv\Scripts\alembic.exe upgrade head
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

По умолчанию backend доступен на localhost:8000 и использует PostgreSQL на localhost:55432
с локальными реквизитами из `.env.example`. Корневой `.env` автоматически читает Compose,
но не команды, запущенные из `backend`. Если реквизиты/порт изменены, перед запуском задайте
`DATABASE_URL` в окружении терминала. Для постоянного ключа сессий задайте `AUTH_SECRET_KEY`.
Не копируйте в приложение ключи Pyrus или GitHub.

## Frontend

В другом терминале из корня проекта:

```powershell
cd frontend
npm ci
npm run dev
```

Интерфейс доступен на localhost:5173. Proxy Vite отправляет `/api/*` на localhost:8000;
при обычном запуске через Compose эту роль выполняет Nginx.

## Проверки

Из `backend`, с установленными зависимостями:

```powershell
..\.venv\Scripts\ruff.exe check .
..\.venv\Scripts\ruff.exe format --check .
..\.venv\Scripts\python.exe -m pytest -q
```

Обычный запуск auth-тестов использует временную SQLite. Для проверки на PostgreSQL
создайте отдельную одноразовую БД, направьте `DATABASE_URL` на неё, примените миграции
и задайте `RUN_DB_TESTS=1`. Миграционный цикл downgrade/upgrade выполняйте только на
одноразовой БД. В GitHub Actions PostgreSQL-тесты включены автоматически.

Из `frontend`:

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Без `E2E_API` браузерные тесты проверяют гостевые маршруты; полный auth-сценарий требует
работающего приложения и API. Для Compose на стандартном порту перед запуском E2E задайте:

```powershell
$env:E2E_BASE_URL='http://localhost:8080'
$env:E2E_API='1'
npm run test:e2e
```

Сценарии API, переменные окружения, seed и правила сессии описаны в [контракте S2](auth-contract.md).
