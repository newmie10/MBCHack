# Polymarket Edge Finder

Quick AI companion that pulls active Polymarket markets from the Gamma API, then asks an LLM to rank them for clarity, timeliness, and potential edge.

## Setup

```bash
cd web
npm install
# create web/.env.local with one of:
# GOOGLE_API_KEY=...              # Gemini Flash (tries 2.5-flash, 2.0-flash-001, 2.0-flash-lite-001)
# (Optional) OPENAI_API_KEY=...   # unused unless you swap models yourself
# (Optional) DEBUG_SCORE_LOG=1   # logs score requests/responses
# (Optional) NEXT_PUBLIC_SUPABASE_URL=...
# (Optional) NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm run dev
```

Visit http://localhost:3000 and click **Refresh markets** then **AI rank top 8**.

## Notes
- Markets are fetched server-side from `https://gamma-api.polymarket.com/markets`.
- AI scoring stays server-side in `/api/score`; the key is never exposed.
- Default model: Gemini (tries in order): `gemini-2.5-flash`, `gemini-2.0-flash-001`, `gemini-2.0-flash-lite-001` (GOOGLE_API_KEY required).
- Scoring request example:
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
  - Calls Gemini; returns `sentimentScore` (-100..100), `sentimentRationale`, `sentimentTags`.
  - Trigger from UI via “News sentiment top 8” or “News sentiment all”.
- Trading brief endpoint `/api/brief`:
  - Calls Gemini to return `brief`, `risk`, `action`, `confidence` (0-100) per market.
  - Trigger per card via “AI trade brief”.
- Market chat (cloud):
  - Uses Supabase (no local storage). Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Create table:
    ```sql
    create table public.messages (
      id uuid primary key default gen_random_uuid(),
      market_id text not null,
      nickname text,
      body text,
      created_at timestamptz default now()
    );
    ```
    Enable insert/select for anon as needed (or set Row Level Security rules).
  - Chat lives per market card; realtime if Supabase is configured.
