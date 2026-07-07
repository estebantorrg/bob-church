# The Church of B.O.B. — Architecture Overview

This document provides a high-level technical overview of the Church of B.O.B. web application. It aims to explain how the various systems interact and are implemented, without exposing raw secrets or sensitive operational configurations.

> **Note:** This site was split out of the Cult of Yefris codebase into its own repository and Cloudflare Pages deployment. It shares the same edge/serverless architecture but runs a single oracle persona (B.O.B.) and its own set of minigames.

## System Topology & Infrastructure

The application is deployed on **Cloudflare Pages** and utilizes a full-stack Serverless/Edge computing model.

```mermaid
graph TD
    Client[Browser Frontend - React SPA]
    CF_Pages_Node[Cloudflare Edge Network]

    subgraph Cloudflare Environment
        Static[Static Assets / HTML / JS]
        API_Ask[/api/ask - LLM Proxy]
        API_Game[/api/game-session - Anti-Cheat]
        API_Leaderboard[/api/leaderboard - Score Submissions]
        KV_Store[(Cloudflare KV Store)]
    end

    Gemini[Google Gemini API]

    Client -->|Loads App| Static
    Client -->|Streaming Chat| API_Ask
    Client -->|Request Session| API_Game
    Client -->|Submit Score| API_Leaderboard

    CF_Pages_Node --- Static
    CF_Pages_Node --- API_Ask
    CF_Pages_Node --- API_Game
    CF_Pages_Node --- API_Leaderboard

    API_Ask -->|Fetch AI| Gemini
    API_Game -->|Create Token| KV_Store
    API_Leaderboard -->|Verify & Consume Token| KV_Store
    API_Leaderboard -->|Save Top 10| KV_Store
```

---

## 1. Frontend Architecture

The client side is a Single Page Application (SPA) built using **React 19**, **TypeScript**, and **Vite**.

- **Routing Model (`react-router-dom`):** The app uses client-side routing. Cloudflare Pages is configured via a `_redirects` file (`/* /index.html 200`) so all URI requests execute `index.tsx` first, allowing React Router to seamlessly handle navigation between `/` (the Church home, which embeds the Oracle) and `/games/*`.
- **Styling System (`tailwindcss` + `index.css`):** The UI strictly uses Tailwind CSS utility classes combined with custom CSS keyframe animations (blob wobble/float/morph, `fade-in-up`) for the gelatinous periwinkle theme and route transitions.
- **State Management:** Local React state (`useState`, `useRef`) handles complex interactions like minigame logic and chat text buffering. Long-term state (chat thread history, keyed `bob_chat_sessions`) is aggressively cached inside the browser's `localStorage`.
- **Fault Tolerance (`ErrorBoundary.tsx`):** A class-based React component wraps the entire component tree, catching unhandled JavaScript errors, providing a B.O.B.-themed fallback UI and preventing page-wide white-screens.
- **Per-route SEO (`App.tsx`):** Since the app is a static SPA with a single hardcoded `<title>`, a `RouteMeta` component rewrites the document title, description, and self-referential canonical/OG tags per route so each page is indexed distinctly.

---

## 2. Minigames & Anti-Cheat Subsystem ("The Goo Trials")

To prevent bad actors from forging malicious HTTP requests directly to the leaderboard API, a server-side **Session Token Architecture** is used.

1. **Token Generation:** When a user starts a minigame (e.g. *Carrot Defense*), the client sends a `POST` request to the Cloudflare Edge API (`/api/game-session`). The server generates a highly entropic hexadecimal token, caches it inside Cloudflare KV with an expiration TTL (10 minutes), and returns it.
2. **Gameplay Validation:** The client holds the token in memory while the game proceeds.
3. **Score Submission:** When the game ends, the client sends the final score alongside the session token. The Cloudflare Edge function (`/api/leaderboard`) strictly verifies the token exists in KV, is unused, and is within its age window. If valid, the score is accepted and the token is marked used (single-use), making replay attacks impossible.

Ranked games map to KV leaderboard keys via a fixed allowlist (`defense`, `burden`, `flappy`) to prevent arbitrary key namespace pollution:

| Trial (route) | Leaderboard `game` id | Ranked |
|---|---|---|
| Carrot Defense (`/games/goo-defense`) | `defense` | ✅ |
| The Dumbfounded Stare (`/games/the-stare`) | — | no score |
| Wobbles Per Minute (`/games/wobbles`) | — | local only |
| Snack or Thought (`/games/snack-or-thought`) | `burden` | ✅ |
| Flight of the Blob (`/games/flappy-blob`) | `flappy` | ✅ |

---

## 3. The Oracle (AI Proxy Engine)

The core feature—Ask the Blob—relies on a secure bridge to the **Google Gemini API**.

- **Secure Edge Proxy (`/api/ask`):** The frontend never directly talks to Google's API, ensuring `GEMINI_API_KEY` (and the optional `GEMINI_COMPACT_API_KEY` used for history compaction) stays hidden within Cloudflare Server Secrets. The endpoint is rate-limited per IP (60 req/min, in-memory per isolate). Unlike the Yefris origin, this backend serves a single hardcoded persona (`bobInstruction`) — there is no `oracle` selector in the request body.
- **Streaming & Parsing (`geminiService.ts`):**
  - The Cloudflare function generates the full response, strips internal chain-of-thought metadata (`<think>` tags), and pushes it over an SSE stream together with Google Search grounding metadata so the frontend can natively render clickable "Stuff B.O.B. Found" source chips.
  - The client-side `askBobStream` async generator then re-streams the buffered text as a batched typewriter (~40 ticks at 4ms each) to minimize perceived latency.
  - History compaction: when a thread grows past ~20 messages or ~5,000 characters, older messages are summarized server-side by a cheaper model (`gemma-4-26b-a4b-it`) before the main model (`gemma-4-31b-it`) is queried.

---

## 4. Telemetry & SEO

- **Web Analytics:** A Cloudflare Web Analytics beacon slot is present in `index.html` (commented out until a per-site token is issued). It uses a privacy-first proxying beacon rather than tracking cookies.
- **Sitemap Indexing:** Crawlers rely on a hardcoded `sitemap.xml` mapping priority weights across the routing paths, plus a `robots.txt` pointing at it.
