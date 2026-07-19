# 🌌 Exoplanet Biosignature Explorer

A full-stack data dashboard that pulls live exoplanetary data from the NASA Exoplanet Archive, computes a Biosignature Confidence Score, and lets astrobiology researchers filter thousands of deep-space candidates.

---

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS | Vercel |
| Backend | Node.js + Express.js (ES modules) | Render |
| Database | PostgreSQL | Neon |
| Data Source | NASA Exoplanet Archive TAP API | — |

---

## Project Structure

```
/
├── server/
│   ├── db/
│   │   ├── pool.js         # PostgreSQL connection pool
│   │   ├── migrate.js      # Run once to create tables
│   │   └── ingest.js       # Fetch & upsert NASA data
│   ├── routes/
│   │   └── exoplanets.js   # REST API endpoints
│   ├── utils/
│   │   └── scorer.js       # Biosignature scoring engine
│   ├── server.js           # Express entry point
│   ├── package.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── components/     # React UI components
    │   ├── hooks/          # Data-fetching hooks
    │   ├── types/          # TypeScript interfaces
    │   ├── utils/          # API helper functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── .env.example
```

---

## Local Development Setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local, Neon, or Supabase)

### 2. Clone & install dependencies

```bash
git clone <your-repo-url>
cd exoplanet-explorer
npm run install:all
```

### 3. Configure server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Run database migration

```bash
npm run migrate
```

### 5. Ingest NASA data

```bash
npm run ingest
```

This fetches ~5,000+ planets from NASA's TAP endpoint and upserts them into the database. Takes ~30–60 seconds.

### 6. Start the server

```bash
npm run dev:server
```

API will be live at `http://localhost:5000`

### 7. Configure client & start frontend

```bash
cp client/.env.example client/.env
# Leave VITE_API_URL blank for local dev (Vite proxy handles it)
npm run dev:client
```

Frontend will be live at `http://localhost:5173`

---

## API Reference

### `GET /api/exoplanets`

Query params:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page (max 100) |
| `minScore` | number | 0 | Minimum biosignature score |
| `habitableOnly` | boolean | false | Only planets in the habitable zone |
| `searchQuery` | string | — | Search by planet name or host star |

### `GET /api/exoplanets/stats`

Returns overview metrics: total planets, habitable zone count, high-confidence count, average score.

### `GET /api/exoplanets/:id`

Returns full detail for a single planet including computed habitable zone boundaries.

### `GET /health`

Server health check — used by the frontend wake-up detection.

---

## Biosignature Scoring Engine

Scores are computed as integers from 0–100:

| Criterion | Points |
|-----------|--------|
| Planet orbit within habitable zone | +40 |
| Ideal rocky mass (0.5–2.0 M⊕) | +10 |
| Gas giant / mini-Neptune (>5 M⊕) | −30 |
| H₂O atmospheric presence | +10 |
| O₂ + CH₄ simultaneous >5% (disequilibrium) | +30 |

Score is clamped to [0, 100].

---

## Production Deployment

### Neon (Database)

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string

### Render (Backend)

1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Root directory: `server`
5. Environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `PORT` = 5000
   - `CLIENT_URL` = your Vercel frontend URL

### Vercel (Frontend)

1. Connect your GitHub repo
2. Root directory: `client`
3. Build command: `npm run build`
4. Environment variables:
   - `VITE_API_URL` = your Render backend URL

### After deploying both services:

Run the ingestion job once via Render's Shell tab:
```bash
node db/ingest.js
```

---

## Notes

- **Cold start handling**: Render's free tier hibernates after 15 min of inactivity. The frontend detects this and shows an animated loading screen while the server wakes up (up to 60 seconds).
- **Re-ingestion**: Running `npm run ingest` is safe at any time — it uses `ON CONFLICT DO UPDATE`, so no duplicate rows are created.
- **Atmospheric data**: The `o2_abundance_pct`, `ch4_abundance_pct`, `h2o_abundance_pct`, and `co2_abundance_pct` fields are simulation targets. Seed them via direct SQL or a future admin endpoint to explore the disequilibrium scoring.
