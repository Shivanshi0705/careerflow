import { NextRequest, NextResponse } from "next/server";
import type { TailoredResult } from "@/types/application";
import type { BulletBankEntry } from "@/types/bullet";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are a senior resume strategist helping candidates reframe their experience for specific roles. Your job is substantive rewriting, not keyword insertion.

Before rewriting each bullet, reason through three things internally (do not output this reasoning):
  (i)  What is the underlying transferable skill demonstrated in this bullet? Name it precisely — e.g. "stakeholder partnership to drive a metric", "model-building under ambiguity", "cross-functional process design".
  (ii) What are the top 3–5 explicit AND implicit requirements in the job description? Implicit requirements are skills the role clearly needs but may not state directly (e.g. a JD that says "collaborate with product teams" implicitly requires clear written communication and scoping judgment).
  (iii) Which of the candidate's transferable skills maps to which JD requirement? Only proceed with a rewrite if a genuine mapping exists.

Rewriting rules — enforce all of them:
  • Preserve every fact, metric, scope number, and named tool from the original. Do not fabricate.
  • The rewrite must change at least one of: the opening verb, the framing of business impact, or which aspect of the work is foregrounded — not just word-for-word synonym swaps.
  • Mirror the JD's own phrasing for the mapped skill ONLY where the mapping is honest (e.g. if the JD says "drive insights" and the original says "analyzed data to inform decisions", write "drove insights from analysis of…"). If no honest mapping exists, keep the original phrasing rather than forcing a keyword.
  • Forbidden: buzzword filler — "delivering accurate results", "solving complex challenges", "leveraging cross-functional synergies", "driving impactful outcomes", or any phrase that sounds AI-generated rather than human-written.
  • Every rewrite must read like a human resume bullet: concise, active voice, strong opening verb, no padding.

You always respond with a single valid JSON object and nothing else — no markdown code fences, no preamble, no explanation outside the JSON.`;

type ModelTailoredBullet = {
  originalBulletId: string;
  rewritten: string;
  relevanceScore: number;
  reasoning: string;
};

type ModelOutput = {
  tailoredBullets: ModelTailoredBullet[];
  missingKeywords: string[];
};

function buildPrompt(jobDescription: string, bullets: BulletBankEntry[]): string {
  const bulletList = bullets.map((bullet) => ({
    id: bullet.id,
    experience: bullet.experience,
    tags: bullet.tags,
    text: bullet.text,
  }));

  return `Job description:
"""
${jobDescription}
"""

Candidate resume bullets (each has an id, the experience it came from, and tags):
${JSON.stringify(bulletList, null, 2)}

Task:
1. Select the 5 bullets from the candidate list that are most relevant to the job description above. If fewer than 5 bullets are provided, use all of them. Rank by strength of genuine transferable-skill mapping, not surface keyword overlap.

2. For each selected bullet, rewrite it following all rules in the system prompt. The rewrite must be substantively different in framing from the original — not just synonym-swapped. Preserve all facts, numbers, tools, and scope.

3. Score each bullet's relevance using these anchors:
   • 90–100: direct match on a core JD requirement — the skill is central to the role and clearly present in the bullet
   • 75–89: strong adjacent skill with a clear, specific mapping to a JD requirement
   • 60–74: transferable skill that requires some interpretation to connect to the JD
   • Below 60: weak or forced fit — only include if no better bullets exist in the bank
   Note: for a poorly-matched JD it is correct and expected for all five selected bullets to score below 75. Do not inflate scores to meet a threshold — honest low scores are informative output, not a failure.

4. For the reasoning field, state specifically: (a) which JD requirement this bullet maps to, and (b) why the rewrite framing was chosen. Example: "Maps the churn modeling work to the JD's 'predictive analytics for customer retention' requirement; reframed lead verb from 'built' to 'forecasted' to foreground the predictive output rather than the build process." Not generic ("demonstrates technical skills").

5. List 5 to 10 important keywords or skills that appear in the job description but are NOT well represented across the selected bullets.

