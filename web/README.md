# Polymarket Edge Finder

Quick AI companion that pulls active Polymarket markets from the Gamma API, then asks an LLM to rank them for clarity, timeliness, and potential edge.

## Setup

```bash
cd web
npm install
# create web/.env.local with one of:
# GROQ_API_KEY=...
# (Optional) OPENAI_API_KEY=...
# (Optional) DEBUG_SCORE_LOG=1   # logs score requests/responses
npm run dev
```

Visit http://localhost:3000 and click **Refresh markets** then **AI rank top 8**.

## Notes
- Markets are fetched server-side from `https://gamma-api.polymarket.com/markets`.
- AI scoring stays server-side in `/api/score`; the key is never exposed.
- Default model: Groq `llama-3.1-8b-instant` (free-tier friendly). Swap in `src/app/api/score/route.ts` if desired.
- Scoring request example (sent to Groq):
  ```json
  {
    "question": "Will X happen by date?",
    "description": "Short market description",
    "outcomes": ["Yes", "No"],
    "prices": [0.48, 0.52],
    "bestBid": 0.48,
    "bestAsk": 0.52,
    "volume24hr": 12345,
    "volumeNum": 98765,
    "liquidityNum": 50000,
    "endDate": "2025-12-31T00:00:00Z"
  }
  ```
  Prompt asks the model to score (0-100) with bands: 0-30 bad/ambiguous, 30-50 low liquidity/unclear, 50-70 decent, 70-85 strong, 85-95 rare, 95-100 extremely rare edge.
- Sentiment analysis (news) endpoint `/api/sentiment`:
  - Fetches up to 5 recent headlines for the market question from GDELT (last 7 days).
  - Calls Groq with those headlines; returns `sentimentScore` (-100..100), `sentimentRationale`, `sentimentTags`.
  - Trigger from UI via “News sentiment top 8” or “News sentiment all”.
