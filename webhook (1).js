// pages/api/billing/webhook.js
// ─────────────────────────────────────────────────────────────────
// Handles Stripe webhook events.
// Set webhook URL in Stripe dashboard:
//   https://yourdomain.com/api/billing/webhook
// Events to listen for:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//   invoice.payment_failed
// ─────────────────────────────────────────────────────────────────

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan names from price IDs
const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_STARTER]:      { plan: "starter",      limit: 5  },
  [process.env.STRIPE_PRICE_PROFESSIONAL]: { plan: "professional", limit: -1 },
  [process.env.STRIPE_PRICE_BUSINESS]:     { plan: "business",     limit: -1 },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  // Log event
  await supabase.from("billing_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    created_at: new Date().toISOString(),
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = subscription.items.data[0]?.price?.id;
      const planInfo = PRICE_TO_PLAN[priceId] || { plan: "starter", limit: 5 };

      await supabase.from("users").update({
        plan: planInfo.plan,
        analyses_limit: planInfo.limit,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);

      console.log("Subscription activated:", userId, planInfo.plan);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price?.id;
      const planInfo = PRICE_TO_PLAN[priceId] || { plan: "starter", limit: 5 };
      const isActive = ["active", "trialing"].includes(sub.status);

      await supabase.from("users").update({
        plan: isActive ? planInfo.plan : "starter",
        analyses_limit: isActive ? planInfo.limit : 5,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await supabase.from("users").update({
        plan: "starter",
        analyses_limit: 5,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.error("Payment failed for customer:", invoice.customer);
      // TODO: send email via Resend
      break;
    }

    default:
      console.log("Unhandled event:", event.type);
  }

  return res.status(200).json({ received: true });
}

// Required: disable body parsing for Stripe signature verification
export const config = {
  api: { bodyParser: false },
};
