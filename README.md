# IT Base

IT Base - веб-платформа для публикации карточек IT-специалистов с публичным каталогом и админ-панелью.

## Возможности

- Публичный список карточек с поиском, фильтрами и сортировкой
- Цветные счетчики по грейдам и общий счетчик базы
- Карточки фиксированной высоты с разворачиванием длинного текста
- Запрос контакта разработчика через администратора
- Админ-панель: логин, CRUD карточек, обработка контактных запросов
- Импорт CSV/XLSX (включая несколько листов XLSX) с режимом замены данных
- Скачивание backup SQLite из админки

## Технологии

- Backend: FastAPI + SQLite (`aiosqlite`)
- Frontend: Vanilla JS + HTML/CSS
- Тесты: `pytest` + `fastapi.testclient`

## Локальный запуск

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Открыть: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Переменные окружения

Файл: `backend/.env`

- `IT_BASE_ADMIN_PASSWORD` - пароль входа в админку
- `IT_BASE_COOKIE_SECRET` - секрет подписи admin-cookie
- `IT_BASE_DB_PATH` - путь к SQLite базе (для Amvera: `/data/itbase.sqlite3`)
- `OPENAI_API_KEY` - опционально, для endpoint рекомендаций
- `OPENAI_MODEL` - опционально, модель OpenAI (по умолчанию `gpt-4o-mini`)

## Тесты

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## Деплой (Amvera)

- Конфиг: `amvera.yaml`
- Точка входа: `start.py`
- Путь зависимостей: `backend/requirements.txt`

