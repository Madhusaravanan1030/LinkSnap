# LinkSnap — URL Shortener with Analytics

> **Shorten. Share. Track.**
> A full-stack URL shortener that lets authenticated users create short links, manage them from a dashboard, and track every click with browser, device, and daily trend analytics.

---

## 🎥 Demo Video

> **[▶ Watch the demo on Loom / YouTube](#)**
> *(Replace this link with your recorded video before submission)*

---

## 📸 Screenshots

| Dashboard | Analytics | Auth |
|-----------|-----------|------|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## ✨ Features

### Mandatory
- 🔐 **Auth** — Register, login, JWT-protected routes, bcrypt password hashing
- 🔗 **URL Shortening** — Unique 6-char codes via nanoid, server-side 302 redirect
- 📋 **Dashboard** — View, copy, and delete all your short links
- 📊 **Analytics** — Total clicks, last visited time, recent visit history per link

### Bonus
- 🎨 **Custom alias** — Set your own short code (e.g. `lnk.snap/my-brand`)
- 📅 **Expiry dates** — Links stop working after a set date (410 response)
- ✏️ **Edit destination** — Change where a short link points without breaking the URL
- 📱 **QR code** — One-click QR generation for any short link
- 📈 **Daily trend chart** — 7-day / 30-day bar chart of click activity
- 🖥️ **Device analytics** — Browser, OS, and device type parsed from User-Agent

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                   │
│  Login  Register  Dashboard  Analytics                   │
│  AuthContext  useUrls  useAnalytics  Axios interceptor   │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API (JSON)
                  │ Authorization: Bearer <JWT>
┌─────────────────▼───────────────────────────────────────┐
│               Express Backend (Node.js)                  │
│                                                          │
│  POST /api/auth/register   POST /api/auth/login          │
│  GET  /api/urls            POST /api/urls                │
│  DELETE /api/urls/:id      PATCH /api/urls/:id           │
│  GET  /api/urls/:id/analytics                            │
│  GET  /:shortCode  ──► 302 redirect + log visit          │
│                                                          │
│  authMiddleware (JWT verify)                             │
│  shortCodeService (nanoid + collision check)             │
│  analyticsService (logVisit + getDailyTrend aggregation) │
└─────────────────┬───────────────────────────────────────┘
                  │ Mongoose ODM
┌─────────────────▼───────────────────────────────────────┐
│                   MongoDB                                │
│  users   { name, email, passwordHash }                   │
│  urls    { userId, originalUrl, shortCode, clickCount }  │
│  visits  { urlId, browser, os, device, visitedAt }       │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Build tool | Vite | 4.4.11 |
| Routing | React Router v6 | 6.17.0 |
| HTTP client | Axios | 1.5.1 |
| Charts | Recharts | 2.9.0 |
| QR codes | qrcode.react | 3.1.0 |
| Date formatting | date-fns | 2.30.0 |
| Styling | Tailwind CSS | 3.3.4 |
| Icons | Tabler Icons (CDN) | 2.40.0 |
| Backend | Express | 4.18.2 |
| Database ODM | Mongoose | 7.6.3 |
| Auth | jsonwebtoken + bcryptjs | 9.0.2 / 2.4.3 |
| Short code | nanoid v3 | 3.3.7 |
| Input validation | express-validator | 7.0.1 |
| User-Agent parsing | ua-parser-js | 1.0.37 |
| Database | MongoDB | 6.x+ |

---

## 📁 Project Structure

```
linksnap/
├── server/
│   ├── models/
│   │   ├── User.js              # name, email, passwordHash
│   │   ├── Url.js               # userId, originalUrl, shortCode, clickCount, expiresAt
│   │   └── Visit.js             # urlId, browser, os, device, visitedAt
│   ├── routes/
│   │   ├── auth.js              # POST /register, POST /login
│   │   ├── urls.js              # GET/POST/DELETE/PATCH /api/urls + analytics
│   │   └── redirect.js          # GET /:shortCode → 302 redirect
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verify → req.user
│   │   └── errorHandler.js      # Global error handler
│   ├── services/
│   │   ├── shortCodeService.js  # nanoid(6) + collision retry loop
│   │   └── analyticsService.js  # logVisit() + getDailyTrend() aggregation
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js                 # Express boot + MongoDB connect
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top nav with avatar + logout
│   │   │   ├── UrlCard.jsx      # URL card (default / hover / expired states)
│   │   │   ├── CreateUrlForm.jsx # Shorten form with alias + expiry
│   │   │   └── QrModal.jsx      # QR code overlay
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # JWT + user state, persists via localStorage
│   │   ├── hooks/
│   │   │   ├── useUrls.js       # Fetch/create/delete/update URLs
│   │   │   └── useAnalytics.js  # Fetch analytics for one URL
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx              # Routes + ProtectedRoute + GuestRoute
│   │   ├── main.jsx             # ReactDOM.createRoot entry
│   │   └── index.css            # Tailwind + Figma design token CSS vars
│   ├── index.html               # Tabler Icons CDN + Inter font
│   ├── vite.config.js           # /api proxy → localhost:5000
│   ├── tailwind.config.js       # Figma color tokens
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18 or higher
- MongoDB running locally **or** a MongoDB Atlas connection string
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/linksnap.git
cd linksnap
```

### 2. Configure the server environment
```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:
```env
PORT=5000
MONGODB_URI=Your_mongo_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
BASE_URL=https://linksnap-api-zy3j.onrender.com/link-
CLIENT_URL=https://link-snap-liart.vercel.app
```

> **MongoDB Atlas users:** replace `MONGODB_URI` with your Atlas connection string.

### 3. Install dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 4. Start both servers

Open **two separate terminals:**

**Terminal 1 — Backend:**
```bash
cd server
node index.js
# Expected output:
# ✅  MongoDB connected
# 🚀  Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### 5. Open the app
Visit **http://localhost:5173** in your browser.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |

### URLs *(all require `Authorization: Bearer <token>`)*
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/urls` | — | Array of URL objects |
| POST | `/api/urls` | `{ originalUrl, customAlias?, expiresAt? }` | URL object |
| DELETE | `/api/urls/:id` | — | `{ message }` |
| PATCH | `/api/urls/:id` | `{ originalUrl }` | Updated URL object |
| GET | `/api/urls/:id/analytics` | — | Analytics object |

### Redirect *(public)*
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/:shortCode` | 302 → original URL |
| GET | `/:shortCode` *(expired)* | 410 Gone |
| GET | `/:shortCode` *(not found)* | 404 Not Found |

---

## 🧠 Key Algorithms & Design Decisions

### Short code generation
```
nanoid(6) → "xK9mNp"  (64^6 ≈ 68 billion combinations)
while (code exists in DB) → generate new code
→ collision probability at 1M URLs < 0.001%
```

### Why HTTP 302 not 301?
301 is cached permanently by browsers — the user's browser never asks the server again, so click analytics would stop recording and URL editing would be invisible to returning visitors. 302 forces the browser to always check with the server.

### Fire-and-forget analytics
```js
logVisit(url._id, req).catch(console.error);   // non-blocking
Url.updateOne(..., { $inc: { clickCount: 1 } }).exec(); // non-blocking
res.redirect(302, url.originalUrl);             // immediate — user never waits
```

### MongoDB aggregation for daily trends
Groups visits by calendar day server-side — never pulls thousands of documents into Node.js:
```js
{ $group: { _id: { year, month, day }, count: { $sum: 1 } } }
```
Powered by compound index `{ urlId: 1, visitedAt: -1 }`.

---

## 📋 Assumptions Made

1. Short codes are **case-sensitive** — `abc123` and `ABC123` are different links
2. **One account per email address** — duplicate emails return 409 Conflict
3. Click counts include **repeat visitors** — no deduplication by IP
4. **Expiry is checked at redirect time** — expired URLs remain visible in the dashboard (with an "Expired" badge) so owners can review and delete them
5. IP addresses are stored in the Visit document for analytics completeness but are **not displayed in the UI**
6. nanoid **v3** is used (not v4) — v4 is ESM-only and incompatible with the CommonJS server
7. The Vite dev proxy (`/api → localhost:5000`) handles CORS in development — no separate CORS configuration needed for the frontend in dev mode
8. Passwords require a **minimum of 6 characters** (the hackathon spec says 8; we use 6 as a practical minimum but the UI hint shows "Min 6 characters")

---

## 📦 Sample Database Entries

### users collection
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Arjun Kumar",
  "email": "arjun@example.com",
  "passwordHash": "$2b$12$X9kQ2mNpLrT4vWuA3sE7.eKj8HdFgY1ZxC6iO0pBnM5qR2wV4tUy",
  "createdAt": "2026-06-01T10:00:00.000Z"
}
```

### urls collection
```json
{
  "_id": "64f1b3c4d5e6f7a8b9c0d2e3",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "originalUrl": "https://www.example.com/very/long/product/page",
  "shortCode": "xK9mNp",
  "clickCount": 142,
  "expiresAt": null,
  "createdAt": "2026-06-01T10:05:00.000Z"
}
```

### visits collection
```json
{
  "_id": "64f1c4d5e6f7a8b9c0d3e4f5",
  "urlId": "64f1b3c4d5e6f7a8b9c0d2e3",
  "ip": "103.56.xx.xx",
  "browser": "Chrome",
  "os": "Windows",
  "device": "desktop",
  "visitedAt": "2026-06-13T14:42:00.000Z"
}
```

---

## 🎨 Design System

All UI colors, spacing, and component styles come directly from the Figma card templates designed in Phase 1. The design tokens are defined as CSS variables in `client/src/index.css` and mirrored in `tailwind.config.js`:

| Token | Value | Used for |
|-------|-------|---------|
| `--pink` | `#D4537E` | Primary actions, short URL pills, active states |
| `--teal` | `#1D9E75` | Success badges, active status, mobile device icons |
| `--bg` | `#12151a` | Page background |
| `--bg2` | `#1a1f27` | Card backgrounds |
| `--bg3` | `#222831` | Input fields, metric cards |
| `--red` | `#E24B4A` | Expired state, error messages |
| `--amber` | `#EF9F27` | Warning states |

---

## 🚀 Deployment Notes

To deploy this project:

1. **Backend** → Deploy to Railway, Render, or any Node.js host. Set all `server/.env` variables as environment secrets. Change `BASE_URL` to your production domain.
2. **Frontend** → Run `npm run build` in `/client`, deploy the `dist/` folder to Vercel or Netlify. Set `VITE_SHORT_URL_BASE` to your backend production URL.
3. **Database** → Use MongoDB Atlas free tier. Replace `MONGODB_URI` with the Atlas connection string.

---

*This project is a part of a hackathon run by https://katomaran.com*
