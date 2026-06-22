// pages/api/chat.js
import Anthropic from "@anthropic-ai/sdk";
import { getAuth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { messages, caseContext } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const sys = (caseContext ? "Context: " + caseContext + "\n" : "") +
    "You are a professional AI legal assistant for ClaimSmart. Provide clear, measured, professional guidance in 2-4 sentences. Never make guarantees about outcomes.";

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: sys,
      messages: messages.slice(-20).map(m => ({ role: m.role, content: m.content || m.text })),
    });
    return res.status(200).json({ reply: response.content.map(b => b.text || "").join("") });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Chat failed. Please try again." });
  }
}
