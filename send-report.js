// pages/api/email/send-report.js
// ─────────────────────────────────────────────────────────────────
// Sends analysis report email via Resend.
// Called automatically after analysis completes.
// ─────────────────────────────────────────────────────────────────

import { Resend } from "resend";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildEmailHTML(result, caseTitle, userName) {
  const scoreColor = result.claimScore >= 8 ? "#10B981" : result.claimScore >= 6 ? "#F59E0B" : "#EF4444";
  const scoreLabel = result.claimScore >= 8 ? "Strong Claim" : result.claimScore >= 6 ? "Moderate" : "Needs Work";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#F9FAFB;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    
    <!-- Header -->
    <div style="background:#07090F;padding:28px 32px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">⚖️</span>
      <span style="color:#fff;font-size:18px;font-weight:700;">ClaimSmart AI</span>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#6B7280;font-size:14px;margin:0 0 8px;">Legal Analysis Report</p>
      <h1 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 24px;">${caseTitle}</h1>

      <!-- Score card -->
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:13px;color:#6B7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em;">Claim Strength</div>
        <div style="font-size:40px;font-weight:700;color:${scoreColor}">${result.claimScore}/10</div>
        <div style="font-size:14px;color:${scoreColor};font-weight:500;margin-top:4px;">${scoreLabel}</div>
      </div>

      <!-- Damages -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280;">Minimum estimate</td>
          <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:15px;font-weight:600;color:#111827;text-align:right;">${result.estimatedMin}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280;">Recommended claim</td>
          <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:15px;font-weight:700;color:#2563EB;text-align:right;">${result.estimatedRecommended}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#6B7280;">Maximum potential</td>
          <td style="padding:10px 0;font-size:15px;font-weight:600;color:#111827;text-align:right;">${result.estimatedMax}</td>
        </tr>
      </table>

      <!-- Summary -->
      <p style="font-size:14px;color:#374151;line-height:1.75;margin-bottom:24px;">${result.verdict}</p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
          View Full Report →
        </a>
      </div>

      <!-- Strengths -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:#6B7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">Strengths</div>
        ${(result.strengths || []).map(s => `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;"><span style="color:#10B981;flex-shrink:0;font-size:13px;">✓</span><span style="font-size:13px;color:#374151;line-height:1.5;">${s}</span></div>`).join("")}
      </div>

      <!-- Next steps -->
      <div style="background:#EFF6FF;border:1px solid #DBEAFE;border-radius:9px;padding:18px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#2563EB;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">Recommended Next Steps</div>
        ${(result.nextSteps || []).map((s, i) => `<div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:8px;"><span style="background:#2563EB;color:#fff;border-radius:50%;width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;">${i+1}</span><span style="font-size:13px;color:#374151;line-height:1.5;">${s}</span></div>`).join("")}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;">
      <p style="font-size:11px;color:#9CA3AF;line-height:1.65;margin:0;">
        This report was generated by ClaimSmart AI for informational purposes only. It does not constitute legal advice. 
        Please consult a licensed attorney before taking legal action.<br><br>
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="color:#6B7280;">View Dashboard</a> · 
        <a href="${process.env.NEXT_PUBLIC_URL}/unsubscribe" style="color:#6B7280;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { result, caseTitle, caseId } = req.body;
  if (!result) return res.status(400).json({ error: "result required" });

  // Get user email from Supabase
  const { data: user } = await supabase
    .from("users")
    .select("email, name")
    .eq("id", userId)
    .single();

  if (!user?.email) return res.status(400).json({ error: "User email not found" });

  try {
    const { data, error } = await resend.emails.send({
      from: "ClaimSmart AI <reports@claimsmart.ai>",
      to: [user.email],
      subject: "Your Legal Analysis Report — " + (caseTitle || "Untitled Case"),
      html: buildEmailHTML(result, caseTitle || "Untitled Case", user.name),
    });

    if (error) throw error;

    return res.status(200).json({ success: true, emailId: data.id });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
