// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: "$29",
    period: "/mo",
    priceId: process.env.STRIPE_PRICE_STARTER!,
    analysesLimit: 5,
    features: [
      "5 AI analyses per month",
      "PDF export",
      "3 language options",
      "Email support",
      "30-day case history",
    ],
  },
  professional: {
    name: "Professional",
    price: "$79",
    period: "/mo",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    analysesLimit: -1, // unlimited
    features: [
      "Unlimited analyses",
      "All 100+ languages",
      "Priority AI processing",
      "Full case history",
      "API access",
      "AI chat assistant",
    ],
  },
  business: {
    name: "Business",
    price: "$199",
    period: "/mo",
    priceId: process.env.STRIPE_PRICE_BUSINESS!,
    analysesLimit: -1,
    features: [
      "Everything in Professional",
      "Team workspace (5 seats)",
      "Custom PDF templates",
      "Dedicated support",
      "Advanced analytics",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanFromPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return null;
}