6. Before returning the JSON, re-read each rewritten bullet and confirm: (a) it preserves every fact, metric, and tool from the original, (b) it does not contain any forbidden buzzword phrases listed in the system prompt, and (c) it reads like a human-written resume bullet, not an AI-tailored one. If any rewrite fails this check, fix it before returning.

Respond with ONLY a JSON object in exactly this shape, with no markdown fences and no extra text:
{
  "tailoredBullets": [
    {
      "originalBulletId": "<id copied exactly from the candidate list above>",
      "rewritten": "<rewritten bullet text>",
      "relevanceScore": <integer 0–100>,
      "reasoning": "<specific sentence naming the JD requirement and the reframe rationale>"
    }
  ],
  "missingKeywords": ["<keyword>", ...]
}`;
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

function isValidModelOutput(data: unknown): data is ModelOutput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.tailoredBullets) || obj.tailoredBullets.length === 0) {
    return false;
  }

  if (!Array.isArray(obj.missingKeywords)) {
    return false;
  }

  if (!obj.missingKeywords.every((keyword) => typeof keyword === "string")) {
    return false;
  }

  return obj.tailoredBullets.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const bullet = entry as Record<string, unknown>;

    return (
      typeof bullet.originalBulletId === "string" &&
      typeof bullet.rewritten === "string" &&
      typeof bullet.relevanceScore === "number" &&
      bullet.relevanceScore >= 0 &&
      bullet.relevanceScore <= 100 &&
      typeof bullet.reasoning === "string"
    );
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "The Anthropic API key is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { jobDescription?: unknown; bullets?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { jobDescription, bullets } = body;

  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return NextResponse.json(
      { error: "A non-empty job description is required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(bullets) || bullets.length === 0) {
    return NextResponse.json(
      { error: "At least one bullet from your bank is required." },
      { status: 400 }
    );
  }

  const bulletBank = bullets as BulletBankEntry[];

  let anthropicResponse: Response;

  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3072,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildPrompt(jobDescription.trim(), bulletBank) },
        ],
      }),
    });
  } catch (error) {
    console.error("Anthropic request failed:", error);
    return NextResponse.json(
      { error: "Could not reach the Anthropic API. Please try again." },
      { status: 502 }
    );
  }

  if (!anthropicResponse.ok) {
    console.error(
      "Anthropic API error:",
      anthropicResponse.status,
      await anthropicResponse.text()
    );
    return NextResponse.json(
      { error: "The Anthropic API returned an error. Please try again." },
      { status: 502 }
    );
  }

  const anthropicData = await anthropicResponse.json();
  const rawText: unknown = anthropicData?.content?.[0]?.text;

  if (typeof rawText !== "string") {
    return NextResponse.json(
      { error: "The model returned an unexpected response format." },
      { status: 400 }
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(stripJsonFences(rawText));
  } catch (error) {
    console.error("Failed to parse model output as JSON:", error);
    return NextResponse.json(
      { error: "The model did not return valid JSON. Please try again." },
      { status: 400 }
    );
  }

  if (!isValidModelOutput(parsed)) {
    return NextResponse.json(
      { error: "The model's response did not match the expected shape." },
      { status: 400 }
    );
  }

  const bulletsById = new Map(bulletBank.map((bullet) => [bullet.id, bullet]));
  const tailoredBullets: TailoredResult["tailoredBullets"] = [];

  for (const entry of parsed.tailoredBullets) {
    const sourceBullet = bulletsById.get(entry.originalBulletId);

    if (!sourceBullet) {
      return NextResponse.json(
        { error: "The model referenced a bullet that is not in your bank." },
        { status: 400 }
      );
    }

    tailoredBullets.push({
      originalBulletId: entry.originalBulletId,
      original: sourceBullet.text,
      rewritten: entry.rewritten,
      relevanceScore: entry.relevanceScore,
      reasoning: entry.reasoning,
    });
  }

  const result: TailoredResult = {
    tailoredBullets,
    missingKeywords: parsed.missingKeywords,
    generatedAt: new Date().toISOString(),
    jobDescriptionSnapshot: jobDescription.trim(),
  };

  return NextResponse.json(result, { status: 200 });
}
