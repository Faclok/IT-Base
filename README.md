# IT Base

IT Base - веб-платформа для публикации карточек IT-специалистов и передачи контактов заказчиков через администратора.

## Что реализовано

- Публичный список разработчиков (без приватных контактов)
- Поиск по стеку, навыкам, опыту и тексту карточки
- Сортировка по дате и грейду
- Пагинация для больших списков (1000+ карточек)
- AI-рекомендации отключены в MVP: используется только поиск по горячим словам
- Админ-панель:
  - вход по паролю (cookie-сессия)
  - создание, редактирование, удаление карточек
  - просмотр и обработка запросов контактов
- Форма запроса контакта с Telegram заказчика
- Базовые автотесты для критических функций

## Стек

- Backend: FastAPI + SQLite
- Frontend: Vanilla JS + HTML/CSS
- Тесты: pytest + FastAPI TestClient

## Локальный запуск

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --port 8000
```

Открыть в браузере: `http://127.0.0.1:8000`

## Переменные окружения (`backend/.env`)

- `IT_BASE_ADMIN_PASSWORD` - пароль админа
- `IT_BASE_COOKIE_SECRET` - секрет подписи cookie
- `IT_BASE_DB_PATH` - путь к SQLite БД
- `IT_BASE_ALLOWED_ORIGINS` - CORS origins (опционально)

## Тесты

```bash
cd backend
source .venv/bin/activate
pytest -q
```
# IT Base

IT Base — веб-платформа для публикации карточек IT-специалистов и передачи контактов заказчиков через администратора.

## Что реализовано

- Публичный список разработчиков (без приватных контактов)
- Поиск по стеку/навыкам/опыту/имени
- Сортировка (по грейду и дате)
- Пагинация (под 1000+ карточек)
- AI-рекомендации:
  - через OpenAI API (если задан `OPENAI_API_KEY`)
  - fallback: локальный TF-IDF + косинусное сходство
- Админ-панель:
  - логин по паролю (cookie-сессия)
  - CRUD карточек разработчиков
  - просмотр/обработка запросов контактов
- Запрос контакта: Telegram заказчика + сообщение
- Базовые тесты критических функций

## Стек

- Backend: FastAPI + SQLite
- Frontend: Vanilla JS + HTML/CSS
- Тесты: pytest + FastAPI TestClient

## Локальный запуск

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Открыть: `http://127.0.0.1:8000`

## Переменные окружения (`backend/.env`)

- `IT_BASE_ADMIN_PASSWORD` — пароль админа
- `IT_BASE_COOKIE_SECRET` — секрет подписи cookie
- `IT_BASE_DB_PATH` — путь к SQLite БД
- `IT_BASE_ALLOWED_ORIGINS` — CORS origins (опционально)
- `OPENAI_API_KEY` — ключ OpenAI для AI-рекомендаций (опционально)
- `OPENAI_MODEL` — модель OpenAI (по умолчанию `gpt-4o-mini`)

## Тесты

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## Деплой

Для Vercel удобнее перейти на Node-стек (Next.js + Prisma) либо деплоить FastAPI как отдельный сервис.
Текущая версия готова для локального запуска и последующего переноса в облако.
## IT Base

Статический сайт-каталог людей в IT + “как надо” локальный backend:

- Публичный каталог + поиск/фильтры
- Админка с логином/паролем (cookie-сессия)
- База данных SQLite
- Запрос “Связаться” → создаёт запись в базе и (опционально) шлёт уведомление в Telegram

## Быстрый старт (локально)

### 1) Установи зависимости backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Настрой переменные окружения

Скопируй пример:

```bash
cp .env.example .env
```

Отредактируй `.env` (пароль админки и, если хочешь, Telegram).

### 3) Запусти backend

```bash
uvicorn main:app --reload --port 8000
```

### 4) Запусти фронт (статик)

В корне проекта:

```bash
python3 -m http.server 5174 --directory "."
```

Открой `http://127.0.0.1:5174/`

### Админка

Нажми “Админ: вход” и введи пароль из `backend/.env` (`IT_BASE_ADMIN_PASSWORD`).

## Примечания

- Токен Telegram хранится **только на backend** в `.env`.
- SQLite файл создаётся автоматически (по умолчанию `backend/itbase.sqlite3`).

