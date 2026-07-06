# Constituency Intelligence MVP

One-day hackathon MVP for AI-powered civic issue reporting, clustering, and priority scoring.

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/report`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/api/health`

The checked-in `.env.local` uses demo database mode and local file storage, so the UI works immediately. For the real PostgreSQL + OpenRouter path, copy values from `.env.example` into `.env.local`.

## Local PostgreSQL setup

Install PostgreSQL locally first. This machine did not expose `psql`, `createdb`, Docker, or a PostgreSQL Windows service during setup, so the app keeps demo mode enabled until you add a working local database.

```bash
createdb constituency_intelligence
psql -d constituency_intelligence -f sql/001_schema_postgres.sql
psql -d constituency_intelligence -f sql/002_seed_demo_madurai_postgres.sql
```

Then set:

```bash
DATABASE_PROVIDER=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/constituency_intelligence
STORAGE_PROVIDER=local
```

Uploaded report photos are saved under `public/uploads` and served from `/uploads/...`.

## Clustering behavior

Reports first try to match an open cluster with the same category and similar description text. For example, "trash dumped near bus stand" and "garbage pile near market" can join the same garbage cluster even when the GPS points are far apart. If text is not similar enough, the app falls back to the 150 meter location rule.

## OpenRouter setup

Set:

```bash
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=YOUR_OPENROUTER_KEY
OPENAI_COMPATIBLE_BASE_URL=https://openrouter.ai/api/v1
OPENAI_COMPATIBLE_MODEL=google/gemini-3.1-flash-lite-image
```

If that model is unavailable, choose another OpenRouter model with image input support.

## Demo script

1. Open `/dashboard` and show seeded clusters.
2. Open `/report`.
3. Upload a civic issue photo.
4. Keep the default description: `Large pothole near school gate`.
5. Submit and show AI category, severity, confidence, cluster match, priority, and department.
6. Return to `/dashboard`, refresh, and mark a cluster assigned or resolved.
