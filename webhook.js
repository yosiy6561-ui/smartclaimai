import { Webhook } from "svix";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await buffer(req);
  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };

  let event;
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    event = wh.verify(rawBody.toString(), headers);
  } catch {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address;
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
    await supabase.from("users").upsert({
      id: data.id,
      email,
      name: name || email?.split("@")[0],
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  }

  if (type === "user.deleted") {
    await supabase.from("users").delete().eq("id", data.id);
  }

  return res.status(200).json({ received: true });
}

export const config = { api: { bodyParser: false } };
