# Solve AI App

Solve AI App is a modern AI-powered accounting and business management platform for SMEs and growing companies. It combines financial operations, reporting, multilingual support, and subscription management in a single SaaS-ready product.

## Core features
- AI-powered accounting dashboard and insights
- Multi-language support in Arabic, English, and French
- Subscription plans: Monthly, Semi-Annual, and Annual
- Customer, supplier, invoice, and transaction management
- Financial summaries, forecasting, and reports
- Role-based access and secure authentication model
- Responsive and modern professional UI

## Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- API layer: REST with mock data for MVP
- Styling: Custom CSS

## Repository structure

```text
Solve-AI-App/
├── apps/
│   ├── web/
│   └── server/
├── package.json
├── .gitignore
├── .env.example
├── README.md
└── LICENSE
```

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the backend:

```bash
npm run dev:server
```

3. Start the frontend:

```bash
npm run dev:web
```

4. Open the app:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API overview
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/plans`
- `GET /api/invoices`
- `GET /api/customers`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/ai/analyze`

## MVP status
This repository currently contains a production-style MVP foundation for the product, including the UI shell, backend API, multilingual sections, and subscription model. It is ready for extension toward a full accounting SaaS product.

## License
MIT
