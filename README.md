# Dukandaar DAO — Fractional Real Estate Investment Platform

A full-stack MERN web application that lets retail investors buy fractional shares in verified commercial real-estate (shops, offices, warehouses, plazas) starting from PKR 5,000 and earn rental dividends straight to their wallet.

This project is the FAST Islamabad **Web Engineering / FinTech Semester Project**, mapping the fintech requirements from the project brief onto the **Dukandaar DAO** topic from Iteration 1.

---

## Features

### Investor (User) Side
- JWT-secured registration and login (auto-creates a PKR wallet)
- Wallet — view balance, deposit, withdraw, transfer to other users by email
- Browse verified properties; invest by buying fractional shares
- Track active investments, ownership %, and dividends earned
- Full transaction history with filters (type, status, date, search)
- Printable transaction receipts
- Personal expenses (CRUD + monthly + per-category summaries)
- Monthly budgets with category limits, near-limit and exceeded warnings
- In-app notifications (transactions, dividends, budget alerts, low balance, account blocked)
- Reports & analytics with bar/pie/area charts (income vs expense, budget usage, category breakdown)
- Profile management + change password

### Admin Side
- System dashboard with totals, flagged count, demo balance, transaction volume chart
- User management with search/filter, block/unblock (writes audit log)
- Wallets table (balance, deposits, withdrawals, invested per user)
- All transactions with filters
- Flagged transactions page (suspicious-rule engine results)
- Property CRUD, verification, and **dividend distribution** (pro-rata to active investors)
- Category management (transaction / expense / budget / property)
- System balance & transaction volume reports
- Audit logs

### Backend-Controlled Logic (per spec)
- All wallet balance updates are computed and persisted server-side
- Self-transfer / blocked-user / insufficient-balance / inactive-receiver guards
- Backend transaction ID generation (`TXN-YYYYMMDD-XXXXX`)
- Failed transactions are stored for monitoring
- Rule-based suspicious transaction monitor (7 rules, see below)

### Suspicious Transaction Rules (backend, in `utils/suspiciousRules.js`)
1. Transfer / withdrawal / investment ≥ PKR 100,000 (high value)
2. More than 5 transfers within 10 minutes by the same user
3. More than 3 failed withdrawals in 24 hours
4. Same amount transferred ≥ 3 times in 24 hours
5. High-value transaction by a newly registered user (< 24h old)
6. Deposit ≥ PKR 500,000 (high deposit)
7. Action attempted by a blocked user

When any rule fires, the transaction is saved with `suspiciousFlag: true` and `suspiciousReasons: [...]`, status set to `flagged`, and a notification is created. Admin sees these on the **Flagged** page.

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, React Router 6, Axios, Recharts, react-hot-toast, Vite |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, helmet, cors, morgan, express-rate-limit |
| Database | MongoDB Atlas |

---

## Folder Structure

```
dukandaar-dao/
├── backend/
│   ├── src/
│   │   ├── config/         (db connection)
│   │   ├── controllers/    (auth, user, wallet, transaction, property, expense, budget, notification, category, report, admin)
│   │   ├── middlewares/    (auth, role, notBlocked, validate, error, rateLimit)
│   │   ├── models/         (User, Wallet, Transaction, Property, Investment, Expense, Budget, Category, Notification, AuditLog)
│   │   ├── routes/         (one file per resource)
│   │   ├── seed/           (seed.js — sample admin, users, properties, categories)
│   │   ├── utils/          (response, asyncHandler, transactionId, suspiciousRules, notify)
│   │   ├── validations/    (per-resource body validators)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     (layout, charts, common reusables)
│   │   ├── context/        (AuthContext)
│   │   ├── pages/          (auth, public, user, admin)
│   │   ├── routes/         (ProtectedRoute)
│   │   ├── services/       (one axios service per resource)
│   │   ├── styles/         (global.css)
│   │   ├── utils/          (format helpers)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Backend
```bash
cd backend
cp .env.example .env       # then edit .env and set MONGO_URI, JWT_SECRET
npm install
npm run seed               # creates admin + sample users + 5 sample properties
npm run dev                # starts on http://localhost:5000
```
Health check: `GET http://localhost:5000/api/health`

### 2. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

### Seeded Logins
- **Admin:** `admin@dukandaar.com` / `Admin@12345`
- **User:** `ali@example.com` / `User@12345`
- **User:** `sara@example.com` / `User@12345`

Each seeded normal user is created with a PKR 250,000 demo wallet so you can immediately invest, transfer, and trigger suspicious rules.

---

