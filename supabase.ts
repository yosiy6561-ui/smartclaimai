// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Browser client (uses anon key — respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client (uses service role — bypasses RLS, server-only)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Types ──────────────────────────────────────────────────────────
export type User = {
  id: string;
  email: string;
  name: string | null;
  plan: "starter" | "professional" | "business";
  analyses_used: number;
  analyses_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export type Case = {
  id: string;
  user_id: string;
  title: string;
  claim_type: string;
  story: string;
  jurisdiction: string;
  amount: string | null;
  language: string;
  score: number;
  recommended: string;
  result: AnalysisResult;
  status: "draft" | "processing" | "complete" | "error";
  created_at: string;
};

export type AnalysisResult = {
  claimScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  missingEvidence: string[];
  estimatedMin: string;
  estimatedRecommended: string;
  estimatedMax: string;
  legalStrategy: string;
  nextSteps: string[];
  evidenceScore: number;
  timelineScore: number;
  legalPrecedentScore: number;
  riskScore: number;
};
