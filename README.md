# Finance Dashboard

A responsive **personal finance dashboard** built with React. It loads transactions from a Vercel serverless API backed by Neon Postgres, shows balances and charts on the **Dashboard**, supports CRUD-style management on **Transactions** (admin role), and surfaces trends plus CSV/JSON export on **Insights**.

---

## Overview

| Area | What it does |
|------|----------------|
| **Dashboard** | Total balance, income, expenses; monthly balance line chart (year filter); category expense pie chart. |
| **Transactions** | Search, filter, sort; list + table layouts by screen size; admins can add, edit, and delete rows via the API. |
| **Insights** | Summary cards, category pie and spending trend charts, rule-based “smart” insights, downloadable data. |

**Tech stack:** React 19, React Router 7, Recharts, Tailwind CSS, Create React App.

**Data:** `transactions` table in Neon Postgres (`id`, `type`, `amount`, `category`, `date`).

---

## Screenshots

<p align="center">
  <b>Dashboard</b><br/>
  <img src="./docs/screenshots/dashboard.png" alt="Dashboard with summary cards and monthly balance chart" width="720"/>
</p>

<p align="center">
  <b>Transactions</b><br/>
  <img src="./docs/screenshots/transactions.png" alt="Transactions table with search and filters" width="720"/>
</p>

<p align="center">
  <b>Insights</b><br/>
  <img src="./docs/screenshots/insights.png" alt="Insights page with charts and smart insights" width="720"/>
</p>

> **Tip:** These are vector previews that match the app structure. For real pixel captures, run the app and replace the files in [`docs/screenshots/`](./docs/screenshots/) with your own PNG or WebP images, then update the paths above if needed.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/sai-unknown/finance-dashboard
cd finance-dashboard
npm install
```

### 2. Configure environment

Create `.env.local` in project root:

```bash
DATABASE_URL=postgresql://...
REACT_APP_API_URL=
```

- Keep `REACT_APP_API_URL` empty to use same-origin `/transactions` on Vercel.

### 3. Start the React app

In a **second** terminal:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Roles

Use the header **Role** control:

- **Viewer** — read-only transactions (no add/edit/delete).
- **Admin** — full transaction form, CSV import, delete confirmation, pagination, and toasts for feedback.

### 5. CSV import (Transactions, admin)

Use **Import CSV** with a header row:

`type,amount,category,date`

- `type`: `income` or `expense`
- `amount`: positive number (commas allowed)
- `category`: any label
- `date`: `YYYY-MM-DD`

A tiny example file is at [`public/sample-transactions-import.csv`](./public/sample-transactions-import.csv).

### 6. Deploy on Vercel

1. Import repository in Vercel.
2. Add environment variable `DATABASE_URL` with your Neon connection string.
3. Deploy and verify:
   - `GET /transactions`
   - `GET /api/transactions`

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server at port 3000 (hot reload). |
| `npm run build` | Production build in `build/`. |
| `npm test` | Jest / React Testing Library (watch mode). |
| `npm run eject` | Irreversible CRA eject (only if you know you need it). |

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Empty data / fetch errors | Verify `DATABASE_URL` is set in Vercel and `/api/transactions` returns data. |
| Blank charts | Confirm transactions include valid `date` and `type` (`income` / `expense`). |

---

## Project structure (high level)

```
finance-dashboard/
├── public/
├── src/
│   ├── components/     # Header, Sidebar, MobileNav, …
│   ├── context/        # AppContext, ToastContext
│   ├── config/         # API_BASE (REACT_APP_API_URL)
│   ├── utils/          # CSV parsing for import
│   ├── hooks/          # useMediaQuery, …
│   ├── pages/          # Dashboard, Transactions, Insights
│   ├── App.js
│   └── index.js
├── docs/screenshots/   # README visuals
├── api/                # Vercel serverless API routes
└── README.md
```

---

## Learn more

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://react.dev/)
- [Neon Postgres](https://neon.com/docs)

---

## Manual QA checklist

Run `npm start`, open DevTools **Console**, then verify:

| Check | Expected |
|-------|-----------|
| **Dashboard** | Cards and charts load; year selector works; no red errors when API is up. |
| **Transactions** | Search / filters / sort; pagination; date on add/edit; CSV import; delete confirmation; toasts instead of blocking alerts. |
| **Insights** | Charts render; download switches JSON/CSV and saves a file. |
| **Role: Viewer** | No “Add transaction”, no Actions column, no edit inputs on rows. |
| **Role: Admin** | Add / edit / save / delete work; switching **Admin → Viewer** closes the add form and exits row edit mode. |
| **API off** | Friendly error message on pages that load data; no uncaught promise rejections. |
| **Responsive** | Resize 320px → 1920px+; bottom nav (mobile), sidebar (desktop); no horizontal page scroll. |
| **Console** | No errors in normal use (warnings from dev tools or extensions are OK). |

Automated: `npm run build` should compile with no errors.

---

## License

Private / assignment use