## Environment Variables

### Backend (`backend/.env`)
| Key | Description |
|-----|-------------|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret used to sign JWTs |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `CLIENT_ORIGIN` | Comma-separated list of allowed CORS origins |
| `ADMIN_SEED_*` | Admin credentials used by `npm run seed` |

### Frontend (`frontend/.env`)
| Key | Description |
|-----|-------------|
| `VITE_API_BASE_URL` | Deployed backend base URL, e.g. `https://api.your-host.com/api` |

> **Security:** never commit `.env` files. Set the same variables in your hosting provider's UI for production.

---

## Deployment

The brief requires deployed frontend + deployed backend + cloud MongoDB. Recommended stacks:

| Component | Recommended host | Notes |
|-----------|------------------|-------|
| Backend (Node) | **Render** (web service) or **Railway** | Build cmd: `npm install` · Start cmd: `npm start` · Set env vars in dashboard |
| Frontend (Vite) | **Vercel** or **Netlify** | Build cmd: `npm run build` · Output dir: `dist` · Set `VITE_API_BASE_URL` to deployed backend URL |
| Database | **MongoDB Atlas** | Free M0 tier is fine. Whitelist `0.0.0.0/0` for ease, or your hosts' egress IPs. |

### Deployment checklist (per evaluation rubric)
- [ ] Backend deployed; `GET /api/health` returns 200 from public URL
- [ ] Frontend deployed; opens login + landing without local dev server
- [ ] Frontend `VITE_API_BASE_URL` points to deployed backend (not `localhost`)
- [ ] Backend `CLIENT_ORIGIN` includes deployed frontend domain
- [ ] MongoDB Atlas cluster reachable from backend host
- [ ] All secrets set as environment variables (NOT in repo)

---

## API Surface (high level)

| Module | Endpoints |
|--------|-----------|
| Auth   | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/change-password` |
| Users  | `GET /users/profile`, `PUT /users/profile` |
| Wallet | `GET /wallet`, `GET /wallet/summary`, `POST /wallet/deposit`, `POST /wallet/withdraw`, `POST /wallet/transfer` |
| Transactions | `GET /transactions`, `GET /transactions/:id`, `GET /transactions/:id/receipt`, `GET /transactions/summary/monthly` |
| Properties | `GET /properties`, `GET /properties/:id`, `POST /properties/:id/invest`, `GET /properties/me/investments`, plus admin CRUD |
| Expenses | `POST/GET /expenses`, `PUT/DELETE /expenses/:id`, `/expenses/summary/monthly`, `/expenses/summary/categories` |
| Budgets | `POST/GET /budgets`, `GET /budgets/current`, `PUT/DELETE /budgets/:id` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Categories | `GET /categories`, plus admin `/admin/categories` CRUD |
| Reports | `GET /reports/user-dashboard`, `/reports/income-expense`, `/reports/budget-usage` |
| Admin | `GET /admin/dashboard`, `/admin/users`, `/admin/users/:id/{block,unblock}`, `/admin/wallets`, `/admin/transactions`, `/admin/transactions/flagged`, `/admin/reports/{transaction-volume,system-balance}`, `/admin/audit-logs`, properties dividend pay-out |
| Health | `GET /health` |

All protected endpoints require an `Authorization: Bearer <token>` header.

---

## Testing the suspicious rules quickly

Once you log in as a seeded user (`ali@example.com`):
1. **High value** — transfer PKR 150,000 to `sara@example.com` ➜ flagged.
2. **Same amount repeated** — transfer PKR 1,000 to `sara@example.com` three times ➜ third transfer flagged.
3. **High deposit** — deposit PKR 600,000 ➜ flagged.
4. **Failed withdrawals** — try to withdraw more than balance four times ➜ a "more than 3 failed withdrawals" reason appears.
5. **Rapid transfers** — fire 6 transfers within 10 minutes ➜ flagged.
6. **Blocked user** — admin blocks the user, user tries any wallet action ➜ 403 (and rule 7 fires if state is mid-flight).
7. **New user high value** — register a brand-new user, deposit 250k, then transfer 60k within first hour ➜ flagged.

Admin can review all flagged items at `/admin/flagged`.

---

## Project Continuity

This implementation continues the Iteration-1 project ("Dukandaar DAO — Fractional Real Estate") and layers on the brief's fintech requirements: secure wallets, transactions, expenses, budgets, suspicious-transaction monitoring, admin panel, charts, and deployment. No replacement project ideas were used.

---

## License

Educational use only. Not for production financial services. All amounts are demo amounts.
