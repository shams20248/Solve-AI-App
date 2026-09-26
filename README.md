# Solve AI App

A modern accounting and business management platform powered by AI, with multilingual support in Arabic, English, and French.

## Features
- Smart accounting dashboard
- Invoice, bills, customer, and supplier management
- AI-generated financial insights and recommendations
- Multilingual interface (Arabic / English / French)
- Subscription plans: Monthly, Semi-Annual, Annual
- Modern responsive UI
- Ready for expansion with backend APIs and database integration

## Project structure

```text
solve-ai-app/
├── apps/
│   ├── web/
│   └── server/
├── package.json
├── README.md
├── .gitignore
└── .env.example
```

## Tech stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Styling: CSS Modules / custom CSS
- App shell: multilingual UI ready for production growth

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run the backend:

```bash
npm run dev:server
```

3. Run the frontend:

```bash
npm run dev:web
```

4. Open the app in your browser:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API endpoints

- `GET /api/health`
- `GET /api/summary`
- `GET /api/plans`

## License
MIT
