# Подготовка рабочего окружения

Ответственный Вадим. Нужны Git, Python 3.12, Node.js 22/npm, Docker Desktop с Compose, редактор, доступ к GitHub и Pyrus.

## Проверить инструменты

В PowerShell выполнить git --version, python --version, node --version, npm --version, docker compose version, docker info. Отсутствие команды означает проблему установки или PATH; после установки открыть новый терминал.

## Выбрать приложение

Клонировать git clone git@github.com:scorpdestroy/Messenger-SAXophone.git и перейти в каталог. Проверить git status. main/develop содержат приложение; release/0.1.0 — кандидат из develop. Ветки sprint/1-setup, sprint/2-architecture, sprint/3-structure содержат документы и структуру, приложение там не запускается.

## Запустить

В чистом checkout develop скопировать .env.example в .env, задать постоянный AUTH_SECRET_KEY для локальных сессий. Не включать .env в Git. docker compose up --build --wait --wait-timeout 180 запускает сервисы. По умолчанию UI http://localhost:8080, health http://localhost:8080/api/health, ready http://localhost:8080/api/ready. /profile по прямой ссылке открывает интерфейс, гостя переводит на вход.

При занятом порте задать FRONTEND_PORT/BACKEND_PORT/POSTGRES_PORT в .env. В отдельном окружении упрощения использовался 8082; это локальное отличие, не стандарт README.

## Проверить и остановить

docker compose ps — состояние, docker compose logs backend — журнал. При 503 /ready проверить готовность БД; при 502 через Nginx — backend. docker compose down останавливает сервисы, сохраняя volume; down -v удаляет данные, для обычной остановки его не использовать.

Участник записывает свою дату, версии, адрес и результаты health/ready. Эта инструкция сама по себе не подтверждает проверку семи личных рабочих мест.
