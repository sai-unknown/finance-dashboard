# Finance Dashboard

A responsive **personal finance dashboard** built with React. It loads transactions from a local REST API ([json-server](https://github.com/typicode/json-server)), shows balances and charts on the **Dashboard**, supports CRUD-style management on **Transactions** (admin role), and surfaces trends plus CSV/JSON export on **Insights**.

---

## Overview

| Area | What it does |
|------|----------------|
| **Dashboard** | Total balance, income, expenses; monthly balance line chart (year filter); category expense pie chart. |
| **Transactions** | Search, filter, sort; list + table layouts by screen size; admins can add, edit, and delete rows via the API. |
| **Insights** | Summary cards, category pie and spending trend charts, rule-based “smart” insights, downloadable data. |

**Tech stack:** React 19, React Router 7, Recharts, Tailwind CSS, Create React App.

**Data:** `db.json` holds a `transactions` array (`id`, `type`, `amount`, `category`, `date`). The UI expects the API at `http://localhost:5000/transactions`.

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

### 2. Start the mock API

The app reads and writes transactions through json-server on **port 5000**.

```bash
npm run api
```

This watches [`db.json`](./db.json). You should see REST endpoints such as:

- `GET http://localhost:5000/transactions`
- `POST http://localhost:5000/transactions`
- `PUT http://localhost:5000/transactions/:id`
- `DELETE http://localhost:5000/transactions/:id`

**Alternative (without npm script):**

```bash
npx json-server@0.17.4 --watch db.json --port 5000
```

### 3. Start the React app

In a **second** terminal:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Keep **both** processes running while developing.

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

### 6. Optional API base URL

Create `.env` in the project root:

```bash
REACT_APP_API_URL=http://localhost:5000
```

Restart `npm start` after changing env vars. The same value is used for the global transaction fetch and transaction mutations.

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server at port 3000 (hot reload). |
| `npm run build` | Production build in `build/`. |
| `npm test` | Jest / React Testing Library (watch mode). |
| `npm run api` | json-server watching `db.json` on port 5000. |
| `npm run eject` | Irreversible CRA eject (only if you know you need it). |

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Empty data / fetch errors | Ensure `npm run api` is running and nothing else uses port **5000**. |
| CORS | json-server allows the CRA origin by default; if you change ports or host, adjust accordingly. |
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
├── db.json             # json-server data
└── README.md
```

---

## Learn more

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://react.dev/)
- [json-server](https://github.com/typicode/json-server)

---

## Manual QA checklist

Run `npm run api` and `npm start`, open DevTools **Console**, then verify:

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