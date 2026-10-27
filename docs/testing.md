# Проверки и демонстрация

| Уровень | Что проверяем | Где |
|---|---|---|
| Unit/API | Health, структура 404, ошибка readiness | pytest/TestClient |
| PostgreSQL | Миграция и FK, запрет пустого сообщения и дубля чата | pytest с RUN_DB_TESTS=1 |
| UI unit | Пустой экран, доступность сервера, сетевой сбой | Vitest/Testing Library |
| UI smoke | Шесть прямых маршрутов, 375/1440 px, без горизонтального скролла | Playwright Chromium |
| Интеграция | Docker Compose, миграция, настоящий HTTP health и ready | CI + scripts/smoke.py |
| Ручная | Фокус с клавиатуры, читаемость, остановка API, сохранение БД после restart | Reviewer перед demo |

Среды: локально Windows/WSL и Docker; CI Ubuntu с PostgreSQL 16.
Внешние ключи Pyrus в CI не используются. Каждый тестовый запуск использует отдельную БД/volume;
рабочие данные участников для тестов не нужны.

P0: окружение не стартует, потеря данных, обход доступа или секрет в репозитории.
P1: основной сценарий сломан, дубль чата/сообщения, мобильный экран недоступен.
P2: некритичное оформление или текст. Дефект содержит окружение, шаги, expected/actual,
серьёзность и доказательство; QA проверяет воспроизведение, владелец компонента исправляет,
другой участник подтверждает исправление.

Для S2: уникальность регистрации, неверный пароль, выход, отсутствие доступа без сессии.
Для S3: два пользователя находят друг друга, одна пара — один чат, отправка/refresh/история,
cursor pagination, третий пользователь получает отказ. Для S4: два браузера, reconnect и unread.
Для S5: поиск BM25 с проверкой доступа и регресс всех основных сценариев.

## Команды

Из backend с активным окружением: `ruff check .`, `pytest`.
С PostgreSQL и DATABASE_URL: `alembic upgrade head`, `RUN_DB_TESTS=1 pytest`,
`alembic check`, `alembic downgrade base`, `alembic upgrade head` на одноразовой тестовой БД.
Из frontend: `npm ci`, `npm run lint`, `npm test`, `npm run build`,
`npx playwright install chromium`, `npm run test:e2e`.
Из корня: `docker compose up --build --wait`, `python scripts/smoke.py`,
`python scripts/smoke.py --url http://localhost:8000/ready`.

Проверка отрицательного smoke: запустить на свободном закрытом порту с `--timeout 1`;
ожидается ненулевой код возврата. Не выполнять `docker compose down -v` на БД с нужными данными.
