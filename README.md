# DC Rack Manager

Облік серверних стійок та обладнання дата-центру (Express + React/Vite).

## Запуск

```bash
# 1. Backend (порт 3000)
cd backend
npm install
npm run dev

# 2. Frontend (порт 5173) — в іншому терміналі
cd frontend
npm install
cp .env.example .env   # необовʼязково, за замовчуванням http://localhost:3000/api
npm run dev
```

Відкрити http://localhost:5173

## Структура
- `backend/` — Express API, дані в `backend/data/*.json`
- `frontend/` — React SPA (react-router-dom v6, useBlocker)
