# 💼 AI Job Board

A full-stack **MERN** job board with AI-assisted job descriptions, real-time search & filters, applications, saved jobs, dark mode, and a live stats dashboard.

> **Stack:** React + Vite (frontend) · Express + MongoDB/Mongoose (backend) · JWT auth · OpenAI (optional) · Vitest · GitHub Actions CI · Vercel (frontend) + Render (backend).

---

## 🔗 Live links

| Part | URL |
|------|-----|
| **Frontend (Vercel)** | https://mern-job-board-lovat.vercel.app|
| **Backend API (Render)** | https://job-board-91q8.onrender.com |
| **Repository** | https://github.com/JAGADISH3723/Job_Board |

> ℹ️ The Render backend is on a free tier, so the **first request after idle can take ~20–30s** to cold-start.

---

## ✨ Features

### 1. Job listings
Browse all open roles as responsive cards showing title, company, location, job type (color-coded tag), salary, and posted date. Cards have hover elevation and a 3-line description clamp for a tidy grid.

### 2. Real-time search
Keyword search across **title, company, location, and description** (case-insensitive). Powered server-side, so results scale with the database.

### 3. Smart filters + sorting
- **Filter by type** — Full-time / Part-time / Contract / Remote
- **Filter by location** — dropdown auto-populated from the live data
- **Sort by** — Newest, Oldest, Company (A–Z), Title (A–Z)
- A results counter and one-click **Reset filters**.

### 4. Job details + apply flow
Click **View details** to open a modal with the full description and meta. Applicants can **Apply** via a guided form (name, email, optional message) — applications are persisted to MongoDB. Closes on Escape or backdrop click, with a success confirmation state.

### 5. Save / bookmark jobs
Bookmark any job with the ★ button. Saved jobs persist in the browser (`localStorage`), show a **badge in the navbar**, and have their own **Saved** tab.

### 6. Post a job (protected)
Sign in with the demo account to publish a new listing through a guided form with client + server-side validation (e.g. numeric salary ranges). Posting requires a valid **JWT**.

### 7. AI-powered job descriptions
On the post form, click **Generate description** to auto-write a polished description from a few inputs, using the OpenAI API. _(Requires an `OPENAI_API_KEY`; the rest of the app works fully without it.)_

### 8. Stats dashboard
A live panel shows total open roles, remote roles, hiring-company count, and a **roles-by-type** bar chart — all computed with MongoDB aggregations.

### 9. Dark mode
A navbar toggle switches light/dark themes. The choice is **persisted** and defaults to the visitor's system preference. The whole UI is theme-aware via CSS variables.

### 10. Polish
Skeleton loading states, empty/error states, sticky translucent navbar, and a fully responsive/mobile layout.

---

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, plain CSS (variable-driven theming) |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB (Atlas in production) |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| AI | OpenAI SDK (optional) |
| Testing | Vitest + Testing Library |
| Lint | Oxlint |
| CI | GitHub Actions |
| Hosting | Vercel (frontend) · Render (backend) |

---

## 📁 Project structure

```
Job_Board/
├─ .github/workflows/ci.yml   # CI: install → build → lint → test
├─ api/                       # (optional) Vercel serverless variant of the API
├─ backend/                   # Express backend (deployed to Render)
│  ├─ index.cjs               #   app + routes (jobs, auth, apply, stats)
│  ├─ models/Job.cjs          #   Job schema
│  └─ utils/validation.cjs    #   payload validation
├─ lib/                       # shared db/openai helpers for the serverless variant
├─ public/                    # static assets
├─ scripts/run-dev.js         # cross-platform dev runner
├─ src/                       # React frontend
│  ├─ api.js                  #   API base-URL helper (VITE_API_BASE)
│  ├─ App.jsx                 #   main page + state
│  ├─ components/             #   Navbar, JobCard, StatsBar, JobDetailsModal
│  ├─ pages/                  #   JobForm, FeatureBlock
│  └─ __tests__/              #   Vitest unit tests
├─ index.html                 # Vite entry
├─ vite.config.js             # Vite + dev proxy + test config
└─ vercel.json                # Vercel routing
```

---

## 🚀 Getting started (local)

### Prerequisites
- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
For a purely local run the defaults work. See `.env.example` for every variable.

### 3. Run (frontend + backend together)
```bash
npm run dev
```
- Frontend → http://localhost:5173
- Backend  → http://localhost:5000
- The Vite dev server proxies `/api` → the backend automatically.

On first run with an empty database, the backend **seeds 6 sample jobs** plus a demo user so search, filters, and stats work immediately.

### Demo credentials
```
email:    demo@jobboard.dev
password: demo1234
```

---

## 📜 Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Run backend + frontend together |
| `npm run client` | Frontend only (Vite) |
| `npm run backend` | Backend only (Express) |
| `npm run build` | Production build of the frontend |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |
| `npm test` | Run the Vitest test suite |

---

## 🔌 API reference

Base URL: `/api` (local) or the Render URL in production.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs?q=&type=&location=&sort=` | – | List jobs with search, filters, and sort |
| GET | `/api/jobs/filters` | – | Distinct locations & types (for dropdowns) |
| GET | `/api/jobs/:id` | – | Fetch a single job |
| POST | `/api/jobs` | ✅ JWT | Create a job |
| POST | `/api/jobs/:id/apply` | – | Submit an application (name, email, message) |
| GET | `/api/stats` | – | Aggregate stats for the dashboard |
| POST | `/api/auth/login` | – | Log in, returns a JWT |
| POST | `/api/generate-description` | – | AI-generated description (needs `OPENAI_API_KEY`) |

---

## 🔁 CI/CD

**CI** — `.github/workflows/ci.yml` runs on every push / PR to `master`:
`install → build → lint → test`. A failing build, lint, or test blocks the pipeline.

**CD** — The frontend deploys to **Vercel** and the backend to **Render**, both wired to this GitHub repo for automatic deploys on push to `master`. See below.

---

## ☁️ Deployment

### Backend → Render
1. New **Web Service** from this repo.
2. **Build:** `npm install` · **Start:** `node backend/index.cjs`
3. Environment variables:
   - `MONGODB_URI` = your MongoDB Atlas SRV string
   - `JWT_SECRET` = a long random string
   - `OPENAI_API_KEY` = _(optional)_
4. Deploy → note the service URL (e.g. `https://job-board-91q8.onrender.com`).

### Frontend → Vercel
1. Import this repo in Vercel (framework preset: **Vite**).
2. **Build:** `npm run build` · **Output:** `dist`
3. Environment variable:
   - `VITE_API_BASE` = your Render backend URL
4. Deploy.

### Database → MongoDB Atlas
Create a free cluster, add a database user, allow network access, and use the connection string as `MONGODB_URI` on Render.

---

## 🧪 Testing
```bash
npm test
```
Unit tests cover the job-payload validation logic and the `JobCard` component (rendering + interactions).

---

## 📝 License
ISC
