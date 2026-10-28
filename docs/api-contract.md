# Контракт существующего API

В браузере адреса имеют префикс /api; proxy убирает его перед FastAPI. Формат ошибки: {"error":{"code":"...","message":"..."}}.

| Метод | Backend-путь | Вход | Ответ |
|---|---|---|---|
| GET | /health | — | 200 status/service; проверка процесса |
| GET | /ready | — | 200 при доступной БД; 503 при ошибке БД |
| POST | /auth/register | username, email, password, display_name? | 201 UserPublic; 400; 409 |
| POST | /auth/login | identity, password | 200 access_token/token_type/expires_in/user; 400; 401 |
| POST | /auth/logout | Bearer | 204 без тела; 401 |
| GET | /users/me | Bearer | 200 UserPublic; 401 |
| GET | /users | Bearer, query, limit | 200 UserSummary[]; 400; 401 |

UserPublic: id, username, email, display_name. UserSummary: id, username, display_name. Поиск не показывает почту, исключает себя и ограничен 1–50 результатами; пустой query возвращает []. Это поиск пользователей, а не сообщений.

Логин: 3–32 латинские буквы/цифры/_, внешние пробелы удаляются, регистр понижается. Email приводится к нижнему регистру, ограничен 254 символами. Пароль регистрации: 10–128 символов, не обрезается. Отображаемое имя: до 80 символов; пустое заменяется логином.

Подпись JWT — HS256. Проверяются sub, jti, iat, exp, iss, aud и запись auth_sessions. В development без AUTH_SECRET_KEY создаётся ключ процесса; для постоянных сессий нужен постоянный ключ окружения. Полного refresh-token потока нет: после истечения нужен новый вход.

Endpoint создания чата, отправки сообщения и WebSocket в финальном API отсутствуют.
