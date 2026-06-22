// pages/api/analyze.js  (or app/api/analyze/route.js for App Router)
// ─────────────────────────────────────────────────────────────────
// Secure backend proxy — Anthropic key stays server-side only.
// Deploy on Vercel. Set ANTHROPIC_API_KEY in environment variables.
//
// Usage from frontend:
//   POST /api/analyze
//   Body: { claimType, title, story, jurisdiction, amount, language, files }
//
// ─────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiter (10 requests / hour per user) ────────────────────
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

// ── Anthropic client ──────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // never sent to browser
});

// ── Supabase admin client ─────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only key
);

// ── Input validation ──────────────────────────────────────────────
function validateInput(body) {
  const { claimType, story } = body;
  if (!claimType) return "claimType is required";
  if (!story || story.trim().length < 30) return "story must be at least 30 characters";
  const validTypes = ["contract","consumer","landlord","freelance","employment","injury"];
  if (!validTypes.includes(claimType)) return "invalid claimType";
  return null;
}

// ── Build prompt ──────────────────────────────────────────────────
function buildPrompt({ claimType, title, story, jurisdiction, amount, language, files }) {
  const fileList = Array.isArray(files) ? files.join(", ") : "None";
  return [
    "You are a professional legal analyst AI.",
    "Analyze this dispute and return ONLY valid JSON — no markdown, no explanation outside the JSON.",
    "",
    "Case: " + (title || "Untitled"),
    "Type: " + claimType,
    "Jurisdiction: " + (jurisdiction || "United States"),
    "Description: " + story,
    "Amount: " + (amount || "unspecified"),
    "Output language: " + (language || "English"),
    "Evidence files: " + fileList,
    "",
    "Return exactly this JSON (replace placeholder text with real analysis):",
    JSON.stringify({
      claimScore: 7.5,
      verdict: "Two-sentence professional assessment.",
      strengths: ["strength one", "strength two", "strength three"],
      weaknesses: ["weakness one", "weakness two"],
      missingEvidence: ["missing one", "missing two", "missing three"],
      estimatedMin: "$5,000",
      estimatedRecommended: "$12,000",
      estimatedMax: "$25,000",
      legalStrategy: "Three to four sentence professional legal strategy.",
      nextSteps: ["step one", "step two", "step three", "step four"],
      evidenceScore: 65,
      timelineScore: 70,
      legalPrecedentScore: 60,
      riskScore: 40,
    }),
  ].join("\n");
}

// ── Main handler ──────────────────────────────────────────────────
export default async function handler(req, res) {
  // Method guard
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth — require signed-in user via Clerk
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please sign in." });
  }

  // Rate limit
  const { success, remaining } = await ratelimit.limit(userId);
  if (!success) {
    return res.status(429).json({
      error: "Rate limit exceeded. You can run up to 10 analyses per hour.",
      remaining: 0,
    });
  }
  res.setHeader("X-RateLimit-Remaining", remaining);

  // Validate input
  const validationError = validateInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { claimType, title, story, jurisdiction, amount, language, files } = req.body;

  try {
    // Call Anthropic — key stays server-side
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: buildPrompt({ claimType, title, story, jurisdiction, amount, language, files }),
        },
      ],
    });

    const raw = message.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```[\w]*/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(clean);

    // Save to Supabase
    const { data: caseRecord, error: dbError } = await supabase
      .from("cases")
      .insert({
        user_id: userId,
        title: title || "Untitled Case",
        claim_type: claimType,
        story,
        jurisdiction: jurisdiction || "United States",
        amount: amount || null,
        language: language || "English",
        score: result.claimScore,
        recommended: result.estimatedRecommended,
        result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Don't fail the request — return result even if DB save fails
    }

    return res.status(200).json({
      result,
      caseId: caseRecord?.id || null,
      remaining,
    });
  } catch (err) {
    console.error("Analysis error:", err);

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
    }

    return res.status(500).json({
      error: "Analysis failed. Please try again in a few seconds.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

// ── Config — allow larger body for file names ─────────────────────
export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};
