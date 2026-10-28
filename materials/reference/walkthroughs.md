# Разбор путей по файлам

Упрощение ab35da5 в PR №3 ещё не слито. В develop до merge используются старые пути; соответствие есть в карте структуры.

## Артём готовность

main.py: /health → health() → JSON без БД. /ready → get_db → SELECT 1 → ok либо 503. test_health.py подменяет отказ БД, не выключая PostgreSQL.

## Николай данные

/auth/register → RegisterRequest → register в auth.py → create_user в users.py → find_conflict → hash_password → User → commit. IntegrityError приводит к rollback и 409. Ограничения БД защищают данные независимо от формы.

## Вячеслав форма

AuthPage в pages.tsx: values/errors/busy. submit отменяет HTML-отправку, проверяет ввод, затем вызывает request регистрации или onLogin. login в App.tsx вызывает api.ts request → fetch /api/auth/login. Ошибка показывается; busy снимается в finally.

## Александр сессия

App хранит user/loading/error. После refresh токен позволяет запросить /users/me. protect показывает загрузку, ошибку с повтором, вход гостю или страницу. ProfilePage получает user через props. Logout сначала отзывает серверную сессию; сетевую ошибку можно повторить. Старый 401 не должен стереть новый токен.

## Вадим окружение и Илья проверки

Dockerfile собирает образ; Compose связывает db/backend/frontend и healthcheck; backend использует db:5432; Nginx убирает /api. Илья связывает пути с test_health.py, test_auth.py, App.test.tsx и E2E auth.spec.ts. Один тест не заменяет общий прогон и человеческий разбор.
