// pages/api/cases/[id].js
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.query;

  if (req.method === "GET") {
    const { data, error } = await sb().from("cases").select("*").eq("id", id).eq("user_id", userId).single();
    if (error || !data) return res.status(404).json({ error: "Case not found" });
    return res.status(200).json({ case: data });
  }

  if (req.method === "DELETE") {
    const { error } = await sb().from("cases").delete().eq("id", id).eq("user_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ deleted: true });
  }

  return res.status(405).end();
}
