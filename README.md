# The Church of B.O.B.

Brainless. Blissful. Indestructible.

A single-page React app (Vite + Tailwind) with Cloudflare Pages Functions for the backend. Split off from the Cult of Yefris site — B.O.B. now has his own church.

## Features

- **The Church** (`/`) — origin, gospel of blankness, powers, holy relics gallery, wobbled scriptures
- **Ask the Blob** (embedded on the home page at `#bob-oracle`) — Gemini-powered oracle with streaming answers, Google Search grounding, chat history (localStorage), share-as-image cards
- **The Goo Trials** (`/games`) — five minigames with global leaderboards and server-side anti-cheat sessions:
  - Carrot Defense (`/games/goo-defense`) — ranked
  - The Dumbfounded Stare (`/games/the-stare`)
  - Wobbles Per Minute (`/games/wobbles`)
  - Snack or Thought (`/games/snack-or-thought`) — ranked
  - Flight of the Blob (`/games/flappy-blob`) — ranked
- **Initiation** — generate and download a personalized church certificate
- PWA manifest, per-route SEO meta/canonicals, sitemap, robots.txt

## Development

```bash
npm install
npm run dev          # frontend only (API routes need wrangler)
npx wrangler pages dev -- npm run dev   # frontend + functions
```

## Deployment (Cloudflare Pages)

1. Create a Cloudflare Pages project pointing at this repo.
   - Build command: `npm run build`
   - Build output directory: `dist`
   - The `functions/` directory is picked up automatically as Pages Functions.
2. Environment variables (Settings → Environment variables):
   - `GEMINI_API_KEY` — required, powers the oracle
   - `GEMINI_COMPACT_API_KEY` — optional, separate key for history compaction (falls back to main key)
3. KV binding (Settings → Functions → KV namespace bindings):
   - `LEADERBOARD_KV` — required for leaderboards and anti-cheat game sessions
4. After first deploy, update the domain in `index.html`, `App.tsx` (`SITE_ORIGIN`), `public/sitemap.xml`, and `public/robots.txt` if not using `churchofbob.pages.dev`.

## API

- `POST /api/ask` — `{ question, history }` → SSE stream (content, metadata w/ grounding sources)
- `POST /api/game-session` — → `{ sessionId }` (10-min TTL, single-use)
- `GET /api/leaderboard?game=defense|burden|flappy` — top 10
- `POST /api/leaderboard` — `{ name, score, sessionId, game }`

All endpoints are rate-limited per IP (in-memory, per isolate).
