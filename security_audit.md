# Security & Bug Audit - The Church of B.O.B.

**Date:** 2026-07-06
**Scope:** Frontend and backend of the Church of B.O.B. (`App.tsx`, `components/`, `functions/api/`, `services/`), split from the Cult of Yefris codebase.

This site inherited the hardened backend from the Cult of Yefris. The vulnerabilities found in the original 2026-04-20 Yefris audit were already remediated before the split, so they are documented here as **carried-over posture** rather than open findings.

## 1. Security Posture (inherited & verified)

| Area | Status |
|---|---|
| API key exposure | ✅ Backend-only `GEMINI_API_KEY` / optional `GEMINI_COMPACT_API_KEY`. No `VITE_`-prefixed secrets. Frontend never contacts Google directly. |
| Grounding URI injection | ✅ Source URIs filtered to `http://`/`https://` before rendering into anchor `href` (`AskBob.tsx`). |
| Rate limiting | ✅ Per-IP in-memory limiter on `/api/ask` (60/min) and `/api/leaderboard` (15/min). |
| Payload validation | ✅ `question` capped at 5,000 chars; `history` capped at 100 messages × 10,000 chars each; malformed JSON returns 400. |
| Leaderboard anti-cheat | ✅ Single-use server-side session tokens (`/api/game-session`, 10-min TTL) required for score submission; game-ID allowlist for KV keys. |
| Score bounds | ✅ Numeric score validated (`0 ≤ score ≤ 50000`); name length capped at 20. |

## 2. Notes Specific to the Split

- **Single persona:** `/api/ask` serves only the `bobInstruction` system prompt. The Yefris `oracle` request-body selector was removed, shrinking the request surface — no branch selects a persona from user input.
- **Shared KV namespace caution:** If this deployment is bound to the *same* `LEADERBOARD_KV` namespace as the Yefris site, the two sites share leaderboard entries and session tokens (game ids `defense`/`burden`/`flappy` overlap). Bind a **separate** KV namespace unless shared boards are intended. See `README.md` deployment step 3.
- **Analytics beacon:** The Cloudflare Web Analytics beacon in `index.html` is commented out. Add a per-site token before relying on traffic data; do not reuse the Yefris token (it is domain-bound).

## Conclusion
No open vulnerabilities. The backend carries the fully-remediated Yefris posture. The primary operational risk is misconfiguration at deploy time (shared KV namespace, missing/incorrect env vars), not code defects — follow the `README.md` deployment checklist.
