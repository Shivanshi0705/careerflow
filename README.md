# CareerFlow

**Live demo:** https://careerflow-app.vercel.app/
*(Sign up with any email to try the tailoring feature — bullet bank seeds
with sample data on first load.)*

An AI-augmented job application tracker. Tracks roles, contacts, and
pipeline metrics like any other tracker — and adds an LLM-powered resume
bullet tailoring feature that turns a job description into ranked, rewritten
resume bullets in under 10 seconds.

Built solo as a portfolio piece during summer 2026 recruiting.

## Try it

1. Sign up on the live demo above
2. Go to **Bullets** in the nav — sample bullets are pre-seeded; add your
   own if you want
3. Click into any tracked application
4. Scroll to **Tailor Resume Bullets**, paste a real job description, hit
   **Tailor Bullets**
5. In ~10 seconds: top 5 most relevant bullets ranked and rewritten to
   match the JD, plus the keywords from the JD that your bank doesn't
   cover

## The tailoring feature

Tailoring a resume per application takes ~45 minutes manually. Applying to
20 roles a cycle, that math doesn't work. CareerFlow fixes that loop:

1. **Bullet bank.** Store every resume bullet you've ever written once,
   tagged by experience and theme.
2. **Paste a JD.** On any application's detail page, drop in the full job
   description.
3. **Tailor.** A server-side Anthropic Claude API route returns the top 5
   most relevant bullets — rewritten to honestly match the JD, scored
   0–100 with reasoning, plus 5–10 keywords from the JD that are missing
   from the bank (real skill gaps, not buzzwords to fake).

The model is instructed to preserve every fact, metric, and tool from the
original bullet. No fabrication. If a bullet truly doesn't map to the role,
the score reflects that — honest low scores are informative output, not a
failure mode.

## Tech

Next.js 16 (App Router), TypeScript, Tailwind v4, React 19. Anthropic
Claude Sonnet 4.5 via a server-side `fetch` (no SDK dep). LocalStorage
persistence for v1 — a deliberate ship-fast tradeoff documented in
[`PRD.md`](PRD.md). Deployed to Vercel.

## Project structure

- `src/app/bullets/` — the master bullet bank UI (list, search, tag
  filters, inline add/edit form)
- `src/lib/bulletStorage.ts` — localStorage CRUD for bullets
- `src/app/api/tailor-bullets/route.ts` — the LLM API route. System
  prompt + user prompt template live here.
- `src/app/applications/[id]/page.tsx` — application detail page with the
  JD input and tailored-result display
- `src/types/` — `BulletBankEntry`, `Application`, `TailoredResult` types
- `PRD.md` — product requirements doc: problem, users, scope, metrics,
  decisions, roadmap

## Prompt iteration

The tailoring quality depends entirely on the system prompt. v1 produced
keyword-substitution rewrites with relevance scores clustered in the
70–75 range regardless of fit. v2 fixed this by:

- Adding a **structured reasoning step** before rewriting: identify the
  bullet's underlying transferable skill, identify the JD's explicit and
  implicit requirements, find the genuine mapping
- Adding **calibrated relevance score anchors** (90+ direct match, 75+
  strong adjacent, 60+ transferable, below 60 weak fit) so scores carry
  signal
- Adding a **forbidden-phrase list** ("delivering accurate results",
  "leveraging cross-functional synergies", etc.) to block AI-buzzword
  filler
- Requiring **specific reasoning** ("maps to JD's predictive analytics
  requirement; reframed lead verb from 'built' to 'forecasted'") instead
  of generic ("demonstrates technical skills")
- A **final self-check step** before returning JSON

On a well-matched JD, v2 produced top scores in the 85–95 range with
substantively reframed bullets. On a mismatched JD (FPGA role with my
data analytics bullets), v2 correctly produced scores in the 50–65 range —
the honest signal that the bullets don't fit.

The current prompt lives at the top of
[`src/app/api/tailor-bullets/route.ts`](src/app/api/tailor-bullets/route.ts).

## Running locally

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up / log in, and
the bullet bank seeds with sample data on first load.

## Roadmap

See [`PRD.md`](PRD.md) for the full roadmap. Next four items in equal
priority:

1. Eval harness — held-out (JD, bullet bank, expected output) triples for
   measuring prompt-version improvement
2. Real database (Postgres / Neon) — replace localStorage for multi-user
3. Cover letter tailoring using the same prompt pattern
4. ATS keyword overlay and original-vs-rewritten diff view

## Status

Single-user v1, live on Vercel. Built and used personally during summer
2026 recruiting.