# CareerFlow — Resume Bullet Tailoring
**Product Requirements Document · v1.0 · June 2026**
**Owner:** Shivanshi Makkar

## Problem

I apply to 20+ internships and full-time roles each recruiting cycle.
Tailoring my resume per application — picking the most relevant bullets,
rewriting them to match the JD's language, and identifying gaps — takes
~45 minutes manually. At that rate, applying to 20 roles is 15 hours of
work before a single application is sent. The result is either rushed,
under-tailored applications or a smaller funnel than I can credibly run.

## Users

Single-user (me) for v1. Future scope considers other job-seeking students,
but expansion is out of scope until the feature proves out for one user.

## Solution

A resume bullet tailoring feature inside CareerFlow, my existing job
application tracker. The flow is three steps:

1. **Master Bullet Bank.** I store every resume bullet I've ever written
   once, tagged by experience (Bharti Airtel, Senior RA, etc.) and theme
   (data analytics, leadership, AI/ML, SQL).
2. **JD Input.** On any application's detail page, I paste the full job
   description.
3. **Tailor.** The system returns the top 5 most relevant bullets, each
   rewritten to honestly match the JD's language and priorities, scored
   for relevance (0–100), with reasoning. It also surfaces 5–10 keywords
   from the JD that are missing from my bullets — flagging real skill
   gaps, not just buzzwords to bolt on.

## Success Metrics

Primary: **Time-to-tailor per application.** Baseline ~45 min manual.
Target: under 10 min end-to-end. Measured informally against a rolling
log of applications.

Secondary, in order:
- **Tailoring quality.** Rewrites must preserve every fact and tool from
  the original bullet, change framing meaningfully (not just synonyms),
  and read like human-written resume language. Tracked qualitatively via
  prompt iteration cycles.
- **Adoption.** Do I actually use this on real applications, or does it
  rot? Self-report weekly.
- **Callback rate.** Tailored vs. untailored applications, tracked as a
  late-stage signal once sample size is large enough to be meaningful.

## v1 Scope (Shipped)

- Master Bullet Bank with CRUD, tag filtering, and experience grouping
- JD input on application detail page, persisted with the application
- Anthropic Claude API integration via a server-side route (API key
  never exposed to client)
- Top-5 bullet selection, rewriting, and relevance scoring
- Missing-keyword detection
- Per-bullet copy button and result persistence across page refreshes
- Two prompt iterations: v1 (baseline) and v2 (structured reasoning,
  forbidden buzzword list, calibrated score anchors), with v2 producing
  noticeably more honest scores and substantively reframed rewrites on a
  test set of real JDs

## Key Decisions and Tradeoffs

- **localStorage over a real database.** Faster to ship, zero
  infrastructure. Tradeoff: data is per-browser and can't be shared.
  Acceptable for single-user v1.
- **Server-side API route over client-side calls.** Keeps the API key
  out of the browser. Tradeoff: one extra hop. Worth it.
- **Anthropic Claude over OpenAI.** Cost-comparable, and aligned with the
  AI tooling I'm specifically building fluency around for my September
  AltaML internship.
- **Fetch over the official SDK.** Avoided a new dependency given how
  simple the call is.
- **Two-phase prompt iteration.** Built v1 first to surface the actual
  failure mode (surface-level keyword substitution), then designed v2
  around that diagnosis. Iterating from observed output produces better
  prompts than iterating from speculation.

## Out of Scope for v1

Cover letter tailoring, real database and multi-user support, deployed
hosting, ATS keyword overlay on the resume itself, and a formal eval
harness for prompt quality.

## v2 / v3 Roadmap

Equal priority across the following four, sequenced by current
informational value:

1. **Eval harness for prompt quality.** A held-out set of (JD, bullet
   bank, expected good output) triples, with pairwise comparison runs
   on each prompt version. Turns prompt iteration from a vibe check
   into a measurable process — and is the single most defensible
   artifact for an AI engineering interview.
2. **Live deployment** to Vercel + a real database (Neon Postgres). Lets
   the project live at a public URL recruiters can open, and unblocks
   sharing with peers in the same job search.
3. **Cover letter tailoring** using the same prompt pattern. Same
   inputs, different output shape. Low marginal effort.
4. **ATS keyword overlay and diff view** showing which JD keywords each
   tailored bullet now covers and a side-by-side delta between original
   and rewritten. Most useful for end-user trust in the output.

## Open Questions

- At what bullet bank size does the current prompt structure start to
  cost too much per call? Worth measuring before adding prompt caching.
- Are recruiter callback rates a meaningful signal at the scale of one
  candidate's job search, or is the sample size always too noisy to
  attribute?
- Should the feature eventually generate net-new bullets from gaps in
  the bank, or stay strictly a curation/rewriting tool? (Generation
  risks fabrication — staying in rewrite mode for now.)